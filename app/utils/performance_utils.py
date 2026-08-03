from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date, datetime
from decimal import Decimal
from app.models.purchase_order import PurchaseOrder
from app.models.performance_reliability import (
    DeliveryPerformance,
    ProductQualityEvaluation,
    CommunicationLog,
    ServiceRating,
    PerformanceHistory,
    VendorRanking,
    VendorReliability,
)
from app.models.vendor import Vendor

def recalculate_vendor_metrics(vendor_id: int, db: Session):
    # 1. Order Completion Rate
    total_pos = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id).count()
    completed_pos = db.query(PurchaseOrder).filter(
        PurchaseOrder.vendor_id == vendor_id,
        PurchaseOrder.status == "Completed"
    ).all()
    
    order_completion_rate = 100.0
    if total_pos > 0:
        order_completion_rate = (len(completed_pos) / total_pos) * 100.0

    # 2. Delivery Performance Score (On-Time Rate)
    # Check all completed POs, find or create delivery performance logs
    delivery_logs = db.query(DeliveryPerformance).filter(DeliveryPerformance.vendor_id == vendor_id).all()
    
    on_time_count = 0
    total_delivery_logs = len(delivery_logs)
    
    for log in delivery_logs:
        # If delay_days is 0 or less, it is On-Time or Early
        if log.delay_days <= 0:
            on_time_count += 1
            
    delivery_score = 100.0
    if total_delivery_logs > 0:
        delivery_score = (on_time_count / total_delivery_logs) * 100.0

    # 3. Product Quality Rating (average rating 1-5, mapped to 0-100)
    quality_evals = db.query(ProductQualityEvaluation).filter(ProductQualityEvaluation.vendor_id == vendor_id).all()
    
    avg_quality_stars = 5.0
    quality_score = 100.0
    
    if len(quality_evals) > 0:
        total_eval_score = 0.0
        for q in quality_evals:
            # Average of 4 criteria
            eval_avg = (
                (q.material_quality or 5) + 
                (q.packaging_quality or 5) + 
                (q.quantity_accuracy or 5) + 
                (q.specification_compliance or 5)
            ) / 4.0
            total_eval_score += eval_avg
        
        avg_quality_stars = total_eval_score / len(quality_evals)
        # map 1-5 to 0-100
        quality_score = (avg_quality_stars / 5.0) * 100.0

    # 4. Communication Score
    comm_logs = db.query(CommunicationLog).filter(
        CommunicationLog.vendor_id == vendor_id,
        CommunicationLog.communication_status == "Completed"
    ).all()
    
    avg_response_hours = 2.0
    communication_score = 100.0
    
    if len(comm_logs) > 0:
        total_response_hours = 0.0
        for log in comm_logs:
            if log.response_duration_hours:
                total_response_hours += float(log.response_duration_hours)
        avg_response_hours = total_response_hours / len(comm_logs)
        
        # Scoring mapping
        if avg_response_hours <= 2.0:
            communication_score = 100.0
        elif avg_response_hours <= 6.0:
            communication_score = 90.0
        elif avg_response_hours <= 12.0:
            communication_score = 80.0
        elif avg_response_hours <= 24.0:
            communication_score = 60.0
        else:
            communication_score = 40.0

    # 5. Service Rating (average 1-5, mapped to 0-100)
    service_ratings = db.query(ServiceRating).filter(ServiceRating.vendor_id == vendor_id).all()
    
    avg_service_stars = 4.0
    service_score = 80.0
    
    if len(service_ratings) > 0:
        total_service = sum([float(s.overall_service_rating or 4.0) for s in service_ratings])
        avg_service_stars = total_service / len(service_ratings)
        service_score = (avg_service_stars / 5.0) * 100.0

    # 6. Overall Performance Score
    # Weighted average: Delivery 40%, Quality 30%, Comm 15%, Service 15%
    overall_performance_score = (
        (delivery_score * 0.40) +
        (quality_score * 0.30) +
        (communication_score * 0.15) +
        (service_score * 0.15)
    )

    # 7. Check Trend
    # Get previous history record
    prev_history = db.query(PerformanceHistory).filter(
        PerformanceHistory.vendor_id == vendor_id
    ).order_by(desc(PerformanceHistory.recorded_at)).first()
    
    trend = "Stable"
    if prev_history:
        prev_score = float(prev_history.overall_performance_score or 0.0)
        if overall_performance_score > prev_score + 0.5:
            trend = "Up"
        elif overall_performance_score < prev_score - 0.5:
            trend = "Down"

    # 8. Record in PerformanceHistory
    current_period = f"Period - {date.today().strftime('%B %Y')}"
    new_history = PerformanceHistory(
        vendor_id=vendor_id,
        delivery_score=Decimal(str(round(delivery_score, 2))),
        quality_score=Decimal(str(round(quality_score, 2))),
        communication_score=Decimal(str(round(communication_score, 2))),
        service_score=Decimal(str(round(service_score, 2))),
        overall_performance_score=Decimal(str(round(overall_performance_score, 2))),
        evaluation_period=current_period,
        remarks=f"Calculated automatically. Total orders: {total_pos}."
    )
    db.add(new_history)
    db.commit()

    # 9. Update/Insert Vendor Reliability (Module 5)
    # Score calculation logic for reliability (considers similar weights but can be customized)
    reliability_score = overall_performance_score
    
    # Procurement Risk Levels
    if reliability_score >= 90.0:
        risk_level = "Low"
        rec_status = "Highly Recommended"
    elif reliability_score >= 75.0:
        risk_level = "Medium"
        rec_status = "Recommended"
    else:
        risk_level = "High"
        rec_status = "Not Recommended"

    reliability = db.query(VendorReliability).filter(VendorReliability.vendor_id == vendor_id).first()
    if not reliability:
        reliability = VendorReliability(vendor_id=vendor_id)
        db.add(reliability)
        
    reliability.reliability_score = Decimal(str(round(reliability_score, 2)))
    reliability.risk_level = risk_level
    reliability.trend = trend
    reliability.recommendation_status = rec_status
    reliability.last_calculated = datetime.now()
    db.commit()

    # 10. Regenerate Rankings for all vendors
    regenerate_rankings(db)


def regenerate_rankings(db: Session):
    # Fetch all vendor reliability scores
    reliabilities = db.query(VendorReliability).order_by(desc(VendorReliability.reliability_score)).all()
    
    # Delete old rankings for the current date to prevent duplicates
    db.query(VendorRanking).filter(VendorRanking.ranking_date == date.today()).delete()
    
    for index, rel in enumerate(reliabilities):
        rank_pos = index + 1
        ranking = VendorRanking(
            vendor_id=rel.vendor_id,
            overall_score=rel.reliability_score,
            rank_position=rank_pos,
            ranking_date=date.today(),
            remarks=f"Generated rank #{rank_pos} automatically."
        )
        db.add(ranking)
    
    db.commit()
