from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, ForeignKey
from datetime import datetime
from app.database.database import Base

class DeliveryPerformance(Base):
    __tablename__ = "delivery_performance"
    delivery_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.order_id"))
    expected_delivery_date = Column(Date)
    actual_delivery_date = Column(Date, nullable=True)
    delay_days = Column(Integer, default=0)
    delivery_status = Column(String(50))
    remarks = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProductQualityEvaluation(Base):
    __tablename__ = "product_quality_evaluations"
    quality_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.order_id"))
    inspection_date = Column(Date)
    material_quality = Column(Integer)
    packaging_quality = Column(Integer)
    quantity_accuracy = Column(Integer)
    specification_compliance = Column(Integer)
    product_defects = Column(Integer)
    overall_quality_rating = Column(String(50))
    remarks = Column(String(255), nullable=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

class CommunicationLog(Base):
    __tablename__ = "communication_logs"
    communication_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.order_id"))
    message_sent_time = Column(DateTime)
    vendor_response_time = Column(DateTime, nullable=True)
    response_duration_hours = Column(Numeric(5, 2), nullable=True)
    communication_status = Column(String(50))
    remarks = Column(String(255), nullable=True)

class ServiceRating(Base):
    __tablename__ = "service_ratings"
    rating_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.order_id"))
    professionalism = Column(Integer)
    customer_support = Column(Integer)
    documentation_quality = Column(Integer)
    flexibility = Column(Integer)
    communication_effectiveness = Column(Integer)
    issue_resolution = Column(Integer)
    overall_service_rating = Column(Numeric(5, 2))
    comments = Column(String(255), nullable=True)
    rating_date = Column(DateTime, default=datetime.utcnow)

class PerformanceHistory(Base):
    __tablename__ = "performance_history"
    history_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    delivery_score = Column(Numeric(5, 2))
    quality_score = Column(Numeric(5, 2))
    communication_score = Column(Numeric(5, 2))
    service_score = Column(Numeric(5, 2))
    overall_performance_score = Column(Numeric(5, 2))
    evaluation_period = Column(String(50))
    remarks = Column(String(255), nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

class VendorRanking(Base):
    __tablename__ = "vendor_rankings"
    ranking_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    overall_score = Column(Numeric(5, 2))
    rank_position = Column(Integer)
    ranking_date = Column(Date)
    remarks = Column(String(255), nullable=True)
