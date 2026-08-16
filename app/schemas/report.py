from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date

class ReportFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    vendor_category: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    vendor_id: Optional[int] = None
    min_reliability_score: Optional[float] = None

class VendorPerformanceReportRow(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_category: Optional[str]
    total_purchase_orders_completed: int
    on_time_delivery_percentage: float
    delayed_deliveries: int
    product_quality_rating: float
    communication_response_time: float
    issue_resolution_performance: float
    overall_service_rating: float
    reliability_score: float

class ProcurementReportRow(BaseModel):
    department: str
    total_requests: int
    approved_requests: int
    purchase_orders_generated: int
    procurements_completed: int
    total_expenditure: float

class PurchaseOrderReportRow(BaseModel):
    po_id: int
    po_number: str
    vendor_name: str
    procurement_category: Optional[str]
    purchase_date: Optional[date]
    delivery_date: Optional[date]
    order_value: float
    current_status: str
    invoice_status: str
    completion_date: Optional[date]

class ComplianceReportRow(BaseModel):
    vendor_id: int
    vendor_name: str
    certification_status: str
    compliance_verification_date: Optional[date]
    missing_documents: int
    expired_certifications: int
    pending_activities: int
    compliance_percentage: float

class ContractReportRow(BaseModel):
    contract_id: int
    contract_number: str
    vendor_name: str
    contract_value: float
    start_date: Optional[date]
    end_date: Optional[date]
    renewal_status: str
    contract_type: str
    contract_manager: Optional[str]
    compliance_status: str

class ExecutiveSummaryReport(BaseModel):
    total_registered_vendors: int
    active_vendors: int
    total_procurement_spending: float
    reliability_distribution: Dict[str, int]
    top_performing_vendors: List[VendorPerformanceReportRow]
    delayed_deliveries_count: int
    contracts_near_expiry_count: int
    procurement_completion_rate: float
    average_compliance_percentage: float
    monthly_procurement_trends: Dict[str, float]
