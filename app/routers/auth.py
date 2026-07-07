from fastapi import APIRouter
from app.schemas.user import UserRegister, UserLogin

from app.core.security import create_access_token

from app.database.database import SessionLocal
from app.models.user import User

router = APIRouter()

# Mock Database
fake_users = []

@router.post("/register")
def register(user: UserRegister):
    db = SessionLocal()

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=user.password,   # We'll hash the password later
        phone=user.phone,
        role_id=user.role_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    db.close()

    return {
        "message": "User Registered Successfully",
        "user": {
            "id": new_user.user_id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "phone": new_user.phone,
            "role_id": new_user.role_id
        }
    }

@router.post("/login")
def login(user: UserLogin):

    token = create_access_token(
        data={"sub": user.email}
    )

    return {
        "message": "Login Successful",
        "access_token": token,
        "token_type": "bearer"
    }