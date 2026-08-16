import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, date, timedelta
from sqlalchemy import text
from app.database.database import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.models.vendor import Vendor
from app.models.procurement import ProcurementRequest
from app.models.contract import Contract
from app.models.message import Message
from app.core.security import hash_password

def seed_db():
    db = SessionLocal()
    
    try:
        db.execute(text("SELECT setval(pg_get_serial_sequence('roles', 'role_id'), coalesce(max(role_id), 1), max(role_id) IS NOT null) FROM roles;"))
        db.commit()
    except Exception as e:
        db.rollback()
        print("Sequence reset failed:", e)

    # Create Roles if they don't exist
    roles = ["Admin", "Procurement Manager", "Vendor", "Auditor", "Finance Manager"]
    role_objs = {}
    for r_name in roles:
        role = db.query(Role).filter(Role.role_name == r_name).first()
        if not role:
            try:
                role = Role(role_name=r_name)
                db.add(role)
                db.commit()
                db.refresh(role)
            except Exception:
                db.rollback()
                role = db.query(Role).filter(Role.role_name == r_name).first()
        role_objs[r_name] = role

    pwd = hash_password("password123")
    
    users_to_create = [
        ("Admin User", "admin@example.com", "Admin"),
        ("Procurement Manager One", "pm@example.com", "Procurement Manager"),
        ("Vendor One", "vendor@example.com", "Vendor"),
        ("Auditor User", "auditor@example.com", "Auditor"),
        ("Finance Manager User", "finance@example.com", "Finance Manager"),
    ]
    
    user_objs = {}
    for full_name, email, role_name in users_to_create:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                full_name=full_name,
                email=email,
                password=pwd,
                role_id=role_objs[role_name].role_id,
                phone="1234567890",
                company="Test Company" if role_name != "Vendor" else "Vendor Corp"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        user_objs[role_name] = user

    vendor_user = user_objs["Vendor"]
    pm_user = user_objs["Procurement Manager"]
    
    # Create Vendor profile
    vendor_email = "vendor@example.com"
    vendor_profile = db.query(Vendor).filter(Vendor.email == vendor_email).first()
    if not vendor_profile:
        vendor_profile = Vendor(
            company_name="Vendor Corp",
            vendor_category="IT Supplies",
            contact_person="Vendor One",
            email=vendor_email,
            gst_number="GST12345",
            pan_number="PAN12345",
            company_registration_number="REG12345",
            vendor_status="Active",
            approval_status="Approved"
        )
        db.add(vendor_profile)
        db.commit()
        db.refresh(vendor_profile)

    # Create Procurement Request
    req = db.query(ProcurementRequest).filter(ProcurementRequest.title == "Test Procurement").first()
    if not req:
        req = ProcurementRequest(
            title="Test Procurement",
            description="Laptops for new employees",
            vendor_id=vendor_profile.vendor_id,
            status="Approved",
            created_date=date.today()
        )
        db.add(req)
        db.commit()
        db.refresh(req)

    # Create Contract
    contract = db.query(Contract).filter(Contract.contract_number == "CON-1001").first()
    if not contract:
        contract = Contract(
            vendor_id=vendor_profile.vendor_id,
            procurement_id=req.procurement_id,
            contract_title="Laptop Supply Agreement",
            contract_number="CON-1001",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=365),
            contract_value=50000.0,
            status="Active"
        )
        db.add(contract)
        db.commit()

    # Create Messages
    msg = db.query(Message).filter(Message.message == "Hello Vendor, are the laptops ready?").first()
    if not msg:
        msg1 = Message(
            sender_id=pm_user.user_id,
            receiver_id=vendor_user.user_id,
            procurement_id=req.procurement_id,
            message="Hello Vendor, are the laptops ready?",
            sent_at=datetime.utcnow()
        )
        msg2 = Message(
            sender_id=vendor_user.user_id,
            receiver_id=pm_user.user_id,
            procurement_id=req.procurement_id,
            message="Yes, they will be shipped tomorrow.",
            sent_at=datetime.utcnow()
        )
        db.add(msg1)
        db.add(msg2)
        db.commit()

    print(f"PM User: pm@example.com / password123")
    print(f"Vendor User: {vendor_email} / password123")
    print("Seeded successfully!")

if __name__ == "__main__":
    seed_db()
