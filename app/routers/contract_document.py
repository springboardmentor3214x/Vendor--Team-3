from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.role import require_roles
from app.database import get_db
from app.models.contract_document import ContractDocument
from app.schemas.contract_document import (
    ContractDocumentCreate,
    ContractDocumentResponse
)


router = APIRouter(
    prefix="/contract-documents",
    tags=["Contract Documents"]
)


@router.post("/", response_model=ContractDocumentResponse)
def create_document(
    document: ContractDocumentCreate,
    db: Session = Depends(get_db)
):

    new_document = ContractDocument(
        **document.dict()
    )

    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    return new_document



@router.get("/{contract_id}",
            response_model=list[ContractDocumentResponse])
def get_documents(
    contract_id: int,
    db: Session = Depends(get_db)
):

    return db.query(
        ContractDocument
    ).filter(
        ContractDocument.contract_id == contract_id
    ).all()


@router.delete("/contracts/document/{document_id}")
def delete_contract_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    document = db.query(
        ContractDocument
    ).filter(
        ContractDocument.document_id == document_id
    ).first()


    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )


    db.delete(document)
    db.commit()


    return {
        "message": "Contract document deleted successfully"
    }