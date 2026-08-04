from pydantic import BaseModel
from datetime import datetime


class ContractAmendmentBase(BaseModel):

    contract_id: int
    amendment_number: str
    description: str | None = None
    file_url: str | None = None



class ContractAmendmentCreate(
    ContractAmendmentBase
):
    pass



class ContractAmendmentResponse(
    ContractAmendmentBase
):

    id: int
    created_at: datetime


    class Config:
        from_attributes = True