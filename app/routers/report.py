from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.report import Report
from app.models.user import User

from app.schemas.report import (
    ReportCreate,
    ReportResponse,
    ReportGenerateRequest,
    ReportGenerateResponse
)

from app.core.role import require_roles


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
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


# ============================================================
# CREATE REPORT
# ============================================================

@router.post(
    "/",
    response_model=ReportResponse
)
def create_report(
    report: ReportCreate,
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

    new_report = Report(
        report_name=report.report_name,
        report_type=report.report_type,
        description=report.description,
        generated_by=user_id,
        file_format=report.file_format,
        file_path=report.file_path,
        status="generated"
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report


# ============================================================
# GET ALL REPORTS
# ============================================================

@router.get(
    "/",
    response_model=list[ReportResponse]
)
def get_reports(
    report_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement",
            "Vendor"
        )
    )
):
    query = db.query(Report)

    if report_type:
        query = query.filter(
            Report.report_type == report_type
        )

    return query.order_by(
        Report.created_at.desc()
    ).all()


# ============================================================
# GET REPORT BY ID
# ============================================================

@router.get(
    "/{report_id}",
    response_model=ReportResponse
)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement",
            "Vendor"
        )
    )
):
    report = (
        db.query(Report)
        .filter(
            Report.report_id == report_id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    return report


# ============================================================
# GENERATE REPORT
# ============================================================

@router.post(
    "/generate",
    response_model=ReportGenerateResponse
)
def generate_report(
    request: ReportGenerateRequest,
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

    report_name = (
        f"{request.report_type.replace('_', ' ').title()} Report"
    )

    report = Report(
        report_name=report_name,
        report_type=request.report_type,
        description=request.description,
        generated_by=user_id,
        file_format=request.file_format,
        status="generated"
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "message": "Report generated successfully",
        "report_id": report.report_id,
        "report_type": report.report_type,
        "file_format": report.file_format,
        "status": report.status
    }


# ============================================================
# DELETE REPORT
# ============================================================

@router.delete(
    "/{report_id}"
)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Admin"
        )
    )
):
    report = (
        db.query(Report)
        .filter(
            Report.report_id == report_id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    db.delete(report)
    db.commit()

    return {
        "message": "Report deleted successfully",
        "report_id": report_id
    }