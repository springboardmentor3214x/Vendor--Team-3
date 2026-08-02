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
from app.models.vendor_reliability import VendorReliability
from app.models.performance_trend import PerformanceTrend
from app.models.procurement_recommendation import ProcurementRecommendation

# Routers
from app.routers import auth
from app.routers import vendor
from app.routers import dashboard
from app.routers import vendor_document
from app.routers import procurement
from app.routers import purchase_order
from app.routers import contract
from app.routers import message
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
app.include_router(vendor_document.router)
app.include_router(procurement.router)
app.include_router(purchase_order.router)
app.include_router(contract.router)
app.include_router(message.router)
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