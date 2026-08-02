from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.vendor_reliability import VendorReliability


def get_dashboard(db: Session):

    total = db.query(VendorReliability).count()

    avg_score = (
        db.query(func.avg(VendorReliability.reliability_score))
        .scalar()
        or 0
    )

    high = (
        db.query(VendorReliability)
        .filter(VendorReliability.risk_level == "Low Risk")
        .count()
    )

    medium = (
        db.query(VendorReliability)
        .filter(VendorReliability.risk_level == "Medium Risk")
        .count()
    )

    risk = (
        db.query(VendorReliability)
        .filter(VendorReliability.risk_level == "High Risk")
        .count()
    )

    top = (
        db.query(VendorReliability)
        .order_by(
            VendorReliability.reliability_score.desc()
        )
        .first()
    )

    return {
        "total_vendors": total,
        "average_reliability_score": round(avg_score, 2),
        "high_reliability_vendors": high,
        "medium_reliability_vendors": medium,
        "high_risk_vendors": risk,
        "top_ranked_vendor": top.vendor_id if top else 0,
        "recommended_vendors": high
    }