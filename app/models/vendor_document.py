from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class VendorDocument(Base):
    __tablename__ = "vendor_documents"

    document_id = Column(Integer, primary_key=True, index=True)

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.vendor_id"),
        nullable=False
    )

    document_type = Column(String, nullable=False)

    file_name = Column(String, nullable=False)

    file_path = Column(String, nullable=False)

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    status = Column(String, default="Pending")

    vendor = relationship("Vendor")