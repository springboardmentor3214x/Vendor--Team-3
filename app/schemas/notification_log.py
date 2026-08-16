from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class NotificationLogResponse(BaseModel):
    log_id: int
    notification_id: int
    channel: str
    status: str
    error_message: Optional[str] = None
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)
    