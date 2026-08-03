from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.performance_trend import (
    PerformanceTrendResponse
)

from app.services.performance_trend import (
    get_performance_trends
)

router = APIRouter(
    prefix="/performance-trends",
    tags=["Performance Trends"]
)


@router.get(
    "/{vendor_id}",
    response_model=list[PerformanceTrendResponse]
)
def performance_trends(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    return get_performance_trends(
        vendor_id,
        db
    )