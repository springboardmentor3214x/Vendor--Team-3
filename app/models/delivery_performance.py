from sqlalchemy import Column, Integer, String, Date, Text, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class DeliveryPerformance(Base):
    __tablename__ = "delivery_performance"

    delivery_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    purchase_order_id = Column(Integer)
    expected_delivery_date = Column(Date)
    actual_delivery_date = Column(Date)
    delay_days = Column(Integer, default=0)
    delivery_status = Column(String(30))
    remarks = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

    vendor = relationship("Vendor")
