from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    preference_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False,
        unique=True,
        index=True
    )

    email_enabled = Column(
        Boolean,
        default=True,
        nullable=False
    )

    sms_enabled = Column(
        Boolean,
        default=False,
        nullable=False
    )

    in_app_enabled = Column(
        Boolean,
        default=True,
        nullable=False
    )

    high_priority_only = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    user = relationship(
        "User",
        foreign_keys=[user_id]
    )