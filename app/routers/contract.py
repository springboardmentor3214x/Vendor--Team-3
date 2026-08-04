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


<<<<<<< HEAD
# ---------------------------------------
# Create Contract
# ---------------------------------------
=======
>>>>>>> 84a41fe (Added contract management module with amendments documents milestones renewal and dashboard)
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


<<<<<<< HEAD
# ---------------------------------------
# Get All Contracts
# ---------------------------------------
=======

>>>>>>> 84a41fe (Added contract management module with amendments documents milestones renewal and dashboard)
@router.get("/", response_model=list[ContractResponse])
def get_contracts(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    return db.query(Contract).all()


<<<<<<< HEAD
# ---------------------------------------
# Get Contract By ID
# ---------------------------------------
=======

>>>>>>> 84a41fe (Added contract management module with amendments documents milestones renewal and dashboard)
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


<<<<<<< HEAD
# ---------------------------------------
# Update Contract
# ---------------------------------------
=======
>>>>>>> 84a41fe (Added contract management module with amendments documents milestones renewal and dashboard)
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

<<<<<<< HEAD
    return contract
=======
    return contract

@router.delete("/{contract_id}")
def delete_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin")
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

    db.delete(contract)
    db.commit()

    return {
        "message": "Contract deleted successfully"
    }
>>>>>>> 84a41fe (Added contract management module with amendments documents milestones renewal and dashboard)
