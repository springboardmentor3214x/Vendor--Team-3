from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.report import ReportFilter
from app.services.report_service import ReportService
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/reports", tags=["Reports & Export"])

@router.post("/vendor-performance/excel")
def export_vendor_performance_excel(filters: ReportFilter, db: Session = Depends(get_db)):
    data = ReportService.get_vendor_performance_data(db, filters)
    output = ReportService.export_to_excel(data, "Vendor Performance")
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=vendor_performance.xlsx"}
    )

@router.post("/vendor-performance/pdf")
def export_vendor_performance_pdf(filters: ReportFilter, db: Session = Depends(get_db)):
    data = ReportService.get_vendor_performance_data(db, filters)
    output = ReportService.export_to_pdf(data, "Vendor Performance Report")
    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=vendor_performance.pdf"}
    )

@router.post("/procurement/excel")
def export_procurement_excel(filters: ReportFilter, db: Session = Depends(get_db)):
    data = ReportService.get_procurement_data(db, filters)
    output = ReportService.export_to_excel(data, "Procurement Report")
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=procurement_report.xlsx"}
    )

@router.post("/procurement/pdf")
def export_procurement_pdf(filters: ReportFilter, db: Session = Depends(get_db)):
    data = ReportService.get_procurement_data(db, filters)
    output = ReportService.export_to_pdf(data, "Procurement Report")
    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=procurement_report.pdf"}
    )
