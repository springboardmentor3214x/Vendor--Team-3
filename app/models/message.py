from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class Message(Base):
    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True, index=True)

    sender_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    receiver_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    procurement_id = Column(
        Integer,
        ForeignKey("procurement_requests.procurement_id"),
        nullable=False
    )

    message = Column(String, nullable=False)

    sent_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    is_read = Column(
        Boolean,
        default=False
    )

    # Relationships
    sender = relationship(
        "User",
        foreign_keys=[sender_id],
        back_populates="sent_messages"
    )

    receiver = relationship(
        "User",
        foreign_keys=[receiver_id],
        back_populates="received_messages"
    )

    procurement = relationship(
        "ProcurementRequest",
        back_populates="messages"
    )