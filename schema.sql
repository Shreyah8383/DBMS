-- ========================================================
-- "Life Line - A Health Assistance Web App" Database Schema
-- Database Management System: MySQL
-- ========================================================

-- Create database if not exists (Admin setup)
CREATE DATABASE IF NOT EXISTS lifeline_db;
USE lifeline_db;

-- --------------------------------------------------------
-- 1. Table: admins
-- --------------------------------------------------------
DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 2. Table: doctors
-- --------------------------------------------------------
DROP TABLE IF EXISTS doctors;
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    specialization VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL,
    availability_hours VARCHAR(100) NOT NULL DEFAULT '09:00 AM - 05:00 PM',
    status_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. Table: patients
-- --------------------------------------------------------
DROP TABLE IF EXISTS patients;
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    medical_history TEXT DEFAULT NULL,
    allergies TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. Table: appointments
-- --------------------------------------------------------
DROP TABLE IF EXISTS appointments;
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    prescription TEXT DEFAULT NULL,
    diagnosis TEXT DEFAULT NULL,
    status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. Table: emergency_requests
-- --------------------------------------------------------
DROP TABLE IF EXISTS emergency_requests;
CREATE TABLE emergency_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    caller_name VARCHAR(100) NOT NULL,
    caller_phone VARCHAR(20) NOT NULL,
    location_address TEXT NOT NULL,
    emergency_type VARCHAR(100) NOT NULL,
    status ENUM('Pending', 'Assigned', 'Dispatched', 'Resolved') NOT NULL DEFAULT 'Pending',
    ambulance_id VARCHAR(50) DEFAULT NULL,
    assigned_hospital VARCHAR(150) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ========================================================
-- SAMPLE DATA INSERTION QUERIES
-- ========================================================

-- 1. Insert Sample Admins (Passwords can be verified using bcrypt)
INSERT INTO admins (username, password_hash, full_name, email) VALUES
('ref_admin', 'admin123', 'System Administrator', 'admin@lifeline.org'),
('shreya_admin', 'shreya123', 'Dr. Shreya Hari', 'shreyah8383@gmail.com');

-- 2. Insert Sample Doctors
INSERT INTO doctors (username, password_hash, full_name, email, specialization, experience_years, phone, consultation_fee, availability_hours) VALUES
('dr_smith', 'doctor123', 'Dr. Robert Smith', 'robert.smith@lifeline.org', 'Cardiology', 15, '+1 555-0199', 150.00, '09:00 AM - 03:00 PM'),
('dr_patel', 'doctor123', 'Dr. Aisha Patel', 'aisha.patel@lifeline.org', 'Pediatrics', 10, '+1 555-0188', 120.00, '10:00 AM - 04:00 PM'),
('dr_garcia', 'doctor123', 'Dr. Carlos Garcia', 'carlos.garcia@lifeline.org', 'Neurology', 18, '+1 555-0177', 180.00, '01:00 PM - 06:00 PM'),
('dr_lee', 'doctor123', 'Dr. Sarah Lee', 'sarah.lee@lifeline.org', 'Dermatology', 8, '+1 555-0166', 100.00, '09:00 AM - 01:00 PM'),
('dr_taylor', 'doctor123', 'Dr. James Taylor', 'james.taylor@lifeline.org', 'General Medicine', 12, '+1 555-0155', 80.00, '08:00 AM - 04:00 PM');

-- 3. Insert Sample Patients
INSERT INTO patients (username, password_hash, full_name, email, phone, dob, gender, blood_group, medical_history, allergies) VALUES
('john_doe', 'patient123', 'John Doe', 'john.doe@gmail.com', '+1 555-0111', '1985-05-15', 'Male', 'O+', 'Mild hypertension diagnosed in 2021', 'Penicillin'),
('jane_watson', 'patient123', 'Jane Watson', 'jane.watson@yahoo.com', '+1 555-0122', '1992-09-21', 'Female', 'A-', 'None', 'Peanuts, Pollen'),
('mike_ross', 'patient123', 'Michael Ross', 'mross@pearson.com', '+1 555-0133', '1988-11-03', 'Male', 'B+', 'Slight chronic back pain', 'Dust Mites');

-- 4. Insert Sample Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, prescription, diagnosis, status) VALUES
(1, 1, '2026-05-25', '10:00 AM', 'Routine cardiology checkup and blood pressure monitoring.', 'Lisinopril 10mg daily', 'Stage 1 Hypertension', 'Confirmed'),
(2, 4, '2026-05-26', '11:30 AM', 'Skin rash on forearms.', NULL, NULL, 'Pending'),
(3, 5, '2026-05-24', '09:00 AM', 'Severe seasonal allergies and sore throat.', 'Cetirizine 10mg, Saltwater gargles', 'Allergic Pharyngitis', 'Completed');

-- 5. Insert Sample Emergency Requests
INSERT INTO emergency_requests (caller_name, caller_phone, location_address, emergency_type, status, ambulance_id, assigned_hospital) VALUES
('Eleanor Vance', '+1 555-9001', '742 Evergreen Terrace, Springfield', 'Shortness of Breath', 'Dispatched', 'AMB-04', 'St. Mary Community Hospital'),
('Arthur Dent', '+1 555-9002', '108 Finchley Road, Westside', 'Accidental Fall / Head Injury', 'Assigned', 'AMB-09', 'City General Hospital'),
('Sarah Connor', '+1 555-9003', '1401 Sector 9 Industrial Ave', 'Deep laceration on right thigh', 'Pending', NULL, NULL);
