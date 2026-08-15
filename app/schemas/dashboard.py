from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from decimal import Decimal

# Procurement Manager Dashboard
class ProcurementStats(BaseModel):
    total_requests: int
    pending_approvals: int
    active_purchase_orders: int
    completed_orders: int
    cancelled_orders: int

class MonthlyProcurementVolume(BaseModel):
    month: str
    count: int

class DepartmentProcurement(BaseModel):
    department: str
    count: int

class ProcurementCostSummary(BaseModel):
    total_spend: Decimal
    spend_by_category: dict[str, Decimal]
    monthly_spend: List[dict]

class ProcurementManagerDashboardResponse(BaseModel):
    stats: ProcurementStats
    monthly_volume: List[MonthlyProcurementVolume]
    department_volume: List[DepartmentProcurement]
    cost_summary: ProcurementCostSummary
    recent_delayed_orders: List[dict]

# Vendor Dashboard
class VendorDashboardStats(BaseModel):
    overall_performance_score: float
    reliability_score: float
    active_purchase_orders: int
    completed_orders: int
    pending_deliveries: int

class VendorPerformanceMetrics(BaseModel):
    delivery_accuracy: float
    product_quality_score: float
    communication_efficiency: float
    issue_resolution_performance: float

class VendorDashboardResponse(BaseModel):
    stats: VendorDashboardStats
    performance_metrics: VendorPerformanceMetrics
    contract_status: dict
    recent_orders: List[dict]

# Admin Dashboard
class AdminDashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_vendors: int
    total_procurement_requests: int
    total_purchase_orders: int
    total_contracts: int

class AdminDashboardResponse(BaseModel):
    stats: AdminDashboardStats
    vendor_risk_distribution: dict
    system_health: str
