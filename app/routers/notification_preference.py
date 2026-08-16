from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.notification_preference import NotificationPreference
from app.models.user import User

from app.schemas.notification_preference import (
    NotificationPreferenceUpdate,
    NotificationPreferenceResponse
)

from app.core.role import require_roles


router = APIRouter(
    prefix="/notification-preferences",
    tags=["Notification Preferences"]
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
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User authentication required"
        )

    email = current_user.get("sub")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user not found"
        )

    return user.user_id


# ============================================================
# GET CURRENT USER NOTIFICATION PREFERENCES
# ============================================================

@router.get(
    "/",
    response_model=NotificationPreferenceResponse
)
def get_notification_preferences(
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

    preference = (
        db.query(NotificationPreference)
        .filter(
            NotificationPreference.user_id == user_id
        )
        .first()
    )

    if not preference:

        preference = NotificationPreference(
            user_id=user_id,
            email_enabled=True,
            sms_enabled=False,
            in_app_enabled=True,
            high_priority_only=False
        )

        db.add(preference)
        db.commit()
        db.refresh(preference)

    return preference


# ============================================================
# UPDATE CURRENT USER NOTIFICATION PREFERENCES
# ============================================================

@router.put(
    "/",
    response_model=NotificationPreferenceResponse
)
def update_notification_preferences(
    preferences: NotificationPreferenceUpdate,
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

    preference = (
        db.query(NotificationPreference)
        .filter(
            NotificationPreference.user_id == user_id
        )
        .first()
    )

    if not preference:

        preference = NotificationPreference(
            user_id=user_id
        )

        db.add(preference)

    preference.email_enabled = preferences.email_enabled
    preference.sms_enabled = preferences.sms_enabled
    preference.in_app_enabled = preferences.in_app_enabled
    preference.high_priority_only = preferences.high_priority_only

    db.commit()
    db.refresh(preference)

    return preference