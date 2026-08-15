from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
import os
import shutil

from app.core.role import require_roles
from app.database.database import SessionLocal
from app.models.vendor import Vendor
from app.schemas.vendor import VendorCreate, VendorResponse

router = APIRouter(
    prefix="/vendors",
    tags=["Vendor"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# Add Vendor
# -----------------------------
@router.post("/")
def create_vendor(
    vendor: VendorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement"))
):

    # Duplicate Email
    if db.query(Vendor).filter(Vendor.email == vendor.email).first():
        raise HTTPException(status_code=400, detail="Vendor email already exists")

    # Duplicate Company Name
    if db.query(Vendor).filter(Vendor.company_name == vendor.company_name).first():
        raise HTTPException(status_code=400, detail="Company already exists")

    # Duplicate GST
    if vendor.gst_number:
        if db.query(Vendor).filter(Vendor.gst_number == vendor.gst_number).first():
            raise HTTPException(status_code=400, detail="GST Number already exists")

    # Duplicate PAN
    if vendor.pan_number:
        if db.query(Vendor).filter(Vendor.pan_number == vendor.pan_number).first():
            raise HTTPException(status_code=400, detail="PAN Number already exists")

    # Duplicate Registration Number
    if vendor.company_registration_number:
        if db.query(Vendor).filter(
            Vendor.company_registration_number == vendor.company_registration_number
        ).first():
            raise HTTPException(
                status_code=400,
                detail="Company Registration Number already exists"
            )

    new_vendor = Vendor(**vendor.dict())

    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)

    return new_vendor


# -----------------------------
# Get All Vendors
# Search + Filter + Pagination
# -----------------------------
@router.get("/", response_model=list[VendorResponse])
def get_all_vendors(
    search: str = Query(default=None),
    category: str = Query(default=None),
    vendor_status: str = Query(default=None),
    approval_status: str = Query(default=None),
    skip: int = 0,
    limit: int = 10,
    sort_by: str = Query(default="company_name"),
    order: str = Query(default="asc"),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):
    query = db.query(Vendor)

    if search:
        query = query.filter(
            or_(
                Vendor.company_name.ilike(f"%{search}%"),
                Vendor.contact_person.ilike(f"%{search}%"),
                Vendor.email.ilike(f"%{search}%"),
                Vendor.gst_number.ilike(f"%{search}%")
            )
        )

    if category:
        query = query.filter(Vendor.vendor_category == category)

    if vendor_status:
        query = query.filter(Vendor.vendor_status == vendor_status)

    if approval_status:
        query = query.filter(Vendor.approval_status == approval_status)

    # -----------------------------
    # Sorting
    # -----------------------------
    if sort_by == "company_name":
        if order.lower() == "desc":
            query = query.order_by(Vendor.company_name.desc())
        else:
            query = query.order_by(Vendor.company_name.asc())

    elif sort_by == "vendor_status":
        if order.lower() == "desc":
            query = query.order_by(Vendor.vendor_status.desc())
        else:
            query = query.order_by(Vendor.vendor_status.asc())

    elif sort_by == "approval_status":
        if order.lower() == "desc":
            query = query.order_by(Vendor.approval_status.desc())
        else:
            query = query.order_by(Vendor.approval_status.asc())

    vendors = query.offset(skip).limit(limit).all()

    return vendors


# -----------------------------
# Get Vendor By ID
# -----------------------------
@router.get("/{vendor_id}", response_model=VendorResponse)
def get_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    return vendor


# -----------------------------
# Update Vendor
# -----------------------------
@router.put("/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: int,
    updated_vendor: VendorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    for key, value in updated_vendor.dict().items():
        setattr(vendor, key, value)

    db.commit()
    db.refresh(vendor)

    return vendor


# -----------------------------
# Delete Vendor
# -----------------------------
@router.delete("/{vendor_id}")
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin")
    )
):

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    db.delete(vendor)
    db.commit()

    return {
        "message": "Vendor deleted successfully"
    }


from app.services.notification_service import NotificationService

# -----------------------------
# Approve Vendor
# -----------------------------
@router.put("/{vendor_id}/approve")
async def approve_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.approval_status = "Approved"
    vendor.vendor_status = "Active"

    db.commit()

    if vendor.user_id:
        await NotificationService.create_and_send_notification(
            db=db,
            user_id=vendor.user_id,
            notification_type="Vendor Approved",
            title="Your Vendor Account is Approved",
            message="Your vendor registration has been approved. You can now participate in procurement activities.",
            related_module="Vendor",
            related_record_id=vendor.vendor_id,
            priority="Medium",
            delivery_method="In-App,Email,SMS"
        )

    return {
        "message": "Vendor Approved Successfully"
    }


# -----------------------------
# Reject Vendor
# -----------------------------
@router.put("/{vendor_id}/reject")
def reject_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    vendor.approval_status = "Rejected"
    vendor.vendor_status = "Rejected"

    db.commit()

    return {
        "message": "Vendor Rejected Successfully"
    }

# -----------------------------
# Upload Vendor Document
# -----------------------------
@router.post("/{vendor_id}/upload-document")
def upload_vendor_document(
    vendor_id: int,
    doc_type: str = Query(..., description="gst, pan, or registration"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Vendor"))
):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    os.makedirs(os.path.join("uploads", "vendors"), exist_ok=True)
    file_path = os.path.join("uploads", "vendors", f"{vendor_id}_{doc_type}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    if doc_type == "gst":
        vendor.gst_certificate_path = file_path
    elif doc_type == "pan":
        vendor.pan_card_path = file_path
    elif doc_type == "registration":
        vendor.registration_certificate_path = file_path
    else:
        raise HTTPException(status_code=400, detail="Invalid doc_type")
        
    db.commit()
    db.refresh(vendor)
    
    return {"message": "Document uploaded successfully", "document_path": file_path}

# -----------------------------
# Download Vendor Document
# -----------------------------
@router.get("/{vendor_id}/download-document")
def download_vendor_document(
    vendor_id: int,
    doc_type: str = Query(..., description="gst, pan, or registration"),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Vendor"))
):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    file_path = None
    if doc_type == "gst":
        file_path = vendor.gst_certificate_path
    elif doc_type == "pan":
        file_path = vendor.pan_card_path
    elif doc_type == "registration":
        file_path = vendor.registration_certificate_path
    else:
        raise HTTPException(status_code=400, detail="Invalid doc_type")
        
    if not file_path:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File missing on server")
        
    return FileResponse(file_path, filename=os.path.basename(file_path))


from fastapi import Form
from app.core.oauth2 import get_current_user

# -----------------------------
# Vendor Onboarding
# -----------------------------
@router.post("/onboarding")
def vendor_onboarding(
    company_name: str = Form(...),
    contact_person: str = Form(...),
    vendor_category: str = Form(...),
    gst_number: str = Form(...),
    pan_number: str = Form(...),
    address_line1: str = Form(...),
    gst_file: UploadFile = File(...),
    pan_file: UploadFile = File(...),
    address_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from app.models.user import User
    user = db.query(User).filter(User.email == current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    existing_vendor = db.query(Vendor).filter(Vendor.email == user.email).first()
    if existing_vendor:
        raise HTTPException(status_code=400, detail="Vendor already onboarded")
        
    new_vendor = Vendor(
        company_name=company_name,
        contact_person=contact_person,
        vendor_category=vendor_category,
        gst_number=gst_number,
        pan_number=pan_number,
        address_line1=address_line1,
        email=user.email,
        phone=user.phone,
        vendor_status="Pending",
        approval_status="Pending"
    )
    
    db.add(new_vendor)
    db.flush() # Get vendor_id
    
    # Save files
    os.makedirs(os.path.join("uploads", "vendors"), exist_ok=True)
    
    gst_path = os.path.join("uploads", "vendors", f"{new_vendor.vendor_id}_gst_{gst_file.filename}")
    with open(gst_path, "wb") as buffer:
        shutil.copyfileobj(gst_file.file, buffer)
        
    pan_path = os.path.join("uploads", "vendors", f"{new_vendor.vendor_id}_pan_{pan_file.filename}")
    with open(pan_path, "wb") as buffer:
        shutil.copyfileobj(pan_file.file, buffer)
        
    reg_path = os.path.join("uploads", "vendors", f"{new_vendor.vendor_id}_registration_{address_file.filename}")
    with open(reg_path, "wb") as buffer:
        shutil.copyfileobj(address_file.file, buffer)
        
    new_vendor.gst_certificate_path = gst_path
    new_vendor.pan_card_path = pan_path
    new_vendor.registration_certificate_path = reg_path
    
    db.commit()
    db.refresh(new_vendor)
    
    return {"message": "Onboarding successful", "vendor_id": new_vendor.vendor_id}
