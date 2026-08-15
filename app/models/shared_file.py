from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base

class SharedFile(Base):
    __tablename__ = "shared_files"

    file_id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False) # e.g., "Vendor", "PurchaseOrder", "Discussion"
    entity_id = Column(Integer, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    uploaded_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    uploader = relationship("User")
