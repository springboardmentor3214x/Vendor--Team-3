from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    log_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    notification_id = Column(
        Integer,
        ForeignKey("notifications.notification_id"),
        nullable=False,
        index=True
    )

    channel = Column(
        String(30),
        nullable=False
    )

    status = Column(
        String(30),
        nullable=False
    )

    error_message = Column(
        String,
        nullable=True
    )

    sent_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    notification = relationship(
        "Notification",
        foreign_keys=[notification_id]
    )