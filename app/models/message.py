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

    message_type = Column(
        String,
        nullable=False,
        default="text"
    )

    related_entity_type = Column(
        String,
        nullable=False
    )

    related_entity_id = Column(
        Integer,
        nullable=False
    )

    subject = Column(
        String,
        nullable=True
    )

    content = Column(
        String,
        nullable=False
    )

    is_read = Column(
        Boolean,
        default=False
    )

    read_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
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