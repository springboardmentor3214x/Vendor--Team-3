from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.models.activity_log import ActivityLog
from app.schemas.activity_log import ActivityLogResponse, ActivityLogCreate
from app.core.role import require_roles

router = APIRouter(
    prefix="/activity-logs",
    tags=["Activity Logs"]
)

@router.get("/", response_model=List[ActivityLogResponse])
def get_activity_logs(
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Auditor"))
):
    return db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).all()

@router.post("/", response_model=ActivityLogResponse)
def create_activity_log(
    log: ActivityLogCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Auditor", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer"))
):
    new_log = ActivityLog(
        user_id=current_user.user_id,
        **log.model_dump()
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log
