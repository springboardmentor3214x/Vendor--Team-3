from sqlalchemy import Column, Integer, String, DECIMAL, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class VendorReliability(Base):
    __tablename__ = "vendor_reliability"

    reliability_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    reliability_score = Column(DECIMAL(5, 2))
    risk_level = Column(String(20))
    last_evaluated = Column(TIMESTAMP, server_default=func.now())

    vendor = relationship("Vendor")
