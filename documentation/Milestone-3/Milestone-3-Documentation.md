# Milestone 3 – Vendor Performance & Analytics

**Project:** Vendor Reliability Intelligence Platform

**Team:** Team 3

**Role:** Database Manager

---

## 1. Objective

The objective of Milestone 3 was to implement vendor performance evaluation, reliability scoring, analytics, reporting, and related database functionality.

## 2. Vendor Performance Management

The database was extended to store and manage vendor performance information.

The following tables were created to support performance evaluation:

- `Delivery_Performance`
- `Product_Quality_Evaluations`
- `Communication_Logs`
- `Service_Ratings`
- `Performance_History`
- `Vendor_Rankings`
- `Recommended_Vendors`
- `Vendor_Reliability`

These tables allow vendor performance information to be stored and analyzed using different performance factors.

## 3. Delivery Performance

The `Delivery_Performance` table stores information about expected and actual delivery dates, delay days, delivery status, and remarks.

It is linked to the appropriate vendor and purchase order.

## 4. Product Quality Evaluation

The `Product_Quality_Evaluations` table stores vendor quality scores, defect counts, inspection status, and evaluation remarks.

This information can be used to evaluate the quality performance of vendors.

## 5. Communication and Service Ratings

The database stores vendor communication records and service ratings.

The `Communication_Logs` table maintains communication information between users and vendors.

The `Service_Ratings` table stores ratings and feedback provided for vendors.

## 6. Performance History

The `Performance_History` table stores historical vendor performance scores and evaluation periods.

This allows previous performance information to be retained for future analysis.

## 7. Vendor Rankings

The `Vendor_Rankings` table stores overall vendor scores, ranking positions, ranking dates, and remarks.

This provides database support for comparing vendors based on their performance.

## 8. Vendor Reliability

The `Vendor_Reliability` table stores the calculated reliability score and risk level of vendors.

This provides the database foundation for identifying reliable and high-risk vendors.

## 9. Recommended Vendors

The `Recommended_Vendors` table stores vendor recommendations, recommendation reasons, and recommendation scores.

This information can be used by the application to support vendor selection decisions.

## 10. Analytics and Reporting Support

The database provides structured performance data that can be used by the application to generate analytics and reports.

The stored vendor performance, reliability, ranking, procurement, and communication data can be queried for dashboard and reporting purposes.

## 11. Database Manager Contribution

As the Database Manager, my contributions during this milestone included:

- Designing vendor performance tables.
- Creating delivery performance and quality evaluation structures.
- Creating communication and service rating tables.
- Maintaining vendor performance history.
- Creating vendor ranking and reliability tables.
- Creating vendor recommendation structures.
- Establishing foreign key relationships with vendors, users, and purchase orders.
- Maintaining database integrity.
- Supporting analytics and reporting through structured database data.
- Updating the ER diagram and database schema.

## 12. Outcome

At the completion of Milestone 3, the database supported vendor performance evaluation, reliability scoring, vendor ranking, recommendations, analytics, and reporting.

The database structure provides the required data foundation for evaluating vendor reliability and supporting procurement decision-making.
