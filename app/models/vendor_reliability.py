from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class VendorReliability(Base):
    __tablename__ = "vendor_reliability"

    reliability_id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.vendor_id"),
        nullable=False
    )

    delivery_score = Column(Float, default=0)

    quality_score = Column(Float, default=0)

    communication_score = Column(Float, default=0)

    contract_compliance_score = Column(Float, default=0)

    purchase_history_score = Column(Float, default=0)

    issue_resolution_score = Column(Float, default=0)

    reliability_score = Column(Float, default=0)

    risk_level = Column(String, default="Medium Risk")

    last_updated = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )