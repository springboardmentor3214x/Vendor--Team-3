from sqlalchemy import Column, Integer, Text, DECIMAL, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class ServiceRating(Base):
    __tablename__ = "service_ratings"

    rating_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    rating = Column(DECIMAL(3, 2))
    feedback = Column(Text)
    rating_date = Column(TIMESTAMP, server_default=func.now())

    vendor = relationship("Vendor")
    user = relationship("User")
