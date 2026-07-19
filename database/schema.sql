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
    vendor_id INT,
    delivery_rating DECIMAL(3,2),
    quality_rating DECIMAL(3,2),
    communication_rating DECIMAL(3,2),
    overall_score DECIMAL(3,2),

    CONSTRAINT fk_performance_vendor
    FOREIGN KEY (vendor_id)
    REFERENCES Vendors(vendor_id)
);

CREATE TABLE Contracts (
    contract_id SERIAL PRIMARY KEY,
    vendor_id INT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20),

    CONSTRAINT fk_contract_vendor
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

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';


-- ===========================================
-- Module 4: Vendor Performance Management
-- Vendor Reliability Intelligence Platform
-- ===========================================

-- 1. Delivery_Performance
CREATE TABLE Delivery_Performance (
   ...
);

-- 2. Product_Quality_Evaluations
CREATE TABLE Product_Quality_Evaluations (
   ...
);

-- 3. Communication_Logs
CREATE TABLE Communication_Logs (
   ...
);

-- 4. Service_Ratings
CREATE TABLE Service_Ratings (
   ...
);

-- 5. Performance_History
CREATE TABLE Performance_History (
   ...
);

-- 6. Vendor_Rankings
CREATE TABLE Vendor_Rankings (
   ...
);

-- Update existing tables
ALTER TABLE Purchase_Orders
...

ALTER TABLE Vendor_Performance
...
