from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, datetime
from decimal import Decimal
from typing import List

from app.database.database import get_db
from app.models.vendor import Vendor
from app.models.performance_reliability import (
    VendorReliability,
    PerformanceHistory,
)
from app.schemas.performance_reliability import (
    VendorReliabilityResponse,
    ReliabilityDashboardResponse,
)
from app.core.role import require_roles
from app.utils.performance_utils import recalculate_vendor_metrics

router = APIRouter(
    prefix="/reliability",
    tags=["Vendor Reliability"]
)

# ---------------------------------------------
# Get Reliability Dashboard
# ---------------------------------------------
@router.get("/dashboard", response_model=ReliabilityDashboardResponse)
def get_reliability_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Supply", "Auditor", "Vendor"))
):
    total_evaluated = db.query(VendorReliability).count()
    avg_score = db.query(func.avg(VendorReliability.reliability_score)).scalar() or Decimal("0")
    
    high_reliability = db.query(VendorReliability).filter(VendorReliability.reliability_score >= 90.0).count()
    medium_reliability = db.query(VendorReliability).filter(
        VendorReliability.reliability_score >= 75.0,
        VendorReliability.reliability_score < 90.0
    ).count()
    high_risk = db.query(VendorReliability).filter(VendorReliability.reliability_score < 75.0).count()
    
    # Top ranked vendors
    top_reliability = db.query(VendorReliability).order_by(desc(VendorReliability.reliability_score)).limit(10).all()
    
    top_ranked_list = []
    for r in top_reliability:
        v = db.query(Vendor).filter(Vendor.vendor_id == r.vendor_id).first()
        if v:
            top_ranked_list.append(
                VendorReliabilityResponse(
                    reliability_id=r.reliability_id,
                    vendor_id=r.vendor_id,
                    vendor_name=v.company_name,
                    vendor_category=v.vendor_category,
                    reliability_score=r.reliability_score,
                    risk_level=r.risk_level,
                    trend=r.trend,
                    recommendation_status=r.recommendation_status,
                    last_calculated=r.last_calculated
                )
            )
            
    return ReliabilityDashboardResponse(
        total_vendors_evaluated=total_evaluated,
        avg_reliability_score=Decimal(str(round(avg_score, 2))),
        high_reliability_count=high_reliability,
        medium_reliability_count=medium_reliability,
        high_risk_count=high_risk,
        top_ranked=top_ranked_list
    )


# ---------------------------------------------
# Get Reliability Details for a Vendor
# ---------------------------------------------
@router.get("/details/{vendor_id}")
def get_reliability_details(
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
                detail="Vendors are only allowed to view their own reliability breakdown details"
            )
    rel = db.query(VendorReliability).filter(VendorReliability.vendor_id == vendor_id).first()
    if not rel:
        raise HTTPException(status_code=404, detail="Reliability details not found for this vendor")
        
    latest_history = db.query(PerformanceHistory).filter(
        PerformanceHistory.vendor_id == vendor_id
    ).order_by(desc(PerformanceHistory.recorded_at)).first()
    
    v = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    
    return {
        "reliability_id": rel.reliability_id,
        "vendor_id": rel.vendor_id,
        "vendor_name": v.company_name if v else "Unknown",
        "vendor_category": v.vendor_category if v else "Unknown",
        "reliability_score": rel.reliability_score,
        "risk_level": rel.risk_level,
        "trend": rel.trend,
        "recommendation_status": rel.recommendation_status,
        "last_calculated": rel.last_calculated,
        "delivery_score": latest_history.delivery_score if latest_history else Decimal("100.0"),
        "quality_score": latest_history.quality_score if latest_history else Decimal("100.0"),
        "communication_score": latest_history.communication_score if latest_history else Decimal("100.0"),
        "service_score": latest_history.service_score if latest_history else Decimal("80.0"),
    }


# ---------------------------------------------
# Get Supplier Rankings
# ---------------------------------------------
@router.get("/rankings", response_model=List[VendorReliabilityResponse])
def get_supplier_rankings(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Supply", "Auditor", "Vendor"))
):
    reliabilities = db.query(VendorReliability).order_by(desc(VendorReliability.reliability_score)).all()
    res = []
    for r in reliabilities:
        v = db.query(Vendor).filter(Vendor.vendor_id == r.vendor_id).first()
        if v:
            res.append(
                VendorReliabilityResponse(
                    reliability_id=r.reliability_id,
                    vendor_id=r.vendor_id,
                    vendor_name=v.company_name,
                    vendor_category=v.vendor_category,
                    reliability_score=r.reliability_score,
                    risk_level=r.risk_level,
                    trend=r.trend,
                    recommendation_status=r.recommendation_status,
                    last_calculated=r.last_calculated
                )
            )
    return res


# ---------------------------------------------
# Get Procurement Recommendations
# ---------------------------------------------
@router.get("/recommendations")
def get_procurement_recommendations(
    category: str = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Supply"))
):
    query = db.query(VendorReliability)
    
    if category:
        query = query.join(Vendor).filter(Vendor.vendor_category == category)
        
    reliabilities = query.order_by(desc(VendorReliability.reliability_score)).all()
    
    res = []
    for r in reliabilities:
        v = db.query(Vendor).filter(Vendor.vendor_id == r.vendor_id).first()
        if v:
            res.append({
                "vendor_id": r.vendor_id,
                "vendor_name": v.company_name,
                "vendor_category": v.vendor_category,
                "reliability_score": r.reliability_score,
                "risk_level": r.risk_level,
                "recommendation_status": r.recommendation_status,
                "comments": f"Select {v.company_name} - {r.risk_level} Risk score of {r.reliability_score}% ({r.recommendation_status})"
            })
    return res


# ---------------------------------------------
# Force Recalculate
# ---------------------------------------------
@router.post("/recalculate/{vendor_id}")
def force_recalculate(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement"))
):
    recalculate_vendor_metrics(vendor_id, db)
    return {"message": f"Successfully recalculated metrics for vendor ID {vendor_id}."}
