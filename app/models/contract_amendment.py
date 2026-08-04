from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base



class ContractAmendment(Base):

    __tablename__="contract_amendments"


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


    amendment_number = Column(
        String,
        nullable=False
    )


    description = Column(
        String
    )


    file_url = Column(
        String
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    contract = relationship(
        "Contract",
        back_populates="amendments"
    )