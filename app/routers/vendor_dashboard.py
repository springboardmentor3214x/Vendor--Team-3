from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.role import require_roles

from app.schemas.vendor_dashboard import (
    VendorDashboardResponse
)

from app.services.vendor_dashboard import (
    get_dashboard
)

from app.models.vendor_reliability import VendorReliability
from app.models.purchase_order import PurchaseOrder
from app.models.contract import Contract

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

@router.get("/performance-view")
def performance_view(db: Session = Depends(get_db), current_user = Depends(require_roles("Vendor"))):
    score = db.query(VendorReliability).filter(VendorReliability.vendor_id == current_user.vendor_profile.vendor_id).first()
    if not score:
        return {"message": "No performance data available"}
    return {
        "delivery_accuracy": float(score.delivery_score),
        "product_quality": float(score.quality_score),
        "overall_score": float(score.overall_score)
    }

@router.get("/contract-status")
def contract_status(db: Session = Depends(get_db), current_user = Depends(require_roles("Vendor"))):
    contracts = db.query(Contract).filter(Contract.vendor_id == current_user.vendor_profile.vendor_id).all()
    return [
        {
            "contract_id": c.contract_id,
            "status": c.status,
            "end_date": c.end_date.isoformat() if c.end_date else None
        } for c in contracts
    ]

@router.get("/order-history")
def order_history(db: Session = Depends(get_db), current_user = Depends(require_roles("Vendor"))):
    orders = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == current_user.vendor_profile.vendor_id).all()
    return [
        {
            "po_id": o.order_id,
            "order_number": o.order_number,
            "total_amount": float(o.total_amount),
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else None
        } for o in orders
    ]

@router.get("/communication-summary")
def communication_summary(db: Session = Depends(get_db), current_user = Depends(require_roles("Vendor"))):
    from app.models.message import Message
    unread_count = db.query(Message).filter(
        Message.receiver_id == current_user.user_id,
        Message.is_read == False
    ).count()

    total_messages = db.query(Message).filter(
        (Message.receiver_id == current_user.user_id) | (Message.sender_id == current_user.user_id)
    ).count()

    return {
        "unread_messages": unread_count,
        "total_messages": total_messages
    }

@router.get("/pending-deliveries")
def pending_deliveries(db: Session = Depends(get_db), current_user = Depends(require_roles("Vendor"))):
    deliveries = db.query(PurchaseOrder).filter(
        PurchaseOrder.vendor_id == current_user.vendor_profile.vendor_id,
        PurchaseOrder.status.in_(["Pending", "Processing", "Shipped"])
    ).all()
    return [
        {
            "po_id": d.order_id,
            "order_number": d.order_number,
            "expected_delivery_date": d.delivery_date.isoformat() if d.delivery_date else None,
            "status": d.status
        } for d in deliveries
    ]