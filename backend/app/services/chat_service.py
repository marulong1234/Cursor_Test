import json
from collections.abc import AsyncIterator
from datetime import datetime, timezone

from fastapi import Request
from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession, selectinload

from app.core.config import settings
from app.llm.base import ChatMode
from app.llm.dashscope import DashScopeProvider
from app.models.message import Message
from app.models.session import Session


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


class ChatService:
    def __init__(self, db: DbSession):
        self.db = db
        self._provider: DashScopeProvider | None = None

    @property
    def provider(self) -> DashScopeProvider:
        if self._provider is None:
            self._provider = DashScopeProvider()
        return self._provider

    def _get_session_with_messages(self, session_id: str) -> Session | None:
        return self.db.scalar(
            select(Session)
            .options(selectinload(Session.messages))
            .where(Session.id == session_id)
        )

    def _build_messages(self, session: Session) -> list[dict[str, str]]:
        messages: list[dict[str, str]] = []
        if settings.system_prompt.strip():
            messages.append({"role": "system", "content": settings.system_prompt.strip()})

        history = session.messages[-settings.max_context_messages :]
        for msg in history:
            if msg.role in ("user", "assistant", "system") and msg.content:
                messages.append({"role": msg.role, "content": msg.content})
        return messages

    def _touch_session(self, session_id: str) -> None:
        session = self.db.get(Session, session_id)
        if session:
            session.updated_at = datetime.now(timezone.utc)
            self.db.commit()

    def _save_user_message(self, session_id: str, content: str) -> Message:
        message = Message(session_id=session_id, role="user", content=content)
        self.db.add(message)
        self.db.flush()
        self._touch_session(session_id)
        self.db.refresh(message)
        return message

    def _save_assistant_message(
        self,
        session_id: str,
        content: str,
        reasoning_content: str | None,
    ) -> Message:
        message = Message(
            session_id=session_id,
            role="assistant",
            content=content,
            reasoning_content=reasoning_content or None,
        )
        self.db.add(message)
        self.db.flush()
        self._touch_session(session_id)
        self.db.refresh(message)
        return message

    async def stream_response(
        self,
        session_id: str,
        user_content: str,
        mode: ChatMode,
        request: Request,
    ) -> AsyncIterator[str]:
        session = self._get_session_with_messages(session_id)
        if not session:
            yield _sse("error", {"message": "Session not found"})
            return

        if not settings.dashscope_api_key:
            yield _sse(
                "error",
                {"message": "DASHSCOPE_API_KEY 未配置，请在 backend/.env 中设置并重启后端"},
            )
            return

        self._save_user_message(session_id, user_content)

        session = self._get_session_with_messages(session_id)
        if not session:
            yield _sse("error", {"message": "Session not found"})
            return

        messages = self._build_messages(session)
        reasoning_parts: list[str] = []
        content_parts: list[str] = []

        try:
            async for chunk in self.provider.stream_chat(messages, mode=mode):
                if await request.is_disconnected():
                    break

                if chunk.event == "reasoning_delta":
                    reasoning_parts.append(chunk.content)
                    yield _sse("reasoning_delta", {"content": chunk.content})
                else:
                    content_parts.append(chunk.content)
                    yield _sse("content_delta", {"content": chunk.content})

            if await request.is_disconnected():
                return

            assistant = self._save_assistant_message(
                session_id,
                content="".join(content_parts),
                reasoning_content="".join(reasoning_parts) if reasoning_parts else None,
            )
            yield _sse("done", {"message_id": assistant.id})

        except Exception as exc:
            yield _sse("error", {"message": str(exc)})
