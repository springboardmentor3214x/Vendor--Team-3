from sqlalchemy import Column, Integer, Text, DECIMAL, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class RecommendedVendor(Base):
    __tablename__ = "recommended_vendors"

    recommendation_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    recommendation_reason = Column(Text)
    recommendation_score = Column(DECIMAL(5, 2))
    created_at = Column(TIMESTAMP, server_default=func.now())

    vendor = relationship("Vendor")
