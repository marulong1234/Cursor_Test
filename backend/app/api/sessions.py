from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DbSession

from app.core.database import get_db
from app.schemas.session import (
    SessionCreate,
    SessionDetail,
    SessionListResponse,
    SessionSummary,
    SessionUpdate,
)
from app.services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])


def get_session_service(db: DbSession = Depends(get_db)) -> SessionService:
    return SessionService(db)


@router.get("", response_model=SessionListResponse)
def list_sessions(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    service: SessionService = Depends(get_session_service),
) -> SessionListResponse:
    items, total = service.list_sessions(page=page, page_size=page_size)
    return SessionListResponse(
        items=[SessionSummary.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=SessionSummary, status_code=201)
def create_session(
    data: SessionCreate,
    service: SessionService = Depends(get_session_service),
) -> SessionSummary:
    session = service.create_session(data)
    return SessionSummary.model_validate(session)


@router.get("/{session_id}", response_model=SessionDetail)
def get_session(
    session_id: str,
    service: SessionService = Depends(get_session_service),
) -> SessionDetail:
    session = service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionDetail.model_validate(session)


@router.patch("/{session_id}", response_model=SessionSummary)
def update_session(
    session_id: str,
    data: SessionUpdate,
    service: SessionService = Depends(get_session_service),
) -> SessionSummary:
    session = service.update_session(session_id, data)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionSummary.model_validate(session)


@router.delete("/{session_id}", status_code=204)
def delete_session(
    session_id: str,
    service: SessionService = Depends(get_session_service),
) -> None:
    deleted = service.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
