from pydantic import BaseModel
from datetime import datetime


class FileAttachmentCreate(BaseModel):
    file_name: str
    file_path: str
    file_type: str
    related_entity_type: str
    related_entity_id: int


class FileAttachmentResponse(BaseModel):
    file_id: int
    uploaded_by: int
    file_name: str
    file_path: str
    file_type: str
    related_entity_type: str
    related_entity_id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True