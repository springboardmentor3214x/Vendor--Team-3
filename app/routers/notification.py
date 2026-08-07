from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.notification import Notification

from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse,
)

from app.core.role import require_roles

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=NotificationResponse)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    new_notification = Notification(**notification.model_dump())

    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)

    return new_notification


@router.get("/", response_model=list[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    return db.query(Notification).all()


@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    notification = db.query(Notification).filter(
        Notification.notification_id == notification_id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return notification


@router.put("/{notification_id}", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    updated_notification: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    notification = db.query(Notification).filter(
        Notification.notification_id == notification_id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = updated_notification.is_read

    db.commit()
    db.refresh(notification)

    return notification