from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ComplianceRecordBase(BaseModel):
    requirement_type: str
    status: Optional[str] = "Pending Verification"
    notes: Optional[str] = None

class ComplianceRecordCreate(ComplianceRecordBase):
    vendor_id: int
    last_verified: Optional[datetime] = None
    next_verification_date: Optional[date] = None

class ComplianceRecordUpdate(BaseModel):
    status: Optional[str] = None
    last_verified: Optional[datetime] = None
    next_verification_date: Optional[date] = None
    notes: Optional[str] = None

class ComplianceRecordResponse(ComplianceRecordBase):
    compliance_id: int
    vendor_id: int
    last_verified: Optional[datetime] = None
    next_verification_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True
