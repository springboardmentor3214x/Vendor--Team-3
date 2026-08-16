from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime

from app.database import Base


class ReportHistory(Base):
    __tablename__ = "report_history"

    history_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    report_id = Column(
        Integer,
        nullable=True
    )

    report_name = Column(
        String(255),
        nullable=False
    )

    report_type = Column(
        String(100),
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
        nullable=False,
        default="generated"
    )

    generated_by = Column(
        Integer,
        nullable=False
    )

    error_message = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )