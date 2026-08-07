from pydantic import BaseModel
from datetime import datetime


class DiscussionCreate(BaseModel):
    title: str
    related_entity_type: str
    related_entity_id: int


class DiscussionResponse(BaseModel):
    discussion_id: int
    created_by: int
    title: str
    related_entity_type: str
    related_entity_id: int
    created_at: datetime

    class Config:
        from_attributes = True