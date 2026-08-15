from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import SessionLocal
from app.models.contract import Contract
from app.models.purchase_order import PurchaseOrder
from app.models.vendor import Vendor
from app.models.vendor_document import VendorDocument
from app.services.notification_service import NotificationService
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def check_contract_expiries():
    logger.info("Running contract expiry check...")
    db = SessionLocal()
    try:
        from datetime import date
        now = date.today()
        threshold_90 = now + timedelta(days=90)
        threshold_30 = now + timedelta(days=30)
        threshold_7 = now + timedelta(days=7)
        
        contracts = db.query(Contract).filter(
            Contract.end_date <= threshold_90,
            Contract.status == "Active"
        ).all()
        
        for contract in contracts:
            days_left = (contract.end_date - now).days
            if days_left in [90, 30, 7, 0]:
                if days_left <= 7:
                    contract.status = "Expiring Soon"
                    db.commit()

                # Get Procurement Manager
                manager_id = contract.procurement.created_by if contract.procurement else 1 # Default to Admin

                await NotificationService.create_and_send_notification(
                    db=db,
                    user_id=manager_id,
                    notification_type="Contract Expiry",
                    title=f"Contract expiring in {days_left} days",
                    message=f"Contract {contract.contract_number} with vendor {contract.vendor_id} is expiring on {contract.end_date.strftime('%Y-%m-%d')}.",
                    related_module="Contract",
                    related_record_id=contract.contract_id,
                    priority="High" if days_left <= 30 else "Medium",
                    delivery_method="In-App,Email"
                )
    except Exception as e:
        logger.error(f"Error checking contract expiries: {e}")
    finally:
        db.close()

async def check_delivery_delays():
    logger.info("Running delivery delay check...")
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        pos = db.query(PurchaseOrder).filter(
            PurchaseOrder.expected_delivery_date < now,
            PurchaseOrder.status.in_(["Pending", "Processing"])
        ).all()
        
        for po in pos:
            # Notify procurement manager
            await NotificationService.create_and_send_notification(
                db=db,
                user_id=po.procurement_manager_id,
                notification_type="Delivery Delay",
                title=f"Purchase Order {po.po_number} is Delayed",
                message=f"The expected delivery date ({po.expected_delivery_date.strftime('%Y-%m-%d')}) for PO {po.po_number} has passed.",
                related_module="PurchaseOrder",
                related_record_id=po.po_id,
                priority="High",
                delivery_method="In-App,Email"
            )
            # Notify vendor
            await NotificationService.create_and_send_notification(
                db=db,
                user_id=po.vendor_id, # Assuming vendor_id corresponds to user_id in user table (or vendor manager)
                notification_type="Delivery Delay",
                title=f"Action Required: PO {po.po_number} is Delayed",
                message=f"Your expected delivery date for PO {po.po_number} has passed.",
                related_module="PurchaseOrder",
                related_record_id=po.po_id,
                priority="High",
                delivery_method="In-App,Email"
            )
    except Exception as e:
        logger.error(f"Error checking delivery delays: {e}")
    finally:
        db.close()

async def check_compliance_expiries():
    logger.info("Running certification expiry check...")
    db = SessionLocal()
    try:
        from app.models.certification import Certification
        from datetime import date
        now = date.today()
        threshold_30 = now + timedelta(days=30)
        
        certs = db.query(Certification).filter(
            Certification.expiry_date <= threshold_30,
            Certification.status == "Active"
        ).all()
        
        for cert in certs:
            days_left = (cert.expiry_date - now).days
            if days_left in [30, 15, 7, 0]:
                if days_left <= 0:
                    cert.status = "Expired"
                    db.commit()

                # Notify Vendor
                vendor = db.query(Vendor).filter(Vendor.vendor_id == cert.vendor_id).first()
                if vendor:
                    vendor_user = db.query(User).filter(User.email == vendor.email).first()
                    if vendor_user:
                        await NotificationService.create_and_send_notification(
                            db=db,
                            user_id=vendor_user.user_id,
                            notification_type="Certification Expiry",
                            title=f"Certification '{cert.name}' expiring soon",
                            message=f"Your certification '{cert.name}' ({cert.cert_number}) expires in {days_left} days.",
                            related_module="Compliance",
                            related_record_id=cert.certification_id,
                            priority="High" if days_left <= 7 else "Medium",
                            delivery_method="In-App,Email"
                        )
    except Exception as e:
        logger.error(f"Error checking certification expiries: {e}")
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(check_contract_expiries, "cron", hour=8, minute=0) # Every day at 8 AM
    scheduler.add_job(check_delivery_delays, "cron", hour=9, minute=0)
    scheduler.add_job(check_compliance_expiries, "cron", hour=10, minute=0)
    scheduler.start()
    logger.info("Background tasks scheduler started.")
