from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    vendor_id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String, unique=True, nullable=False)
    vendor_category = Column(String, nullable=False)

    contact_person = Column(String, nullable=False)
    designation = Column(String)

    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    alternate_phone = Column(String)

    gst_number = Column(String, unique=True)
    pan_number = Column(String, unique=True)
    company_registration_number = Column(String, unique=True)

    address_line1 = Column(String)
    address_line2 = Column(String)

    city = Column(String)
    state = Column(String)
    country = Column(String)
    pincode = Column(String)

    website = Column(String)
    description = Column(String)

    bank_account_number = Column(String)
    ifsc_code = Column(String)
    payment_terms = Column(String)

    vendor_status = Column(String, default="Pending")
    approval_status = Column(String, default="Pending")

    gst_certificate_path = Column(String, nullable=True)
    pan_card_path = Column(String, nullable=True)
    registration_certificate_path = Column(String, nullable=True)

    # Relationships
    procurement_requests = relationship(
        "ProcurementRequest",
        back_populates="vendor"
    )

    purchase_orders = relationship(
        "PurchaseOrder",
        back_populates="vendor"
    )

    contracts = relationship(
        "Contract",
        back_populates="vendor",
        cascade="all, delete-orphan"
    )