from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.procurement_risk import (
    ProcurementRiskResponse
)

from app.services.procurement_risk import (
    get_procurement_risk
)

router = APIRouter(
    prefix="/procurement-risk",
    tags=["Procurement Risk"]
)


@router.get(
    "/",
    response_model=list[ProcurementRiskResponse]
)
def procurement_risk(
    db: Session = Depends(get_db)
):

    return get_procurement_risk(db)