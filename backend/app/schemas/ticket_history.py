from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TicketHistoryResponse(BaseModel):
    id: int
    ticket_id: int
    user_id: int
    action: str
    old_value: str | None
    new_value: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)