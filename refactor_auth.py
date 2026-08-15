import os

auth_py_path = 'c:/Users/namke/OneDrive/Desktop/vendor_reliability/app/routers/auth.py'

with open(auth_py_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the `def register` logic.

new_register_logic = """
from app.models.otp import OtpVerification
from app.core.email import send_otp_email
import random
import json
from datetime import datetime, timedelta
from pydantic import BaseModel

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

@router.post("/register")
def register(user: UserRegister):
    try:
        db = SessionLocal()

        existing_user = db.query(User).filter(
            User.email == user.email
        ).first()

        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Generate OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Remove old OTPs for this email
        db.query(OtpVerification).filter(OtpVerification.email == user.email).delete()

        otp_entry = OtpVerification(
            email=user.email,
            otp_code=otp_code,
            expires_at=datetime.utcnow() + timedelta(minutes=10),
            user_data=json.dumps({
                "full_name": user.full_name,
                "email": user.email,
                "password": user.password,
                "phone": user.phone,
                "role_id": user.role_id
            })
        )

        db.add(otp_entry)
        db.commit()

        # Send OTP
        send_otp_email(user.email, otp_code)

        return {
            "message": "OTP sent to email. Please verify to complete registration."
        }

    except Exception as e:
        print("========== ERROR ==========")
        print(e)
        raise
    finally:
        db.close()


@router.post("/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    try:
        db = SessionLocal()

        otp_record = db.query(OtpVerification).filter(
            OtpVerification.email == req.email,
            OtpVerification.otp_code == req.otp
        ).first()

        if not otp_record:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        if otp_record.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="OTP has expired")

        user_data = json.loads(otp_record.user_data)
        hashed_password = hash_password(user_data["password"])

        new_user = User(
            full_name=user_data["full_name"],
            email=user_data["email"],
            password=hashed_password,
            phone=user_data["phone"],
            role_id=user_data["role_id"]
        )

        db.add(new_user)
        # Delete OTP record
        db.delete(otp_record)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "User Registered Successfully"
        }

    except Exception as e:
        print("========== ERROR ==========")
        print(e)
        raise
    finally:
        db.close()
"""

# Replace the existing `def register` block
import re

content = re.sub(
    r'@router\.post\("/register"\)\s*def register\(user: UserRegister\):.*?(?=@router\.post\("/login"\))',
    new_register_logic + "\n\n",
    content,
    flags=re.DOTALL
)

with open(auth_py_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced auth.py logic")
