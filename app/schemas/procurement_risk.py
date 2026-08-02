from pydantic import BaseModel


class ProcurementRiskResponse(BaseModel):
    vendor_id: int
    reliability_score: float
    risk_level: str

    class Config:
        from_attributes = True