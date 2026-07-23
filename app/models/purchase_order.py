from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DECIMAL,
    TIMESTAMP,
    ForeignKey,
    text,
)

from sqlalchemy.orm import relationship

from app.database.database import Base


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    order_id = Column(Integer, primary_key=True, index=True)

    procurement_id = Column(
        Integer,
        ForeignKey("procurement_requests.procurement_id"),
        nullable=False
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.vendor_id"),
        nullable=False
    )

    order_number = Column(
        String(50),
        unique=True,
        nullable=False
    )

    order_date = Column(
        Date,
        nullable=False
    )

    delivery_date = Column(Date)

    total_amount = Column(
        DECIMAL(12, 2),
        nullable=False
    )

    status = Column(
        String(50),
        default="Pending"
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    procurement = relationship(
        "ProcurementRequest",
        back_populates="purchase_orders"
    )

    vendor = relationship(
        "Vendor",
        back_populates="purchase_orders"
    )