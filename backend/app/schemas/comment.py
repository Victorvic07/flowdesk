from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CommentCreate(BaseModel):
    content: str = Field(min_length=2, max_length=2000)


class CommentResponse(BaseModel):
    id: int
    content: str
    ticket_id: int
    author_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)