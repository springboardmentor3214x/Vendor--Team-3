from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import SessionLocal

from app.models.user import User
from app.models.vendor import Vendor
from app.models.procurement import ProcurementRequest
from app.models.purchase_order import PurchaseOrder
from app.models.contract import Contract
from app.models.vendor_reliability import VendorReliability




from app.models.message import Message
from app.models.discussion import Discussion
from app.models.file_attachment import FileAttachment
from app.models.notification import Notification





from app.schemas.dashboard import (
    ProcurementDashboardResponse,
    VendorDashboardResponse,
    AdminDashboardResponse,
    VendorPerformanceDashboardResponse,
    ContractDashboardResponse,
    CommunicationDashboardResponse,
    ProcurementCostResponse,
    DeliveryDashboardResponse
)



from app.core.role import require_roles

router = APIRouter(
    prefix="/dashboard-analytics",
    tags=["Dashboard Analytics"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------
# Procurement Dashboard
# ---------------------------------------

@router.get(
    "/procurement-summary",
    response_model=ProcurementDashboardResponse
)
def procurement_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    total_procurement_requests = db.query(
        ProcurementRequest
    ).count()

    pending_approvals = db.query(
        ProcurementRequest
    ).filter(
        ProcurementRequest.status == "Pending"
    ).count()

    active_purchase_orders = db.query(
        PurchaseOrder
    ).filter(
        PurchaseOrder.status == "Active"
    ).count()

    completed_orders = db.query(
        PurchaseOrder
    ).filter(
        PurchaseOrder.status == "Completed"
    ).count()

    cancelled_orders = db.query(
        PurchaseOrder
    ).filter(
        PurchaseOrder.status == "Cancelled"
    ).count()

    return ProcurementDashboardResponse(
        total_procurement_requests=total_procurement_requests,
        pending_approvals=pending_approvals,
        active_purchase_orders=active_purchase_orders,
        completed_orders=completed_orders,
        cancelled_orders=cancelled_orders
    )


# ---------------------------------------
# Vendor Dashboard
# ---------------------------------------

@router.get(
    "/vendor-summary",
    response_model=VendorDashboardResponse
)
def vendor_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    total_vendors = db.query(Vendor).count()

    active_vendors = db.query(Vendor).filter(
        Vendor.vendor_status == "Active"
    ).count()

    average_reliability_score = db.query(
        func.avg(VendorReliability.reliability_score)
    ).scalar()

    if average_reliability_score is None:
        average_reliability_score = 0

    high_risk_vendors = db.query(
        VendorReliability
    ).filter(
        VendorReliability.risk_level == "High Risk"
    ).count()

    return VendorDashboardResponse(
        total_vendors=total_vendors,
        active_vendors=active_vendors,
        average_reliability_score=round(
            average_reliability_score, 2
        ),
        high_risk_vendors=high_risk_vendors
    )


# ---------------------------------------
# Admin Dashboard
# ---------------------------------------

@router.get(
    "/admin-summary",
    response_model=AdminDashboardResponse
)
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin")
    )
):

    total_users = db.query(User).count()

    total_vendors = db.query(Vendor).count()

    total_procurement_requests = db.query(
        ProcurementRequest
    ).count()

    total_purchase_orders = db.query(
        PurchaseOrder
    ).count()

    total_contracts = db.query(
        Contract
    ).count()

    return AdminDashboardResponse(
        total_users=total_users,
        total_vendors=total_vendors,
        total_procurement_requests=total_procurement_requests,
        total_purchase_orders=total_purchase_orders,
        total_contracts=total_contracts
    )


# ---------------------------------------
# Vendor Performance Dashboard
# ---------------------------------------

@router.get(
    "/vendor-performance/{vendor_id}",
    response_model=VendorPerformanceDashboardResponse
)
def vendor_performance_dashboard(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    reliability = db.query(
        VendorReliability
    ).filter(
        VendorReliability.vendor_id == vendor_id
    ).first()

    if not reliability:
        raise HTTPException(
            status_code=404,
            detail="Vendor Reliability Record not found"
        )

    return VendorPerformanceDashboardResponse(
        vendor_id=reliability.vendor_id,
        reliability_score=reliability.reliability_score,
        delivery_score=reliability.delivery_score,
        quality_score=reliability.quality_score,
        communication_score=reliability.communication_score,
        issue_resolution_score=reliability.issue_resolution_score,
        contract_compliance_score=reliability.contract_compliance_score
    )



# ---------------------------------------
# Contract Dashboard
# ---------------------------------------

@router.get(
    "/contract-summary",
    response_model=ContractDashboardResponse
)
def contract_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    total_contracts = db.query(
        Contract
    ).count()

    active_contracts = db.query(
        Contract
    ).filter(
        Contract.status == "Active"
    ).count()

    expiring_contracts = db.query(
        Contract
    ).filter(
        Contract.status == "Expiring Soon"
    ).count()

    expired_contracts = db.query(
        Contract
    ).filter(
        Contract.status == "Expired"
    ).count()

    pending_renewals = db.query(
        Contract
    ).filter(
        Contract.status == "Pending Renewal"
    ).count()

    return ContractDashboardResponse(
        total_contracts=total_contracts,
        active_contracts=active_contracts,
        expiring_contracts=expiring_contracts,
        expired_contracts=expired_contracts,
        pending_renewals=pending_renewals
    )


    # ---------------------------------------
# Communication Dashboard
# ---------------------------------------

@router.get(
    "/communication-summary",
    response_model=CommunicationDashboardResponse
)
def communication_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    total_messages = db.query(
        Message
    ).count()

    total_discussions = db.query(
        Discussion
    ).count()

    total_uploaded_files = db.query(
        FileAttachment
    ).count()

    unread_notifications = db.query(
        Notification
    ).filter(
        Notification.is_read == False
    ).count()

    return CommunicationDashboardResponse(
        total_messages=total_messages,
        total_discussions=total_discussions,
        total_uploaded_files=total_uploaded_files,
        unread_notifications=unread_notifications
    )


# ---------------------------------------
# Procurement Cost Analysis
# ---------------------------------------

@router.get(
    "/cost-analysis",
    response_model=ProcurementCostResponse
)
def procurement_cost_analysis(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    total_procurement_cost = db.query(
        func.sum(Contract.contract_value)
    ).scalar()

    average_contract_value = db.query(
        func.avg(Contract.contract_value)
    ).scalar()

    if total_procurement_cost is None:
        total_procurement_cost = 0

    if average_contract_value is None:
        average_contract_value = 0

    return ProcurementCostResponse(
        total_procurement_cost=round(total_procurement_cost, 2),
        average_contract_value=round(average_contract_value, 2)
    )


# ---------------------------------------
# Delivery Status Dashboard
# ---------------------------------------

@router.get(
    "/delivery-status",
    response_model=DeliveryDashboardResponse
)
def delivery_status_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    active_orders = db.query(
        PurchaseOrder
    ).filter(
        PurchaseOrder.status == "Active"
    ).count()

    completed_orders = db.query(
        PurchaseOrder
    ).filter(
        PurchaseOrder.status == "Completed"
    ).count()

    cancelled_orders = db.query(
        PurchaseOrder
    ).filter(
        PurchaseOrder.status == "Cancelled"
    ).count()

    return DeliveryDashboardResponse(
        active_orders=active_orders,
        completed_orders=completed_orders,
        cancelled_orders=cancelled_orders
    )