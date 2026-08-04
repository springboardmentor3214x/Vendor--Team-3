from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.role import require_roles
from app.database import get_db
from app.models.contract_milestone import ContractMilestone
from app.schemas.contract_milestone import (
    ContractMilestoneCreate,
    ContractMilestoneResponse
)


router = APIRouter(
    prefix="/contract-milestones",
    tags=["Contract Milestones"]
)


@router.post("/", response_model=ContractMilestoneResponse)
def create_milestone(
    milestone: ContractMilestoneCreate,
    db: Session = Depends(get_db)
):

    new_milestone = ContractMilestone(
        **milestone.dict()
    )

    db.add(new_milestone)
    db.commit()
    db.refresh(new_milestone)

    return new_milestone



@router.get("/{contract_id}",
response_model=list[ContractMilestoneResponse])
def get_milestones(
    contract_id:int,
    db:Session=Depends(get_db)
):

    return db.query(
        ContractMilestone
    ).filter(
        ContractMilestone.contract_id==contract_id
    ).all()


@router.put("/milestone/{milestone_id}/status")
def update_milestone_status(
    milestone_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    milestone = db.query(ContractMilestone).filter(
        ContractMilestone.milestone_id == milestone_id
    ).first()


    if not milestone:
        raise HTTPException(
            status_code=404,
            detail="Milestone not found"
        )


    milestone.status = status

    db.commit()
    db.refresh(milestone)


    return {
        "message": "Milestone status updated successfully",
        "milestone_id": milestone.milestone_id,
        "status": milestone.status
    }