from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.report_history import ReportHistory
from app.core.role import require_roles


router = APIRouter(
    prefix="/report-history",
    tags=["Report History"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# GET ALL REPORT HISTORY
# ============================================================

@router.get("/")
def get_report_history(
    report_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement",
            "Vendor"
        )
    )
):
    query = db.query(ReportHistory)

    if report_id:
        query = query.filter(
            ReportHistory.report_id == report_id
        )

    return query.order_by(
        ReportHistory.created_at.desc()
    ).all()


# ============================================================
# GET REPORT HISTORY BY ID
# ============================================================

@router.get("/{history_id}")
def get_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement",
            "Vendor"
        )
    )
):
    history = (
        db.query(ReportHistory)
        .filter(
            ReportHistory.history_id == history_id
        )
        .first()
    )

    if not history:
        raise HTTPException(
            status_code=404,
            detail="Report history not found"
        )

    return history