from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base



class ContractRenewal(Base):

    __tablename__="contract_renewals"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    contract_id = Column(
        Integer,
        ForeignKey("contracts.contract_id"),
        nullable=False
    )


    renewal_date = Column(
        DateTime
    )


    new_end_date = Column(
        DateTime
    )


    status = Column(
        String,
        default="pending"
    )


    contract = relationship(
        "Contract",
        back_populates="renewals"
    )