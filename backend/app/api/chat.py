from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session as DbSession

from app.core.database import get_db
from app.schemas.chat import ChatStreamRequest
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])


def get_chat_service(db: DbSession = Depends(get_db)) -> ChatService:
    return ChatService(db)


@router.post("/stream")
async def chat_stream(
    body: ChatStreamRequest,
    request: Request,
    service: ChatService = Depends(get_chat_service),
) -> StreamingResponse:
    return StreamingResponse(
        service.stream_response(
            session_id=body.session_id,
            user_content=body.message,
            mode=body.mode,
            request=request,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
