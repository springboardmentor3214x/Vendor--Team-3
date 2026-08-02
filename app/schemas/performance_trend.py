from pydantic import BaseModel


class PerformanceTrendResponse(BaseModel):
    vendor_id: int
    month: str
    year: int
    delivery_score: float
    quality_score: float
    communication_score: float
    contract_compliance_score: float
    issue_resolution_score: float
    reliability_score: float

    class Config:
        from_attributes = True