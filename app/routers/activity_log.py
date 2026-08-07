from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.activity_log import ActivityLog

from app.schemas.activity_log import (
    ActivityLogCreate,
    ActivityLogResponse,
)

from app.core.role import require_roles

router = APIRouter(
    prefix="/activity-logs",
    tags=["Activity Logs"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ActivityLogResponse)
def create_activity_log(
    log: ActivityLogCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin")
    )
):

    new_log = ActivityLog(**log.model_dump())

    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    return new_log


@router.get("/", response_model=list[ActivityLogResponse])
def get_activity_logs(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin")
    )
):

    return db.query(ActivityLog).all()


@router.get("/{log_id}", response_model=ActivityLogResponse)
def get_activity_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin")
    )
):

    log = db.query(ActivityLog).filter(
        ActivityLog.log_id == log_id
    ).first()

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Activity log not found"
        )

    return log