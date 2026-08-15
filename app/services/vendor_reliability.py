from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.vendor_reliability import VendorReliability
from app.models.performance_reliability import (
    DeliveryPerformance,
    ProductQualityEvaluation,
    CommunicationLog,
    ServiceRating
)
from app.models.vendor import Vendor

def recalculate_vendor_reliability(vendor_id: int, db: Session):
    # 1. Fetch related data
    deliveries = db.query(DeliveryPerformance).filter(DeliveryPerformance.vendor_id == vendor_id).all()
    qualities = db.query(ProductQualityEvaluation).filter(ProductQualityEvaluation.vendor_id == vendor_id).all()
    comms = db.query(CommunicationLog).filter(CommunicationLog.vendor_id == vendor_id).all()
    services = db.query(ServiceRating).filter(ServiceRating.vendor_id == vendor_id).all()

    # If no records exist, default to 50% "Pending Evaluation"
    if not deliveries and not qualities and not comms and not services:
        delivery_score = 50.0
        quality_score = 50.0
        comm_score = 50.0
        compliance_score = 50.0
        resolution_score = 50.0
        history_score = 50.0
    else:
        # Calculate Delivery (0 delay = 100%, each day drops score by 5%)
        if deliveries:
            total_del_score = 0
            for d in deliveries:
                delay = d.delay_days or 0
                score = max(0, 100 - (delay * 5))
                total_del_score += score
            delivery_score = total_del_score / len(deliveries)
        else:
            delivery_score = 50.0

        # Calculate Quality (average of material, packaging, spec out of 10 -> map to 100)
        if qualities:
            total_q_score = 0
            for q in qualities:
                avg_rating = ((q.material_quality or 0) + (q.packaging_quality or 0) + (q.specification_compliance or 0)) / 3.0
                # Assuming ratings are out of 5
                total_q_score += (avg_rating / 5.0) * 100
            quality_score = total_q_score / len(qualities)
        else:
            quality_score = 50.0

        # Calculate Communication (response < 2 hours = 100%, else drops)
        if comms:
            total_c_score = 0
            for c in comms:
                resp_time = float(c.response_duration_hours or 0)
                if resp_time <= 2:
                    score = 100
                elif resp_time <= 12:
                    score = 80
                elif resp_time <= 24:
                    score = 50
                else:
                    score = 20
                total_c_score += score
            comm_score = total_c_score / len(comms)
        else:
            comm_score = 50.0

        # Calculate Service/Compliance/Resolution (from ServiceRating)
        if services:
            total_comp_score = 0
            total_res_score = 0
            for s in services:
                # Ratings out of 5
                total_comp_score += ((s.documentation_quality or 0) / 5.0) * 100
                total_res_score += ((s.issue_resolution or 0) / 5.0) * 100
            compliance_score = total_comp_score / len(services)
            resolution_score = total_res_score / len(services)
        else:
            compliance_score = 50.0
            resolution_score = 50.0

        # History Score (just a baseline based on total orders processed, cap at 100)
        history_score = min(100.0, 50 + (len(deliveries) * 5))

    # Apply weighted formula
    final_score = (
        (delivery_score * 0.35) +
        (quality_score * 0.30) +
        (comm_score * 0.20) +
        (compliance_score * 0.15)
    )
    
    # We'll map resolution and history as well into the 15% service score or keep them separate in DB
    # The weights approved were: Delivery 35%, Quality 30%, Communication 20%, Service 15%
    # We will average compliance and resolution into that 15%
    avg_service = (compliance_score + resolution_score) / 2.0
    final_score = (
        (delivery_score * 0.35) +
        (quality_score * 0.30) +
        (comm_score * 0.20) +
        (avg_service * 0.15)
    )

    if not deliveries and not qualities and not comms and not services:
        risk_level = "Pending Evaluation"
        recommendation_status = "Evaluating"
    else:
        if final_score >= 85:
            risk_level = "Low"
            recommendation_status = "Recommended"
        elif final_score >= 60:
            risk_level = "Medium"
            recommendation_status = "Standard"
        else:
            risk_level = "High"
            recommendation_status = "Restricted"

    # Get or create VendorReliability
    reliability = db.query(VendorReliability).filter(VendorReliability.vendor_id == vendor_id).first()
    if not reliability:
        reliability = VendorReliability(vendor_id=vendor_id)
        db.add(reliability)

    reliability.delivery_score = round(delivery_score, 2)
    reliability.quality_score = round(quality_score, 2)
    reliability.communication_score = round(comm_score, 2)
    reliability.contract_compliance_score = round(compliance_score, 2)
    reliability.issue_resolution_score = round(resolution_score, 2)
    reliability.purchase_history_score = round(history_score, 2)
    reliability.reliability_score = round(final_score, 2)
    reliability.risk_level = risk_level
    
    # Store recommendation status if we want, or just compute dynamically.
    # We'll just return it as well.
    db.commit()
    db.refresh(reliability)
    
    return reliability