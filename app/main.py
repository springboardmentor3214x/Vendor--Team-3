from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth

# from app.database import Base, engine
from app.database import Base, engine
from app.models.role import Role
from app.models.user import User
from app.routers import vendor
from app.routers import dashboard
from app.routers import vendor_document

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vendor Reliability Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include Authentication Routes
app.include_router(auth.router)
app.include_router(vendor.router)
app.include_router(dashboard.router)
app.include_router(vendor_document.router)


@app.get("/")
def home():
    return {
        "message": "Vendor Reliability Backend is Running Successfully!"
    }