from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

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


# -----------------------------
# Approve Vendor
# -----------------------------
@router.put("/{vendor_id}/approve")
def approve_vendor(
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