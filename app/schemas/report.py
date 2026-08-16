from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ============================================================
# REPORT CREATE
# ============================================================

class ReportCreate(BaseModel):
    report_name: str
    report_type: str
    description: Optional[str] = None
    generated_by: int
    file_format: str = "pdf"


# ============================================================
# REPORT RESPONSE
# ============================================================

class ReportResponse(BaseModel):
    report_id: int
    report_name: str
    report_type: str
    description: Optional[str] = None
    generated_by: int
    file_format: str
    file_path: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# REPORT GENERATION REQUEST
# ============================================================

class ReportGenerateRequest(BaseModel):
    report_type: str
    file_format: str = "pdf"
    description: Optional[str] = None


# ============================================================
# REPORT GENERATION RESPONSE
# ============================================================

class ReportGenerateResponse(BaseModel):
    message: str
    report_id: Optional[int] = None
    report_type: str
    file_format: str
    file_path: Optional[str] = None
    status: str