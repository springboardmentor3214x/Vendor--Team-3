from pydantic import BaseModel
from datetime import datetime


class ContractDocumentBase(BaseModel):

    contract_id: int
    file_url: str
    uploaded_by: int | None = None



class ContractDocumentCreate(
    ContractDocumentBase
):
    pass



class ContractDocumentResponse(
    ContractDocumentBase
):

    id: int
    uploaded_at: datetime


    class Config:
        from_attributes = True