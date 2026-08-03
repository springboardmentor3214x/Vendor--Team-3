from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class QuotationCreate(BaseModel):
    proposed_price: int
    delivery_time: str

class QuotationResponse(BaseModel):
    id: int
    rfq_id: int
    vendor_id: int
    vendor_name: str
    proposed_price: int
    delivery_time: str

    class Config:
        from_attributes = True

class RfqCreate(BaseModel):
    title: str
    items: List[str]
    deadline: str

class RfqResponse(BaseModel):
    id: int
    rfq_number: str
    title: str
    items: List[str]
    deadline: str
    status: str
    created_by_id: int
    quotations: List[QuotationResponse] = []

    class Config:
        from_attributes = True
