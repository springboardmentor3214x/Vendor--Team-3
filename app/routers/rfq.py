from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.rfq import Rfq, RfqQuotation
from app.models.vendor import Vendor
from app.schemas.rfq import RfqCreate, RfqResponse, QuotationCreate, QuotationResponse
from app.models.notification import Notification
from app.models.role import Role
from app.models.user import User
from app.core.role import require_roles
from app.core.oauth2 import get_current_user
import uuid

router = APIRouter(
    prefix="/rfqs",
    tags=["RFQs"]
)

@router.get("/", response_model=List[RfqResponse])
def get_rfqs(db: Session = Depends(get_db), current_user = Depends(require_roles("Admin", "Procurement", "SupplyChain", "Vendor", "Auditor"))):
    rfqs = db.query(Rfq).all()
    return rfqs

@router.post("/", response_model=RfqResponse)
def create_rfq(rfq_in: RfqCreate, db: Session = Depends(get_db), current_user = Depends(require_roles("Admin", "Procurement"))):
    new_rfq = Rfq(
        rfq_number=f"RFQ-{uuid.uuid4().hex[:6].upper()}",
        title=rfq_in.title,
        items=rfq_in.items,
        deadline=rfq_in.deadline,
        status="Open",
        created_by_id=current_user.user_id
    )
    db.add(new_rfq)
    db.commit()
    db.refresh(new_rfq)
    
    # Notify all vendors about the new RFQ
    vendor_role = db.query(Role).filter(Role.role_name == "Vendor").first()
    if vendor_role:
        vendors = db.query(User).filter(User.role_id == vendor_role.role_id).all()
        for vendor in vendors:
            notification = Notification(
                user_id=vendor.user_id,
                message=f"New RFQ created: {new_rfq.title} ({new_rfq.rfq_number}). Please submit your quotation."
            )
            db.add(notification)
        db.commit()
        
    return new_rfq

@router.post("/{rfq_id}/quotations", response_model=QuotationResponse)
def submit_quotation(rfq_id: int, quote_in: QuotationCreate, db: Session = Depends(get_db), current_user = Depends(require_roles("Vendor"))):
    rfq = db.query(Rfq).filter(Rfq.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    if rfq.status != "Open":
        raise HTTPException(status_code=400, detail="RFQ is not open for quotations")

    # Check if vendor already submitted
    existing = db.query(RfqQuotation).filter(RfqQuotation.rfq_id == rfq_id, RfqQuotation.vendor_id == current_user.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a quotation for this RFQ")

    # Get vendor company name
    vendor = db.query(Vendor).filter(Vendor.email == current_user.email).first()
    vendor_name = vendor.company_name if vendor else "Unknown Vendor"

    new_quote = RfqQuotation(
        rfq_id=rfq_id,
        vendor_id=current_user.user_id,
        vendor_name=vendor_name,
        proposed_price=quote_in.proposed_price,
        delivery_time=quote_in.delivery_time
    )
    db.add(new_quote)
    db.commit()
    db.refresh(new_quote)
    return new_quote
