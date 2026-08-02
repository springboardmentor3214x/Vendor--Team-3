from pydantic import BaseModel


class SupplierRankingResponse(BaseModel):
    vendor_id: int
    reliability_score: float
    risk_level: str
    vendor_rank: int

    class Config:
        from_attributes = True