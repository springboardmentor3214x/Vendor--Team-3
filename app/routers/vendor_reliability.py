from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.vendor import Vendor
from app.models.vendor_reliability import VendorReliability

from app.schemas.vendor_reliability import (
    VendorReliabilityCreate,
    VendorReliabilityResponse
)

from app.services.vendor_reliability import calculate_reliability_score

router = APIRouter(
    prefix="/vendor-reliability",
    tags=["Vendor Reliability"]
)


@router.post(
    "/calculate",
    response_model=VendorReliabilityResponse
)
def calculate_vendor_reliability(
    reliability: VendorReliabilityCreate,
    db: Session = Depends(get_db)
):

    vendor = db.query(Vendor).filter(
        Vendor.vendor_id == reliability.vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    vendor_reliability = VendorReliability(
        **reliability.model_dump()
    )

    vendor_reliability = calculate_reliability_score(
        vendor_reliability
    )

    db.add(vendor_reliability)
    db.commit()
    db.refresh(vendor_reliability)

    return vendor_reliability


@router.get(
    "/{vendor_id}",
    response_model=VendorReliabilityResponse
)
def get_vendor_reliability(
    vendor_id: int,
    db: Session = Depends(get_db)
):

    reliability = db.query(VendorReliability).filter(
        VendorReliability.vendor_id == vendor_id
    ).first()

    if not reliability:
        raise HTTPException(
            status_code=404,
            detail="Vendor reliability not found"
        )

    return reliability