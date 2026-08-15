from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DiscussionMessageBase(BaseModel):
    content: str
    attachment_path: Optional[str] = None

class DiscussionMessageCreate(DiscussionMessageBase):
    pass

class DiscussionMessageResponse(DiscussionMessageBase):
    message_id: int
    discussion_id: int
    sender_id: int
    sent_at: datetime

    class Config:
        from_attributes = True

class DiscussionBase(BaseModel):
    entity_type: str
    entity_id: int
    title: str

class DiscussionCreate(DiscussionBase):
    pass

class DiscussionResponse(DiscussionBase):
    discussion_id: int
    created_at: datetime
    created_by: int
    messages: List[DiscussionMessageResponse] = []

    class Config:
        from_attributes = True
