from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional


class VendorCreate(BaseModel):
    company_name: str
    vendor_category: str
    contact_person: str
    designation: Optional[str] = None

    email: EmailStr
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None

    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    company_registration_number: Optional[str] = None

    address_line1: Optional[str] = None
    address_line2: Optional[str] = None

    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None

    website: Optional[str] = None
    description: Optional[str] = None

    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    payment_terms: Optional[str] = None


class VendorResponse(VendorCreate):
    vendor_id: int
    vendor_status: str
    approval_status: str

    gst_certificate_path: str | None = None
    pan_card_path: str | None = None
    registration_certificate_path: str | None = None

    model_config = ConfigDict(from_attributes=True)