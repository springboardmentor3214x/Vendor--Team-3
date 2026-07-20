from datetime import date
from pydantic import BaseModel, ConfigDict


class ContractCreate(BaseModel):
    vendor_id: int
    procurement_id: int
    contract_title: str
    contract_number: str
    start_date: date
    end_date: date
    contract_value: float
    status: str = "Active"


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

    model_config = ConfigDict(from_attributes=True)