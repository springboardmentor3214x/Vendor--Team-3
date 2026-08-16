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
from app.models.vendor import Vendor

router = APIRouter(
    prefix="/vendor-dashboard",
    tags=["Vendor Dashboard"]
)

def get_vendor_for_user(db: Session, current_user):
    """Helper: look up Vendor record by the logged-in user's email."""
    return db.query(Vendor).filter(Vendor.email == current_user.email).first()


@router.get(
    "/",
    response_model=VendorDashboardResponse
)
def dashboard(
    db: Session = Depends(get_db)
):
    return get_dashboard(db)


@router.get("/performance-view")
def performance_view(db: Session = Depends(get_db), current_user=Depends(require_roles("Vendor"))):
    vendor = get_vendor_for_user(db, current_user)
    if not vendor:
        return {"message": "Vendor profile not found"}
    
    score_rec = db.query(VendorReliability).filter(VendorReliability.vendor_id == vendor.vendor_id).first()
    if not score_rec:
        return {"message": "No performance data available"}
    
    reliability = float(score_rec.reliability_score or 0)
    delivery   = float(score_rec.delivery_score or reliability)
    quality    = float(score_rec.quality_score or reliability)
    
    return {
        "delivery_score": delivery,
        "quality_score": quality,
        "overall_score": reliability,
        "delivery_accuracy": delivery,
        "product_quality": quality,
        "reliability_score": reliability
    }


@router.get("/contract-status")
def contract_status(db: Session = Depends(get_db), current_user=Depends(require_roles("Vendor"))):
    vendor = get_vendor_for_user(db, current_user)
    if not vendor:
        return []
    
    contracts = db.query(Contract).filter(Contract.vendor_id == vendor.vendor_id).all()
    return [
        {
            "contract_id": c.contract_id,
            "status": c.status,
            "end_date": c.end_date.isoformat() if c.end_date else None
        } for c in contracts
    ]


@router.get("/order-history")
def order_history(db: Session = Depends(get_db), current_user=Depends(require_roles("Vendor"))):
    vendor = get_vendor_for_user(db, current_user)
    if not vendor:
        return []
    
    orders = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor.vendor_id).all()
    return [
        {
            "po_id": o.order_id,
            "order_number": o.order_number,
            "total_amount": float(o.total_amount),
            "status": o.status,
            "created_at": o.order_date.isoformat() if o.order_date else None
        } for o in orders
    ]


@router.get("/communication-summary")
def communication_summary(db: Session = Depends(get_db), current_user=Depends(require_roles("Vendor"))):
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
def pending_deliveries(db: Session = Depends(get_db), current_user=Depends(require_roles("Vendor"))):
    vendor = get_vendor_for_user(db, current_user)
    if not vendor:
        return []
    
    deliveries = db.query(PurchaseOrder).filter(
        PurchaseOrder.vendor_id == vendor.vendor_id,
        PurchaseOrder.status.in_(["Pending", "In Transit", "Processing", "Shipped"])
    ).all()
    return [
        {
            "po_id": d.order_id,
            "order_number": d.order_number,
            "expected_delivery_date": d.delivery_date.isoformat() if d.delivery_date else None,
            "status": d.status
        } for d in deliveries
    ]