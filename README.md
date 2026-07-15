# Vendor Reliability Intelligence Platform

The **Vendor Reliability Intelligence Platform (VRIP)** is a collaborative, role-based application designed to manage vendor lifecycles, track performance, evaluate compliance, and coordinate procurement workflows.

---

## Project Directory Structure

- [frontend/](file:///c:/Users/namke/OneDrive/Desktop/vendor_reliability/frontend) - Angular v18 web application client (User's Contribution).
- [app/](file:///c:/Users/namke/OneDrive/Desktop/vendor_reliability/app) - FastAPI backend application server (Teammate's Contribution).
- [database/](file:///c:/Users/namke/OneDrive/Desktop/vendor_reliability/database) - Database SQL schemas, ER diagrams, and design reports (Teammate's Contribution).
- [ui-ux/](file:///c:/Users/namke/OneDrive/Desktop/vendor_reliability/ui-ux) - UI mockup PDFs and PNG asset slices (Teammate's Contribution).

---

## Tech Stack

### Frontend Client
- **Framework**: Angular v18 (Standalone Components, TypeScript)
- **Styling**: Vanilla CSS / SCSS (Dynamic role-based theming)
- **Routing**: Angular Router with Auth and Role Guards
- **State Management**: Local caching and RxJS Observables

### Backend Server
- **Framework**: FastAPI (Python)
- **Database ORM**: SQLAlchemy
- **Data Validation**: Pydantic
- **Security**: JWT Authentication, Bcrypt Password Hashing
- **Execution**: Uvicorn

### Database
- **Engine**: PostgreSQL
- **Schema**: Custom SQL script (`database/schema.sql`) defining relations for Users, Roles, Vendors, POs, Contracts, Performance, and Audits.

---

## Frontend Implementation: Roles, Pages, & Features

The client application features responsive dynamic layouts, dynamic role-based color theming, a collapsible sidebar navigation, and a structured dashboard flow.

### 1. Authentication Pages (Common)
- **Login (`/login`)**:
  - Secure login form (Email & Password validation).
  - Redirection to role-specific dashboard based on user token role attributes.
- **Registration (`/register`)**:
  - Sign-up form (Full Name, Email, Phone, Password, and Role selection).
  - Role mapping utility aligning inputs with database-expected numeric keys (`role_id`).
- **Forgot Password (`/forgot-password`)**:
  - Reset request utility triggering simulated links to users.
- **Reset Password (`/reset-password`)**:
  - Secure entry form for password changes.

### 2. Administrator Role
- **Admin Dashboard (`/admin-dashboard`)**:
  - **Key Stat Cards**: Track total vendors, active users, purchase orders, and monthly revenue.
  - **Recent Activities & Notifications Logs**: List registrations, pending tasks, and recent alerts.
  - **Top Vendors & Growth Metrics**: Monthly vendor acquisition charts.
  - **Users Overview Registry**: Table of users, roles, registration dates, and statuses.
  - **Quick Status Cards**: Latest completed orders and approvals.
- **Vendor Registry (`/vendors`)**: Searchable list of all registered vendors with filtering by category and status.
- **Onboard Vendor (`/add-vendor`)**: Form to add vendor metadata (GST, PAN, Company Registration, Payment Terms, and Category).
- **Vendor Profile Sheet (`/vendor-details`)**: Deep-dive details of specific vendors including compliance metrics and documents.
- **Vendor Approval Workflow (`/vendor-approval`)**: Tool to review pending vendor onboarding applications, insert remarks, and issue approvals or rejections.
- **User Profile Settings (`/profile`)**: Manage personal credentials, employee credentials, and update login passwords.

### 3. Procurement Manager Role
- **Procurement Dashboard (`/procurement-dashboard`)**:
  - **Key Metrics**: Total vendors, purchase orders, active procurements, and expiring contracts.
  - **Procurement Stage Indicators**: Interactive progress tracking for vendor selection, quotation reviews, and approvals.
  - **Actions Hub**: Shortcuts to create purchase orders, add vendors, manage contracts, or run reports.
  - **Purchase Order Tracking table**: Review PO numbers, amounts, dates, and approvals.
  - **Upcoming Deliveries**: Logistics reminder alerts.
  - **Budget Tracker**: Financial progress bar monitoring monthly budgets.
- **Sub-pages**: Shared access to **Vendor Registry (`/vendors`)**, **Onboard Vendor (`/add-vendor`)**, **Vendor Profile Sheet (`/vendor-details`)**, **Vendor Approval Workflow (`/vendor-approval`)**, and **User Profile Settings (`/profile`)**.

### 4. Supply Chain Manager Role
- **Supply Chain Dashboard (`/supply-chain-dashboard`)**:
  - **Metrics**: Active vendors, deliveries today, delayed shipments, and overall reliability scores.
  - **Vendor Reliability Index**: Interactive star ratings representing vendor logistics history.
  - **Shipment Status Tracking**: Detailed table with destination, priority, and real-time status (Delivered, On Route, Delayed).
  - **Logistics Indicators**: Bar meters for upcoming trucks and status summaries.
- **Sub-pages**: Access to **User Profile Settings (`/profile`)**.

### 5. Finance Officer Role
- **Finance Dashboard (`/finance-dashboard`)**:
  - **Metrics**: Total bills, paid bills, pending invoices, and monthly expenditure.
  - **Quick Actions**: Generate invoices, record payments, and export ledger logs.
  - **Invoice Details Sheet**: Track invoice IDs, transaction modes, due dates, and statuses.
  - **Upcoming Payment Ledger**: Highlights next payment due date, company name, and amount.
  - **Payment Methods Breakdown**: Visual summary of transaction channels (UPI, NEFT, RTGS).
- **Sub-pages**: Access to **User Profile Settings (`/profile`)**.

### 6. Auditor Role
- **Auditor Dashboard (`/auditor-dashboard`)**:
  - **Metrics**: Audits completed, compliance rates, open issues, and risk profiles.
  - **Compliance Checklist**: Review verification logs for vendors, invoices, and payments.
  - **Audit Summaries**: Visual indicators showing pass/fail statistics.
  - **Recent Audit Logs Table**: Real-time activity feeds showing user operations and date markers.
  - **Risk Analysis Panel**: Count of low, medium, and high-risk flags.
- **Sub-pages**: Access to **User Profile Settings (`/profile`)**.

### 7. Vendor Role
- **Vendor Portal (`/vendor-dashboard`)**:
  - **Metrics**: Total orders, active contracts, total payments, and vendor rating.
  - **Recent Orders & Contracts**: Tracker for processing POs and renewal contracts.
  - **Procurement Communication box**: Messaging logs from managers.
  - **Performance Score Card**: Quality, communication, delivery, and aggregate ratings.
  - **Compliance Upload Utility**: Upload panel to browse, attach, and upload invoices/agreements.
- **Sub-pages**: Access to **User Profile Settings (`/profile`)** to update company profiles.

---

## Teammate's Backend Implementation (API Reference)

The teammate's backend code resides inside the `/app` folder. The primary REST APIs include:

### Authentication
- `POST /register`: Registers new users. Expects `full_name`, `email`, `password`, `phone`, and `role_id`.
- `POST /login`: Validates credentials and returns JWT bearer tokens.
- `GET /profile`: Retrieves user profile metadata based on the current user session.
- `POST /forgot-password`: Generates mock password reset links.
- `POST /reset-password`: Resets passwords with validated email identifiers.

### Vendor Management
- `POST /vendors`: Add new vendors to database.
- `GET /vendors`: Query all vendors with support for search, category filters, and pagination.
- `GET /vendors/{vendor_id}`: Retrieve vendor details by primary key.
- `PUT /vendors/{vendor_id}`: Update vendor metadata.
- `DELETE /vendors/{vendor_id}`: Delete vendors (restricted to Admin users).
- `PUT /vendors/{vendor_id}/approve`: Approve a vendor profile.
- `PUT /vendors/{vendor_id}/reject`: Reject a vendor profile.

### Vendor Documents
- `POST /vendor-documents`: Upload vendor compliance document metadata.
- `GET /vendor-documents/{vendor_id}`: Retrieve list of documents matching a vendor ID.
- `DELETE /vendor-documents/{document_id}`: Delete documents.

### Dashboard
- `GET /dashboard/vendor-summary`: Returns statistics for total, approved, pending, active, suspended, and rejected vendors.
