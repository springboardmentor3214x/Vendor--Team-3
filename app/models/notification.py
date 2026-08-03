from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    message = Column(Text, nullable=False)

    status = Column(String(20), default="Unread")

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    # Relationships
    user = relationship("User")
