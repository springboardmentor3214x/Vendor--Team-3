from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.vendor_dashboard import (
    VendorDashboardResponse
)

from app.services.vendor_dashboard import (
    get_dashboard
)

router = APIRouter(
    prefix="/vendor-dashboard",
    tags=["Vendor Dashboard"]
)


@router.get(
    "/",
    response_model=VendorDashboardResponse
)
def dashboard(
    db: Session = Depends(get_db)
):

    return get_dashboard(db)