from pydantic import BaseModel
from datetime import datetime


class VendorReliabilityBase(BaseModel):
    delivery_score: float
    quality_score: float
    communication_score: float
    contract_compliance_score: float
    purchase_history_score: float
    issue_resolution_score: float


class VendorReliabilityCreate(VendorReliabilityBase):
    vendor_id: int


class VendorReliabilityRecalculate(BaseModel):
    vendor_id: int


class VendorReliabilityResponse(VendorReliabilityBase):
    reliability_id: int
    vendor_id: int
    reliability_score: float
    risk_level: str
    last_updated: datetime

    class Config:
        from_attributes = True