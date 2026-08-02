from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.procurement_recommendation import (
    ProcurementRecommendationResponse
)

from app.services.procurement_recommendation import (
    get_procurement_recommendations
)

router = APIRouter(
    prefix="/procurement-recommendations",
    tags=["Procurement Recommendations"]
)


@router.get(
    "/",
    response_model=list[ProcurementRecommendationResponse]
)
def recommendations(
    db: Session = Depends(get_db)
):

    return get_procurement_recommendations(db)