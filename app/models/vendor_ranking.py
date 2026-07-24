from sqlalchemy import Column, Integer, Text, DECIMAL, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class VendorRanking(Base):
    __tablename__ = "vendor_rankings"

    ranking_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    overall_score = Column(DECIMAL(5, 2))
    rank_position = Column(Integer)
    ranking_date = Column(Date)
    remarks = Column(Text)

    vendor = relationship("Vendor")
