from app.models.vendor_reliability import VendorReliability


def calculate_reliability_score(reliability: VendorReliability):

    score = (
        (reliability.delivery_score * 0.30)
        + (reliability.quality_score * 0.25)
        + (reliability.communication_score * 0.15)
        + (reliability.contract_compliance_score * 0.10)
        + (reliability.purchase_history_score * 0.10)
        + (reliability.issue_resolution_score * 0.10)
    )

    reliability.reliability_score = round(score, 2)

    if score >= 90:
        reliability.risk_level = "Low Risk"

    elif score >= 70:
        reliability.risk_level = "Medium Risk"

    else:
        reliability.risk_level = "High Risk"

    return reliability