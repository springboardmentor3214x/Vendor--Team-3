# Milestone 4 – Advanced Vendor Management, Communication & Notifications

**Project:** Vendor Reliability Intelligence Platform

**Team:** Team 3

**Role:** Database Manager

---

## 1. Objective

The objective of Milestone 4 was to extend the database to support advanced vendor management, contract and compliance management, communication, dashboard analytics, and notification functionality.

The database was expanded to support the integration of these modules with the existing procurement system.

---

## 2. Vendor Performance and Reliability

The database supports advanced vendor performance evaluation through tables related to:

- Delivery performance
- Product quality
- Communication
- Service ratings
- Performance history
- Vendor rankings
- Vendor recommendations
- Vendor reliability

These records provide the data required to evaluate vendor performance and reliability.

---

## 3. Contract and Compliance Management

The database was extended to support contract and compliance management.

The main tables include:

- `Contracts`
- `Contract_Renewals`
- `Certifications`
- `Compliance_Records`
- `Vendor_Documents`

The `Contracts` table stores contract information including contract number, title, type, dates, value, payment terms, SLA information, warranty details, responsible manager, and status.

The `Contract_Renewals` table stores contract renewal information.

The `Certifications` table stores vendor certification details and expiry information.

The `Compliance_Records` table stores vendor compliance status and verification information.

The `Vendor_Documents` table stores vendor-related document information.

---

## 4. Communication Management

The database provides support for communication between users and vendors.

Communication records can be associated with vendors, users, procurement activities, purchase orders, and contracts.

The database structure allows communication information to be stored and retrieved for future reference, auditing, and vendor relationship management.

---

## 5. Activity and Communication Tracking

Communication-related data provides traceability for procurement discussions and vendor interactions.

The database can support tracking of communication activities such as:

- Messages
- Discussions
- File sharing
- Document access
- User activities

This helps maintain a record of important procurement-related interactions.

---

## 6. Dashboard and Analytics Support

The database provides structured data for dashboard and analytics functionality.

Vendor performance, reliability, procurement, contract, compliance, and communication information can be queried and summarized for application dashboards.

The database structure supports the generation of useful procurement and vendor-related insights.

---

## 7. Notification Management

The database supports notification functionality through notification-related records.

Notifications can be associated with users and can contain information such as:

- Notification message
- Notification status
- Creation timestamp
- Related user

This provides the database foundation for informing users about important system events.

---

## 8. Database Integrity

Primary keys and foreign keys were maintained throughout the database.

Foreign key relationships were established between related entities to maintain referential integrity.

Constraints were also used where required to validate data values.

For example, service ratings are restricted to a valid rating range.

---

## 9. ER Diagram Updates

The ER diagram was updated as new modules and tables were introduced.

The updated ER structure represents relationships between vendors, users, procurement requests, purchase orders, performance records, contracts, compliance records, and other module entities.

---

## 10. Database Manager Contribution

As the Database Manager, my contributions included:

- Extending the PostgreSQL schema for additional project modules.
- Creating and maintaining module-specific tables.
- Establishing primary key and foreign key relationships.
- Maintaining referential integrity.
- Updating the ER diagram.
- Supporting contract and compliance database design.
- Supporting communication-related database design.
- Supporting notification and analytics data requirements.
- Maintaining the `schema.sql` file.
- Verifying database tables and relationships.
- Supporting integration between the database and application modules.

---

## 11. Database Verification

The database tables were verified using PostgreSQL queries.

The database structure was checked to ensure that the required tables were created successfully and that relationships between entities were correctly established.

---

## 12. Overall Outcome

At the completion of Milestone 4, the database provided a comprehensive foundation for the Vendor Reliability Intelligence Platform.

It supports:

- Vendor management
- Procurement management
- Purchase orders
- Vendor performance
- Reliability scoring
- Contracts
- Contract renewals
- Certifications
- Compliance records
- Vendor documents
- Communication
- Notifications
- Dashboard analytics
- Reporting

The database is structured to support the application's current functionality and future modules.
