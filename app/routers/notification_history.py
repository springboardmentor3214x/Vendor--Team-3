from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.notification import Notification
from app.models.user import User

from app.core.role import require_roles


router = APIRouter(
    prefix="/notifications",
    tags=["Notification History"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_user_id_from_current_user(
    db: Session,
    current_user
):
    email = current_user.get("sub")

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=404,
            detail="Authenticated user not found"
        )

    return user.user_id


@router.get("/history")
def get_notification_history(
    module: Optional[str] = Query(
        default=None
    ),

    priority: Optional[str] = Query(
        default=None
    ),

    read_status: Optional[bool] = Query(
        default=None
    ),

    date_from: Optional[datetime] = Query(
        default=None
    ),

    date_to: Optional[datetime] = Query(
        default=None
    ),

    db: Session = Depends(get_db),

    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement",
            "Vendor"
        )
    )
):
    user_id = get_user_id_from_current_user(
        db,
        current_user
    )

    query = db.query(Notification).filter(
        Notification.user_id == user_id
    )

    # Module filter
    if module:
        query = query.filter(
            Notification.related_module == module
        )

    # Priority filter
    if priority:
        query = query.filter(
            Notification.priority == priority
        )

    # Read/unread filter
    if read_status is not None:
        query = query.filter(
            Notification.is_read == read_status
        )

    # Starting date
    if date_from:
        query = query.filter(
            Notification.created_at >= date_from
        )

    # Ending date
    if date_to:
        query = query.filter(
            Notification.created_at <= date_to
        )

    notifications = query.order_by(
        Notification.created_at.desc()
    ).all()

    return notifications