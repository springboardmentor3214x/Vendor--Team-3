from sqlalchemy.orm import Session

from app.models.vendor_reliability import VendorReliability


def get_procurement_risk(db: Session):

    vendors = db.query(VendorReliability).all()

    risks = []

    for vendor in vendors:

        risks.append({
            "vendor_id": vendor.vendor_id,
            "reliability_score": vendor.reliability_score,
            "risk_level": vendor.risk_level
        })

    return risks