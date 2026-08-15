from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    notification_type: str
    title: str
    message: str
    related_module: Optional[str] = None
    related_record_id: Optional[int] = None
    priority: Optional[str] = "Low"
    delivery_method: Optional[str] = "In-App"

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    notification_id: int
    user_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    status: str
