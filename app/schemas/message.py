from datetime import datetime
from pydantic import BaseModel, ConfigDict


class MessageCreate(BaseModel):
    sender_id: int
    receiver_id: int
    procurement_id: int
    message: str


class MessageUpdate(BaseModel):
    message: str
    is_read: bool


class MessageResponse(BaseModel):
    message_id: int
    sender_id: int
    receiver_id: int
    procurement_id: int
    message: str
    sent_at: datetime
    is_read: bool
    attachment_path: str | None = None

    model_config = ConfigDict(from_attributes=True)