# Vendor Reliability Intelligence Platform
**Milestone 1 - Day 1 Frontend Progress Review**

This README outlines the progress made specifically on the **Frontend (Angular)** portion of the application for the Day 1 review, as well as the current blockers we are facing from other departments.

## 🛠️ Tech Stack
- **Framework**: Angular v18 (Standalone Components)
- **UI/Component Library**: Angular Material & Angular CDK
- **Styling**: SCSS (Using default Material Prebuilt Themes)
- **State/Routing**: Angular Router, Reactive Forms

## 🏃‍♂️ Getting Started
To run the frontend application locally:
1. Navigate into the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run start` (or `ng serve`)
4. Open your browser and navigate to `http://localhost:4200`

## 🚀 What We Have Built (Frontend)

Despite the dependencies and blockers listed below, the frontend architecture has been successfully initialized and prepared:
- **Architecture**: Angular 18 project initialized with modern standalone components and strict routing.
- **Core Layout**: Implemented the main application shell, including a responsive Sidenav (sidebar) and Toolbar (header).
- **Authentication Pages**: Built the UI layouts and reactive forms for both the `Login` and `Register` pages.
- **Vendor Management**: Scaffolded the `Vendor Management` screen featuring a fully responsive Angular Material data table with status badges.
- **Services Setup**: Built the foundational `auth.service.ts` to prepare for API integration.

---

## 🚧 Current Blockers & Unfinished Features

Due to missing deliverables and discrepancies from the rest of the team, the following compromises had to be made on the frontend:

### 1. UI/UX Blockers (Shamili)
Shamili was responsible for UI/UX but has not provided the Figma wireframes, color themes, fonts, or user flow diagrams yet.
- **Impact**: Because we have no design guidelines, we could not build the custom dashboard charts, specific layouts, or apply proper branding. 
- **Workaround**: We are currently forced to use the default Angular Material "Indigo/Pink" pre-built theme as a generic placeholder so we have *something* to show for the review.

### 2. Backend Discrepancy (Bharath)
Bharath was responsible for the Backend API. While he provided the registration endpoint, the `UserRegister` schema he created in `app/schemas/user.py` is incomplete. It only accepts `full_name`, `email`, and `password`, completely missing the user's role.
- **Impact**: Because the backend API would crash if we sent it a role, we were forced to temporarily remove the "Role Selection" dropdown from the frontend Registration UI to match his incomplete schema.

### 3. Database Conflict (Thanisha)
Thanisha was responsible for the Database. Her schema (`schema.sql`) correctly requires a `role_id` for a User to manage permissions. 
- **Impact**: This creates a direct conflict with Bharath's backend implementation (which ignores roles). Until Thanisha and Bharath align their requirements, the frontend cannot implement role-based access control or complete the user registration flow properly.
