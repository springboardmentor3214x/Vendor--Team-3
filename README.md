# Vendor Reliability Intelligence Platform - Backend

## Overview

The Vendor Reliability Intelligence Platform is a backend application developed using FastAPI and PostgreSQL to manage vendor information, authentication, document management, and vendor approval workflows. The system provides secure REST APIs for user authentication and vendor lifecycle management.

---

## Tech Stack

- FastAPI
- Python
- PostgreSQL
- SQLAlchemy ORM
- Pydantic
- JWT Authentication
- Passlib (Password Hashing)
- Uvicorn

---

## Features

### Authentication & Role Management

- User Registration
- User Login
- JWT Token Authentication
- Password Hashing using bcrypt
- User Profile APIs
- Password Reset APIs
- Role-based User Management

### Vendor Management

- Create Vendor
- Get All Vendors
- Search Vendors
- Filter Vendors
- Pagination
- Sorting
- Get Vendor by ID
- Update Vendor
- Delete Vendor (Admin Only)
- Vendor Approval
- Vendor Rejection

### Vendor Documents

- Add Vendor Document Details
- Retrieve Vendor Documents
- Delete Vendor Documents
- Store Document Information in PostgreSQL

### Dashboard

- Dashboard APIs for vendor-related statistics and summaries

---

## Project Structure

```
VendorReliabilityBackend/
│
├── app/
│   ├── core/
│   ├── database/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── main.py
│
├── uploads/
├── requirements.txt
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd VendorReliabilityBackend
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

Windows

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure PostgreSQL

Update your database URL in the configuration file.

Example:

```text
postgresql://postgres:password@localhost:5432/vendor_reliability_db
```

### Run the Server

```bash
uvicorn app.main:app --reload
```

---

## API Documentation

Swagger UI

```
http://127.0.0.1:8000/docs
```

ReDoc

```
http://127.0.0.1:8000/redoc
```

---

## Main API Modules

### Authentication

- POST /register
- POST /login
- GET /profile
- PUT /profile
- POST /forgot-password
- POST /reset-password

### Vendors

- POST /vendors
- GET /vendors
- GET /vendors/{vendor_id}
- PUT /vendors/{vendor_id}
- DELETE /vendors/{vendor_id}
- PUT /vendors/{vendor_id}/approve
- PUT /vendors/{vendor_id}/reject

### Vendor Documents

- POST /vendor-documents
- GET /vendor-documents/{vendor_id}
- DELETE /vendor-documents/{document_id}

### Dashboard

- Dashboard summary APIs

---

## Security

- JWT Authentication
- Password Hashing using bcrypt
- Role-based Authorization
- PostgreSQL Data Storage

