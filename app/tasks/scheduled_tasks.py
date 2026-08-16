from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.database.database import SessionLocal

from app.models.contract import Contract
from app.models.purchase_order import PurchaseOrder
from app.models.user import User
from app.models.vendor_document import VendorDocument
from app.services.notification_service import create_notification


# ============================================================
# CONTRACT EXPIRY
# ============================================================

def check_contract_expiry():
    """
    Check contracts expiring within the next 30 days.
    """

    db: Session = SessionLocal()

    try:
        today = datetime.utcnow().date()
        expiry_limit = today + timedelta(days=30)

        contracts = (
            db.query(Contract)
            .filter(
                Contract.end_date >= today,
                Contract.end_date <= expiry_limit,
                Contract.status == "Active"
            )
            .all()
        )

        # Procurement users receive contract expiry alerts.
        users = (
    db.query(User)
    .join(User.role)
    .filter(
        User.role.has(
            role_name="Procurement"
        )
    )
    .all()
)

        user_ids = [
            user.user_id
            for user in users
        ]

        for contract in contracts:

            days_remaining = (
                contract.end_date - today
            ).days

            if not user_ids:
                continue

            create_notification(
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

        print(
            f"Contract expiry check completed. "
            f"{len(contracts)} contracts found."
        )

    finally:
        db.close()


# ============================================================
# DELIVERY DELAY
# ============================================================

def check_delivery_delay():
    """
    Check purchase orders whose delivery date has passed
    while the order is still pending.
    """

    db: Session = SessionLocal()

    try:
        today = datetime.utcnow().date()

        orders = (
            db.query(PurchaseOrder)
            .filter(
                PurchaseOrder.delivery_date < today,
                PurchaseOrder.status == "Pending"
            )
            .all()
        )

        users = db.query(User).all()

        user_ids = [
            user.user_id
            for user in users
        ]

        for order in orders:

            if not user_ids:
                continue

            create_notification(
                db=db,
                user_ids=user_ids,
                notification_type="delivery_delayed",
                title="Delivery Delayed",
                message=(
                    f"Purchase Order "
                    f"{order.order_number} "
                    f"has passed its delivery date."
                ),
                related_module="purchase_order",
                related_record_id=order.order_id,
                priority="high",
                methods=["in_app"]
            )

        print(
            f"Delivery delay check completed. "
            f"{len(orders)} delayed orders found."
        )

    finally:
        db.close()


# ============================================================
# COMPLIANCE EXPIRY
# ============================================================
def check_compliance_expiry():
    """
    Check vendor documents expiring within the next 30 days.
    """

    db: Session = SessionLocal()

    try:
        today = datetime.utcnow().date()
        expiry_limit = today + timedelta(days=30)

        documents = (
            db.query(VendorDocument)
            .filter(
                VendorDocument.expiry_date >= today,
                VendorDocument.expiry_date <= expiry_limit
            )
            .all()
        )

        users = db.query(User).all()

        user_ids = [
            user.user_id
            for user in users
        ]

        for document in documents:

            if not user_ids:
                continue

            days_remaining = (
                document.expiry_date - today
            ).days

            create_notification(
                db=db,
                user_ids=user_ids,
                notification_type="compliance_expiry",
                title="Compliance Document Expiry Alert",
                message=(
                    f"Vendor document "
                    f"'{document.file_name}' "
                    f"expires in {days_remaining} days."
                ),
                related_module="vendor_document",
                related_record_id=document.document_id,
                priority="high",
                methods=["in_app"]
            )

        print(
            f"Compliance expiry check completed. "
            f"{len(documents)} documents found."
        )

    finally:
        db.close()



# ============================================================
# RUN ALL PERIODIC CHECKS
# ============================================================

def periodic_system_alerts():

    check_contract_expiry()

    check_delivery_delay()

    check_compliance_expiry()