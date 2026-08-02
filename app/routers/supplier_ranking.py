from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.supplier_ranking import (
    SupplierRankingResponse
)

from app.services.supplier_ranking import (
    get_supplier_rankings
)

router = APIRouter(
    prefix="/supplier-ranking",
    tags=["Supplier Ranking"]
)


@router.get(
    "/",
    response_model=list[SupplierRankingResponse]
)
def get_rankings(
    db: Session = Depends(get_db)
):

    return get_supplier_rankings(db)