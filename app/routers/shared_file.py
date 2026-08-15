from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil
from typing import List

from app.database.database import get_db
from app.models.shared_file import SharedFile
from app.schemas.shared_file import SharedFileResponse, SharedFileUploadResponse
from app.core.role import require_roles

router = APIRouter(
    prefix="/shared-files",
    tags=["Shared Files"]
)

# ---------------------------------------
# Upload File
# ---------------------------------------
@router.post("/upload", response_model=SharedFileUploadResponse)
def upload_file(
    entity_type: str = Form(...),
    entity_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer", "Auditor"))
):
    os.makedirs(os.path.join("uploads", "shared"), exist_ok=True)
    file_path = os.path.join("uploads", "shared", f"{entity_type}_{entity_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    new_file = SharedFile(
        file_name=file.filename,
        file_path=file_path,
        file_type=file.content_type or "application/octet-stream",
        entity_type=entity_type,
        entity_id=entity_id,
        uploaded_by=current_user.user_id
    )
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    
    return {"message": "File uploaded successfully", "file": new_file}

# ---------------------------------------
# Get All Files
# ---------------------------------------
@router.get("/", response_model=List[SharedFileResponse])
def get_all_files(
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer", "Auditor"))
):
    return db.query(SharedFile).order_by(SharedFile.uploaded_at.desc()).all()

# ---------------------------------------
# Get Files By Entity
# ---------------------------------------
@router.get("/{entity_type}/{entity_id}", response_model=List[SharedFileResponse])
def get_files_by_entity(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer", "Auditor"))
):
    return db.query(SharedFile).filter(
        SharedFile.entity_type == entity_type,
        SharedFile.entity_id == entity_id
    ).order_by(SharedFile.uploaded_at.desc()).all()

# ---------------------------------------
# Download File
# ---------------------------------------
@router.get("/download/{file_id}")
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer", "Auditor"))
):
    shared_file = db.query(SharedFile).filter(SharedFile.file_id == file_id).first()
    if not shared_file:
        raise HTTPException(status_code=404, detail="File record not found")
        
    if not os.path.exists(shared_file.file_path):
        raise HTTPException(status_code=404, detail="File missing on server")
        
    return FileResponse(shared_file.file_path, filename=shared_file.file_name)
