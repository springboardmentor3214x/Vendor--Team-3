from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, datetime
from decimal import Decimal
from typing import List

from app.database.database import get_db
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder
from app.models.performance_reliability import (
    DeliveryPerformance,
    ProductQualityEvaluation,
    CommunicationLog,
    ServiceRating,
    PerformanceHistory,
    VendorRanking,
)
from app.schemas.performance_reliability import (
    ProductQualityEvaluationCreate,
    ProductQualityEvaluationResponse,
    CommunicationLogCreate,
    CommunicationLogResponse,
    ServiceRatingCreate,
    ServiceRatingResponse,
    PerformanceHistoryResponse,
    VendorRankingResponse,
    PerformanceDashboardResponse,
)
from app.core.role import require_roles
from app.utils.performance_utils import recalculate_vendor_metrics

router = APIRouter(
    prefix="/performance",
    tags=["Vendor Performance"]
)

# ---------------------------------------------
# Get Performance Dashboard
# ---------------------------------------------
@router.get("/dashboard", response_model=PerformanceDashboardResponse)
def get_performance_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Supply", "Auditor", "Vendor"))
):
    # Total Vendors Evaluated
    total_evaluated = db.query(func.count(func.distinct(PerformanceHistory.vendor_id))).scalar() or 0
    
    # Averages
    avg_delivery = db.query(func.avg(PerformanceHistory.delivery_score)).scalar() or Decimal("0")
    avg_quality = db.query(func.avg(PerformanceHistory.quality_score)).scalar() or Decimal("0")
    
    # Avg response time from communication logs
    avg_response = db.query(func.avg(CommunicationLog.response_duration_hours)).scalar() or Decimal("0")
    
    # Total Completed Orders
    total_completed = db.query(PurchaseOrder).filter(PurchaseOrder.status == "Completed").count()
    
    # Delayed Deliveries count
    delayed_count = db.query(DeliveryPerformance).filter(DeliveryPerformance.delay_days > 0).count()
    
    # Rankings (latest position for each vendor)
    latest_ranking_date = db.query(func.max(VendorRanking.ranking_date)).scalar()
    
    rankings_list = []
    if latest_ranking_date:
        rankings = db.query(VendorRanking).filter(
            VendorRanking.ranking_date == latest_ranking_date
        ).order_by(VendorRanking.rank_position).all()
        
        for r in rankings:
            v = db.query(Vendor).filter(Vendor.vendor_id == r.vendor_id).first()
            if v:
                rankings_list.append(
                    VendorRankingResponse(
                        ranking_id=r.ranking_id,
                        vendor_id=r.vendor_id,
                        vendor_name=v.company_name,
                        vendor_category=v.vendor_category,
                        overall_score=r.overall_score,
                        rank_position=r.rank_position,
                        ranking_date=r.ranking_date,
                        remarks=r.remarks
                    )
                )
                
    return PerformanceDashboardResponse(
        total_vendors_evaluated=total_evaluated,
        avg_delivery_performance=Decimal(str(round(avg_delivery, 2))),
        avg_product_quality=Decimal(str(round(avg_quality, 2))),
        avg_response_time_hours=Decimal(str(round(avg_response, 2))),
        total_completed_orders=total_completed,
        delayed_deliveries_count=delayed_count,
        rankings=rankings_list
    )


# ---------------------------------------------
# Record Product Quality Evaluation
# ---------------------------------------------
@router.post("/quality-evaluation", response_model=ProductQualityEvaluationResponse)
def record_quality_evaluation(
    eval_in: ProductQualityEvaluationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Supply"))
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.order_id == eval_in.purchase_order_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
        
    # Calculate Overall Quality Rating label
    avg_stars = (
        eval_in.material_quality + 
        eval_in.packaging_quality + 
        eval_in.quantity_accuracy + 
        eval_in.specification_compliance
    ) / 4.0
    
    if avg_stars >= 4.5:
        overall_rating = "Excellent"
    elif avg_stars >= 3.5:
        overall_rating = "Good"
    elif avg_stars >= 2.5:
        overall_rating = "Average"
    else:
        overall_rating = "Poor"

    new_eval = ProductQualityEvaluation(
        vendor_id=eval_in.vendor_id,
        purchase_order_id=eval_in.purchase_order_id,
        inspection_date=eval_in.inspection_date,
        material_quality=eval_in.material_quality,
        packaging_quality=eval_in.packaging_quality,
        quantity_accuracy=eval_in.quantity_accuracy,
        specification_compliance=eval_in.specification_compliance,
        product_defects=eval_in.product_defects,
        overall_quality_rating=overall_rating,
        remarks=eval_in.remarks
    )
    
    db.add(new_eval)
    db.commit()
    db.refresh(new_eval)
    
    # Recalculate metrics
    recalculate_vendor_metrics(eval_in.vendor_id, db)
    
    return new_eval


# ---------------------------------------------
# Record Communication Log
# ---------------------------------------------
@router.post("/communication-log", response_model=CommunicationLogResponse)
def record_communication_log(
    comm_in: CommunicationLogCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Supply"))
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.order_id == comm_in.purchase_order_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
        
    duration = None
    status = "Pending"
    if comm_in.vendor_response_time:
        duration_delta = comm_in.vendor_response_time - comm_in.message_sent_time
        duration = Decimal(str(round(duration_delta.total_seconds() / 3600.0, 2)))
        status = "Completed"

    new_log = CommunicationLog(
        vendor_id=comm_in.vendor_id,
        purchase_order_id=comm_in.purchase_order_id,
        message_sent_time=comm_in.message_sent_time,
        vendor_response_time=comm_in.vendor_response_time,
        response_duration_hours=duration,
        communication_status=status,
        remarks=comm_in.remarks
    )
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    
    # Recalculate metrics
    recalculate_vendor_metrics(comm_in.vendor_id, db)
    
    return new_log


# ---------------------------------------------
# Submit Service Rating
# ---------------------------------------------
@router.post("/service-rating", response_model=ServiceRatingResponse)
def submit_service_rating(
    rate_in: ServiceRatingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement"))
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.order_id == rate_in.purchase_order_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
        
    overall = Decimal(str(round((
        rate_in.professionalism + 
        rate_in.customer_support + 
        rate_in.documentation_quality + 
        rate_in.flexibility + 
        rate_in.communication_effectiveness + 
        rate_in.issue_resolution
    ) / 6.0, 2)))

    new_rating = ServiceRating(
        vendor_id=rate_in.vendor_id,
        purchase_order_id=rate_in.purchase_order_id,
        professionalism=rate_in.professionalism,
        customer_support=rate_in.customer_support,
        documentation_quality=rate_in.documentation_quality,
        flexibility=rate_in.flexibility,
        communication_effectiveness=rate_in.communication_effectiveness,
        issue_resolution=rate_in.issue_resolution,
        overall_service_rating=overall,
        comments=rate_in.comments
    )
    
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    
    # Recalculate metrics
    recalculate_vendor_metrics(rate_in.vendor_id, db)
    
    return new_rating


# ---------------------------------------------
# Get Performance History
# ---------------------------------------------
@router.get("/history/{vendor_id}", response_model=List[PerformanceHistoryResponse])
def get_performance_history(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Supply", "Vendor"))
):
    user = current_user
    role_mapping = {
        "Administrator": "Admin",
        "Procurement Manager": "Procurement",
        "Supply Chain Manager": "Supply",
        "Vendor": "Vendor",
        "Finance Officer": "Finance",
        "Auditor": "Auditor"
    }
    mapped_role = role_mapping.get(user.role.role_name, user.role.role_name)

    if mapped_role == "Vendor":
        vendor = db.query(Vendor).filter(Vendor.email == user.email).first()
        if not vendor or vendor.vendor_id != vendor_id:
            raise HTTPException(
                status_code=403,
                detail="Vendors are only allowed to view their own performance history"
            )

    return db.query(PerformanceHistory).filter(
        PerformanceHistory.vendor_id == vendor_id
    ).order_by(desc(PerformanceHistory.recorded_at)).all()


# ---------------------------------------------
# Get Rankings
# ---------------------------------------------
@router.get("/rankings", response_model=List[VendorRankingResponse])
def get_vendor_rankings(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Supply", "Auditor", "Vendor"))
):
    latest_ranking_date = db.query(func.max(VendorRanking.ranking_date)).scalar()
    if not latest_ranking_date:
        return []
        
    rankings = db.query(VendorRanking).filter(
        VendorRanking.ranking_date == latest_ranking_date
    ).order_by(VendorRanking.rank_position).all()
    
    res = []
    for r in rankings:
        v = db.query(Vendor).filter(Vendor.vendor_id == r.vendor_id).first()
        if v:
            res.append(
                VendorRankingResponse(
                    ranking_id=r.ranking_id,
                    vendor_id=r.vendor_id,
                    vendor_name=v.company_name,
                    vendor_category=v.vendor_category,
                    overall_score=r.overall_score,
                    rank_position=r.rank_position,
                    ranking_date=r.ranking_date,
                    remarks=r.remarks
                )
            )
    return res
