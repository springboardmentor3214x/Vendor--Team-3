CREATE TABLE Roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_role
    FOREIGN KEY (role_id)
    REFERENCES Roles(role_id)
);

CREATE TABLE Vendors (
    vendor_id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(15),
    address TEXT,
    status VARCHAR(20)
);

CREATE TABLE Procurement_Requests (
    procurement_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    vendor_id INT,
    status VARCHAR(20),
    created_date DATE,

    CONSTRAINT fk_procurement_vendor
    FOREIGN KEY (vendor_id)
    REFERENCES Vendors(vendor_id)
);

CREATE TABLE Purchase_Orders (
    order_id SERIAL PRIMARY KEY,
    vendor_id INT,
    amount DECIMAL(10,2),
    order_date DATE,
    delivery_date DATE,
    status VARCHAR(20),

    CONSTRAINT fk_order_vendor
    FOREIGN KEY (vendor_id)
    REFERENCES Vendors(vendor_id)
);


CREATE TABLE Vendor_Performance (
    performance_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    delivery_rating DECIMAL(3,2),
    quality_rating DECIMAL(3,2),
    communication_rating DECIMAL(3,2),
    overall_score DECIMAL(3,2),

    CONSTRAINT fk_performance_vendor
    FOREIGN KEY (vendor_id)
    REFERENCES Vendors(vendor_id)
);


CREATE TABLE Notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT,
    message TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
    FOREIGN KEY (user_id)
    REFERENCES Users(user_id)
);

CREATE TABLE Reports (
    report_id SERIAL PRIMARY KEY,
    report_name VARCHAR(100),
    generated_by INT,
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    report_type VARCHAR(50),

    CONSTRAINT fk_report_user
    FOREIGN KEY (generated_by)
    REFERENCES Users(user_id)
);



-- =====================================================
-- Module 4: Vendor Performance Management
-- Vendor Reliability Intelligence Platform
-- =====================================================

-- 1. Delivery Performance
CREATE TABLE Delivery_Performance (
    delivery_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    purchase_order_id INT,
    expected_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    delay_days INT DEFAULT 0,
    delivery_status VARCHAR(30),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_delivery_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id),

    CONSTRAINT fk_delivery_order
    FOREIGN KEY (purchase_order_id)
    REFERENCES Purchase_Orders(order_id)
);

---------------------------------------------------------

-- 2. Product Quality Evaluations
CREATE TABLE Product_Quality_Evaluations (
    quality_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    purchase_order_id INT,
    quality_score DECIMAL(5,2),
    defect_count INT DEFAULT 0,
    inspection_status VARCHAR(30),
    remarks TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_quality_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id),

    CONSTRAINT fk_quality_order
    FOREIGN KEY (purchase_order_id)
    REFERENCES Purchase_Orders(order_id)
);

---------------------------------------------------------

-- 3. Communication Logs
CREATE TABLE Communication_Logs (
    communication_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    user_id INT,
    communication_type VARCHAR(30),
    subject VARCHAR(100),
    message TEXT,
    communication_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comm_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id),

    CONSTRAINT fk_comm_user
        FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
);

---------------------------------------------------------

-- 4. Service Ratings
CREATE TABLE Service_Ratings (
    rating_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    user_id INT,
    rating DECIMAL(3,2) CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    rating_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rating_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id),

    CONSTRAINT fk_rating_user
        FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
);

---------------------------------------------------------

-- 5. Performance History
CREATE TABLE Performance_History (
    history_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    performance_score DECIMAL(5,2),
    evaluation_period VARCHAR(50),
    remarks TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id)
);

---------------------------------------------------------

-- 6. Vendor Rankings
CREATE TABLE Vendor_Rankings (
    ranking_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    overall_score DECIMAL(5,2),
    rank_position INT,
    ranking_date DATE,
    remarks TEXT,

    CONSTRAINT fk_ranking_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id)
);

---------------------------------------------------------

CREATE TABLE Recommended_Vendors (
    recommendation_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    recommendation_reason TEXT,
    recommendation_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recommended_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id)
);

CREATE TABLE Vendor_Reliability (
    reliability_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    reliability_score DECIMAL(5,2),
    risk_level VARCHAR(20),
    last_evaluated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reliability_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id)
);

/* ==========================================================
   MODULE 6 - CONTRACT & COMPLIANCE MANAGEMENT
   ========================================================== */

/* Contracts Table */
CREATE TABLE Contracts (
    contract_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    procurement_id INT,
    contract_number VARCHAR(50) NOT NULL UNIQUE,
    contract_title VARCHAR(150) NOT NULL,
    contract_type VARCHAR(50),
    procurement_category VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    contract_value DECIMAL(12,2),
    payment_terms TEXT,
    service_level_agreement TEXT,
    warranty_details TEXT,
    responsible_manager VARCHAR(100),
    contract_status VARCHAR(30) DEFAULT 'Draft',
    document_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_contract_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id)
        ON DELETE CASCADE,

  CONSTRAINT fk_contract_procurement
FOREIGN KEY (procurement_id)
REFERENCES Procurement_Requests(procurement_id)
ON DELETE SET NULL
);

/* Contract Renewals Table */
CREATE TABLE Contract_Renewals (
    renewal_id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL,
    renewal_date DATE NOT NULL,
    new_expiry_date DATE NOT NULL,
    renewal_status VARCHAR(30),
    remarks TEXT,
    renewed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_renewal_contract
        FOREIGN KEY (contract_id)
        REFERENCES Contracts(contract_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_renewed_by
        FOREIGN KEY (renewed_by)
        REFERENCES Users(user_id)
        ON DELETE SET NULL
);

/* Certifications Table */
CREATE TABLE Certifications (
    certification_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    certification_name VARCHAR(100) NOT NULL,
    certificate_number VARCHAR(100) UNIQUE,
    issuing_authority VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    certificate_path TEXT,
    certification_status VARCHAR(30) DEFAULT 'Active',

    CONSTRAINT fk_cert_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id)
        ON DELETE CASCADE
);

/* Compliance Records Table */
CREATE TABLE Compliance_Records (
    compliance_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    compliance_type VARCHAR(100) NOT NULL,
    compliance_status VARCHAR(30)
        CHECK (compliance_status IN
        ('Compliant',
         'Pending Verification',
         'Non-Compliant',
         'Expired')),
    verification_date DATE,
    verified_by INT,
    remarks TEXT,

    CONSTRAINT fk_compliance_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_verified_by
        FOREIGN KEY (verified_by)
        REFERENCES Users(user_id)
        ON DELETE SET NULL
);

/* Vendor Documents Table */
CREATE TABLE Vendor_Documents (
    document_id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(150),
    file_path TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INT,
    document_status VARCHAR(30) DEFAULT 'Active',

    CONSTRAINT fk_document_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_uploaded_by
        FOREIGN KEY (uploaded_by)
        REFERENCES Users(user_id)
        ON DELETE SET NULL
);

/* ==========================================================
   MODULE 7 - COMMUNICATION MANAGEMENT
   ========================================================== */

CREATE TABLE Messages (
    message_id SERIAL PRIMARY KEY,

    sender_id INT NOT NULL,

    receiver_id INT NOT NULL,

    vendor_id INT,

    procurement_id INT,

    purchase_order_id INT,

    contract_id INT,

    message_content TEXT NOT NULL,

    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    read_status VARCHAR(20) DEFAULT 'Unread',

    CONSTRAINT fk_message_sender
        FOREIGN KEY (sender_id)
        REFERENCES Users(user_id),

    CONSTRAINT fk_message_receiver
        FOREIGN KEY (receiver_id)
        REFERENCES Users(user_id),

    CONSTRAINT fk_message_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id),

    CONSTRAINT fk_message_procurement
        FOREIGN KEY (procurement_id)
        REFERENCES Procurement_Requests(procurement_id),

    CONSTRAINT fk_message_order
        FOREIGN KEY (purchase_order_id)
        REFERENCES Purchase_Orders(order_id),

    CONSTRAINT fk_message_contract
        FOREIGN KEY (contract_id)
        REFERENCES Contracts(contract_id)
);

/* ==========================================================
   DISCUSSIONS TABLE
   ========================================================== */

CREATE TABLE Discussions (
    discussion_id SERIAL PRIMARY KEY,

    title VARCHAR(150) NOT NULL,

    vendor_id INT,

    procurement_id INT,

    purchase_order_id INT,

    contract_id INT,

    created_by INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    discussion_status VARCHAR(30) DEFAULT 'Open',

    CONSTRAINT fk_discussion_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id),

    CONSTRAINT fk_discussion_procurement
        FOREIGN KEY (procurement_id)
        REFERENCES Procurement_Requests(procurement_id),

    CONSTRAINT fk_discussion_order
        FOREIGN KEY (purchase_order_id)
        REFERENCES Purchase_Orders(order_id),

    CONSTRAINT fk_discussion_contract
        FOREIGN KEY (contract_id)
        REFERENCES Contracts(contract_id),

    CONSTRAINT fk_discussion_user
        FOREIGN KEY (created_by)
        REFERENCES Users(user_id)
);

/* ==========================================================
   DISCUSSION PARTICIPANTS TABLE
   ========================================================== */

CREATE TABLE Discussion_Participants (
    participant_id SERIAL PRIMARY KEY,

    discussion_id INT NOT NULL,

    user_id INT NOT NULL,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    participant_role VARCHAR(50),

    CONSTRAINT fk_participant_discussion
        FOREIGN KEY (discussion_id)
        REFERENCES Discussions(discussion_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_participant_user
        FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE
);

/* ==========================================================
   SHARED FILES TABLE
   ========================================================== */

CREATE TABLE Shared_Files (
    file_id SERIAL PRIMARY KEY,

    discussion_id INT,

    vendor_id INT,

    procurement_id INT,

    purchase_order_id INT,

    contract_id INT,

    uploaded_by INT NOT NULL,

    file_name VARCHAR(255) NOT NULL,

    file_type VARCHAR(50),

    file_path TEXT NOT NULL,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_file_discussion
        FOREIGN KEY (discussion_id)
        REFERENCES Discussions(discussion_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_file_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES Vendors(vendor_id),

    CONSTRAINT fk_file_procurement
        FOREIGN KEY (procurement_id)
        REFERENCES Procurement_Requests(procurement_id),

    CONSTRAINT fk_file_order
        FOREIGN KEY (purchase_order_id)
        REFERENCES Purchase_Orders(order_id),

    CONSTRAINT fk_file_contract
        FOREIGN KEY (contract_id)
        REFERENCES Contracts(contract_id),

    CONSTRAINT fk_file_user
        FOREIGN KEY (uploaded_by)
        REFERENCES Users(user_id)
);

/* ==========================================================
   ACTIVITY LOGS TABLE
   ========================================================== */

CREATE TABLE Activity_Logs (
    activity_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    module_name VARCHAR(100) NOT NULL,

    action_performed VARCHAR(100) NOT NULL,

    related_record_id INT,

    ip_address VARCHAR(50),

    activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE
);

CREATE VIEW Procurement_Dashboard AS
SELECT
    COUNT(*) AS total_requests,
    COUNT(CASE WHEN status='Pending' THEN 1 END) AS pending_requests,
    COUNT(CASE WHEN status='Approved' THEN 1 END) AS approved_requests,
    COUNT(CASE WHEN status='Rejected' THEN 1 END) AS rejected_requests
FROM Procurement_Requests;

CREATE VIEW Purchase_Order_Dashboard AS
SELECT
    COUNT(*) AS total_orders,
    COUNT(CASE WHEN status='Pending' THEN 1 END) AS pending_orders,
    COUNT(CASE WHEN status='Completed' THEN 1 END) AS completed_orders,
    COUNT(CASE WHEN status='Cancelled' THEN 1 END) AS cancelled_orders
FROM Purchase_Orders;

CREATE VIEW Vendor_Dashboard AS
SELECT
    COUNT(*) AS total_vendors,
    AVG(overall_score) AS average_vendor_score
FROM Vendor_Performance;

CREATE VIEW Contract_Dashboard AS
SELECT
    COUNT(*) AS total_contracts,
    COUNT(CASE WHEN contract_status='Active' THEN 1 END) AS active_contracts,
    COUNT(CASE WHEN contract_status='Expired' THEN 1 END) AS expired_contracts
FROM Contracts;

CREATE VIEW Delivery_Dashboard AS
SELECT
    COUNT(*) AS total_deliveries,
    COUNT(CASE WHEN delivery_status='Delivered' THEN 1 END) AS delivered,
    COUNT(CASE WHEN delivery_status='Delayed' THEN 1 END) AS delayed
FROM Delivery_Performance;


CREATE VIEW Communication_Dashboard AS
SELECT
    COUNT(*) AS total_messages,
    COUNT(CASE WHEN read_status='Unread' THEN 1 END) AS unread_messages
FROM Messages;

-- Verify all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

SELECT table_name
FROM information_schema.views
WHERE table_schema='public';
