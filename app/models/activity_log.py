from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    action_performed = Column(String(255), nullable=False)
    timestamp = Column(TIMESTAMP, server_default=func.now())
    module_name = Column(String(100), nullable=False)
    related_business_record = Column(String(255), nullable=True) # E.g., "PO-1002" or "Vendor-5"
    ip_address = Column(String(50), nullable=True)

    # Relationships
    user = relationship("User")
