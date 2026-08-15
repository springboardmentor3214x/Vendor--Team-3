from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SharedFileResponse(BaseModel):
    file_id: int
    file_name: str
    file_path: str
    file_type: str
    entity_type: str
    entity_id: int
    uploaded_by: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class SharedFileUploadResponse(BaseModel):
    message: str
    file: SharedFileResponse
