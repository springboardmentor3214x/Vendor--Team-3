from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class FileAttachment(Base):
    __tablename__ = "file_attachments"

    file_id = Column(Integer, primary_key=True, index=True)

    uploaded_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    file_name = Column(
        String,
        nullable=False
    )

    file_path = Column(
        String,
        nullable=False
    )

    file_type = Column(
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

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    uploader = relationship(
        "User",
        foreign_keys=[uploaded_by]
    )