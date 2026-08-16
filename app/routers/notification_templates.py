from fastapi import APIRouter, Depends

from app.core.role import require_roles


router = APIRouter(
    prefix="/notification-templates",
    tags=["Notification Templates"]
)


NOTIFICATION_TEMPLATES = [
    {
        "type": "vendor_approved",
        "title": "Vendor Approved",
        "description": "Notification when a vendor is approved.",
        "default_priority": "high"
    },

    {
        "type": "vendor_rejected",
        "title": "Vendor Rejected",
        "description": "Notification when a vendor is rejected.",
        "default_priority": "high"
    },

    {
        "type": "purchase_order_created",
        "title": "Purchase Order Created",
        "description": "Notification when a purchase order is created.",
        "default_priority": "medium"
    },

    {
        "type": "delivery_delayed",
        "title": "Delivery Delayed",
        "description": "Notification when delivery is delayed.",
        "default_priority": "high"
    },

    {
        "type": "contract_expiry",
        "title": "Contract Expiry",
        "description": "Notification when a contract is approaching expiry.",
        "default_priority": "high"
    },

    {
        "type": "compliance_expiry",
        "title": "Compliance Expiry",
        "description": "Notification when compliance is approaching expiry.",
        "default_priority": "high"
    },

    {
        "type": "invoice_approved",
        "title": "Invoice Approved",
        "description": "Notification when an invoice is approved.",
        "default_priority": "medium"
    },

    {
        "type": "new_message",
        "title": "New Message",
        "description": "Notification when a new message is received.",
        "default_priority": "medium"
    }
]


@router.get("/")
def get_notification_templates(
    current_user=Depends(
        require_roles(
            "Admin",
            "Procurement",
            "Vendor"
        )
    )
):
    return {
        "templates": NOTIFICATION_TEMPLATES
    }