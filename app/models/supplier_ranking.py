from sqlalchemy import Column, Integer, Float, String, ForeignKey

from app.database.database import Base


class SupplierRanking(Base):
    __tablename__ = "supplier_rankings"

    ranking_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.vendor_id"),
        nullable=False
    )

    vendor_name = Column(
        String,
        nullable=False
    )

    vendor_category = Column(
        String,
        nullable=False
    )

    reliability_score = Column(
        Float,
        default=0
    )

    procurement_risk = Column(
        String,
        default="Medium Risk"
    )

    vendor_rank = Column(
        Integer,
        default=0
    )