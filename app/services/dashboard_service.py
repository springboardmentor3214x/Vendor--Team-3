from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.procurement import ProcurementRequest
from app.models.purchase_order import PurchaseOrder
from app.models.vendor import Vendor
from app.models.user import User
from app.models.contract import Contract
from app.models.vendor_reliability import VendorReliability
from app.schemas.dashboard import (
    ProcurementStats,
    MonthlyProcurementVolume,
    DepartmentProcurement,
    ProcurementCostSummary,
    ProcurementManagerDashboardResponse,
    VendorDashboardStats,
    VendorPerformanceMetrics,
    VendorDashboardResponse,
    AdminDashboardStats,
    AdminDashboardResponse
)
from decimal import Decimal

def get_procurement_dashboard(db: Session) -> ProcurementManagerDashboardResponse:
    # 1. Procurement Stats
    total_requests = db.query(ProcurementRequest).count()
    pending_approvals = db.query(ProcurementRequest).filter(ProcurementRequest.status == "Pending").count()
    active_po = db.query(PurchaseOrder).filter(PurchaseOrder.status.in_(["Pending", "Processing"])).count()
    completed_po = db.query(PurchaseOrder).filter(PurchaseOrder.status == "Delivered").count()
    cancelled_po = db.query(PurchaseOrder).filter(PurchaseOrder.status == "Cancelled").count()
    
    stats = ProcurementStats(
        total_requests=total_requests,
        pending_approvals=pending_approvals,
        active_purchase_orders=active_po,
        completed_orders=completed_po,
        cancelled_orders=cancelled_po
    )
    
    # 2. Cost summary
    total_spend = db.query(func.sum(PurchaseOrder.total_amount)).filter(PurchaseOrder.status == "Delivered").scalar() or 0
    cost_summary = ProcurementCostSummary(
        total_spend=Decimal(total_spend),
        spend_by_category={"Hardware": Decimal("10000.00"), "Software": Decimal("5000.00")}, # Mocked categories for now
        monthly_spend=[]
    )
    
    # 3. Dummy data for charts
    monthly_volume = [
        MonthlyProcurementVolume(month="Jan", count=10),
        MonthlyProcurementVolume(month="Feb", count=15),
    ]
    
    department_volume = [
        DepartmentProcurement(department="IT", count=25),
        DepartmentProcurement(department="HR", count=10),
    ]
    
    recent_delayed = []
    
    return ProcurementManagerDashboardResponse(
        stats=stats,
        monthly_volume=monthly_volume,
        department_volume=department_volume,
        cost_summary=cost_summary,
        recent_delayed_orders=recent_delayed
    )

def get_vendor_dashboard(db: Session, vendor_id: int) -> VendorDashboardResponse:
    # Vendor stats
    active_po = db.query(PurchaseOrder).filter(
        PurchaseOrder.vendor_id == vendor_id,
        PurchaseOrder.status.in_(["Pending", "Processing"])
    ).count()
    
    completed_po = db.query(PurchaseOrder).filter(
        PurchaseOrder.vendor_id == vendor_id,
        PurchaseOrder.status == "Delivered"
    ).count()
    
    reliability = db.query(VendorReliability).filter(VendorReliability.vendor_id == vendor_id).first()
    
    if reliability:
        reliability_score = reliability.reliability_score
        perf = VendorPerformanceMetrics(
            delivery_accuracy=reliability.delivery_score,
            product_quality_score=reliability.quality_score,
            communication_efficiency=reliability.communication_score,
            issue_resolution_performance=reliability.issue_resolution_score
        )
    else:
        reliability_score = 0
        perf = VendorPerformanceMetrics(
            delivery_accuracy=0, product_quality_score=0, communication_efficiency=0, issue_resolution_performance=0
        )
        
    stats = VendorDashboardStats(
        overall_performance_score=(perf.delivery_accuracy + perf.product_quality_score) / 2,
        reliability_score=reliability_score,
        active_purchase_orders=active_po,
        completed_orders=completed_po,
        pending_deliveries=active_po
    )
    
    return VendorDashboardResponse(
        stats=stats,
        performance_metrics=perf,
        contract_status={"active": 1},
        recent_orders=[]
    )

def get_admin_dashboard(db: Session) -> AdminDashboardResponse:
    stats = AdminDashboardStats(
        total_users=db.query(User).count(),
        active_users=db.query(User).filter(User.is_active == True).count(),
        total_vendors=db.query(Vendor).count(),
        total_procurement_requests=db.query(ProcurementRequest).count(),
        total_purchase_orders=db.query(PurchaseOrder).count(),
        total_contracts=db.query(Contract).count()
    )
    
    return AdminDashboardResponse(
        stats=stats,
        vendor_risk_distribution={"Low Risk": 10, "Medium Risk": 5, "High Risk": 1},
        system_health="Optimal"
    )
