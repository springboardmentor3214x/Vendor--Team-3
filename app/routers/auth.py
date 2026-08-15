
# from fastapi import APIRouter, HTTPException, Depends
# from fastapi.security import OAuth2PasswordRequestForm
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm

from fastapi import UploadFile, File
import os
import shutil

from sqlalchemy.orm import Session

from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserProfileUpdate,
    UserProfileResponse,
)

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password
)

from app.database.database import SessionLocal
from app.models.user import User

router = APIRouter()


# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



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


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):

    db = SessionLocal()

    db_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not db_user:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    if not verify_password(
        form_data.password,
        db_user.password
    ):
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    token = create_access_token(
        data={
            "sub": db_user.email,
            "role_id": db_user.role_id
        }
    )

    role_name = db_user.role.role_name if db_user.role else "Unknown"

    # Check onboarding status
    is_onboarded = True
    if role_name.lower() == "vendor":
        from app.models.vendor import Vendor
        vendor_record = db.query(Vendor).filter(Vendor.email == db_user.email).first()
        if not vendor_record:
            is_onboarded = False
        else:
            if not vendor_record.pan_number or not vendor_record.gst_number or not vendor_record.address_line1:
                is_onboarded = False

    db.close()

    return {
        "message": "Login Successful",
        "access_token": token,
        "token_type": "bearer",
        "role": role_name,
        "user_id": db_user.user_id,
        "is_onboarded": is_onboarded
    }

   



  







from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.oauth2 import get_current_user


@router.get("/profile")
def get_profile(
    current_user=Depends(get_current_user)
):

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    db.close()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "user_id": user.user_id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role_id": user.role_id
    }


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    profile: UserProfileUpdate,
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not user:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if profile.full_name is not None:
        user.full_name = profile.full_name

    if profile.phone is not None:
        user.phone = profile.phone

    if profile.address is not None:
        user.address = profile.address

    if profile.company is not None:
        user.company = profile.company

    db.commit()
    db.refresh(user)
    db.close()

    return user

from pydantic import BaseModel


class ForgotPasswordRequest(BaseModel):
    email: str


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    db.close()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email not found"
        )

    return {
        "message": "Password reset link sent successfully (Demo)"
    }



class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.password = hash_password(request.new_password)

    db.commit()
    db.refresh(user)
    db.close()

    return {
        "message": "Password Reset Successfully"
    }



@router.get("/users")
def get_all_users():
    db = SessionLocal()
    users = db.query(User).all()
    db.close()
    return [{"user_id": u.user_id, "email": u.email, "role_id": u.role_id, "full_name": u.full_name} for u in users]


@router.post("/profile/upload-picture")
def upload_profile_picture(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    db = SessionLocal()

    user = db.query(User).filter(
        User.email == current_user["sub"]
    ).first()

    if not user:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Allowed image types
    allowed_extensions = ["jpg", "jpeg", "png"]

    extension = file.filename.split(".")[-1].lower()

    if extension not in allowed_extensions:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG and PNG files are allowed."
        )

    filename = f"user_{user.user_id}.{extension}"

    file_path = os.path.join(
        "uploads",
        "profile_pictures",
        filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    user.profile_picture = file_path

    db.commit()

    db.refresh(user)

    db.close()

    return {
        "message": "Profile picture uploaded successfully.",
        "profile_picture": file_path
    }