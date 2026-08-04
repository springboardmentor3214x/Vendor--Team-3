from pydantic import BaseModel
from datetime import datetime


class ContractRenewalBase(BaseModel):

    contract_id: int
    renewal_date: datetime | None = None
    new_end_date: datetime | None = None
    status: str = "pending"



class ContractRenewalCreate(
    ContractRenewalBase
):
    pass



class ContractRenewalResponse(
    ContractRenewalBase
):

    id: int


    class Config:
        from_attributes = True