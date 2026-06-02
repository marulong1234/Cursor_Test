from collections.abc import AsyncIterator

from openai import AsyncOpenAI

from app.core.config import settings
from app.llm.base import ChatMode, StreamChunk


class DashScopeProvider:
    """阿里云百炼 DashScope 兼容模式，DeepSeek 单模型 + enable_thinking 切换推理。"""

    def __init__(self) -> None:
        self._client: AsyncOpenAI | None = None

    def _get_client(self) -> AsyncOpenAI:
        if not settings.dashscope_api_key:
            raise ValueError("DASHSCOPE_API_KEY is not configured")

        if self._client is None:
            self._client = AsyncOpenAI(
                api_key=settings.dashscope_api_key,
                base_url=settings.dashscope_base_url,
            )
        return self._client

    async def stream_chat(
        self,
        messages: list[dict[str, str]],
        mode: ChatMode = "normal",
    ) -> AsyncIterator[StreamChunk]:
        enable_thinking = mode == "reasoning"
        client = self._get_client()
        stream = await client.chat.completions.create(
            model=settings.chat_model,
            messages=messages,
            extra_body={"enable_thinking": enable_thinking},
            stream=True,
            stream_options={"include_usage": True},
        )

        async for chunk in stream:
            if not chunk.choices:
                continue

            delta = chunk.choices[0].delta

            reasoning = getattr(delta, "reasoning_content", None)
            if reasoning is not None and reasoning:
                yield StreamChunk(event="reasoning_delta", content=reasoning)

            if delta.content:
                yield StreamChunk(event="content_delta", content=delta.content)
