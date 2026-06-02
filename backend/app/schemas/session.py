from datetime import datetime, timezone

from pydantic import BaseModel, Field, field_serializer


def _serialize_utc(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt.isoformat().replace("+00:00", "Z")


class SessionCreate(BaseModel):
    title: str | None = Field(default=None, max_length=255)


class SessionUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=255)


class SessionSummary(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("created_at", "updated_at")
    def serialize_datetime(self, dt: datetime) -> str:
        return _serialize_utc(dt)


class MessageOut(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    reasoning_content: str | None
    token_count: int | None
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("created_at")
    def serialize_datetime(self, dt: datetime) -> str:
        return _serialize_utc(dt)


class SessionDetail(SessionSummary):
    messages: list[MessageOut]


class SessionListResponse(BaseModel):
    items: list[SessionSummary]
    total: int
    page: int
    page_size: int
