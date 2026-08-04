from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.role import require_roles
from app.database import get_db
from app.models.contract_amendment import ContractAmendment
from app.schemas.contract_amendment import (
    ContractAmendmentCreate,
    ContractAmendmentResponse
)


router = APIRouter(
    prefix="/contract-amendments",
    tags=["Contract Amendments"]
)


@router.post("/", response_model=ContractAmendmentResponse)
def create_amendment(
    amendment: ContractAmendmentCreate,
    db: Session = Depends(get_db)
):

    obj = ContractAmendment(
        **amendment.dict()
    )

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj



@router.get("/{contract_id}",
response_model=list[ContractAmendmentResponse])
def get_amendments(
    contract_id:int,
    db:Session=Depends(get_db)
):

    return db.query(
        ContractAmendment
    ).filter(
        ContractAmendment.contract_id==contract_id
    ).all()


@router.get("/{amendment_id}")
def get_amendment(
    amendment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    amendment = db.query(
        ContractAmendment
    ).filter(
        ContractAmendment.amendment_id == amendment_id
    ).first()


    if not amendment:
        raise HTTPException(
            status_code=404,
            detail="Amendment not found"
        )


    return amendment