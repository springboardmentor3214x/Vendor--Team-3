from pydantic import BaseModel


class ProcurementRecommendationResponse(BaseModel):
    vendor_id: int
    recommendation: str
    reason: str
    reliability_score: float

    class Config:
        from_attributes = True