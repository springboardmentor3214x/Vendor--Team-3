from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.file_attachment import FileAttachment

from app.schemas.file_attachment import (
    FileAttachmentCreate,
    FileAttachmentResponse,
)

from app.core.role import require_roles

router = APIRouter(
    prefix="/file-attachments",
    tags=["File Attachments"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------
# Upload File
# ---------------------------------------

@router.post("/", response_model=FileAttachmentResponse)
def upload_file(
    file: FileAttachmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    new_file = FileAttachment(
        uploaded_by=current_user.user_id,
        file_name=file.file_name,
        file_path=file.file_path,
        file_type=file.file_type,
        related_entity_type=file.related_entity_type,
        related_entity_id=file.related_entity_id
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return new_file


# ---------------------------------------
# Get All Files
# ---------------------------------------

@router.get("/", response_model=list[FileAttachmentResponse])
def get_files(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    return db.query(FileAttachment).all()


# ---------------------------------------
# Get File By ID
# ---------------------------------------

@router.get("/{file_id}", response_model=FileAttachmentResponse)
def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    file = db.query(FileAttachment).filter(
        FileAttachment.file_id == file_id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return file


# ---------------------------------------
# Delete File
# ---------------------------------------

@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin")
    )
):

    file = db.query(FileAttachment).filter(
        FileAttachment.file_id == file_id
    ).first()

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    db.delete(file)
    db.commit()

    return {
        "message": "File deleted successfully"
    }