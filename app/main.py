from fastapi import FastAPI
from app.routers import auth

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