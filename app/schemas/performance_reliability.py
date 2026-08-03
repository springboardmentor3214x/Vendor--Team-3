from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
from decimal import Decimal

# ---------------------------------------------
# Delivery Performance
# ---------------------------------------------
class DeliveryPerformanceBase(BaseModel):
    purchase_order_id: int
    expected_delivery_date: date
    actual_delivery_date: Optional[date] = None
    remarks: Optional[str] = None

class DeliveryPerformanceCreate(DeliveryPerformanceBase):
    vendor_id: int

class DeliveryPerformanceResponse(BaseModel):
    delivery_id: int
    vendor_id: int
    purchase_order_id: int
    expected_delivery_date: date
    actual_delivery_date: Optional[date]
    delay_days: int
    delivery_status: str
    remarks: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ---------------------------------------------
# Product Quality Evaluations
# ---------------------------------------------
class ProductQualityEvaluationBase(BaseModel):
    purchase_order_id: int
    inspection_date: date
    material_quality: int = Field(..., ge=1, le=5)
    packaging_quality: int = Field(..., ge=1, le=5)
    quantity_accuracy: int = Field(..., ge=1, le=5)
    specification_compliance: int = Field(..., ge=1, le=5)
    product_defects: int = Field(0, ge=0)
    remarks: Optional[str] = None

class ProductQualityEvaluationCreate(ProductQualityEvaluationBase):
    vendor_id: int

class ProductQualityEvaluationResponse(BaseModel):
    quality_id: int
    vendor_id: int
    purchase_order_id: int
    inspection_date: date
    material_quality: int
    packaging_quality: int
    quantity_accuracy: int
    specification_compliance: int
    product_defects: int
    overall_quality_rating: str
    remarks: Optional[str]
    evaluated_at: datetime

    class Config:
        from_attributes = True

# ---------------------------------------------
# Communication Logs
# ---------------------------------------------
class CommunicationLogBase(BaseModel):
    purchase_order_id: int
    message_sent_time: datetime
    vendor_response_time: Optional[datetime] = None
    remarks: Optional[str] = None

class CommunicationLogCreate(CommunicationLogBase):
    vendor_id: int

class CommunicationLogResponse(BaseModel):
    communication_id: int
    vendor_id: int
    purchase_order_id: int
    message_sent_time: datetime
    vendor_response_time: Optional[datetime]
    response_duration_hours: Optional[Decimal]
    communication_status: str
    remarks: Optional[str]

    class Config:
        from_attributes = True

# ---------------------------------------------
# Service Ratings
# ---------------------------------------------
class ServiceRatingBase(BaseModel):
    purchase_order_id: int
    professionalism: int = Field(..., ge=1, le=5)
    customer_support: int = Field(..., ge=1, le=5)
    documentation_quality: int = Field(..., ge=1, le=5)
    flexibility: int = Field(..., ge=1, le=5)
    communication_effectiveness: int = Field(..., ge=1, le=5)
    issue_resolution: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None

class ServiceRatingCreate(ServiceRatingBase):
    vendor_id: int

class ServiceRatingResponse(BaseModel):
    rating_id: int
    vendor_id: int
    purchase_order_id: int
    professionalism: int
    customer_support: int
    documentation_quality: int
    flexibility: int
    communication_effectiveness: int
    issue_resolution: int
    overall_service_rating: Decimal
    comments: Optional[str]
    rating_date: datetime

    class Config:
        from_attributes = True

# ---------------------------------------------
# Performance History
# ---------------------------------------------
class PerformanceHistoryResponse(BaseModel):
    history_id: int
    vendor_id: int
    delivery_score: Decimal
    quality_score: Decimal
    communication_score: Decimal
    service_score: Decimal
    overall_performance_score: Decimal
    evaluation_period: str
    remarks: Optional[str]
    recorded_at: datetime

    class Config:
        from_attributes = True

# ---------------------------------------------
# Vendor Rankings
# ---------------------------------------------
class VendorRankingResponse(BaseModel):
    ranking_id: int
    vendor_id: int
    vendor_name: str
    vendor_category: str
    overall_score: Decimal
    rank_position: int
    ranking_date: date
    remarks: Optional[str]

    class Config:
        from_attributes = True

# ---------------------------------------------
# Vendor Reliability
# ---------------------------------------------
class VendorReliabilityResponse(BaseModel):
    reliability_id: int
    vendor_id: int
    vendor_name: str
    vendor_category: str
    reliability_score: Decimal
    risk_level: str
    trend: str
    recommendation_status: str
    last_calculated: datetime

    class Config:
        from_attributes = True

# ---------------------------------------------
# Dashboards Responses
# ---------------------------------------------
class PerformanceDashboardResponse(BaseModel):
    total_vendors_evaluated: int
    avg_delivery_performance: Decimal
    avg_product_quality: Decimal
    avg_response_time_hours: Decimal
    total_completed_orders: int
    delayed_deliveries_count: int
    rankings: List[VendorRankingResponse]

class ReliabilityDashboardResponse(BaseModel):
    total_vendors_evaluated: int
    avg_reliability_score: Decimal
    high_reliability_count: int
    medium_reliability_count: int
    high_risk_count: int
    top_ranked: List[VendorReliabilityResponse]
