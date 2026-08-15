from sqlalchemy.orm import Session
from app.models.vendor_reliability import VendorReliability
from app.models.vendor import Vendor

def get_supplier_rankings(db: Session):
    # Join with Vendor to get latest company_name and vendor_category
    results = (
        db.query(VendorReliability, Vendor)
        .join(Vendor, Vendor.vendor_id == VendorReliability.vendor_id)
        .order_by(VendorReliability.reliability_score.desc())
        .all()
    )

    rankings = []
    rank = 1

    for rel, vendor in results:
        # Determine trend based on simple logic for now (mock trend if no historicals exist)
        trend = "Stable"
        if rel.reliability_score > 90:
            trend = "Up"
        elif rel.reliability_score < 70:
            trend = "Down"

        rankings.append({
            "vendor_id": vendor.vendor_id,
            "vendor_name": vendor.company_name,
            "vendor_category": vendor.vendor_category,
            "reliability_score": rel.reliability_score,
            "risk_level": rel.risk_level,
            "vendor_rank": rank,
            "trend": trend
        })
        rank += 1

    return rankings