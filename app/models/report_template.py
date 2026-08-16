from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime

from app.database import Base


class ReportTemplate(Base):
    __tablename__ = "report_templates"

    template_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    template_name = Column(
        String(255),
        nullable=False
    )

    report_type = Column(
        String(100),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    template_config = Column(
        Text,
        nullable=True
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )

    created_by = Column(
        Integer,
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