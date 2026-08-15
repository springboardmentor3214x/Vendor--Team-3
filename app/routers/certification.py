from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil

from app.database.database import get_db
from app.models.certification import Certification
from app.schemas.certification import CertificationCreate, CertificationUpdate, CertificationResponse
from app.core.role import require_roles

router = APIRouter(
    prefix="/certifications",
    tags=["Certifications"]
)

@router.post("/", response_model=CertificationResponse)
def create_certification(
    certification: CertificationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement Manager"))
):
    new_cert = Certification(**certification.model_dump())
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    return new_cert

@router.get("/", response_model=List[CertificationResponse])
def get_all_certifications(
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement Manager", "Auditor"))
):
    return db.query(Certification).all()

@router.get("/vendor/{vendor_id}", response_model=List[CertificationResponse])
def get_vendor_certifications(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement Manager", "Auditor", "Vendor"))
):
    return db.query(Certification).filter(Certification.vendor_id == vendor_id).all()

@router.post("/{certification_id}/upload")
def upload_certificate(
    certification_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement Manager", "Vendor"))
):
    cert = db.query(Certification).filter(Certification.certification_id == certification_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
        
    os.makedirs(os.path.join("uploads", "certifications"), exist_ok=True)
    file_path = os.path.join("uploads", "certifications", f"{certification_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    cert.document_path = file_path
    db.commit()
    db.refresh(cert)
    
    return {"message": "Document uploaded successfully", "document_path": file_path}

@router.get("/{certification_id}/download")
def download_certificate(
    certification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement Manager", "Auditor", "Vendor"))
):
    from fastapi.responses import FileResponse
    cert = db.query(Certification).filter(Certification.certification_id == certification_id).first()
    if not cert or not cert.document_path:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if not os.path.exists(cert.document_path):
        raise HTTPException(status_code=404, detail="File missing on server")
        
    return FileResponse(cert.document_path, filename=os.path.basename(cert.document_path))
