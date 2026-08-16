from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ReportTemplateBase(BaseModel):
    template_name: str
    report_type: str
    description: Optional[str] = None
    file_format: str = "pdf"


class ReportTemplateCreate(ReportTemplateBase):
    pass


class ReportTemplateResponse(ReportTemplateBase):
    template_id: int
    created_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)