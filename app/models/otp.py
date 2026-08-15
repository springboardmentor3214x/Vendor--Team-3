from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database.database import Base

class OtpVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    # Storing temp data for registration
    user_data = Column(String, nullable=False) # JSON encoded string
    created_at = Column(DateTime, default=datetime.utcnow)
