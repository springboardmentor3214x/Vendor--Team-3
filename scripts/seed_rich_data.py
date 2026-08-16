import sys, os, random
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy import text
from app.database.database import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.models.vendor import Vendor
from app.models.procurement import ProcurementRequest
from app.models.purchase_order import PurchaseOrder
from app.models.contract import Contract
from app.models.message import Message
from app.models.vendor_reliability import VendorReliability
from app.models.supplier_ranking import SupplierRanking
from app.models.performance_trend import PerformanceTrend
from app.models.activity_log import ActivityLog
from app.models.certification import Certification
from app.models.compliance import ComplianceRecord
from app.models.contract_renewal import ContractRenewal
from app.models.notification import Notification
from app.models.rfq import Rfq, RfqQuotation
from app.models.shared_file import SharedFile
from app.models.vendor_document import VendorDocument
from app.models.procurement_recommendation import ProcurementRecommendation
from app.models.discussion import Discussion, DiscussionMessage
from app.models.performance_reliability import (
    CommunicationLog, DeliveryPerformance, PerformanceHistory,
    ProductQualityEvaluation, ServiceRating, VendorRanking
)
from app.core.security import hash_password


def rand_date(days_back=60, days_forward=0):
    offset = random.randint(-days_back, days_forward)
    return date.today() + timedelta(days=offset)

def rand_dt(days_back=60):
    return datetime.utcnow() - timedelta(days=random.randint(0, days_back), hours=random.randint(0,23))


def clear_all(db):
    print("Clearing all tables...")
    tables = [
        "discussion_messages", "discussions", "shared_files", "activity_logs",
        "notifications", "vendor_documents", "certifications", "compliance_records",
        "contract_renewals", "procurement_recommendations", "rfq_quotations", "rfqs",
        "service_ratings", "product_quality_evaluations", "communication_logs",
        "delivery_performance", "performance_history", "vendor_rankings",
        "messages", "performance_trends", "supplier_rankings", "vendor_reliability",
        "contracts", "purchase_orders", "procurement_requests", "vendors", "users",
    ]
    for t in tables:
        try:
            db.execute(text(f"TRUNCATE TABLE {t} CASCADE;"))
        except Exception as e:
            db.rollback()
            print(f"  Could not truncate {t}: {e}")
    db.commit()
    print("Done clearing.\n")


def seed():
    db = SessionLocal()
    clear_all(db)

    # ── 1. ROLES ──────────────────────────────────────────────────────────────
    role_names = ["Admin", "Procurement Manager", "Supply Chain Manager", "Auditor", "Finance Manager", "Vendor"]
    role_objs = {}
    for rn in role_names:
        r = db.query(Role).filter(Role.role_name == rn).first()
        if not r:
            r = Role(role_name=rn)
            db.add(r)
            db.commit()
            db.refresh(r)
        role_objs[rn] = r
    print("Roles ready.")

    # ── 2. CORE USERS ─────────────────────────────────────────────────────────
    pwd = hash_password("password123")

    managers = [
        ("Amit Sharma", "admin@gmail.com", "Admin", "9876543210", "VendorIQ Pvt Ltd"),
        ("Priya Nair", "pm@gmail.com", "Procurement Manager", "9876543211", "VendorIQ Pvt Ltd"),
        ("Rohit Verma", "supply@gmail.com", "Supply Chain Manager", "9876543212", "VendorIQ Pvt Ltd"),
        ("Kavitha Reddy", "auditor@gmail.com", "Auditor", "9876543213", "VendorIQ Pvt Ltd"),
        ("Suresh Iyer", "finance@gmail.com", "Finance Manager", "9876543214", "VendorIQ Pvt Ltd"),
    ]
    mgr_users = {}
    for full_name, email, role, phone, company in managers:
        u = User(full_name=full_name, email=email, password=pwd, role_id=role_objs[role].role_id, phone=phone, company=company)
        db.add(u)
        db.commit()
        db.refresh(u)
        mgr_users[role] = u
        print(f"  Created {role}: {email}")

    admin_user = mgr_users["Admin"]
    pm_user    = mgr_users["Procurement Manager"]
    sc_user    = mgr_users["Supply Chain Manager"]

    # ── 3. VENDORS ────────────────────────────────────────────────────────────
    indian_vendors = [
        ("Tata Consultancy Services", "Arjun Tata", "IT Supplies"),
        ("Infosys Limited", "Nandini Infosys", "IT Supplies"),
        ("Reliance Industries", "Mukesh Reliance", "Raw Materials"),
        ("Wipro Enterprises", "Azim Wipro", "IT Supplies"),
        ("Mahindra & Mahindra", "Anand Mahindra", "Logistics"),
        ("Larsen & Toubro", "S N Subrahmanyan", "Raw Materials"),
        ("HCL Technologies", "Roshni Nadar", "IT Supplies"),
        ("Adani Enterprises", "Gautam Adani", "Raw Materials"),
        ("ITC Limited", "Sanjiv Puri", "Office Supplies"),
        ("Bajaj Finserv", "Sanjiv Bajaj", "Finance"),
        ("Bharti Airtel", "Sunil Mittal", "IT Supplies"),
        ("Godrej Group", "Jamshyd Godrej", "Office Supplies"),
        ("Sun Pharmaceutical", "Dilip Shanghvi", "Raw Materials"),
        ("Tech Mahindra", "C P Gurnani", "IT Supplies"),
        ("JSW Steel", "Sajjan Jindal", "Raw Materials"),
        ("Vedanta Resources", "Anil Agarwal", "Raw Materials"),
        ("Hindalco Industries", "Kumar Mangalam Birla", "Raw Materials"),
        ("Maruti Suzuki", "Hisashi Takeuchi", "Logistics"),
        ("Dr Reddys Laboratories", "G V Prasad", "Raw Materials"),
        ("Tata Steel", "T V Narendran", "Raw Materials"),
    ]

    categories = ["IT Supplies", "Office Supplies", "Raw Materials", "Logistics", "Finance"]
    vendor_users = []
    vendor_objs  = []

    os.makedirs("uploads/documents", exist_ok=True)
    os.makedirs("uploads/messages", exist_ok=True)
    os.makedirs("uploads/shared", exist_ok=True)

    for i, (company_name, contact_name, category) in enumerate(indian_vendors, start=1):
        email = f"v{i}@gmail.com"
        score = round(random.uniform(70.0, 99.0), 2)

        u = User(
            full_name=contact_name, email=email, password=pwd,
            role_id=role_objs["Vendor"].role_id,
            phone=f"9{random.randint(100000000, 999999999)}",
            company=company_name
        )
        db.add(u); db.commit(); db.refresh(u)

        v = Vendor(
            company_name=company_name,
            vendor_category=category,
            contact_person=contact_name,
            email=email,
            gst_number=f"22AAAA{i:04d}A1Z5",
            pan_number=f"AAAA{i:04d}A",
            address_line1=f"Plot {random.randint(1,99)}, MIDC Industrial Area",
            vendor_status="Active",
            approval_status=random.choice(["Approved", "Approved", "Approved", "Pending"])
        )
        db.add(v); db.commit(); db.refresh(v)

        vendor_users.append((u, v, score))
        vendor_objs.append(v)
        print(f"  Vendor {i}: {company_name} ({email})")

    # ── 4. PROCUREMENT REQUESTS, POs, CONTRACTS, RENEWALS ───────────────────
    depts = ["IT", "HR", "Operations", "Finance", "Marketing", "Logistics"]
    all_orders = []

    for u, v, score in vendor_users:
        num_reqs = random.randint(2, 4)
        for j in range(num_reqs):
            dept   = random.choice(depts)
            status = random.choice(["Approved", "Approved", "Approved", "Pending", "Rejected"])
            req = ProcurementRequest(
                title=f"{dept} Supplies Q{random.randint(1,4)}",
                description=f"Procurement of {dept} department supplies and equipment from {v.company_name}.",
                vendor_id=v.vendor_id,
                status=status,
                created_date=rand_date(90)
            )
            db.add(req); db.commit(); db.refresh(req)

            if status == "Approved":
                amt = random.randint(25000, 750000)
                po_status = random.choice(["Pending", "In Transit", "Completed", "Completed", "Completed"])
                order_date = rand_date(45)
                delivery_date = order_date + timedelta(days=random.randint(7, 30))
                actual_delivery = delivery_date + timedelta(days=random.randint(-2, 5)) if po_status == "Completed" else None

                order = PurchaseOrder(
                    procurement_id=req.procurement_id,
                    vendor_id=v.vendor_id,
                    order_number=f"PO-{v.vendor_id:03d}-{j:02d}",
                    order_date=order_date,
                    delivery_date=delivery_date,
                    actual_delivery_date=actual_delivery,
                    total_amount=float(amt),
                    status=po_status
                )
                db.add(order); db.commit(); db.refresh(order)
                all_orders.append((order, v, u))

                # Contract
                con = Contract(
                    vendor_id=v.vendor_id,
                    procurement_id=req.procurement_id,
                    contract_title=f"{v.company_name} Supply Agreement",
                    contract_number=f"CON-{v.vendor_id:03d}-{j:02d}",
                    start_date=order_date,
                    end_date=order_date + timedelta(days=random.choice([180, 365, 730])),
                    contract_value=float(amt * 1.5),
                    status=random.choice(["Active", "Active", "Active", "Expired", "Terminated"])
                )
                db.add(con); db.commit(); db.refresh(con)

                # Contract Renewal for some
                if random.random() > 0.5:
                    renewal = ContractRenewal(
                        contract_id=con.contract_id,
                        renewal_date=rand_date(30),
                        new_end_date=con.end_date + timedelta(days=365),
                        new_value=float(amt * 1.6),
                        notes=f"Annual renewal for {v.company_name} supply contract."
                    )
                    db.add(renewal)

        db.commit()

    # ── 5. RELIABILITY, RANKINGS, TRENDS ─────────────────────────────────────
    months_data = [("April", 2026), ("May", 2026), ("June", 2026),
                   ("July", 2026), ("August", 2026)]

    for idx, (u, v, score) in enumerate(vendor_users):
        rel = VendorReliability(
            vendor_id=v.vendor_id,
            reliability_score=float(score),
            risk_level="Low" if score > 85 else ("Medium" if score > 75 else "High"),
            delivery_score=float(min(100, score + random.uniform(-4, 4))),
            quality_score=float(min(100, score + random.uniform(-4, 4))),
            communication_score=float(min(100, score + random.uniform(-4, 4)))
        )
        db.add(rel)

        for m_idx, (m_name, m_year) in enumerate(months_data):
            trend_score = score + (m_idx * random.uniform(0.2, 0.8))
            trend = PerformanceTrend(
                vendor_id=v.vendor_id, month=m_name, year=m_year,
                delivery_score=min(100, trend_score + 2),
                quality_score=min(100, trend_score - 1),
                communication_score=min(100, trend_score + 1),
                contract_compliance_score=min(100, trend_score),
                issue_resolution_score=min(100, trend_score),
                reliability_score=min(100, trend_score)
            )
            db.add(trend)

        rank = SupplierRanking(
            vendor_id=v.vendor_id,
            vendor_name=v.company_name,
            vendor_category=v.vendor_category,
            reliability_score=score,
            procurement_risk="Low" if score > 85 else "Medium",
            vendor_rank=idx + 1
        )
        db.add(rank)

        rec_text = random.choice([
            "Highly recommended based on consistent delivery performance.",
            "Recommended for bulk orders. Strong quality compliance.",
            "Good for IT supply chain needs. Reliable communication.",
            "Consider for long-term partnership due to competitive pricing.",
            "Preferred vendor for raw material sourcing."
        ])
        rec = ProcurementRecommendation(
            vendor_id=v.vendor_id,
            recommendation=f"Preferred Vendor – {v.vendor_category}",
            reason=rec_text,
            reliability_score=score
        )
        db.add(rec)

    db.commit()
    print("Reliability, rankings, trends seeded.")

    # ── 6. PERFORMANCE RELIABILITY TABLES ────────────────────────────────────
    for order, v, u in all_orders:
        if order.status == "Completed":
            delay = random.randint(-2, 5)
            dp = DeliveryPerformance(
                vendor_id=v.vendor_id,
                purchase_order_id=order.order_id,
                expected_delivery_date=order.delivery_date,
                actual_delivery_date=order.actual_delivery_date,
                delay_days=max(0, delay),
                delivery_status="On Time" if delay <= 0 else "Delayed",
                remarks="Goods received in good condition." if delay <= 0 else f"Delayed by {delay} days."
            )
            db.add(dp)

            q_scores = [random.randint(7, 10) for _ in range(5)]
            pq = ProductQualityEvaluation(
                vendor_id=v.vendor_id,
                purchase_order_id=order.order_id,
                inspection_date=order.actual_delivery_date,
                material_quality=q_scores[0],
                packaging_quality=q_scores[1],
                quantity_accuracy=q_scores[2],
                specification_compliance=q_scores[3],
                product_defects=random.randint(0, 2),
                overall_quality_rating="Excellent" if sum(q_scores) >= 42 else "Good",
                remarks="Standard quality inspection passed.",
                evaluated_at=rand_dt(10)
            )
            db.add(pq)

            s_scores = [random.randint(7, 10) for _ in range(6)]
            sr = ServiceRating(
                vendor_id=v.vendor_id,
                purchase_order_id=order.order_id,
                professionalism=s_scores[0],
                customer_support=s_scores[1],
                documentation_quality=s_scores[2],
                flexibility=s_scores[3],
                communication_effectiveness=s_scores[4],
                issue_resolution=s_scores[5],
                overall_service_rating=Decimal(str(round(sum(s_scores)/len(s_scores), 2))),
                comments="Vendor performed satisfactorily on all fronts.",
                rating_date=rand_dt(10)
            )
            db.add(sr)

            cl = CommunicationLog(
                vendor_id=v.vendor_id,
                purchase_order_id=order.order_id,
                message_sent_time=rand_dt(30),
                vendor_response_time=rand_dt(28),
                response_duration_hours=Decimal(str(round(random.uniform(0.5, 24.0), 2))),
                communication_status="Responded",
                remarks="Vendor responded within acceptable time."
            )
            db.add(cl)

        ph = PerformanceHistory(
            vendor_id=v.vendor_id,
            delivery_score=Decimal(str(round(random.uniform(70, 99), 2))),
            quality_score=Decimal(str(round(random.uniform(70, 99), 2))),
            communication_score=Decimal(str(round(random.uniform(70, 99), 2))),
            service_score=Decimal(str(round(random.uniform(70, 99), 2))),
            overall_performance_score=Decimal(str(round(random.uniform(70, 99), 2))),
            evaluation_period=random.choice(["Q1 2026", "Q2 2026", "Q3 2026"]),
            remarks="Periodic performance review completed.",
            recorded_at=rand_dt(60)
        )
        db.add(ph)

    # Vendor Rankings from performance_reliability
    for idx, (u, v, score) in enumerate(vendor_users):
        vr = VendorRanking(
            vendor_id=v.vendor_id,
            overall_score=Decimal(str(round(score, 2))),
            rank_position=idx + 1,
            ranking_date=date.today(),
            remarks=f"Ranked #{idx+1} based on Q3 2026 performance review."
        )
        db.add(vr)

    db.commit()
    print("Performance reliability tables seeded.")

    # ── 7. CERTIFICATIONS & COMPLIANCE ───────────────────────────────────────
    cert_types = [
        ("ISO 9001:2015", "Bureau Veritas"),
        ("ISO 14001:2015", "TUV SUD"),
        ("SOC 2 Type II", "KPMG India"),
        ("MSME Certificate", "Ministry of MSME, India"),
        ("GST Compliance", "GSTN India"),
    ]
    compliance_types = ["GST Filing", "Labour Laws", "Environmental Norms", "Factory Act", "PF Compliance"]

    for u, v, score in vendor_users:
        # 1-2 certifications per vendor
        chosen_certs = random.sample(cert_types, k=random.randint(1, 3))
        for cert_name, authority in chosen_certs:
            issue_dt = rand_date(500)
            cert = Certification(
                vendor_id=v.vendor_id,
                name=cert_name,
                cert_number=f"CERT-{v.vendor_id}-{random.randint(1000,9999)}",
                issuing_authority=authority,
                issue_date=issue_dt,
                expiry_date=issue_dt + timedelta(days=random.choice([365, 730, 1095])),
                document_path=f"uploads/documents/cert_{v.vendor_id}.pdf",
                status=random.choice(["Valid", "Valid", "Expired"])
            )
            db.add(cert)

        for ct in random.sample(compliance_types, k=random.randint(2, 4)):
            comp = ComplianceRecord(
                vendor_id=v.vendor_id,
                requirement_type=ct,
                status=random.choice(["Compliant", "Compliant", "Non-Compliant", "Pending Review"]),
                last_verified=rand_dt(60),
                next_verification_date=rand_date(-30, 180),
                notes=f"{ct} checked and verified for {v.company_name}."
            )
            db.add(comp)

        # Vendor Documents
        for doc_type in ["GST Certificate", "PAN Card", "Company Registration"]:
            vdoc = VendorDocument(
                vendor_id=v.vendor_id,
                document_type=doc_type,
                file_name=f"{doc_type.replace(' ', '_')}_{v.vendor_id}.pdf",
                file_path=f"uploads/documents/{doc_type.replace(' ', '_')}_{v.vendor_id}.pdf",
                status="Verified"
            )
            db.add(vdoc)

    db.commit()
    print("Certifications, compliance, vendor documents seeded.")

    # ── 8. RFQs & QUOTATIONS ──────────────────────────────────────────────────
    rfq_titles = [
        ("Office Furniture Procurement", ["Chairs", "Desks", "Cabinets", "Conference Tables"]),
        ("IT Hardware Upgrade", ["Laptops", "Monitors", "Keyboards", "Network Switches"]),
        ("Raw Material Supply – Steel", ["HR Coils", "CR Sheets", "Galvanized Steel"]),
        ("Logistics Services Q4 2026", ["Truck Hire", "Warehouse Space", "Last Mile Delivery"]),
        ("Industrial Safety Equipment", ["Helmets", "Gloves", "Safety Boots", "Fire Extinguishers"]),
    ]
    for k, (title, items) in enumerate(rfq_titles):
        rfq = Rfq(
            rfq_number=f"RFQ-2026-{k+1:03d}",
            title=title,
            items=items,
            deadline=str(rand_date(-5, 30)),
            status=random.choice(["Open", "Open", "Closed", "Awarded"]),
            created_by_id=pm_user.user_id
        )
        db.add(rfq); db.commit(); db.refresh(rfq)

        # 3-6 vendor quotations per RFQ
        bidding_vendors = random.sample(vendor_users, k=random.randint(3, 6))
        for u, v, score in bidding_vendors:
            q = RfqQuotation(
                rfq_id=rfq.id,
                vendor_id=u.user_id,
                vendor_name=v.company_name,
                proposed_price=random.randint(50000, 500000),
                delivery_time=f"{random.randint(7, 30)} days"
            )
            db.add(q)

    db.commit()
    print("RFQs and quotations seeded.")

    # ── 9. MESSAGES ───────────────────────────────────────────────────────────
    msg_templates = [
        "Please find the attached purchase order for your review.",
        "Kindly confirm the delivery schedule for your recent order.",
        "Invoice for your latest order has been processed.",
        "Please provide updated GST certificate at the earliest.",
        "Quality inspection report has been approved for your recent shipment.",
        "Your contract renewal is due in 30 days. Please initiate the process.",
        "Payment has been released for your latest invoice.",
        "Please submit the compliance documents for Q3 2026.",
    ]

    # Build a map of vendor_id -> first procurement request id
    from app.models.procurement import ProcurementRequest as PR
    for idx, (u, v, score) in enumerate(vendor_users):
        # Find a procurement request for this vendor
        first_req = db.query(PR).filter(PR.vendor_id == v.vendor_id).first()
        if not first_req:
            continue
        proc_id = first_req.procurement_id

        # PM -> Vendor
        msg = Message(
            sender_id=pm_user.user_id,
            receiver_id=u.user_id,
            procurement_id=proc_id,
            message=random.choice(msg_templates),
            sent_at=rand_dt(30)
        )
        db.add(msg)
        # Vendor -> PM reply
        msg2 = Message(
            sender_id=u.user_id,
            receiver_id=pm_user.user_id,
            procurement_id=proc_id,
            message=f"Acknowledged. We will process the request promptly. Thank you.",
            sent_at=rand_dt(28)
        )
        db.add(msg2)

    db.commit()
    print("Messages seeded.")

    # ── 10. DISCUSSIONS ───────────────────────────────────────────────────────
    disc_topics = [
        ("Supplier Quality Standards for FY 2027", "PurchaseOrder"),
        ("Freight Cost Optimization Initiative", "ProcurementRequest"),
        ("New Compliance Requirements – Q4 2026", "PurchaseOrder"),
        ("Vendor Onboarding Process Improvement", "ProcurementRequest"),
        ("Emergency Procurement Protocol", "PurchaseOrder"),
    ]
    all_mgr_users = list(mgr_users.values())
    for k, (title, entity_type) in enumerate(disc_topics):
        disc = Discussion(
            entity_type=entity_type,
            entity_id=k + 1,
            title=title,
            created_by=random.choice(all_mgr_users).user_id
        )
        db.add(disc); db.commit(); db.refresh(disc)

        # 2-4 replies per discussion
        participants = random.sample(all_mgr_users, k=min(3, len(all_mgr_users)))
        replies = [
            "Agreed, we need to set stricter quality benchmarks for all tier-1 vendors.",
            "I have raised this with the finance team. Budget approval expected by next week.",
            "Please share the updated compliance checklist so we can distribute to vendors.",
            "This should be addressed in the next vendor review meeting.",
            "I will coordinate with the supply chain team to finalize the timeline.",
        ]
        for participant in participants:
            dm = DiscussionMessage(
                discussion_id=disc.discussion_id,
                sender_id=participant.user_id,
                content=random.choice(replies)
            )
            db.add(dm)

    db.commit()
    print("Discussions seeded.")

    # ── 11. NOTIFICATIONS ─────────────────────────────────────────────────────
    all_users = all_mgr_users + [u for u, v, s in vendor_users]
    notif_templates = [
        ("Contract Expiring Soon", "Your contract CON-{id} expires in 30 days. Please initiate renewal.", "Contract", "High"),
        ("New Purchase Order", "Purchase order PO-{id} has been raised for your company.", "PurchaseOrder", "Medium"),
        ("Payment Processed", "Payment of ₹{amt} has been released for invoice #{id}.", "Invoice", "Low"),
        ("Document Verification Required", "Please upload your updated GST certificate.", "Document", "High"),
        ("RFQ Deadline Reminder", "RFQ-2026-001 deadline is approaching in 3 days.", "RFQ", "Medium"),
    ]
    for u_obj in all_users[:15]:  # Notifications for first 15 users
        for _ in range(random.randint(2, 4)):
            title, msg_t, module, priority = random.choice(notif_templates)
            notif = Notification(
                user_id=u_obj.user_id,
                notification_type=module,
                title=title,
                message=msg_t.replace("{id}", str(random.randint(100, 999))).replace("{amt}", f"{random.randint(10000, 500000):,}"),
                related_module=module,
                related_record_id=random.randint(1, 50),
                priority=priority,
                delivery_method="In-App",
                status=random.choice(["Read", "Unread", "Unread"])
            )
            db.add(notif)

    db.commit()
    print("Notifications seeded.")

    # ── 12. ACTIVITY LOGS ─────────────────────────────────────────────────────
    actions = [
        ("Logged In", "Authentication"),
        ("Created Purchase Order", "PurchaseOrder"),
        ("Approved Procurement Request", "Procurement"),
        ("Uploaded Vendor Document", "Documents"),
        ("Generated Report", "Reports"),
        ("Updated Vendor Profile", "Vendors"),
        ("Sent Message to Vendor", "Messages"),
        ("Submitted RFQ Response", "RFQ"),
        ("Renewed Contract", "Contracts"),
        ("Viewed Audit Logs", "AuditLogs"),
    ]
    for u_obj in all_users:
        for _ in range(random.randint(3, 6)):
            action, module = random.choice(actions)
            log = ActivityLog(
                user_id=u_obj.user_id,
                action_performed=action,
                module_name=module,
                related_business_record=f"{module}-{random.randint(100, 999)}",
                ip_address=f"192.168.{random.randint(1,5)}.{random.randint(1,254)}"
            )
            db.add(log)

    db.commit()
    print("Activity logs seeded.")

    # ── 13. SHARED FILES ──────────────────────────────────────────────────────
    file_types = ["pdf", "xlsx", "docx", "csv"]
    file_names = [
        "Vendor_Performance_Report_Q3_2026",
        "Contract_Summary_Aug2026",
        "Purchase_Order_List",
        "Compliance_Checklist_Q3",
        "RFQ_Evaluation_Matrix",
        "Supplier_Scorecard_2026",
        "Budget_Utilization_Report",
    ]
    for k, fname in enumerate(file_names):
        ftype = random.choice(file_types)
        uploader = random.choice(all_mgr_users)
        sf = SharedFile(
            file_name=f"{fname}.{ftype}",
            file_path=f"uploads/shared/{fname}.{ftype}",
            file_type=ftype,
            entity_type=random.choice(["PurchaseOrder", "Contract", "Vendor", "Report"]),
            entity_id=random.randint(1, 20),
            uploaded_by=uploader.user_id
        )
        db.add(sf)

    db.commit()
    print("Shared files seeded.")

    # ── DONE ──────────────────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("DATABASE FULLY SEEDED!")
    print("="*60)
    print("\nLOGIN CREDENTIALS (Password for all: password123)")
    print(f"  Admin:              admin@gmail.com")
    print(f"  Procurement Mgr:    pm@gmail.com")
    print(f"  Supply Chain Mgr:   supply@gmail.com")
    print(f"  Auditor:            auditor@gmail.com")
    print(f"  Finance Manager:    finance@gmail.com")
    print(f"  Vendors:            v1@gmail.com  to  v20@gmail.com")
    print("="*60)


if __name__ == "__main__":
    seed()
