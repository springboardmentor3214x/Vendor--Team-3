from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.database.database import Base


class Contract(Base):
    __tablename__ = "contracts"

    contract_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"), nullable=False)
    procurement_id = Column(Integer, ForeignKey("procurement_requests.procurement_id"), nullable=False)

    contract_title = Column(String, nullable=False)
    contract_number = Column(String, unique=True, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    contract_value = Column(Float, nullable=False)
    status = Column(String, default="Active")

    vendor = relationship("Vendor", back_populates="contracts")
<<<<<<< HEAD
    procurement = relationship("ProcurementRequest", back_populates="contracts")
=======
    procurement = relationship("ProcurementRequest", back_populates="contracts")

    documents = relationship(
    "ContractDocument",
    back_populates="contract",
    cascade="all, delete"
)


    milestones = relationship(
    "ContractMilestone",
    back_populates="contract",
    cascade="all, delete"
)


    renewals = relationship(
    "ContractRenewal",
    back_populates="contract",
    cascade="all, delete"
)


    amendments = relationship(
    "ContractAmendment",
    back_populates="contract",
    cascade="all, delete"
)
>>>>>>> 84a41fe (Added contract management module with amendments documents milestones renewal and dashboard)
