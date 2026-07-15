# Missing Integrations and Backend Gaps

This document outlines the items that are missing or prevent the frontend and backend from connecting out-of-the-box, based on the teammates' current GitHub contributions.

---

## 1. Backend CORS Middleware Missing
- **Issue**: The teammate's FastAPI server (`app/main.py`) does not contain `CORSMiddleware` configuration.
- **Impact**: When the Angular frontend (running on `http://localhost:4200`) makes API calls to the FastAPI backend (running on `http://localhost:8000`), the browser blocks the requests due to Same-Origin Policy (CORS).
- **Resolution Needed**: The backend developer needs to add `CORSMiddleware` in `app/main.py` allowing requests from `http://localhost:4200`.

---

## 2. Missing Database Seed Data for Roles
- **Issue**: The database schema (`database/schema.sql`) defines a `Users` table where `role_id` is a foreign key referencing the `Roles` table:
  ```sql
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES Roles(role_id)
  ```
  However, there is no seed script to populate the `Roles` table with the required roles.
- **Impact**: User registration will fail with a database foreign key constraint error because the referenced `role_id` (1 through 6) does not exist in the `Roles` table.
- **Resolution Needed**: The database/backend developers must seed the `Roles` table with:
  - `1`: Administrator
  - `2`: Procurement Manager
  - `3`: Supply Chain Manager
  - `4`: Vendor
  - `5`: Finance Officer
  - `6`: Auditor

---

## 3. Database URL Environment Variable Required
- **Issue**: The backend uses SQLAlchemy and expects a `DATABASE_URL` environment variable inside a `.env` file in the root directory.
- **Impact**: The backend won't start or connect to the database unless a local PostgreSQL instance is running and the database URL is specified.
- **Resolution Needed**: A local `.env` file must be created with:
  ```text
  DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
  ```
  Additionally, the schema file `database/schema.sql` must be executed manually in the PostgreSQL database.

---

## 4. Mocked Frontend Dashboards and Sub-pages
- **Issue**: The only HTTP API integrations currently implemented in the frontend are in `AuthService` (for Login, Registration, Profile, Forgot Password, and Reset Password).
- **Impact**: All dashboards and management pages display hardcoded mockup data directly declared in the component files:
  - **Vendor List (`/vendors`)**: Uses static mockup data array of 3 vendors.
  - **Add Vendor (`/add-vendor`)**: Form fields are not connected to the `POST /vendors` API endpoint.
  - **Vendor Details (`/vendor-details`)**: Details are hardcoded and not fetched from `GET /vendors/{vendor_id}`.
  - **Vendor Approval (`/vendor-approval`)**: Action buttons (`Approve` and `Reject`) display basic alerts instead of calling `/vendors/{vendor_id}/approve` or `/vendors/{vendor_id}/reject` endpoints.
  - **Dashboards (Admin, PM, SCM, Finance, Auditor, Vendor)**: All charts, tables, progress meters, and statistics cards display hardcoded data. They are not integrated with the `GET /dashboard/vendor-summary` API or other database metrics.
  - **Purchase Orders (`/purchase-orders`) & Vendor Management (`/vendor-management`)**: These components are created but are not registered in the Angular routes or connected to the backend.
- **Resolution Needed**: Implement Angular services and HTTP client calls to fetch and push data to the backend REST API endpoints once the backend/database is running.
