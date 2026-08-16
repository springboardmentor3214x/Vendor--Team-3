from pydantic import BaseModel, ConfigDict
from datetime import datetime


class NotificationPreferenceUpdate(BaseModel):
    email_enabled: bool = True
    sms_enabled: bool = False
    in_app_enabled: bool = True
    high_priority_only: bool = False


class NotificationPreferenceResponse(BaseModel):
    preference_id: int
    user_id: int

    email_enabled: bool
    sms_enabled: bool
    in_app_enabled: bool
    high_priority_only: bool

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)