from pydantic import BaseModel


class ProcurementDashboardResponse(BaseModel):
    total_procurement_requests: int
    pending_approvals: int
    active_purchase_orders: int
    completed_orders: int
    cancelled_orders: int


class VendorDashboardResponse(BaseModel):
    total_vendors: int
    active_vendors: int
    average_reliability_score: float
    high_risk_vendors: int


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_vendors: int
    total_procurement_requests: int
    total_purchase_orders: int
    total_contracts: int

class VendorPerformanceDashboardResponse(BaseModel):
    vendor_id: int
    reliability_score: float
    delivery_score: float
    quality_score: float
    communication_score: float
    issue_resolution_score: float
    contract_compliance_score: float

class VendorPerformanceDashboardResponse(BaseModel):
    vendor_id: int
    reliability_score: float
    delivery_score: float
    quality_score: float
    communication_score: float
    issue_resolution_score: float
    contract_compliance_score: float

class ContractDashboardResponse(BaseModel):
    total_contracts: int
    active_contracts: int
    expiring_contracts: int
    expired_contracts: int
    pending_renewals: int



class CommunicationDashboardResponse(BaseModel):
    total_messages: int
    total_discussions: int
    total_uploaded_files: int
    unread_notifications: int


class ProcurementCostResponse(BaseModel):
    total_procurement_cost: float
    average_contract_value: float


class DeliveryDashboardResponse(BaseModel):
    active_orders: int
    completed_orders: int
    cancelled_orders: int