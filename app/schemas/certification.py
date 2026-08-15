from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class CertificationBase(BaseModel):
    name: str
    cert_number: str
    issuing_authority: str
    issue_date: date
    expiry_date: date
    status: Optional[str] = "Active"

class CertificationCreate(CertificationBase):
    vendor_id: int

class CertificationUpdate(BaseModel):
    name: Optional[str] = None
    cert_number: Optional[str] = None
    issuing_authority: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: Optional[str] = None

class CertificationResponse(CertificationBase):
    certification_id: int
    vendor_id: int
    document_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
