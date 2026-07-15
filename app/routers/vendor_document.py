from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.vendor_document import VendorDocument
from app.models.vendor import Vendor
from app.schemas.vendor_document import (
    VendorDocumentCreate,
    VendorDocumentResponse
)

router = APIRouter(
    prefix="/vendor-documents",
    tags=["Vendor Documents"]
)


# Upload Vendor Document
@router.post("/", response_model=VendorDocumentResponse)
def upload_document(
    document: VendorDocumentCreate,
    db: Session = Depends(get_db)
):

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == document.vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    new_document = VendorDocument(**document.model_dump())

    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    return new_document


# Get Documents of a Vendor
@router.get("/{vendor_id}", response_model=list[VendorDocumentResponse])
def get_vendor_documents(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    documents = db.query(VendorDocument).filter(
        VendorDocument.vendor_id == vendor_id
    ).all()

    return documents


# Delete Vendor Document
@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
):

    document = db.query(VendorDocument).filter(
        VendorDocument.document_id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully"
    }