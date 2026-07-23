from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.purchase_order import PurchaseOrder
from app.models.procurement import ProcurementRequest
from app.models.vendor import Vendor

from app.schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderUpdate,
    PurchaseOrderResponse,
)

from app.core.role import require_roles

router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase Orders"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------
# Create Purchase Order
# ---------------------------------------
@router.post("/", response_model=PurchaseOrderResponse)
def create_purchase_order(
    order: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement"))
):

    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.procurement_id == order.procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement Request not found"
        )

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == order.vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    new_order = PurchaseOrder(**order.model_dump())

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


# ---------------------------------------
# Get All Purchase Orders
# ---------------------------------------
@router.get("/", response_model=list[PurchaseOrderResponse])
def get_purchase_orders(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    return db.query(PurchaseOrder).all()


# ---------------------------------------
# Get Purchase Order By ID
# ---------------------------------------
@router.get("/{order_id}", response_model=PurchaseOrderResponse)
def get_purchase_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    order = db.query(PurchaseOrder).filter(
        PurchaseOrder.order_id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    return order


# ---------------------------------------
# Update Purchase Order
# ---------------------------------------
@router.put("/{order_id}", response_model=PurchaseOrderResponse)
def update_purchase_order(
    order_id: int,
    updated_order: PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    order = db.query(PurchaseOrder).filter(
        PurchaseOrder.order_id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Purchase Order not found"
        )

    update_fields = updated_order.model_dump(exclude_unset=True)

    for key, value in update_fields.items():
        setattr(order, key, value)

    db.commit()
    db.refresh(order)

    return order