from datetime import date, datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional


class ContractCreate(BaseModel):
    vendor_id: int
    procurement_id: int
    contract_title: str
    contract_number: str
    start_date: date
    end_date: date
    contract_value: float
    status: str = "Active"
    scope_of_work: str | None = None
    payment_terms: str | None = None


class ContractUpdate(BaseModel):
    contract_title: str
    contract_number: str
    start_date: date
    end_date: date
    contract_value: float
    status: str


class ContractResponse(BaseModel):
    contract_id: int
    vendor_id: int
    procurement_id: int
    contract_title: str
    contract_number: str
    start_date: date
    end_date: date
    contract_value: float
    status: str
    document_path: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ContractRenewalBase(BaseModel):
    renewal_date: date
    new_end_date: date
    new_value: Optional[float] = None
    notes: Optional[str] = None


class ContractRenewalCreate(ContractRenewalBase):
    contract_id: int


class ContractRenewalResponse(ContractRenewalBase):
    renewal_id: int
    contract_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)