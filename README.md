# Vendor Reliability Intelligence Platform

## Project Directory Structure

- `frontend/` - Angular v18 web application client.
- `backend/` - FastAPI backend application server.
- `database/` - Database ER diagrams, PDF reports, and SQL schemas.
- `ui-ux/` - Directory containing UI mockup PDFs and PNG asset slices.

---

## Features

### 1. Frontend Features
- **Fixed Sidebar Navigation**: Anchored left navigation menu (`position: fixed`) that remains statically in place during page scrolls.
- **Adjusted Footer Alignment**: Settings and Logout links grouped directly below the main links, removing the massive vertical gap.
- **Sidebar Collapse Toggle**: Hamburger button (`☰`) in the header to show and hide the sidebar.
- **Multi-Page Layout Shell**: Unified sidebar container integrated across dashboards, vendor lists, add vendor, vendor details, and user profiles.
- **Dynamic Role Theming**: Dynamic template rendering that updates theme background color, brand labels, and links based on user credentials (Admin, Procurement Manager, Supply Chain Manager, Finance Officer, Auditor, Vendor).
- **Go Back Button**: "← Go Back" navigation button in sub-page headers to return to the active user's role-based dashboard.

### 2. Backend Features
- **User Authentication Endpoints**: Mock registration (`POST /register`) and login (`POST /login`) endpoints configured inside `backend/app/routers/auth.py`.
- **JWT Authentication**: Generates Bearer access tokens on successful login.

### 3. Database Features
- **Schema Script**: Root `schema.sql` file defining PostgreSQL tables for Users, Roles, Vendors, Procurement Requests, Purchase Orders, Vendor Performance, Contracts, Notifications, and Reports.
- **ER Diagram**: Model diagram (`ER_Diagram.png`) illustrating relationships between database tables.

### 4. UI/UX Features
- **Mockup PDFs**: High-fidelity page layouts (Login, Registration, Admin, Procurement, Supply Chain, Finance, Auditor, Profile).
- **Asset Slices**: Detailed PNG slices used for UI development.
