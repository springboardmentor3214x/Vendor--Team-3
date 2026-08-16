from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class NotificationHistoryResponse(BaseModel):
    notification_id: int
    user_id: int

    notification_type: str
    title: str
    message: str

    related_module: Optional[str] = None
    related_record_id: Optional[int] = None

    priority: str
    delivery_method: str

    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)