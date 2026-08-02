from sqlalchemy.orm import Session

from app.models.performance_trend import PerformanceTrend


def get_performance_trends(vendor_id: int, db: Session):

    return (
        db.query(PerformanceTrend)
        .filter(
            PerformanceTrend.vendor_id == vendor_id
        )
        .order_by(
            PerformanceTrend.year,
            PerformanceTrend.month
        )
        .all()
    )