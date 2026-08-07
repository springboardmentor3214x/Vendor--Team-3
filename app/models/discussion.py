from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class Discussion(Base):
    __tablename__ = "discussions"

    discussion_id = Column(Integer, primary_key=True, index=True)

    created_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    related_entity_type = Column(
        String,
        nullable=False
    )

    related_entity_id = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    creator = relationship(
        "User",
        foreign_keys=[created_by]
    )