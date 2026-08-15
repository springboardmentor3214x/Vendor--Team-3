from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.core.role import require_roles

from app.models.user import User
from app.models.vendor import Vendor
from app.models.procurement import ProcurementRequest
from app.models.purchase_order import PurchaseOrder

router = APIRouter(
    prefix="/admin-dashboard",
    tags=["Admin Dashboard"]
)

@router.get("/overview")
def admin_overview(db: Session = Depends(get_db), current_user = Depends(require_roles("Admin"))):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_vendors = db.query(Vendor).count()
    total_procurement_requests = db.query(ProcurementRequest).count()
    total_purchase_orders = db.query(PurchaseOrder).count()

    vendor_distribution = db.query(
        Vendor.approval_status, func.count(Vendor.vendor_id)
    ).group_by(Vendor.approval_status).all()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_vendors": total_vendors,
        "total_procurement_requests": total_procurement_requests,
        "total_purchase_orders": total_purchase_orders,
        "system_status": "Healthy",
        "vendor_distribution": [{"status": d[0] if d[0] else "Unknown", "count": d[1]} for d in vendor_distribution]
    }
