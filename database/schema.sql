-- =========================================================
-- MEDISECURE CLOUD DATABASE SCHEMA
-- Database : MySQL / MariaDB
-- Tools    : Laragon
-- Project  : MediSecure Cloud
-- Purpose  : Cloud Computing + Keamanan Jaringan
-- =========================================================

CREATE DATABASE IF NOT EXISTS medisecure_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE medisecure_db;

-- =========================================================
-- DROP TABLES
-- =========================================================

DROP TABLE IF EXISTS security_alerts;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS ai_analysis_results;
DROP TABLE IF EXISTS medical_documents;
DROP TABLE IF EXISTS health_records;
DROP TABLE IF EXISTS patient_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- =========================================================
-- 1. TABLE: roles
-- Fungsi:
-- Menyimpan daftar role pengguna.
-- Digunakan untuk Role-Based Access Control.
-- =========================================================

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- 2. TABLE: users
-- Fungsi:
-- Menyimpan akun pengguna.
-- Password disimpan dalam bentuk hash, bukan plaintext.
-- =========================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_roles
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 3. TABLE: patient_profiles
-- Fungsi:
-- Menyimpan profil tambahan untuk pasien.
-- =========================================================

CREATE TABLE patient_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other') NULL,
    address TEXT,
    blood_type VARCHAR(5),
    emergency_contact VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_patient_profiles_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 4. TABLE: health_records
-- Fungsi:
-- Menyimpan data kesehatan pasien.
-- Data ini digunakan sebagai input fitur AI.
-- =========================================================

CREATE TABLE health_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    blood_pressure VARCHAR(20),
    blood_sugar DECIMAL(6,2),
    weight DECIMAL(6,2),
    height DECIMAL(6,2),
    body_temperature DECIMAL(4,2),
    symptoms TEXT,
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_health_records_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 5. TABLE: medical_documents
-- Fungsi:
-- Menyimpan metadata dokumen medis.
-- File asli disimpan di object storage, yaitu Google Cloud Storage.
-- =========================================================

CREATE TABLE medical_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    storage_provider VARCHAR(100) DEFAULT 'Google Cloud Storage',
    storage_path TEXT NOT NULL,
    upload_status ENUM('uploaded', 'failed', 'deleted') DEFAULT 'uploaded',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_medical_documents_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 6. TABLE: ai_analysis_results
-- Fungsi:
-- Menyimpan hasil analisis AI dari Gemini API.
-- =========================================================

CREATE TABLE ai_analysis_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    health_record_id INT NOT NULL,
    input_summary TEXT,
    analysis_result TEXT NOT NULL,
    risk_level ENUM('Rendah', 'Sedang', 'Tinggi') NOT NULL,
    recommendation TEXT,
    ai_provider VARCHAR(100) DEFAULT 'Gemini API',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_results_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_ai_results_health_records
        FOREIGN KEY (health_record_id)
        REFERENCES health_records(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 7. TABLE: activity_logs
-- Fungsi:
-- Menyimpan log aktivitas pengguna.
-- Dipakai untuk monitoring dan audit trail.
-- =========================================================

CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    activity VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_logs_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 8. TABLE: security_alerts
-- Fungsi:
-- Menyimpan aktivitas mencurigakan.
-- Contoh: brute force, unauthorized access, XSS, SQL Injection.
-- =========================================================

CREATE TABLE security_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    description TEXT NOT NULL,
    source_ip VARCHAR(45),
    endpoint VARCHAR(255),
    status ENUM('open', 'investigating', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,

    CONSTRAINT fk_security_alerts_users
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- INDEXING
-- Fungsi:
-- Membantu performa pencarian data.
-- =========================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

CREATE INDEX idx_health_records_user_id ON health_records(user_id);
CREATE INDEX idx_health_records_recorded_at ON health_records(recorded_at);

CREATE INDEX idx_medical_documents_user_id ON medical_documents(user_id);

CREATE INDEX idx_ai_results_user_id ON ai_analysis_results(user_id);
CREATE INDEX idx_ai_results_health_record_id ON ai_analysis_results(health_record_id);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_ip_address ON activity_logs(ip_address);

CREATE INDEX idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX idx_security_alerts_status ON security_alerts(status);
CREATE INDEX idx_security_alerts_source_ip ON security_alerts(source_ip);

-- =========================================================
-- END OF SCHEMA
-- =========================================================