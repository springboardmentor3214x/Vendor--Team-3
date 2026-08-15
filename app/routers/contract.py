from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil

from app.database.database import SessionLocal
from app.models.contract import Contract
from app.models.vendor import Vendor
from app.models.procurement import ProcurementRequest
from app.models.notification import Notification
from app.models.user import User

from app.schemas.contract import (
    ContractCreate,
    ContractUpdate,
    ContractResponse,
)

from app.core.role import require_roles

router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"]
)



def generate_contract_pdf(contract_id: int, vendor_id: int, scope: str, payment: str, title: str, number: str, value: float, start_date: str, end_date: str, email: str, company_name: str):
    db = SessionLocal()
    try:
        from fpdf import FPDF
        import google.generativeai as genai
        import os

        api_key = os.getenv("GEMINI_API_KEY")
        contract_text = ""
        
        if api_key:
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                prompt = f"""
                Write a formal, professional legal contract between our company and the vendor.
                Vendor Name: {company_name}
                Contract Title: {title}
                Contract Number: {number}
                Contract Value: ${value}
                Start Date: {start_date}
                End Date: {end_date}
                
                Scope of Work:
                {scope}
                
                Payment Terms:
                {payment}
                
                Format the response cleanly as plain text without markdown formatting like asterisks or hash symbols, so it renders nicely in a basic PDF. Include a formal opening, clauses for the scope, payment terms, confidentiality, termination, and a formal closing. Do not include signature blocks at the very end, I will add those programmatically. Keep it concise, around 3-4 paragraphs.
                """
                response = model.generate_content(prompt)
                contract_text = response.text.replace('**', '').replace('*', '').replace('#', '')
            except Exception as e:
                import logging
                logging.error(f"Gemini API failed: {e}")
        
        if not contract_text:
            contract_text = f"""This Contract Agreement ("Agreement") is made and entered into on this day, by and between the Company and {company_name} ("Vendor").

1. SCOPE OF SERVICES
The Vendor agrees to provide the following services:
{scope}

2. PAYMENT TERMS
In consideration of the services provided, the Company agrees to pay the Vendor the total amount of ${value}.
{payment}

3. TERM
This Agreement shall commence on {start_date} and shall continue in effect until {end_date}, unless terminated earlier.

4. CONFIDENTIALITY
Both parties agree to keep all information exchanged during this Agreement confidential.

5. TERMINATION
Either party may terminate this Agreement with 30 days written notice.
"""

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", size=16)
        pdf.cell(0, 10, txt=f"Contract Agreement: {title}", align='C')
        pdf.ln(15)

        pdf.set_font("Helvetica", size=12)
        pdf.cell(0, 10, txt=f"Contract Number: {number}")
        pdf.ln(8)
        pdf.cell(0, 10, txt=f"Vendor: {company_name} (ID: {vendor_id})")
        pdf.ln(8)
        pdf.cell(0, 10, txt=f"Contract Value: ${value}")
        pdf.ln(8)
        pdf.cell(0, 10, txt=f"Duration: {start_date} to {end_date}")
        pdf.ln(15)

        pdf.set_font("Helvetica", size=11)
        safe_text = contract_text.encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 6, txt=safe_text)
        pdf.ln(15)

        pdf.set_font("Helvetica", style="B", size=11)
        pdf.cell(90, 10, txt="Authorized Signature (Company)")
        pdf.cell(90, 10, txt="Authorized Signature (Vendor)")

        os.makedirs(os.path.join("uploads", "contracts"), exist_ok=True)
        file_path = os.path.join("uploads", "contracts", f"{contract_id}_auto_contract.pdf")
        pdf.output(file_path)

        contract = db.query(Contract).filter(Contract.contract_id == contract_id).first()
        if contract:
            contract.document_path = file_path
            db.commit()

        # Create Notification
        vendor_user = db.query(User).filter(User.email == email).first()
        if vendor_user:
            notification = Notification(
                user_id=vendor_user.user_id,
                message=f"New Contract '{title}' created for your review.",
                status="Unread"
            )
            db.add(notification)
            db.commit()
            
    except Exception as e:
        import logging
        logging.error(f"Failed to generate PDF: {e}")
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------
# Create Contract
# ---------------------------------------
@router.post("/", response_model=ContractResponse)
def create_contract(
    contract: ContractCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == contract.vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.procurement_id == contract.procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement Request not found"
        )

    contract_data = contract.model_dump(exclude={"scope_of_work", "payment_terms"})
    new_contract = Contract(**contract_data)

    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    # Generate PDF Contract in background
    scope = contract.scope_of_work or "Standard terms apply."
    payment = contract.payment_terms or "Standard payment terms."
    background_tasks.add_task(
        generate_contract_pdf,
        contract_id=new_contract.contract_id,
        vendor_id=vendor.vendor_id,
        scope=scope,
        payment=payment,
        title=new_contract.contract_title,
        number=new_contract.contract_number,
        value=new_contract.contract_value,
        start_date=new_contract.start_date,
        end_date=new_contract.end_date,
        email=vendor.email,
        company_name=vendor.company_name
    )


    return new_contract


# ---------------------------------------
# Get All Contracts
# ---------------------------------------
@router.get("/", response_model=list[ContractResponse])
def get_contracts(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):
    query = db.query(Contract)
    if current_user.role.role_name == "Vendor":
        vendor = db.query(Vendor).filter(Vendor.email == current_user.email).first()
        if vendor:
            query = query.filter(Contract.vendor_id == vendor.vendor_id)
        else:
            return []
    return query.all()


# ---------------------------------------
# Get Contract By ID
# ---------------------------------------
@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    query = db.query(Contract).filter(Contract.contract_id == contract_id)
    if current_user.role.role_name == "Vendor":
        vendor = db.query(Vendor).filter(Vendor.email == current_user.email).first()
        if vendor:
            query = query.filter(Contract.vendor_id == vendor.vendor_id)
        else:
            raise HTTPException(status_code=404, detail="Contract not found")

    contract = query.first()

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return contract


# ---------------------------------------
# Update Contract
# ---------------------------------------
@router.put("/{contract_id}", response_model=ContractResponse)
def update_contract(
    contract_id: int,
    updated_contract: ContractUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    contract = db.query(Contract).filter(
        Contract.contract_id == contract_id
    ).first()

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    update_fields = updated_contract.model_dump(exclude_unset=True)

    for key, value in update_fields.items():
        setattr(contract, key, value)

    db.commit()
    db.refresh(contract)

    return contract


# ---------------------------------------
# Upload Contract Document
# ---------------------------------------
@router.post("/{contract_id}/upload")
def upload_contract_document(
    contract_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement"))
):
    contract = db.query(Contract).filter(Contract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    os.makedirs(os.path.join("uploads", "contracts"), exist_ok=True)
    file_path = os.path.join("uploads", "contracts", f"{contract_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    contract.document_path = file_path
    db.commit()
    db.refresh(contract)
    
    return {"message": "Document uploaded successfully", "document_path": file_path}

# ---------------------------------------
# Download Contract Document
# ---------------------------------------
@router.get("/{contract_id}/download")
def download_contract_document(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Vendor"))
):
    query = db.query(Contract).filter(Contract.contract_id == contract_id)
    if current_user.role.role_name == "Vendor":
        vendor = db.query(Vendor).filter(Vendor.email == current_user.email).first()
        if vendor:
            query = query.filter(Contract.vendor_id == vendor.vendor_id)
        else:
            raise HTTPException(status_code=404, detail="Contract not found")
            
    contract = query.first()
    if not contract or not contract.document_path:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if not os.path.exists(contract.document_path):
        raise HTTPException(status_code=404, detail="File missing on server")
        
    return FileResponse(contract.document_path, filename=os.path.basename(contract.document_path))

# ---------------------------------------
# Renew Contract
# ---------------------------------------
from app.models.contract_renewal import ContractRenewal
from app.schemas.contract import ContractRenewalCreate, ContractRenewalResponse

@router.post("/{contract_id}/renew", response_model=ContractRenewalResponse)
def renew_contract(
    contract_id: int,
    renewal_data: ContractRenewalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement"))
):
    contract = db.query(Contract).filter(Contract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    # Update main contract
    contract.end_date = renewal_data.new_end_date
    if renewal_data.new_value is not None:
        contract.contract_value = renewal_data.new_value
    contract.status = "Active"
    
    # Create renewal record
    new_renewal = ContractRenewal(
        contract_id=contract_id,
        renewal_date=renewal_data.renewal_date,
        new_end_date=renewal_data.new_end_date,
        new_value=renewal_data.new_value,
        notes=renewal_data.notes
    )
    
    db.add(new_renewal)
    db.commit()
    db.refresh(new_renewal)
    
    return new_renewal
