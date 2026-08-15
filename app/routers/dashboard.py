from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.database.database import get_db
from app.models.vendor import Vendor
from app.models.procurement import ProcurementRequest
from app.models.purchase_order import PurchaseOrder
from app.models.vendor_reliability import VendorReliability
from app.core.role import require_roles

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/vendor-summary")
def vendor_summary(db: Session = Depends(get_db)):
    counts = db.query(Vendor.approval_status, Vendor.vendor_status, func.count(Vendor.vendor_id)).group_by(Vendor.approval_status, Vendor.vendor_status).all()
    total_vendors, approved_vendors, pending_vendors, active_vendors, suspended_vendors, rejected_vendors = 0, 0, 0, 0, 0, 0
    for app, vend, cnt in counts:
        total_vendors += cnt
        if app == "Approved": approved_vendors += cnt
        if app == "Pending": pending_vendors += cnt
        if app == "Rejected": rejected_vendors += cnt
        if vend == "Active": active_vendors += cnt
        if vend == "Suspended": suspended_vendors += cnt

    return {
        "total_vendors": total_vendors,
        "approved_vendors": approved_vendors,
        "pending_vendors": pending_vendors,
        "active_vendors": active_vendors,
        "suspended_vendors": suspended_vendors,
        "rejected_vendors": rejected_vendors
    }

@router.get("/procurement-stats")
def procurement_stats(db: Session = Depends(get_db), current_user = Depends(require_roles("Procurement", "Admin"))):
    total = db.query(ProcurementRequest).count()
    pending = db.query(ProcurementRequest).filter(ProcurementRequest.status == "Pending").count()
    approved = db.query(ProcurementRequest).filter(ProcurementRequest.status == "Approved").count()
    rejected = db.query(ProcurementRequest).filter(ProcurementRequest.status == "Rejected").count()

    # Requests by department (Mocked since department doesn't exist on ProcurementRequest)
    # Alternatively group by status to show something meaningful
    status_stats = db.query(
        ProcurementRequest.status, func.count(ProcurementRequest.procurement_id)
    ).group_by(ProcurementRequest.status).all()

    return {
        "total_requests": total,
        "pending_approvals": pending,
        "approved": approved,
        "rejected": rejected,
        "by_department": [{"department": d[0] if d[0] else "Unknown", "count": d[1]} for d in status_stats]
    }

@router.get("/active-purchase-orders")
def active_purchase_orders(db: Session = Depends(get_db), current_user = Depends(require_roles("Procurement", "Admin"))):
    pos = db.query(PurchaseOrder, Vendor).join(Vendor).filter(
        PurchaseOrder.status.in_(["Pending", "Processing", "Shipped"])
    ).all()
    
    return [
        {
            "po_id": po.PurchaseOrder.order_id,
            "vendor_name": po.Vendor.company_name,
            "status": po.PurchaseOrder.status,
            "expected_delivery_date": po.PurchaseOrder.delivery_date.isoformat() if hasattr(po.PurchaseOrder, 'delivery_date') and po.PurchaseOrder.delivery_date else None,
            "total_amount": float(po.PurchaseOrder.total_amount)
        } for po in pos
    ]

@router.get("/vendor-performance-summary")
def vendor_performance_summary(db: Session = Depends(get_db), current_user = Depends(require_roles("Procurement", "Admin"))):
    scores = db.query(VendorReliability, Vendor).join(Vendor).all()
    
    return [
        {
            "vendor_id": s.Vendor.vendor_id,
            "vendor_name": s.Vendor.company_name,
            "overall_score": float(s.VendorReliability.reliability_score),
            "delivery_accuracy": float(s.VendorReliability.delivery_score),
            "quality_score": float(s.VendorReliability.quality_score)
        } for s in scores
    ]

@router.get("/delivery-status")
def delivery_status(db: Session = Depends(get_db), current_user = Depends(require_roles("Procurement", "Admin", "Supply Chain Manager"))):
    today = datetime.now().date()
    on_time = db.query(PurchaseOrder).filter(
        PurchaseOrder.status == "Delivered",
        PurchaseOrder.actual_delivery_date <= PurchaseOrder.delivery_date
    ).count() 
    
    delayed = db.query(PurchaseOrder).filter(
        PurchaseOrder.status.in_(["Pending", "Processing", "Shipped"]),
        PurchaseOrder.delivery_date < today
    ).count()
    
    pending_shipments = db.query(PurchaseOrder).filter(PurchaseOrder.status == "Pending").count()
    shipped = db.query(PurchaseOrder).filter(PurchaseOrder.status == "Shipped").count()

    return {
        "on_time_deliveries": on_time,
        "delayed_deliveries": delayed,
        "pending_shipments": pending_shipments,
        "shipped": shipped
    }

@router.get("/cost-analysis")
def cost_analysis(db: Session = Depends(get_db), current_user = Depends(require_roles("Procurement", "Admin"))):
    monthly_costs = db.query(
        func.extract('month', PurchaseOrder.created_at).label('month'),
        func.extract('year', PurchaseOrder.created_at).label('year'),
        func.sum(PurchaseOrder.total_amount).label('total')
    ).group_by(
        func.extract('year', PurchaseOrder.created_at),
        func.extract('month', PurchaseOrder.created_at)
    ).order_by(
        func.extract('year', PurchaseOrder.created_at),
        func.extract('month', PurchaseOrder.created_at)
    ).all()

    vendor_costs = db.query(
        Vendor.company_name,
        func.sum(PurchaseOrder.total_amount).label('total')
    ).join(PurchaseOrder).group_by(Vendor.company_name).order_by(func.sum(PurchaseOrder.total_amount).desc()).limit(5).all()

    return {
        "monthly_expenses": [
            {"month": f"{int(r.year)}-{int(r.month):02d}", "total": float(r.total)} for r in monthly_costs
        ],
        "vendor_expenses": [
            {"vendor_name": r.company_name, "total": float(r.total)} for r in vendor_costs
        ]
    }
