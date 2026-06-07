-- =========================================================
-- MEDISECURE CLOUD DATABASE SEED
-- Database : MySQL / MariaDB
-- Tools    : Laragon
-- Project  : MediSecure Cloud
-- Purpose  : Dummy data for Cloud Computing + Keamanan Jaringan
-- =========================================================

USE medisecure_db;

-- =========================================================
-- RESET DATA
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE security_alerts;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE ai_analysis_results;
TRUNCATE TABLE medical_documents;
TRUNCATE TABLE health_records;
TRUNCATE TABLE patient_profiles;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 1. INSERT ROLES
-- =========================================================

INSERT INTO roles (id, role_name, description)
VALUES
    (1, 'admin', 'Administrator sistem yang memiliki hak akses penuh untuk mengelola pengguna, log, dan security alert.'),
    (2, 'doctor', 'Dokter atau petugas kesehatan yang dapat melihat data pasien dan hasil analisis kesehatan.'),
    (3, 'patient', 'Pasien yang dapat mencatat data kesehatan, mengunggah dokumen, dan melihat hasil analisis AI.');

-- =========================================================
-- 2. INSERT USERS
-- =========================================================
-- Semua akun dummy menggunakan password: password
-- Password disimpan dalam bentuk bcrypt hash, bukan plaintext.
-- =========================================================

INSERT INTO users (id, role_id, name, email, password_hash, phone, status, last_login_at)
VALUES
    (
        1,
        1,
        'Admin MediSecure',
        'admin@medisecure.local',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '081100000001',
        'active',
        CURRENT_TIMESTAMP
    ),
    (
        2,
        2,
        'Dokter MediSecure',
        'doctor@medisecure.local',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '081100000002',
        'active',
        CURRENT_TIMESTAMP
    ),
    (
        3,
        3,
        'Pasien Demo',
        'patient@medisecure.local',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '081100000003',
        'active',
        CURRENT_TIMESTAMP
    ),
    (
        4,
        3,
        'Siti Rahma',
        'siti.rahma@medisecure.local',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '081100000004',
        'active',
        CURRENT_TIMESTAMP
    ),
    (
        5,
        3,
        'Budi Santoso',
        'budi.santoso@medisecure.local',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '081100000005',
        'active',
        CURRENT_TIMESTAMP
    );

-- =========================================================
-- 3. INSERT PATIENT PROFILES
-- =========================================================

INSERT INTO patient_profiles (
    id,
    user_id,
    date_of_birth,
    gender,
    address,
    blood_type,
    emergency_contact
)
VALUES
    (
        1,
        3,
        '2003-05-12',
        'female',
        'Bandung',
        'O',
        '081122223333'
    ),
    (
        2,
        4,
        '2002-08-21',
        'female',
        'Cimahi',
        'A',
        '081144445555'
    ),
    (
        3,
        5,
        '2001-11-09',
        'male',
        'Bandung',
        'B',
        '081166667777'
    );

-- =========================================================
-- 4. INSERT HEALTH RECORDS
-- =========================================================

INSERT INTO health_records (
    id,
    user_id,
    blood_pressure,
    blood_sugar,
    weight,
    height,
    body_temperature,
    symptoms,
    notes,
    recorded_at
)
VALUES
    (
        1,
        3,
        '120/80',
        95.00,
        52.50,
        160.00,
        37.20,
        'Demam ringan, batuk, dan sakit tenggorokan.',
        'Pasien mengalami gejala sejak dua hari terakhir.',
        CURRENT_TIMESTAMP
    ),
    (
        2,
        3,
        '130/85',
        110.00,
        52.80,
        160.00,
        38.00,
        'Pusing, lemas, dan nyeri kepala.',
        'Pasien kurang tidur dan belum makan teratur.',
        CURRENT_TIMESTAMP
    ),
    (
        3,
        4,
        '118/79',
        90.00,
        48.00,
        158.00,
        36.80,
        'Nyeri perut ringan dan mual.',
        'Pasien mengeluhkan mual setelah makan.',
        CURRENT_TIMESTAMP
    ),
    (
        4,
        5,
        '140/90',
        130.00,
        70.00,
        170.00,
        37.00,
        'Mudah lelah dan sering haus.',
        'Perlu pemantauan gula darah secara berkala.',
        CURRENT_TIMESTAMP
    );

-- =========================================================
-- 5. INSERT MEDICAL DOCUMENTS
-- =========================================================

INSERT INTO medical_documents (
    id,
    user_id,
    original_file_name,
    stored_file_name,
    file_type,
    file_size,
    storage_provider,
    storage_path,
    upload_status,
    uploaded_at
)
VALUES
    (
        1,
        3,
        'hasil_lab_pasien_demo.pdf',
        'uuid-001-hasil-lab-pasien-demo.pdf',
        'application/pdf',
        245760,
        'Google Cloud Storage',
        'gs://medisecure-cloud-bucket/documents/uuid-001-hasil-lab-pasien-demo.pdf',
        'uploaded',
        CURRENT_TIMESTAMP
    ),
    (
        2,
        4,
        'resep_obat_siti.png',
        'uuid-002-resep-obat-siti.png',
        'image/png',
        180500,
        'Google Cloud Storage',
        'gs://medisecure-cloud-bucket/documents/uuid-002-resep-obat-siti.png',
        'uploaded',
        CURRENT_TIMESTAMP
    ),
    (
        3,
        5,
        'hasil_pemeriksaan_budi.jpg',
        'uuid-003-hasil-pemeriksaan-budi.jpg',
        'image/jpeg',
        210900,
        'Google Cloud Storage',
        'gs://medisecure-cloud-bucket/documents/uuid-003-hasil-pemeriksaan-budi.jpg',
        'uploaded',
        CURRENT_TIMESTAMP
    );

-- =========================================================
-- 6. INSERT AI ANALYSIS RESULTS
-- =========================================================

INSERT INTO ai_analysis_results (
    id,
    user_id,
    health_record_id,
    input_summary,
    analysis_result,
    risk_level,
    recommendation,
    ai_provider
)
VALUES
    (
        1,
        3,
        1,
        'Demam ringan, batuk, sakit tenggorokan, suhu tubuh 37.2 derajat.',
        'Gejala yang dimasukkan mengarah pada gangguan kesehatan ringan seperti flu atau infeksi saluran pernapasan ringan.',
        'Rendah',
        'Istirahat cukup, konsumsi air putih, dan konsultasi ke dokter apabila gejala memburuk atau berlangsung lebih dari tiga hari.',
        'Gemini API'
    ),
    (
        2,
        3,
        2,
        'Pusing, lemas, nyeri kepala, suhu tubuh 38 derajat.',
        'Gejala menunjukkan kondisi sedang dan perlu pemantauan, terutama jika disertai demam tinggi atau kelemahan berlebih.',
        'Sedang',
        'Istirahat, konsumsi makanan bergizi, pantau suhu tubuh, dan konsultasi ke tenaga kesehatan jika gejala berlanjut.',
        'Gemini API'
    ),
    (
        3,
        5,
        4,
        'Mudah lelah, sering haus, tekanan darah 140/90, gula darah 130.',
        'Data menunjukkan adanya indikasi risiko kesehatan yang perlu diperhatikan, terutama terkait tekanan darah dan gula darah.',
        'Tinggi',
        'Disarankan untuk melakukan pemeriksaan lanjutan ke tenaga kesehatan dan melakukan pemantauan tekanan darah serta gula darah secara berkala.',
        'Gemini API'
    );

-- =========================================================
-- 7. INSERT ACTIVITY LOGS
-- =========================================================

INSERT INTO activity_logs (
    id,
    user_id,
    activity,
    description,
    ip_address,
    user_agent,
    endpoint,
    method,
    status_code,
    created_at
)
VALUES
    (
        1,
        1,
        'LOGIN_SUCCESS',
        'Admin berhasil login ke dashboard.',
        '192.168.1.10',
        'Mozilla/5.0',
        '/api/auth/login',
        'POST',
        200,
        CURRENT_TIMESTAMP
    ),
    (
        2,
        3,
        'CREATE_HEALTH_RECORD',
        'Pasien menambahkan data kesehatan baru.',
        '192.168.1.20',
        'Mozilla/5.0',
        '/api/health-records',
        'POST',
        201,
        CURRENT_TIMESTAMP
    ),
    (
        3,
        3,
        'UPLOAD_DOCUMENT',
        'Pasien mengunggah dokumen kesehatan.',
        '192.168.1.20',
        'Mozilla/5.0',
        '/api/documents/upload',
        'POST',
        201,
        CURRENT_TIMESTAMP
    ),
    (
        4,
        3,
        'AI_ANALYSIS_REQUEST',
        'Pasien meminta analisis AI berdasarkan data kesehatan.',
        '192.168.1.20',
        'Mozilla/5.0',
        '/api/ai/analyze',
        'POST',
        200,
        CURRENT_TIMESTAMP
    ),
    (
        5,
        4,
        'ACCESS_DENIED',
        'Pasien mencoba mengakses endpoint admin.',
        '192.168.1.30',
        'Mozilla/5.0',
        '/api/admin/users',
        'GET',
        403,
        CURRENT_TIMESTAMP
    );

-- =========================================================
-- 8. INSERT SECURITY ALERTS
-- =========================================================

INSERT INTO security_alerts (
    id,
    user_id,
    alert_type,
    severity,
    description,
    source_ip,
    endpoint,
    status,
    created_at
)
VALUES
    (
        1,
        NULL,
        'BRUTE_FORCE_ATTEMPT',
        'High',
        'Terdeteksi beberapa percobaan login gagal dari alamat IP yang sama.',
        '192.168.1.50',
        '/api/auth/login',
        'open',
        CURRENT_TIMESTAMP
    ),
    (
        2,
        4,
        'UNAUTHORIZED_ACCESS',
        'Medium',
        'User dengan role pasien mencoba mengakses endpoint admin.',
        '192.168.1.30',
        '/api/admin/users',
        'investigating',
        CURRENT_TIMESTAMP
    ),
    (
        3,
        NULL,
        'SUSPICIOUS_FILE_UPLOAD',
        'Critical',
        'Terdeteksi percobaan upload file dengan ekstensi tidak diizinkan.',
        '192.168.1.60',
        '/api/documents/upload',
        'open',
        CURRENT_TIMESTAMP
    ),
    (
        4,
        NULL,
        'XSS_PAYLOAD_DETECTED',
        'High',
        'Terdeteksi input yang mengandung pola script mencurigakan pada form gejala.',
        '192.168.1.70',
        '/api/health-records',
        'open',
        CURRENT_TIMESTAMP
    );

-- =========================================================
-- END OF SEED DATA
-- =========================================================