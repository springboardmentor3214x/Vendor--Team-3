from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.database import get_db
from app.models.compliance import ComplianceRecord
from app.schemas.compliance import ComplianceRecordCreate, ComplianceRecordUpdate, ComplianceRecordResponse
from app.core.role import require_roles

router = APIRouter(
    prefix="/compliance",
    tags=["Compliance"]
)

@router.post("/", response_model=ComplianceRecordResponse)
def create_compliance_record(
    record: ComplianceRecordCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement Manager"))
):
    new_record = ComplianceRecord(**record.model_dump())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.get("/", response_model=List[ComplianceRecordResponse])
def get_all_compliance(
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement Manager", "Auditor"))
):
    return db.query(ComplianceRecord).all()

@router.get("/vendor/{vendor_id}", response_model=List[ComplianceRecordResponse])
def get_vendor_compliance(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement Manager", "Auditor", "Vendor"))
):
    return db.query(ComplianceRecord).filter(ComplianceRecord.vendor_id == vendor_id).all()

@router.put("/{compliance_id}", response_model=ComplianceRecordResponse)
def update_compliance_status(
    compliance_id: int,
    update_data: ComplianceRecordUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement Manager"))
):
    record = db.query(ComplianceRecord).filter(ComplianceRecord.compliance_id == compliance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Compliance record not found")
        
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
        
    if update_data.status == "Compliant":
        record.last_verified = datetime.utcnow()
        
    db.commit()
    db.refresh(record)
    return record
