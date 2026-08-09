# Milestone 2 – Vendor & Procurement Management

**Project:** Vendor Reliability Intelligence Platform

**Team:** Team 3

**Role:** Database Manager

---

## 1. Objective

The objective of Milestone 2 was to implement the core vendor and procurement management functionality of the Vendor Reliability Intelligence Platform.

This milestone covers vendor management, procurement requests, purchase orders, vendor approval, contract management, and communication-related database support.

## 2. Vendor Management

The system maintains vendor information including vendor name, category, contact person, email, phone number, address, and status.

Vendor records are stored in the `Vendors` table and are referenced by other procurement-related entities.

## 3. Procurement Management

Procurement requests are stored in the `Procurement_Requests` table.

The table maintains information such as the request title, description, vendor, status, and creation date.

The relationship between procurement requests and vendors is maintained using a foreign key.

## 4. Purchase Order Management

Purchase orders are stored in the `Purchase_Orders` table.

The table maintains vendor information, order amount, order date, delivery date, and order status.

Purchase orders are linked to vendors using a foreign key relationship.

## 5. Vendor Approval and Management

Vendor information and status are maintained in the database so that the system can manage vendor records throughout the procurement process.

The database structure supports vendor-related operations required by the application.

## 6. Contract Management

Contract information is maintained using the `Contracts` table.

The contract structure stores information such as vendor, contract number, contract title, contract type, start date, end date, contract value, payment terms, service-level agreement, responsible manager, and contract status.

Contract renewals are maintained using the `Contract_Renewals` table.

## 7. Communication Support

The database provides the foundation for communication between users and vendors.

Communication-related records can be associated with vendors, users, procurement activities, purchase orders, and contracts.

## 8. Database Manager Contribution

As the Database Manager, my contributions during this milestone included:

- Creating and maintaining vendor-related database tables.
- Creating procurement request and purchase order tables.
- Establishing primary key and foreign key relationships.
- Designing contract-related database structures.
- Maintaining referential integrity between procurement entities.
- Updating the database schema as the project modules were developed.
- Updating the ER diagram to reflect the database relationships.
- Verifying the database tables and relationships in PostgreSQL.

## 9. Database Relationships

Important relationships implemented during this milestone include:

- Vendors → Procurement Requests
- Vendors → Purchase Orders
- Vendors → Contracts
- Users → Communication records
- Procurement Requests → Contracts
- Purchase Orders → Vendor-related activities

These relationships allow procurement information to remain connected throughout the system.

## 10. Outcome

At the completion of Milestone 2, the database provided the required foundation for managing vendors, procurement requests, purchase orders, vendor approval, contracts, and communication-related information.

The database structure supports the backend APIs and allows the frontend application to access and manage procurement information.
