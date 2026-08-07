from pydantic import BaseModel
from datetime import datetime


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    notification_type: str


class NotificationUpdate(BaseModel):
    is_read: bool


class NotificationResponse(BaseModel):
    notification_id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True