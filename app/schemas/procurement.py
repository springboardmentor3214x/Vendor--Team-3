from pydantic import BaseModel
from datetime import date
from typing import Optional


class ProcurementCreate(BaseModel):
    title: str
    description: Optional[str] = None
    vendor_id: int
    status: Optional[str] = "Draft"
    created_date: date


class ProcurementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    vendor_id: Optional[int] = None
    status: Optional[str] = None


class ProcurementResponse(BaseModel):
    procurement_id: int
    title: str
    description: Optional[str]
    vendor_id: int
    status: str
    created_date: date

    class Config:
        from_attributes = True