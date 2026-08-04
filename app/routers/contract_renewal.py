from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.contract_renewal import ContractRenewal
from app.schemas.contract_renewal import (
    ContractRenewalCreate,
    ContractRenewalResponse
)


router = APIRouter(
    prefix="/contract-renewals",
    tags=["Contract Renewals"]
)


@router.post("/", response_model=ContractRenewalResponse)
def create_renewal(
    renewal: ContractRenewalCreate,
    db: Session = Depends(get_db)
):

    obj = ContractRenewal(
        **renewal.dict()
    )

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj



@router.get("/{contract_id}",
response_model=list[ContractRenewalResponse])
def get_renewals(
    contract_id:int,
    db:Session=Depends(get_db)
):

    return db.query(
        ContractRenewal
    ).filter(
        ContractRenewal.contract_id==contract_id
    ).all()