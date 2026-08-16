from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.report_template import ReportTemplate
from app.models.user import User

from app.schemas.report_template import (
    ReportTemplateCreate,
    ReportTemplateResponse
)

from app.core.role import require_roles


router = APIRouter(
    prefix="/report-templates",
    tags=["Report Templates"]
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
# CREATE REPORT TEMPLATE
# ============================================================

@router.post(
    "/",
    response_model=ReportTemplateResponse
)
def create_report_template(
    template: ReportTemplateCreate,
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

    new_template = ReportTemplate(
        template_name=template.template_name,
        report_type=template.report_type,
        description=template.description,
        file_format=template.file_format,
        created_by=user_id
    )

    db.add(new_template)
    db.commit()
    db.refresh(new_template)

    return new_template


# ============================================================
# GET ALL REPORT TEMPLATES
# ============================================================

@router.get(
    "/",
    response_model=list[ReportTemplateResponse]
)
def get_report_templates(
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
    query = db.query(ReportTemplate)

    if report_type:
        query = query.filter(
            ReportTemplate.report_type == report_type
        )

    return query.order_by(
        ReportTemplate.created_at.desc()
    ).all()


# ============================================================
# GET REPORT TEMPLATE BY ID
# ============================================================

@router.get(
    "/{template_id}",
    response_model=ReportTemplateResponse
)
def get_report_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement",
            "Vendor"
        )
    )
):
    template = (
        db.query(ReportTemplate)
        .filter(
            ReportTemplate.template_id == template_id
        )
        .first()
    )

    if not template:
        raise HTTPException(
            status_code=404,
            detail="Report template not found"
        )

    return template


# ============================================================
# DELETE REPORT TEMPLATE
# ============================================================

@router.delete(
    "/{template_id}"
)
def delete_report_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin")
    )
):
    template = (
        db.query(ReportTemplate)
        .filter(
            ReportTemplate.template_id == template_id
        )
        .first()
    )

    if not template:
        raise HTTPException(
            status_code=404,
            detail="Report template not found"
        )

    db.delete(template)
    db.commit()

    return {
        "message": "Report template deleted successfully",
        "template_id": template_id
    }