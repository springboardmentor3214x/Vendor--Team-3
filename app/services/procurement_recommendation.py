from sqlalchemy.orm import Session

from app.models.procurement_recommendation import (
    ProcurementRecommendation
)


def get_procurement_recommendations(
    db: Session
):

    return (
        db.query(
            ProcurementRecommendation
        )
        .order_by(
            ProcurementRecommendation.reliability_score.desc()
        )
        .all()
    )