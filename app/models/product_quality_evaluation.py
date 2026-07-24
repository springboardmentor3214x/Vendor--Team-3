from sqlalchemy import Column, Integer, String, Text, DECIMAL, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class ProductQualityEvaluation(Base):
    __tablename__ = "product_quality_evaluations"

    quality_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    purchase_order_id = Column(Integer)
    quality_score = Column(DECIMAL(5,2))
    defect_count = Column(Integer, default=0)
    inspection_status = Column(String(30))
    remarks = Column(Text)
    evaluated_at = Column(TIMESTAMP, server_default=func.now())

    vendor = relationship("Vendor")
