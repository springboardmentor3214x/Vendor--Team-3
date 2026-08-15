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

    notification_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    related_module = Column(String(100), nullable=True)
    related_record_id = Column(Integer, nullable=True)
    
    priority = Column(String(20), default="Low") # High, Medium, Low
    delivery_method = Column(String(50), default="In-App") # In-App, Email, SMS, Multiple

    status = Column(String(20), default="Unread")

    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    # Relationships
    user = relationship("User")
