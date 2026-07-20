from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.procurement import ProcurementRequest
from app.models.vendor import Vendor
from app.schemas.procurement import (
    ProcurementCreate,
    ProcurementUpdate,
    ProcurementResponse,
)
from app.core.role import require_roles

router = APIRouter(
    prefix="/procurements",
    tags=["Procurement"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------
# Create Procurement Request
# ---------------------------------------
@router.post("/", response_model=ProcurementResponse)
def create_procurement(
    procurement: ProcurementCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement"))
):

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == procurement.vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    new_procurement = ProcurementRequest(**procurement.dict())

    db.add(new_procurement)
    db.commit()
    db.refresh(new_procurement)

    return new_procurement


# ---------------------------------------
# Get All Procurement Requests
# ---------------------------------------
@router.get("/", response_model=list[ProcurementResponse])
def get_procurements(
    status: str = Query(default=None),
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    query = db.query(ProcurementRequest)

    if status:
        query = query.filter(
            ProcurementRequest.status == status
        )

    procurements = query.offset(skip).limit(limit).all()

    return procurements


# ---------------------------------------
# Get Procurement By ID
# ---------------------------------------
@router.get("/{procurement_id}", response_model=ProcurementResponse)
def get_procurement(
    procurement_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.procurement_id == procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement Request not found"
        )

    return procurement


# ---------------------------------------
# Update Procurement
# ---------------------------------------
@router.put("/{procurement_id}", response_model=ProcurementResponse)
def update_procurement(
    procurement_id: int,
    updated_data: ProcurementUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.procurement_id == procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement Request not found"
        )

    update_fields = updated_data.dict(exclude_unset=True)

    if "vendor_id" in update_fields:
        vendor = db.query(Vendor).filter(
            Vendor.vendor_id == update_fields["vendor_id"]
        ).first()

        if not vendor:
            raise HTTPException(
                status_code=404,
                detail="Vendor not found"
            )

    for key, value in update_fields.items():
        setattr(procurement, key, value)

    db.commit()
    db.refresh(procurement)

    return procurement