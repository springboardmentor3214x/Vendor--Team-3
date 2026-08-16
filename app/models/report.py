from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Text

from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    report_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    report_name = Column(
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

    generated_by = Column(
        Integer,
        nullable=False
    )

    file_format = Column(
        String(20),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=True
    )

    status = Column(
        String(50),
        default="generated",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )