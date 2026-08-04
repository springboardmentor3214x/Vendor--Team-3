# Vendor Reliability Intelligence Platform

## 📌 Project Overview

The **Vendor Reliability Intelligence Platform** is an enterprise-level vendor management system designed to improve vendor evaluation, contract management, compliance tracking, and reliability analysis.

The platform helps organizations manage the complete vendor lifecycle including vendor registration, approval workflows, procurement requests, contract management, document tracking, renewals, amendments, risk monitoring, and dashboard-based analytics.

The system provides a centralized solution for procurement teams and administrators to monitor vendor performance, contract status, and operational reliability.

---

# 🚀 Features

## 1. Authentication & User Management

* User registration and login
* JWT-based authentication
* Role-based access control (RBAC)
* Secure password hashing using bcrypt
* Profile management

### Supported Roles

* Admin
* Procurement Team
* Vendor

---

# 2. Vendor Management Module

## Vendor Registration

Vendors can register their organization details:

* Company information
* Contact details
* GST details
* PAN details
* Bank information
* Payment terms
* Business description

## Vendor Operations

Features:

* Create vendor
* View vendor details
* Update vendor information
* Delete vendor
* Vendor approval workflow
* Vendor status tracking

Vendor statuses:

* Pending
* Approved
* Rejected
* Active
* Inactive

---

# 3. Vendor Document Management

The platform supports vendor document management.

Supported documents:

* GST Certificate
* PAN Card
* Registration Certificate
* Compliance Documents
* Other business documents

Features:

* Upload vendor documents
* View documents
* Delete documents
* Track document details

---

# 4. Procurement Request Management

The procurement module manages purchase requirements before contract creation.

Features:

* Create procurement request
* Assign vendors
* Track procurement status
* Approve or reject requests

Procurement lifecycle:

```
Created
   ↓
Under Review
   ↓
Approved
   ↓
Contract Created
```

---

# 5. Contract Management Module

The contract module manages complete contract lifecycle.

## Contract CRUD Operations

Supported APIs:

```
POST    /contracts/
GET     /contracts/
GET     /contracts/{contract_id}
PUT     /contracts/{contract_id}
DELETE  /contracts/{contract_id}
```

Contract information includes:

* Contract title
* Description
* Vendor details
* Contract value
* Start date
* End date
* Status
* Created date

Contract statuses:

* Draft
* Active
* Expired
* Terminated

---

# 6. Contract Document Management

Contract-related documents can be stored and tracked.

Features:

* Add contract documents
* View documents
* Delete documents

Supported operations:

```
POST   /contract-documents/
GET    /contract-documents/{contract_id}
DELETE /contracts/document/{document_id}
```

Examples:

* Agreement documents
* Legal documents
* Signed contracts
* Supporting files

---

# 7. Contract Milestone Management

Milestones help track important contract activities.

Features:

* Create milestone
* View milestones
* Update milestone status

Milestone workflow:

```
Pending
   ↓
In Progress
   ↓
Completed
```

API:

```
POST /contract-milestones/

GET /contract-milestones/{contract_id}

PUT /milestone/{milestone_id}/status
```

---

# 8. Contract Renewal Management

Tracks contract renewal activities.

Features:

* Create renewal request
* View renewals
* Track renewal dates

Renewal tracking includes:

* Renewal date
* Previous contract
* Renewal status

---

# 9. Contract Amendment Management

Manages contract modifications.

Features:

* Create amendments
* View amendments
* Retrieve amendment details

APIs:

```
POST /contract-amendments/

GET /contract-amendments/{contract_id}

GET /contract-amendments/{amendment_id}
```

---

# 10. Contract Dashboard

Provides analytics and contract insights.

Dashboard APIs:

```
GET /dashboard/contracts/summary

GET /dashboard/contracts/expiring-soon

GET /dashboard/contracts/value-by-vendor
```

Dashboard provides:

* Total contracts
* Active contracts
* Expired contracts
* Total contract value
* Expiring contracts
* Vendor-wise contract value

---

# 🏗️ Technology Stack

## Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic
* JWT Authentication
* Passlib
* Bcrypt

## Database

* PostgreSQL

## API Documentation

* Swagger UI
* OpenAPI 3.0

---

# 📂 Project Structure

```
Vendor--Team-3

│
├── app
│   │
│   ├── main.py
│   ├── database
│   │     └── database.py
│   │
│   ├── models
│   │     ├── vendor.py
│   │     ├── contract.py
│   │     ├── contract_document.py
│   │     ├── contract_milestone.py
│   │     ├── contract_renewal.py
│   │     └── contract_amendment.py
│   │
│   ├── schemas
│   │     ├── vendor.py
│   │     ├── contract.py
│   │     └── documents.py
│   │
│   ├── routers
│   │     ├── auth.py
│   │     ├── vendor.py
│   │     ├── contract.py
│   │     ├── contract_document.py
│   │     ├── contract_milestone.py
│   │     ├── contract_renewal.py
│   │     ├── contract_amendment.py
│   │     └── contract_dashboard.py
│   │
│   └── core
│         ├── security.py
│         └── role.py
│
├── requirements.txt
├── .env
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Clone Repository

```bash
git clone <repository-url>

cd Vendor--Team-3
```

---

## 2. Create Virtual Environment

```bash
python -m venv venv
```

Activate:

### Windows

```bash
venv\Scripts\activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🗄️ Database Configuration

Create PostgreSQL database:

```
vendor_reliability_db
```

Update `.env` file:

```
DATABASE_URL=postgresql://username:password@localhost:5432/vendor_reliability_db

SECRET_KEY=your_secret_key

ALGORITHM=HS256
```

---

# ▶️ Run Application

Start FastAPI server:

```bash
uvicorn app.main:app --reload
```

Application runs at:

```
http://127.0.0.1:8000
```

---

# 📖 API Documentation

Swagger documentation:

```
http://127.0.0.1:8000/docs
```

OpenAPI JSON:

```
http://127.0.0.1:8000/openapi.json
```

---

# 🔐 Authentication Flow

```
Register User
      |
      ↓
Login
      |
      ↓
Receive JWT Token
      |
      ↓
Authorize Swagger
      |
      ↓
Access Protected APIs
```

---

# 🧪 API Testing

Testing is performed using:

* Swagger UI
* Postman

Tested modules:

✅ Authentication
✅ Vendor Management
✅ Vendor Documents
✅ Procurement
✅ Contract CRUD
✅ Contract Documents
✅ Contract Milestones
✅ Contract Renewals
✅ Contract Amendments
✅ Contract Dashboard

---

# 📊 Current Module Completion

| Module                       | Status        |
| ---------------------------- | ------------- |
| Authentication               | ✅ Completed   |
| Vendor Management            | ✅ Completed   |
| Vendor Documents             | ✅ Completed   |
| Procurement                  | ✅ Completed   |
| Contract CRUD                | ✅ Completed   |
| Contract Documents           | ✅ Completed   |
| Contract Milestones          | ✅ Completed   |
| Contract Renewals            | ✅ Completed   |
| Contract Amendments          | ✅ Completed   |
| Contract Dashboard           | ✅ Completed   |
| File Upload System           | ⏳ Enhancement |
| Automated Lifecycle Tracking | ⏳ Enhancement |

---

# 🔮 Future Enhancements

* Real file upload using cloud storage
* Email notifications for contract expiry
* AI-based vendor reliability scoring
* Automated compliance checking
* Advanced analytics dashboard
* Vendor risk prediction model

---

# 👨‍💻 Team Project

## Vendor Reliability Intelligence Platform

Developed using:

* FastAPI Backend
* PostgreSQL Database
* REST API Architecture
* Role-Based Security

---

# 📄 License

This project is developed for educational and enterprise prototype purposes.
