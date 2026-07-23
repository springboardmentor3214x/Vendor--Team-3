from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.core.oauth2 import get_current_user


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_roles(*allowed_roles):
    def role_checker(
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        user = db.query(User).filter(
            User.email == current_user["sub"]
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        role_name = user.role.role_name

        if role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        return user

    return role_checker