from sqlalchemy import Column, Integer, Float, String, ForeignKey

from app.database.database import Base


class PerformanceTrend(Base):
    __tablename__ = "performance_trends"

    trend_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.vendor_id"),
        nullable=False
    )

    month = Column(String)

    year = Column(Integer)

    delivery_score = Column(Float)

    quality_score = Column(Float)

    communication_score = Column(Float)

    contract_compliance_score = Column(Float)

    issue_resolution_score = Column(Float)

    reliability_score = Column(Float)