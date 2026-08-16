from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime

from app.database import Base


class ReportFilter(Base):
    __tablename__ = "report_filters"

    filter_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    report_type = Column(
        String(100),
        nullable=False
    )

    filter_name = Column(
        String(255),
        nullable=False
    )

    filter_config = Column(
        Text,
        nullable=True
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