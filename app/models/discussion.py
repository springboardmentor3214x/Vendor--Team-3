from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base

class Discussion(Base):
    __tablename__ = "discussions"

    discussion_id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False) # e.g., "PurchaseOrder", "ProcurementRequest"
    entity_id = Column(Integer, nullable=False) # The ID of the related entity
    title = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    messages = relationship("DiscussionMessage", back_populates="discussion", cascade="all, delete-orphan")

class DiscussionMessage(Base):
    __tablename__ = "discussion_messages"

    message_id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("discussions.discussion_id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    content = Column(Text, nullable=False)
    sent_at = Column(TIMESTAMP, server_default=func.now())
    attachment_path = Column(String(500), nullable=True)

    # Relationships
    discussion = relationship("Discussion", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
