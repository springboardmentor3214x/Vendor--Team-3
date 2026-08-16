from fastapi import FastAPI

from app.database import Base, engine

# Models
from app.models.role import Role
from app.models.user import User
from app.models.vendor import Vendor
from app.models.procurement import ProcurementRequest
from app.models.purchase_order import PurchaseOrder
from app.models.contract import Contract
from app.models.message import Message
from app.models.discussion import Discussion
from app.models.file_attachment import FileAttachment
from app.models.notification import Notification
from app.models.activity_log import ActivityLog
from app.models.vendor_reliability import VendorReliability
from app.models.performance_trend import PerformanceTrend
from app.models.procurement_recommendation import ProcurementRecommendation

# Routers
from app.routers import auth
from app.routers import vendor
from app.routers import dashboard
from app.routers import dashboard_analytics
from app.routers import vendor_document
from app.routers import procurement
from app.routers import purchase_order
from app.routers import contract
from app.routers import contract_document
from app.routers import contract_milestone
from app.routers import contract_renewal
from app.routers import contract_amendment
from app.routers import contract_dashboard
from app.routers import message
from app.routers import discussion
from app.routers import file_attachment
from app.routers import notification
from app.routers import notification_history
from app.routers import notification_preference
from app.routers import notification_templates
from app.routers import notification_test
from app.routers import activity_log
from app.routers import vendor_reliability
from app.routers import supplier_ranking
from app.routers import procurement_risk
from app.routers import performance_trend
from app.routers import procurement_recommendation
from app.routers import vendor_dashboard

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vendor Reliability Intelligence Platform",
    version="1.0.0"
)

# Include Routers
app.include_router(auth.router)
app.include_router(vendor.router)
app.include_router(dashboard.router)
app.include_router(dashboard_analytics.router)
app.include_router(vendor_document.router)
app.include_router(procurement.router)
app.include_router(purchase_order.router)

# Contract Module
app.include_router(contract.router)
app.include_router(contract_document.router)
app.include_router(contract_milestone.router)
app.include_router(contract_renewal.router)
app.include_router(contract_amendment.router)
app.include_router(contract_dashboard.router)

# Communication Module
app.include_router(message.router)
app.include_router(discussion.router)
app.include_router(file_attachment.router)
app.include_router(notification.router)
app.include_router(notification_history.router)
app.include_router(notification_preference.router)
app.include_router(notification_templates.router)
app.include_router(notification_test.router)
app.include_router(activity_log.router)

# Vendor Reliability Module
app.include_router(vendor_reliability.router)
app.include_router(supplier_ranking.router)
app.include_router(procurement_risk.router)
app.include_router(performance_trend.router)
app.include_router(procurement_recommendation.router)
app.include_router(vendor_dashboard.router)


@app.get("/")
def home():
    return {
        "message": "Vendor Reliability Backend is Running Successfully!"
    }