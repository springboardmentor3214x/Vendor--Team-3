from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.database import SessionLocal
from app.models.user import User

from app.core.role import require_roles

from app.services.notification_service import (
    create_notification
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notification Testing"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


class NotificationTestRequest(BaseModel):
    user_id: int
    title: str = "Test Notification"
    message: str = "This is a test notification."
    notification_type: str = "test"
    priority: str = "medium"


@router.post("/test-in-app")
def test_in_app_notification(
    request: NotificationTestRequest,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement"
        )
    )
):
    user = db.query(User).filter(
        User.user_id == request.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    notifications = create_notification(
        db=db,
        user_ids=[request.user_id],
        notification_type=request.notification_type,
        title=request.title,
        message=request.message,
        priority=request.priority,
        methods=["in_app"]
    )

    if not notifications:
        return {
            "message": "Notification was not created. "
                       "It may already exist."
        }

    return {
        "message": "Test in-app notification created",
        "notification_id":
            notifications[0].notification_id
    }


@router.post("/test-email")
def test_email_notification(
    request: NotificationTestRequest,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement"
        )
    )
):
    user = db.query(User).filter(
        User.user_id == request.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    notifications = create_notification(
        db=db,
        user_ids=[request.user_id],
        notification_type=request.notification_type,
        title=request.title,
        message=request.message,
        priority=request.priority,
        methods=["email"]
    )

    return {
        "message": "Test email notification requested",
        "notification_id":
            notifications[0].notification_id
            if notifications else None
    }


@router.post("/test-sms")
def test_sms_notification(
    request: NotificationTestRequest,

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement"
        )
    )
):
    user = db.query(User).filter(
        User.user_id == request.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    notifications = create_notification(
        db=db,
        user_ids=[request.user_id],
        notification_type=request.notification_type,
        title=request.title,
        message=request.message,
        priority=request.priority,
        methods=["sms"]
    )

    return {
        "message": "Test SMS notification requested",
        "notification_id":
            notifications[0].notification_id
            if notifications else None
    }