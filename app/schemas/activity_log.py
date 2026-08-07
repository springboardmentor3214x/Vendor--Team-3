from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ActivityLogCreate(BaseModel):
    user_id: int
    action: str
    module: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[int] = None


class ActivityLogResponse(BaseModel):
    log_id: int
    user_id: int
    action: str
    module: str
    related_entity_type: Optional[str]
    related_entity_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True