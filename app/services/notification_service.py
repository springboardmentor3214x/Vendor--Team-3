from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.notification import Notification
from app.models.notification_log import NotificationLog
from app.models.notification_preference import NotificationPreference
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder
from app.models.message import Message
from app.models.user import User


# ============================================================
# VENDOR APPROVAL
# ============================================================

def notify_vendor_approval(
    db: Session,
    vendor_id: int,
    approval_status: str
):
    """
    Send notification when vendor approval status changes.
    """

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == vendor_id
    ).first()

    if not vendor:
        return []

    status = approval_status.lower()

    if status == "approved":
        notification_type = "vendor_approved"
        title = "Vendor Approved"
        message = (
            f"Vendor '{vendor.company_name}' "
            "has been approved."
        )
        priority = "high"

    elif status == "rejected":
        notification_type = "vendor_rejected"
        title = "Vendor Rejected"
        message = (
            f"Vendor '{vendor.company_name}' "
            "has been rejected."
        )
        priority = "high"

    else:
        return []

    users = db.query(User).all()

    user_ids = [
        user.user_id
        for user in users
    ]

    if not user_ids:
        return []

    return create_notification(
        db=db,
        user_ids=user_ids,
        notification_type=notification_type,
        title=title,
        message=message,
        related_module="vendor",
        related_record_id=vendor.vendor_id,
        priority=priority,
        methods=["in_app"]
    )


# ============================================================
# VENDOR REJECTION
# ============================================================

def notify_vendor_rejection(
    db: Session,
    vendor_id: int
):
    """
    Notify users when a vendor is rejected.
    """

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == vendor_id
    ).first()

    if not vendor:
        return []

    users = db.query(User).all()

    user_ids = [
        user.user_id
        for user in users
    ]

    if not user_ids:
        return []

    return create_notification(
        db=db,
        user_ids=user_ids,
        notification_type="vendor_rejected",
        title="Vendor Rejected",
        message=(
            f"Vendor '{vendor.company_name}' "
            "has been rejected."
        ),
        related_module="vendor",
        related_record_id=vendor.vendor_id,
        priority="high",
        methods=["in_app"]
    )


# ============================================================
# IN-APP NOTIFICATION
# ============================================================

def send_in_app_notification(
    db: Session,
    notification: Notification
):
    """
    Store an in-app notification delivery log.
    """

    log = NotificationLog(
        notification_id=notification.notification_id,
        channel="in_app",
        status="sent",
        error_message=None,
        sent_at=datetime.utcnow()
    )

    db.add(log)
    db.commit()

    return True


# ============================================================
# EMAIL NOTIFICATION
# ============================================================

def send_email_notification(
    db: Session,
    notification: Notification,
    user: User
):
    """
    Email sending will be connected to SMTP later.
    """

    log = NotificationLog(
        notification_id=notification.notification_id,
        channel="email",
        status="pending",
        error_message=None,
        sent_at=datetime.utcnow()
    )

    db.add(log)
    db.commit()

    return True


# ============================================================
# SMS NOTIFICATION
# ============================================================

def send_sms_notification(
    db: Session,
    notification: Notification,
    user: User
):
    """
    SMS sending will be connected to Twilio later.
    """

    log = NotificationLog(
        notification_id=notification.notification_id,
        channel="sms",
        status="pending",
        error_message=None,
        sent_at=datetime.utcnow()
    )

    db.add(log)
    db.commit()

    return True


# ============================================================
# DUPLICATE CHECK
# ============================================================

def avoid_duplicate_notification(
    db: Session,
    user_id: int,
    notification_type: str,
    related_module: Optional[str] = None,
    related_record_id: Optional[int] = None
):
    """
    Check whether the same notification already exists.
    """

    query = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.notification_type == notification_type
    )

    if related_module is not None:
        query = query.filter(
            Notification.related_module == related_module
        )

    if related_record_id is not None:
        query = query.filter(
            Notification.related_record_id == related_record_id
        )

    return query.first() is not None


# ============================================================
# CREATE NOTIFICATION
# ============================================================

def create_notification(
    db: Session,
    user_ids: List[int],
    notification_type: str,
    title: str,
    message: str,
    description: Optional[str] = None,
    related_module: Optional[str] = None,
    related_record_id: Optional[int] = None,
    priority: str = "medium",
    methods: Optional[List[str]] = None
):
    """
    Create notifications for one or more users
    and trigger the requested delivery channels.
    """

    if methods is None:
        methods = ["in_app"]

    created_notifications = []

    for user_id in user_ids:

        if avoid_duplicate_notification(
            db,
            user_id,
            notification_type,
            related_module,
            related_record_id
        ):
            continue

        user = db.query(User).filter(
            User.user_id == user_id
        ).first()

        if not user:
            continue

        preference = db.query(
            NotificationPreference
        ).filter(
            NotificationPreference.user_id == user_id
        ).first()

        if not preference:
            preference = NotificationPreference(
                user_id=user_id,
                email_enabled=True,
                sms_enabled=False,
                in_app_enabled=True,
                high_priority_only=False
            )

            db.add(preference)
            db.commit()
            db.refresh(preference)

        if (
            preference.high_priority_only
            and priority.lower() != "high"
        ):
            continue

        notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            description=description,
            related_module=related_module,
            related_record_id=related_record_id,
            priority=priority,
            delivery_method=",".join(methods),
            is_read=False
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        if (
            "in_app" in methods
            and preference.in_app_enabled
        ):
            send_in_app_notification(
                db,
                notification
            )

        if (
            "email" in methods
            and preference.email_enabled
        ):
            send_email_notification(
                db,
                notification,
                user
            )

        if (
            "sms" in methods
            and preference.sms_enabled
        ):
            send_sms_notification(
                db,
                notification,
                user
            )

        created_notifications.append(notification)

    return created_notifications


# ============================================================
# PURCHASE ORDER CREATED
# ============================================================

def notify_purchase_order_created(
    db: Session,
    order_id: int
):
    """
    Notify users when a purchase order is created.
    """

    order = db.query(
        PurchaseOrder
    ).filter(
        PurchaseOrder.order_id == order_id
    ).first()

    if not order:
        return []

    users = db.query(User).all()

    user_ids = [
        user.user_id
        for user in users
    ]

    if not user_ids:
        return []

    return create_notification(
        db=db,
        user_ids=user_ids,
        notification_type="purchase_order_created",
        title="Purchase Order Created",
        message=(
            f"Purchase Order "
            f"{order.order_number} "
            "has been created."
        ),
        related_module="purchase_order",
        related_record_id=order.order_id,
        priority="medium",
        methods=["in_app"]
    )


# ============================================================
# NEW MESSAGE
# ============================================================

def notify_new_message(
    db: Session,
    message_id: int
):
    """
    Notify the receiver when a new message is created.
    """

    message = db.query(
        Message
    ).filter(
        Message.message_id == message_id
    ).first()

    if not message:
        return []

    return create_notification(
        db=db,
        user_ids=[message.receiver_id],
        notification_type="new_message",
        title=(
            message.subject
            if message.subject
            else "New Message"
        ),
        message=(
            f"You received a new message: "
            f"{message.content[:200]}"
        ),
        related_module="message",
        related_record_id=message.message_id,
        priority="medium",
        methods=["in_app"]
    )


# ============================================================
# EVENT USER MAPPING
# ============================================================

def get_users_for_event(
    db: Session,
    event_type: str,
    **kwargs
):
    """
    Return target users for a business event.
    """

    users = []

    if event_type in [
        "vendor_approved",
        "vendor_rejected",
        "purchase_order_created",
        "invoice_approved",
        "contract_expiry",
        "compliance_expiry",
        "delivery_delayed",
        "new_message"
    ]:
        users = db.query(User).all()

    return users
# ============================================================
# DELIVERY DELAYED
# ============================================================

def notify_delivery_delayed(
    db: Session,
    order_id: int
):
    """
    Notify users when a purchase order delivery is delayed.
    """

    order = db.query(
        PurchaseOrder
    ).filter(
        PurchaseOrder.order_id == order_id
    ).first()

    if not order:
        return []

    users = db.query(User).all()

    user_ids = [
        user.user_id
        for user in users
    ]

    if not user_ids:
        return []

    return create_notification(
        db=db,
        user_ids=user_ids,
        notification_type="delivery_delayed",
        title="Delivery Delayed",
        message=(
            f"Purchase Order "
            f"{order.order_number} "
            "has passed its delivery date."
        ),
        related_module="purchase_order",
        related_record_id=order.order_id,
        priority="high",
        methods=["in_app"]
    )
# ============================================================
# CONTRACT EXPIRY
# ============================================================

def notify_contract_expiry(
    db: Session,
    contract_id: int,
    days_remaining: int
):
    """
    Notify users when a contract is approaching expiry.
    """

    from app.models.contract import Contract

    contract = db.query(
        Contract
    ).filter(
        Contract.contract_id == contract_id
    ).first()

    if not contract:
        return []

    users = db.query(User).all()

    user_ids = [
        user.user_id
        for user in users
    ]

    if not user_ids:
        return []

    return create_notification(
        db=db,
        user_ids=user_ids,
        notification_type="contract_expiry",
        title="Contract Expiry Alert",
        message=(
            f"Contract '{contract.contract_title}' "
            f"({contract.contract_number}) "
            f"expires in {days_remaining} days."
        ),
        related_module="contract",
        related_record_id=contract.contract_id,
        priority="high",
        methods=["in_app"]
    )
# ============================================================
# COMPLIANCE EXPIRY
# ============================================================

def notify_compliance_expiry(
    db: Session,
    document_id: int,
    days_remaining: int
):
    """
    Notify users when a vendor compliance document
    is approaching expiry.
    """

    from app.models.vendor_document import VendorDocument

    document = db.query(
        VendorDocument
    ).filter(
        VendorDocument.document_id == document_id
    ).first()

    if not document:
        return []

    users = db.query(User).all()

    user_ids = [
        user.user_id
        for user in users
    ]

    if not user_ids:
        return []

    return create_notification(
        db=db,
        user_ids=user_ids,
        notification_type="compliance_expiry",
        title="Compliance Document Expiry Alert",
        message=(
            f"Vendor compliance document "
            f"'{document.file_name}' "
            f"expires in {days_remaining} days."
        ),
        related_module="vendor_document",
        related_record_id=document.document_id,
        priority="high",
        methods=["in_app"]
    )