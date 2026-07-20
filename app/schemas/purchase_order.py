from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PurchaseOrderCreate(BaseModel):
    procurement_id: int
    vendor_id: int
    order_number: str
    order_date: date
    delivery_date: Optional[date] = None
    total_amount: Decimal
    status: str = "Pending"


class PurchaseOrderUpdate(BaseModel):
    procurement_id: Optional[int] = None
    vendor_id: Optional[int] = None
    order_number: Optional[str] = None
    order_date: Optional[date] = None
    delivery_date: Optional[date] = None
    total_amount: Optional[Decimal] = None
    status: Optional[str] = None


class PurchaseOrderResponse(BaseModel):
    order_id: int
    procurement_id: int
    vendor_id: int
    order_number: str
    order_date: date
    delivery_date: Optional[date]
    total_amount: Decimal
    status: str
    created_at: Optional[date]

    model_config = ConfigDict(from_attributes=True)