from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.vendor import Vendor

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/vendor-summary")
def vendor_summary(db: Session = Depends(get_db)):
    total_vendors = db.query(Vendor).count()
    approved_vendors = db.query(Vendor).filter(Vendor.approval_status == "Approved").count()
    pending_vendors = db.query(Vendor).filter(Vendor.approval_status == "Pending").count()
    active_vendors = db.query(Vendor).filter(Vendor.vendor_status == "Active").count()
    suspended_vendors = db.query(Vendor).filter(Vendor.vendor_status == "Suspended").count()
    rejected_vendors = db.query(Vendor).filter(Vendor.approval_status == "Rejected").count()

    return {
        "total_vendors": total_vendors,
        "approved_vendors": approved_vendors,
        "pending_vendors": pending_vendors,
        "active_vendors": active_vendors,
        "suspended_vendors": suspended_vendors,
        "rejected_vendors": rejected_vendors
    }