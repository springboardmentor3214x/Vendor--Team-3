-- ===========================================
-- Vendor Reliability Intelligence Platform
-- Sample Data
-- ===========================================

-------------------------------------------------
-- Roles
-------------------------------------------------

INSERT INTO Roles (role_name)
VALUES
('Administrator'),
('Procurement Manager'),
('Department User'),
('Vendor');

-------------------------------------------------
-- Users
-------------------------------------------------

INSERT INTO Users (full_name, email, password, phone, role_id)
VALUES
('John Smith','john@example.com','john123','9876543210',1),
('Alice Johnson','alice@example.com','alice123','9876543211',2),
('Rahul Kumar','rahul@example.com','rahul123','9876543212',3),
('Vendor Admin','vendor@example.com','vendor123','9876543213',4);

-------------------------------------------------
-- Vendors
-------------------------------------------------

INSERT INTO Vendors
(vendor_name, category, contact_person, email, phone, address, status)
VALUES
('ABC Suppliers','Electronics','David Miller','abc@gmail.com','9876500001','Bangalore','Active'),

('XYZ Traders','Hardware','Michael Brown','xyz@gmail.com','9876500002','Mysore','Active'),

('Tech Solutions','Software','Sarah Wilson','tech@gmail.com','9876500003','Chennai','Active');

-------------------------------------------------
-- Procurement Requests
-------------------------------------------------

INSERT INTO Procurement_Requests
(title, description, vendor_id, status, created_date)
VALUES
('Laptop Procurement','Purchase laptops for employees',1,'Approved','2026-07-01'),

('Office Furniture','Purchase office chairs',2,'Pending','2026-07-03'),

('Software License','Purchase IDE licenses',3,'Approved','2026-07-05');

-------------------------------------------------
-- Purchase Orders
-------------------------------------------------

INSERT INTO Purchase_Orders
(vendor_id, amount, order_date, delivery_date, status)
VALUES
(1,250000,'2026-07-02','2026-07-08','Completed'),

(2,90000,'2026-07-04','2026-07-10','Pending'),

(3,120000,'2026-07-06','2026-07-12','Completed');

-------------------------------------------------
-- Vendor Performance
-------------------------------------------------

INSERT INTO Vendor_Performance
(vendor_id, delivery_rating, quality_rating, communication_rating, overall_score)
VALUES
(1,4.8,4.7,4.9,4.8),

(2,4.2,4.1,4.3,4.2),

(3,4.9,5.0,4.8,4.9);

-------------------------------------------------
-- Contracts
-------------------------------------------------

INSERT INTO Contracts
(vendor_id,start_date,end_date,status)
VALUES
(1,'2026-01-01','2026-12-31','Active'),

(2,'2026-02-01','2026-12-31','Active'),

(3,'2026-03-01','2026-12-31','Active');

-------------------------------------------------
-- Notifications
-------------------------------------------------

INSERT INTO Notifications
(user_id,message,status)
VALUES
(1,'Vendor approved successfully','Unread'),

(2,'Purchase order generated','Read'),

(3,'Performance updated','Unread');

-------------------------------------------------
-- Reports
-------------------------------------------------

INSERT INTO Reports
(report_name,generated_by,report_type)
VALUES
('Vendor Performance Report',1,'Performance'),

('Monthly Procurement Report',2,'Procurement'),

('Purchase Order Report',1,'Orders');

-------------------------------------------------
-- Delivery Performance
-------------------------------------------------

INSERT INTO Delivery_Performance
(vendor_id,purchase_order_id,expected_delivery_date,
actual_delivery_date,delay_days,delivery_status,remarks)
VALUES
(1,1,'2026-07-08','2026-07-08',0,'On-Time','Delivered on schedule'),

(2,2,'2026-07-10','2026-07-12',2,'Delayed','Transport delay'),

(3,3,'2026-07-12','2026-07-11',0,'Early','Delivered one day early');

-------------------------------------------------
-- Product Quality Evaluations
-------------------------------------------------

INSERT INTO Product_Quality_Evaluations
(vendor_id,purchase_order_id,quality_score,defect_count,
inspection_status,remarks)
VALUES
(1,1,4.9,0,'Passed','Excellent quality'),

(2,2,4.2,2,'Passed','Minor defects'),

(3,3,5.0,0,'Passed','Outstanding quality');

-------------------------------------------------
-- Communication Logs
-------------------------------------------------

INSERT INTO Communication_Logs
(vendor_id,user_id,communication_type,subject,message)
VALUES
(1,1,'Email','Order Confirmation',
'Purchase order confirmed'),

(2,2,'Phone','Delivery Delay',
'Vendor informed about shipment delay'),

(3,1,'Email','Invoice',
'Invoice received successfully');

-------------------------------------------------
-- Service Ratings
-------------------------------------------------

INSERT INTO Service_Ratings
(vendor_id,user_id,rating,feedback)
VALUES
(1,1,4.8,'Excellent service'),

(2,2,4.1,'Good communication'),

(3,1,5.0,'Outstanding support');

-------------------------------------------------
-- Performance History
-------------------------------------------------

INSERT INTO Performance_History
(vendor_id,performance_score,evaluation_period,remarks)
VALUES
(1,4.8,'July 2026','Consistent performance'),

(2,4.2,'July 2026','Average performance'),

(3,4.9,'July 2026','Top performing vendor');

-------------------------------------------------
-- Vendor Rankings
-------------------------------------------------

INSERT INTO Vendor_Rankings
(vendor_id,overall_score,rank_position,ranking_date,remarks)
VALUES
(3,4.9,1,'2026-07-20','Top Vendor'),

(1,4.8,2,'2026-07-20','Excellent'),

(2,4.2,3,'2026-07-20','Needs Improvement');
