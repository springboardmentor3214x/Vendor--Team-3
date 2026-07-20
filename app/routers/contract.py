from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.contract import Contract
from app.models.vendor import Vendor
from app.models.procurement import ProcurementRequest

from app.schemas.contract import (
    ContractCreate,
    ContractUpdate,
    ContractResponse,
)

from app.core.role import require_roles

router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------
# Create Contract
# ---------------------------------------
@router.post("/", response_model=ContractResponse)
def create_contract(
    contract: ContractCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == contract.vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.procurement_id == contract.procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement Request not found"
        )

    new_contract = Contract(**contract.model_dump())

    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    return new_contract


# ---------------------------------------
# Get All Contracts
# ---------------------------------------
@router.get("/", response_model=list[ContractResponse])
def get_contracts(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    return db.query(Contract).all()


# ---------------------------------------
# Get Contract By ID
# ---------------------------------------
@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    contract = db.query(Contract).filter(
        Contract.contract_id == contract_id
    ).first()

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return contract


# ---------------------------------------
# Update Contract
# ---------------------------------------
@router.put("/{contract_id}", response_model=ContractResponse)
def update_contract(
    contract_id: int,
    updated_contract: ContractUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    contract = db.query(Contract).filter(
        Contract.contract_id == contract_id
    ).first()

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    update_fields = updated_contract.model_dump(exclude_unset=True)

    for key, value in update_fields.items():
        setattr(contract, key, value)

    db.commit()
    db.refresh(contract)

    return contract