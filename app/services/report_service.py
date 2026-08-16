import pandas as pd
import io
from sqlalchemy.orm import Session
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from app.models.vendor import Vendor
from app.models.procurement import ProcurementRequest
from app.models.purchase_order import PurchaseOrder
from app.models.contract import Contract
from app.models.vendor_reliability import VendorReliability
from app.models.compliance import ComplianceRecord
from app.schemas.report import ReportFilter
from fastapi.responses import StreamingResponse

class ReportService:
    @staticmethod
    def get_vendor_performance_data(db: Session, filters: ReportFilter):
        query = db.query(Vendor, VendorReliability).outerjoin(VendorReliability, Vendor.id == VendorReliability.vendor_id)
        if filters.vendor_category:
            query = query.filter(Vendor.vendor_category == filters.vendor_category)
        if filters.vendor_id:
            query = query.filter(Vendor.id == filters.vendor_id)
        
        data = []
        for vendor, reliability in query.all():
            if filters.min_reliability_score and (not reliability or reliability.reliability_score < filters.min_reliability_score):
                continue
                
            data.append({
                "vendor_id": vendor.id,
                "vendor_name": vendor.company_name,
                "vendor_category": vendor.vendor_category,
                "total_purchase_orders_completed": reliability.total_purchase_orders_completed if reliability else 0,
                "on_time_delivery_percentage": reliability.on_time_delivery_rate if reliability else 0.0,
                "delayed_deliveries": reliability.delayed_deliveries if reliability else 0,
                "product_quality_rating": reliability.quality_rating if reliability else 0.0,
                "communication_response_time": 0.0,  # mock
                "issue_resolution_performance": 0.0, # mock
                "overall_service_rating": 0.0, # mock
                "reliability_score": reliability.reliability_score if reliability else 0.0,
            })
        return data

    @staticmethod
    def get_procurement_data(db: Session, filters: ReportFilter):
        query = db.query(ProcurementRequest)
        if filters.department:
            query = query.filter(ProcurementRequest.department == filters.department)
        
        # Aggregate by department
        df = pd.DataFrame([{"department": p.department, "status": p.status, "budget": p.budget} for p in query.all()])
        if df.empty:
            return []
        
        agg_df = df.groupby('department').agg(
            total_requests=('status', 'count'),
            approved_requests=('status', lambda x: (x == 'Approved').sum()),
            purchase_orders_generated=('status', lambda x: (x == 'Completed').sum()),
            procurements_completed=('status', lambda x: (x == 'Completed').sum()),
            total_expenditure=('budget', 'sum')
        ).reset_index()
        
        return agg_df.to_dict('records')

    @staticmethod
    def export_to_excel(data: list, sheet_name: str):
        df = pd.DataFrame(data)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name=sheet_name)
        output.seek(0)
        return output

    @staticmethod
    def export_to_pdf(data: list, title: str):
        output = io.BytesIO()
        doc = SimpleDocTemplate(output, pagesize=landscape(letter))
        elements = []
        
        styles = getSampleStyleSheet()
        elements.append(Paragraph(title, styles['Title']))
        elements.append(Spacer(1, 12))
        
        if not data:
            elements.append(Paragraph("No data available", styles['Normal']))
            doc.build(elements)
            output.seek(0)
            return output
            
        headers = list(data[0].keys())
        table_data = [headers]
        for row in data:
            table_data.append([str(row.get(h, '')) for h in headers])
            
        t = Table(table_data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(t)
        doc.build(elements)
        output.seek(0)
        return output
