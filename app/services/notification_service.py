from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.user import User
from app.utils.email_service import send_email
from app.utils.sms_service import send_sms
from app.routers.websocket import manager
import asyncio
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    async def create_and_send_notification(
        db: Session,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        related_module: str = None,
        related_record_id: int = None,
        priority: str = "Low",
        delivery_method: str = "In-App"
    ):
        # 1. Save to Database
        new_notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            related_module=related_module,
            related_record_id=related_record_id,
            priority=priority,
            delivery_method=delivery_method
        )
        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)

        # 2. Get User Contact Info
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            logger.error(f"User {user_id} not found for notification.")
            return new_notification

        # 3. Handle Delivery Methods
        methods = [m.strip() for m in delivery_method.split(",")]
        
        if "In-App" in methods:
            try:
                # Need a running event loop to send via websocket
                asyncio.create_task(manager.send_personal_message({
                    "type": "new_notification",
                    "notification": {
                        "id": new_notification.notification_id,
                        "title": new_notification.title,
                        "message": new_notification.message,
                        "priority": new_notification.priority,
                        "time": new_notification.created_at.isoformat() if new_notification.created_at else "",
                        "status": new_notification.status,
                        "module": new_notification.related_module
                    }
                }, user_id))
            except Exception as e:
                logger.error(f"Error sending websocket notification: {e}")

        if "Email" in methods and user.email:
            send_email(
                to_email=user.email,
                subject=f"VendorIQ Alert: {title}",
                body=f"<h3>{title}</h3><p>{message}</p><p>Please log in to the Vendor Reliability Platform to take action.</p>"
            )

        if "SMS" in methods and hasattr(user, 'phone_number') and user.phone_number:
            send_sms(
                to_phone=user.phone_number,
                message=f"VendorIQ: {title} - {message}"
            )

        return new_notification
