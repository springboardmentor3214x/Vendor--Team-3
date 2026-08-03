from sqlalchemy import Column, Integer, String, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.database import Base

class Rfq(Base):
    __tablename__ = "rfqs"

    id = Column(Integer, primary_key=True, index=True)
    rfq_number = Column(String(50), unique=True, index=True)
    title = Column(String(255), nullable=False)
    items = Column(JSON, nullable=False) # Store array of strings
    deadline = Column(String(50), nullable=False)
    status = Column(String(50), default="Open")
    created_by_id = Column(Integer, ForeignKey("users.user_id"))

    quotations = relationship("RfqQuotation", back_populates="rfq", cascade="all, delete-orphan")


class RfqQuotation(Base):
    __tablename__ = "rfq_quotations"

    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"))
    vendor_id = Column(Integer, ForeignKey("users.user_id")) # Refers to the vendor user
    vendor_name = Column(String(255))
    proposed_price = Column(Integer, nullable=False)
    delivery_time = Column(String(100), nullable=False)

    rfq = relationship("Rfq", back_populates="quotations")
