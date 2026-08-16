from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.report_filter import ReportFilter
from app.models.user import User

from app.core.role import require_roles


router = APIRouter(
    prefix="/report-filters",
    tags=["Report Filters"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_id_from_current_user(db: Session, current_user):

    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="User authentication required"
        )

    email = current_user.get("sub")

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Authenticated user not found"
        )

    return user.user_id


@router.post("/")
def create_filter(
    report_id: int,
    filter_name: str,
    filter_value: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement"
        )
    )
):
    user_id = get_user_id_from_current_user(
        db,
        current_user
    )

    new_filter = ReportFilter(
        report_id=report_id,
        filter_name=filter_name,
        filter_value=filter_value,
        created_by=user_id
    )

    db.add(new_filter)
    db.commit()
    db.refresh(new_filter)

    return new_filter


@router.get("/")
def get_filters(
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
    query = db.query(ReportFilter)

    if report_id:
        query = query.filter(
            ReportFilter.report_id == report_id
        )

    return query.all()


@router.get("/{filter_id}")
def get_filter(
    filter_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement",
            "Vendor"
        )
    )
):
    report_filter = (
        db.query(ReportFilter)
        .filter(
            ReportFilter.filter_id == filter_id
        )
        .first()
    )

    if not report_filter:
        raise HTTPException(
            status_code=404,
            detail="Report filter not found"
        )

    return report_filter


@router.delete("/{filter_id}")
def delete_filter(
    filter_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin")
    )
):
    report_filter = (
        db.query(ReportFilter)
        .filter(
            ReportFilter.filter_id == filter_id
        )
        .first()
    )

    if not report_filter:
        raise HTTPException(
            status_code=404,
            detail="Report filter not found"
        )

    db.delete(report_filter)
    db.commit()

    return {
        "message": "Report filter deleted successfully",
        "filter_id": filter_id
    }