from sqlalchemy import Column, Integer, Date, ForeignKey, DateTime, Float, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class ContractRenewal(Base):
    __tablename__ = "contract_renewals"

    renewal_id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.contract_id"), nullable=False)
    
    renewal_date = Column(Date, nullable=False)
    new_end_date = Column(Date, nullable=False)
    new_value = Column(Float, nullable=True)
    
    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    contract = relationship("Contract", back_populates="renewals")
