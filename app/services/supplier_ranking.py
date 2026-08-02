from sqlalchemy.orm import Session

from app.models.vendor_reliability import VendorReliability


def get_supplier_rankings(db: Session):

    vendors = (
        db.query(VendorReliability)
        .order_by(VendorReliability.reliability_score.desc())
        .all()
    )

    rankings = []

    rank = 1

    for vendor in vendors:

        rankings.append({
            "vendor_id": vendor.vendor_id,
            "reliability_score": vendor.reliability_score,
            "risk_level": vendor.risk_level,
            "vendor_rank": rank
        })

        rank += 1

    return rankings