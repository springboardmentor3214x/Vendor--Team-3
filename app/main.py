from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine

# Models
from app.models.role import Role
from app.models.user import User
from app.models.vendor import Vendor
from app.models.procurement import ProcurementRequest
from app.models.purchase_order import PurchaseOrder
from app.models.contract import Contract
from app.models.message import Message

# Routers
from app.routers import auth
from app.routers import vendor
from app.routers import dashboard
from app.routers import vendor_document
from app.routers import procurement
from app.routers import purchase_order
from app.routers import contract
from app.routers import message

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vendor Reliability Intelligence Platform",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.get("/")
def home():
    return {
        "message": "Vendor Reliability Backend is Running Successfully!"
    }