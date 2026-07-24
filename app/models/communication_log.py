from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class CommunicationLog(Base):
    __tablename__ = "communication_logs"

    communication_id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.vendor_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    communication_type = Column(String(30))
    subject = Column(String(100))
    message = Column(Text)
    communication_date = Column(TIMESTAMP, server_default=func.now())

    vendor = relationship("Vendor")
    user = relationship("User")
