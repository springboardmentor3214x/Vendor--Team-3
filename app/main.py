from fastapi import FastAPI
from app.routers import auth


# from app.database import Base, engine
from app.database import Base, engine
from app.models.role import Role
from app.models.user import User

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Vendor Reliability Intelligence Platform",
    version="1.0.0"
)

# Include Authentication Routes
app.include_router(auth.router)


@app.get("/")
def home():
    return {
        "message": "Vendor Reliability Backend is Running Successfully!"
    }