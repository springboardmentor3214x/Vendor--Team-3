from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ActivityLogBase(BaseModel):
    action_performed: str
    module_name: str
    related_business_record: Optional[str] = None
    ip_address: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLogResponse(ActivityLogBase):
    log_id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
