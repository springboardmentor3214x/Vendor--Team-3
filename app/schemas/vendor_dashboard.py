from pydantic import BaseModel


class VendorDashboardResponse(BaseModel):
    total_vendors: int
    average_reliability_score: float
    high_reliability_vendors: int
    medium_reliability_vendors: int
    high_risk_vendors: int
    top_ranked_vendor: int
    recommended_vendors: int