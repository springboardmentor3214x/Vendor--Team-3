from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

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

    # Auto-notify vendor: find the vendor's user account by email
    _send_auto_notification(
        db=db,
        sender_user=current_user,
        vendor=vendor,
        procurement_id=procurement.procurement_id,
        message_text=(
            f"📦 New Purchase Order Issued: {new_order.order_number}\n"
            f"Amount: ₹{new_order.total_amount}\n"
            f"Expected Delivery: {new_order.delivery_date}\n"
            f"Please review and confirm delivery schedule."
        )
    )

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
    user = current_user
    # Map full database role names to short names checked in code
    role_mapping = {
        "Administrator": "Admin",
        "Procurement Manager": "Procurement",
        "Supply Chain Manager": "Supply",
        "Vendor": "Vendor",
        "Finance Officer": "Finance",
        "Auditor": "Auditor"
    }
    mapped_role = role_mapping.get(user.role.role_name, user.role.role_name)

    if mapped_role == "Vendor":
        vendor = db.query(Vendor).filter(Vendor.email == user.email).first()
        if not vendor:
            return []
        return db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor.vendor_id).all()

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

    user = current_user
    role_mapping = {
        "Administrator": "Admin",
        "Procurement Manager": "Procurement",
        "Supply Chain Manager": "Supply",
        "Vendor": "Vendor",
        "Finance Officer": "Finance",
        "Auditor": "Auditor"
    }
    mapped_role = role_mapping.get(user.role.role_name, user.role.role_name)

    if mapped_role == "Vendor":
        vendor = db.query(Vendor).filter(Vendor.email == user.email).first()
        if not vendor or order.vendor_id != vendor.vendor_id:
            raise HTTPException(
                status_code=403,
                detail="You can only update your own assigned purchase orders"
            )
        
        # Verify that vendors are ONLY updating 'status' or 'actual_delivery_date'
        update_fields = updated_order.model_dump(exclude_unset=True)
        for key in update_fields.keys():
            if key not in ["status", "actual_delivery_date"]:
                raise HTTPException(
                    status_code=403,
                    detail="Vendors are only allowed to update shipment status"
                )

    old_status = order.status
    status_updated_to_completed = False

    update_fields = updated_order.model_dump(exclude_unset=True)

    for key, value in update_fields.items():
        setattr(order, key, value)

    # If the status is updated to completed, and it wasn't completed before:
    if order.status == "Completed" and old_status != "Completed":
        status_updated_to_completed = True
        # Set actual_delivery_date if not set
        if not order.actual_delivery_date:
            order.actual_delivery_date = date.today()

    db.commit()
    db.refresh(order)

    # Auto-notify when status changes
    new_status = update_fields.get("status")
    if new_status and new_status != old_status:
        vendor = db.query(Vendor).filter(Vendor.vendor_id == order.vendor_id).first()
        procurement = db.query(ProcurementRequest).filter(
            ProcurementRequest.procurement_id == order.procurement_id
        ).first()
        if vendor and procurement:
            status_messages = {
                "Approved": f"✅ Your Purchase Order {order.order_number} has been APPROVED. Please prepare for delivery by {order.delivery_date}.",
                "Delivered": f"📬 Purchase Order {order.order_number} has been marked as DELIVERED. Payment processing will begin shortly.",
                "Completed": f"🎉 Purchase Order {order.order_number} is COMPLETED and payment has been processed. Thank you!",
                "Cancelled": f"❌ Purchase Order {order.order_number} has been CANCELLED. Please contact the procurement team for details.",
            }
            msg_text = status_messages.get(
                new_status,
                f"ℹ️ Purchase Order {order.order_number} status updated to: {new_status}"
            )
            _send_auto_notification(
                db=db,
                sender_user=current_user,
                vendor=vendor,
                procurement_id=procurement.procurement_id,
                message_text=msg_text
            )

    # Performance tracking is now handled by the new vendor_reliability module
    pass

    return order


# ---------------------------------------
# Helper: Send Auto Notification
# ---------------------------------------
def _send_auto_notification(db, sender_user, vendor, procurement_id: int, message_text: str):
    """
    Finds the vendor's user account (matched by email) and creates
    an in-app notification message from the system/current user.
    Silently skips if no matching vendor user account is found.
    """
    try:
        from app.models.user import User
        from app.models.message import Message
        from app.models.notification import Notification

        vendor_user = db.query(User).filter(User.email == vendor.email).first()
        if not vendor_user:
            # Vendor may not have a user account yet — skip silently
            return

        notification_msg = Message(
            sender_id=sender_user.user_id,
            receiver_id=vendor_user.user_id,
            procurement_id=procurement_id,
            message=message_text,
            is_read=False
        )
        db.add(notification_msg)

        # Also create a UI Notification
        ui_notification = Notification(
            user_id=vendor_user.user_id,
            message=message_text,
            status="Unread"
        )
        db.add(ui_notification)

        db.commit()
    except Exception:
        # Never let notification failure break the main operation
        db.rollback()