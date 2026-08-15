import os

vendor_py_path = 'c:/Users/namke/OneDrive/Desktop/vendor_reliability/app/routers/vendor.py'

with open(vendor_py_path, 'r', encoding='utf-8') as f:
    content = f.read()

onboarding_logic = """
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
"""

if "# Vendor Onboarding" not in content:
    content += "\n\n" + onboarding_logic
    with open(vendor_py_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added onboarding logic to vendor.py")
else:
    print("Already added")
