from fastapi import APIRouter
from app.schemas.user import UserRegister, UserLogin

from app.core.security import create_access_token

router = APIRouter()

# Mock Database
fake_users = []


@router.post("/register")
def register(user: UserRegister):
    fake_users.append(user)
    return {
        "message": "User Registered Successfully",
        "user": user
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