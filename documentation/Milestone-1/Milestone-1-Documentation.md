# Milestone 1 – Requirements, UI Design, Database Design & Backend Setup

**Project:** Vendor Reliability Intelligence Platform

**Team:** Team 3

**Role:** Database Manager

---

## 1. Objective

The objective of Milestone 1 was to establish the basic foundation of the Vendor Reliability Intelligence Platform. This included understanding the system requirements, designing the user interface, creating the database structure, and setting up the backend and frontend environments.

## 2. Requirements Analysis

The project requirements were analyzed to identify the major users, system modules, functional requirements, and technical requirements.

The system is designed to support procurement activities including vendor management, procurement requests, purchase orders, vendor performance, contracts, communication, notifications, analytics, and reporting.

## 3. Database Design

The database was designed using PostgreSQL.

The database design includes entities required for users, roles, vendors, procurement requests, purchase orders, vendor performance, contracts, notifications, reports, and other project modules.

Primary keys and foreign keys were used to establish relationships between entities and maintain referential integrity.

## 4. Database Manager Contribution

As the Database Manager, my responsibilities included:

- Designing the PostgreSQL database schema.
- Creating tables for the required modules.
- Defining primary keys and foreign keys.
- Establishing relationships between database entities.
- Maintaining the `schema.sql` file.
- Updating the ER diagram as new modules were introduced.
- Verifying that tables and relationships were created correctly.
- Supporting the backend by providing the required database structure.

## 5. Backend Setup

The backend foundation was planned using FastAPI with PostgreSQL as the database.

The backend is responsible for communicating with the database and providing APIs that can be consumed by the Angular frontend.

## 6. Frontend Setup

The frontend foundation was developed using Angular.

The frontend provides the user interface through which users interact with the system.

## 7. Authentication

The system includes user authentication and role management. Different users can have different roles and permissions within the application.

JWT-based authentication is used as part of the application's security mechanism.

## 8. UI/UX Design

The initial UI/UX design and wireframes were prepared to provide a clear structure for the application's screens and user interactions.

The design provides the foundation for implementing the frontend interfaces in later milestones.

## 9. Outcome

At the completion of Milestone 1, the project had its basic technical foundation established, including the requirements, database design, frontend setup, backend setup, authentication structure, and UI/UX foundation.

