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
    prefix="/procurement-recommendation",
    tags=["Procurement Recommendations"]
)


from typing import Optional

@router.get(
    "/",
    # We will return dynamic list instead of strictly tying to the Pydantic model for now
)
def recommendations(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):

    return get_procurement_recommendations(db, category)