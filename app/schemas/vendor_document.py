from pydantic import BaseModel
from datetime import datetime


class VendorDocumentCreate(BaseModel):
    vendor_id: int
    document_type: str
    file_name: str
    file_path: str


class VendorDocumentResponse(VendorDocumentCreate):
    document_id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True