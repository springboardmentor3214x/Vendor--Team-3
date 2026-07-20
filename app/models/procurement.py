from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class ProcurementRequest(Base):
    __tablename__ = "procurement_requests"

    procurement_id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    description = Column(String)

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.vendor_id"),
        nullable=False
    )

    status = Column(String, default="Pending")

    created_date = Column(Date)

    # Relationships
    vendor = relationship(
        "Vendor",
        back_populates="procurement_requests"
    )

    purchase_orders = relationship(
        "PurchaseOrder",
        back_populates="procurement",
        cascade="all, delete-orphan"
    )

    contracts = relationship(
        "Contract",
        back_populates="procurement",
        cascade="all, delete-orphan"
    )

    messages = relationship(
        "Message",
        back_populates="procurement",
        cascade="all, delete-orphan"
    )