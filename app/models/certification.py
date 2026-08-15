from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class Certification(Base):
    __tablename__ = "certifications"

    certification_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"), nullable=False)
    
    name = Column(String, nullable=False)
    cert_number = Column(String, nullable=False)
    issuing_authority = Column(String, nullable=False)
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    
    document_path = Column(String, nullable=True)
    status = Column(String, default="Active") # Active, Expiring, Expired

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    vendor = relationship("Vendor")
