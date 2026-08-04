from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta

from app.database.database import SessionLocal
from app.models.contract import Contract
from app.models.vendor import Vendor

from app.core.role import require_roles


router = APIRouter(
    prefix="/dashboard/contracts",
    tags=["Contract Dashboard"]
)


# Database connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/summary")
def contract_summary(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    total_contracts = db.query(
        Contract
    ).count()


    active_contracts = db.query(
        Contract
    ).filter(
        func.lower(Contract.status) == "active"
    ).count()


    expired_contracts = db.query(
        Contract
    ).filter(
        func.lower(Contract.status) == "expired"
    ).count()


    total_value = db.query(
        func.sum(Contract.contract_value)
    ).scalar()


    return {
        "total_contracts": total_contracts,
        "active_contracts": active_contracts,
        "expired_contracts": expired_contracts,
        "total_contract_value": total_value or 0
    }




@router.get("/expiring-soon")
def expiring_contracts(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):

    today = date.today()

    future_date = today + timedelta(days=30)


    contracts = db.query(
        Contract
    ).filter(
        Contract.end_date >= today,
        Contract.end_date <= future_date
    ).all()


    return {
        "count": len(contracts),
        "contracts": contracts
    }




@router.get("/value-by-vendor")
def contract_value_by_vendor(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement")
    )
):


    result = (
        db.query(
            Vendor.vendor_name,
            func.sum(Contract.contract_value)
            .label("total_value")
        )
        .join(
            Contract,
            Vendor.vendor_id == Contract.vendor_id
        )
        .group_by(
            Vendor.vendor_name
        )
        .all()
    )


    return [
        {
            "vendor_name": row.vendor_name,
            "total_contract_value": row.total_value
        }
        for row in result
    ]