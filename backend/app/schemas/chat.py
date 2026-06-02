from typing import Literal

from pydantic import BaseModel, Field


ChatMode = Literal["normal", "reasoning"]


class ChatStreamRequest(BaseModel):
    session_id: str
    message: str = Field(min_length=1)
    mode: ChatMode = "normal"
