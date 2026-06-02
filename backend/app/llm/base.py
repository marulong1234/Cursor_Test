from dataclasses import dataclass
from typing import Literal


ChatMode = Literal["normal", "reasoning"]
StreamEventType = Literal["reasoning_delta", "content_delta"]


@dataclass
class StreamChunk:
    event: StreamEventType
    content: str
