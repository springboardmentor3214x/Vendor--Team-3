from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class ContractDocument(Base):

    __tablename__ = "contract_documents"

    id = Column(Integer, primary_key=True, index=True)

    contract_id = Column(
        Integer,
        ForeignKey("contracts.contract_id"),
        nullable=False
    )

    file_url = Column(String, nullable=False)

    uploaded_by = Column(Integer)

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    contract = relationship(
        "Contract",
        back_populates="documents"
    )