from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class ComplianceRecord(Base):
    __tablename__ = "compliance_records"

    compliance_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"), nullable=False)
    
    requirement_type = Column(String, nullable=False) # e.g., GST Registration, Safety Regulations
    status = Column(String, default="Pending Verification") # Compliant, Pending Verification, Non-Compliant, Expired
    
    last_verified = Column(DateTime(timezone=True), nullable=True)
    next_verification_date = Column(Date, nullable=True)
    
    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    vendor = relationship("Vendor")
