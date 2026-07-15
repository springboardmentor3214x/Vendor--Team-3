from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from app.schemas.user import UserRegister, UserLogin
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


# -----------------------------
# Register
# -----------------------------
@router.post("/register")
def register(user: UserRegister):
    try:
        db = SessionLocal()

        existing_user = db.query(User).filter(
            User.email == user.email
        ).first()

        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")

        hashed_password = hash_password(user.password)

        new_user = User(
            full_name=user.full_name,
            email=user.email,
            password=hashed_password,
            phone=user.phone,
            role_id=user.role_id
        )

        db.add(new_user)
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

# -----------------------------
# Login
# -----------------------------
@router.post("/login")
def login(user: UserLogin):

    db = SessionLocal()

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    if not verify_password(
        user.password,
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

    db.close()

    return {
        "message": "Login Successful",
        "access_token": token,
        "token_type": "bearer"
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