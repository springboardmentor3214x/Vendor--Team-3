from sqlalchemy.orm import Session
from app.models.vendor_reliability import VendorReliability
from app.models.vendor import Vendor

def get_procurement_recommendations(db: Session, category: str = None):
    query = (
        db.query(VendorReliability, Vendor)
        .join(Vendor, Vendor.vendor_id == VendorReliability.vendor_id)
        .filter(VendorReliability.risk_level.in_(["Low", "Medium Risk", "Medium", "Low Risk"]))
    )
    
    if category:
        query = query.filter(Vendor.vendor_category == category)
        
    results = query.order_by(VendorReliability.reliability_score.desc()).all()
    
    recommendations = []
    for rel, vendor in results:
        recommendations.append({
            "vendor_id": vendor.vendor_id,
            "vendor_name": vendor.company_name,
            "vendor_category": vendor.vendor_category,
            "reliability_score": rel.reliability_score,
            "risk_level": rel.risk_level.replace(" Risk", ""),
            "recommendation": "Recommended" if rel.reliability_score >= 85 else "Standard",
            "reason": "High reliability score and proven track record."
        })
        
    return recommendations