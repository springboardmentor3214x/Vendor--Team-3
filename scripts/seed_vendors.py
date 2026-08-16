import sys
import os
import random
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, date, timedelta
from sqlalchemy import text
from app.database.database import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.models.vendor import Vendor
from app.models.procurement import ProcurementRequest
from app.models.purchase_order import PurchaseOrder
from app.models.contract import Contract
from app.models.message import Message
from app.core.security import hash_password

def seed_vendors():
    db = SessionLocal()
    
    try:
        # Add attachment_path column if it doesn't exist
        db.execute(text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_path VARCHAR;"))
        db.commit()
    except Exception as e:
        db.rollback()
        print("Alter table messages failed:", e)

    vendor_role = db.query(Role).filter(Role.role_name == "Vendor").first()
    pm_user = db.query(User).filter(User.email == "pm@example.com").first()

    pwd = hash_password("password123")
    
    vendor_emails = ["seed1@gmail.com", "seed2@gmail.com", "seed3@gmail.com", "seed4@gmail.com", "seed5@gmail.com"]
    
    # Mock PDF
    os.makedirs("uploads/messages", exist_ok=True)
    mock_pdf_path = "uploads/messages/mock_contract.pdf"
    with open(mock_pdf_path, "w") as f:
        f.write("%PDF-1.4\nMock Contract Document Content")

    for i, v_email in enumerate(vendor_emails, start=101):
        # 1. Create User
        user = db.query(User).filter(User.email == v_email).first()
        company_name = f"Vendor Corp {v_email.split('@')[0].upper()}"
        if not user:
            user = User(
                full_name=f"Vendor {v_email.split('@')[0].upper()}",
                email=v_email,
                password=pwd,
                role_id=vendor_role.role_id,
                phone=f"900000000{i}",
                company=company_name
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        # 2. Create Vendor Profile
        vendor = db.query(Vendor).filter(Vendor.email == v_email).first()
        if not vendor:
            vendor = Vendor(
                company_name=company_name,
                vendor_category="General Supplies",
                contact_person=user.full_name,
                email=v_email,
                gst_number=f"GST{i}000",
                pan_number=f"PAN{i}000",
                vendor_status="Active",
                approval_status="Approved"
            )
            db.add(vendor)
            db.commit()
            db.refresh(vendor)
            
        # 3. Create Procurement Request
        req_title = f"Supply Request for {company_name}"
        req = db.query(ProcurementRequest).filter(ProcurementRequest.title == req_title).first()
        if not req:
            req = ProcurementRequest(
                title=req_title,
                description=f"Standard supplies from {company_name}",
                vendor_id=vendor.vendor_id,
                status="Approved",
                created_date=date.today()
            )
            db.add(req)
            db.commit()
            db.refresh(req)
            
        # 4. Create Purchase Order (Pending)
        order_number = f"PO-{i}000"
        order = db.query(PurchaseOrder).filter(PurchaseOrder.order_number == order_number).first()
        if not order:
            order = PurchaseOrder(
                procurement_id=req.procurement_id,
                vendor_id=vendor.vendor_id,
                order_number=order_number,
                order_date=date.today(),
                delivery_date=date.today() + timedelta(days=7),
                total_amount=15000.0 + i*1000,
                status="Pending"
            )
            db.add(order)
            db.commit()
            db.refresh(order)
            
        # 5. Create Contract
        contract_number = f"CON-{i}000"
        contract = db.query(Contract).filter(Contract.contract_number == contract_number).first()
        if not contract:
            contract = Contract(
                vendor_id=vendor.vendor_id,
                procurement_id=req.procurement_id,
                contract_title=f"Agreement {company_name}",
                contract_number=contract_number,
                start_date=date.today(),
                end_date=date.today() + timedelta(days=365),
                contract_value=50000.0,
                status="Active"
            )
            db.add(contract)
            db.commit()
            
        # 6. Create Message with mock PDF attachment
        msg = db.query(Message).filter(
            Message.sender_id == pm_user.user_id,
            Message.receiver_id == user.user_id,
            Message.procurement_id == req.procurement_id
        ).first()
        
        if not msg:
            msg = Message(
                sender_id=pm_user.user_id,
                receiver_id=user.user_id,
                procurement_id=req.procurement_id,
                message="Please find the attached contract PDF for your review.",
                attachment_path=mock_pdf_path,
                sent_at=datetime.utcnow()
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)
            
        # 7. For the first vendor, complete the PO to trigger reliability calculations
        if i == 1 and order.status == "Pending":
            order.status = "Completed"
            order.actual_delivery_date = date.today()
            db.commit()
            
        # Seed Mock Reliability Data for all vendors directly
        from app.models.vendor_reliability import VendorReliability
        from app.models.supplier_ranking import SupplierRanking
        from app.models.performance_trend import PerformanceTrend
        from decimal import Decimal
        
        rel = db.query(VendorReliability).filter(VendorReliability.vendor_id == vendor.vendor_id).first()
        score = 80.0 + (i * 2.5) # Example: 82.5, 85.0, etc.
        if not rel:
            rel = VendorReliability(
                vendor_id=vendor.vendor_id,
                reliability_score=float(score),
                risk_level="Low" if score > 85 else "Medium",
                delivery_score=float(score + 2),
                quality_score=float(score - 1),
                communication_score=float(score + 1)
            )
            db.add(rel)
        
        trend = db.query(PerformanceTrend).filter(PerformanceTrend.vendor_id == vendor.vendor_id).first()
        if not trend:
            trend = PerformanceTrend(
                vendor_id=vendor.vendor_id,
                month="August",
                year=2026,
                delivery_score=score + 2,
                quality_score=score - 1,
                communication_score=score + 1,
                contract_compliance_score=score,
                issue_resolution_score=score,
                reliability_score=score
            )
            db.add(trend)
            
        rank = db.query(SupplierRanking).filter(SupplierRanking.vendor_id == vendor.vendor_id).first()
        if not rank:
            rank = SupplierRanking(
                vendor_id=vendor.vendor_id,
                vendor_name=vendor.company_name,
                vendor_category=vendor.vendor_category,
                reliability_score=score,
                procurement_risk="Low" if score > 85 else "Medium",
                vendor_rank=6-i
            )
            db.add(rank)
            
        db.commit()

    print("Successfully seeded 5 vendors with purchase orders, contracts, and messages with PDF attachments.")
    
if __name__ == "__main__":
    seed_vendors()
