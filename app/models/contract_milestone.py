from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class ContractMilestone(Base):

    __tablename__ = "contract_milestones"


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


    milestone_name = Column(
        String,
        nullable=False
    )


    due_date = Column(
        DateTime
    )


    status = Column(
        String,
        default="pending"
    )


    completed_at = Column(
        DateTime,
        nullable=True
    )


    contract = relationship(
        "Contract",
        back_populates="milestones"
    )