from pydantic import BaseModel
from datetime import datetime


class ContractMilestoneBase(BaseModel):

    contract_id: int
    milestone_name: str
    due_date: datetime | None = None
    status: str = "pending"



class ContractMilestoneCreate(
    ContractMilestoneBase
):
    pass



class ContractMilestoneResponse(
    ContractMilestoneBase
):

    id: int
    completed_at: datetime | None = None


    class Config:
        from_attributes = True