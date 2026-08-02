from sqlalchemy import Column, Integer, String, Float, ForeignKey

from app.database.database import Base


class ProcurementRecommendation(Base):
    __tablename__ = "procurement_recommendations"

    recommendation_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.vendor_id"),
        nullable=False
    )

    recommendation = Column(
        String,
        nullable=False
    )

    reason = Column(
        String,
        nullable=False
    )

    reliability_score = Column(
        Float,
        default=0
    )