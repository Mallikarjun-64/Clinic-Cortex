-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. DOCTORS TABLE
-- ============================================
CREATE TABLE doctors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salutation      VARCHAR(10) DEFAULT 'Dr.',
    first_name      VARCHAR(100) NOT NULL,
    middle_name     VARCHAR(100),
    last_name       VARCHAR(100) NOT NULL,
    dob             DATE,
    gender          VARCHAR(20) DEFAULT 'Male',
    nationality     VARCHAR(50) DEFAULT 'Indian',
    profile_photo_url VARCHAR(500),
    aadhar_no       VARCHAR(20),
    pan_no          VARCHAR(20),
    passport_no     VARCHAR(20),
    mobile          VARCHAR(20),
    whatsapp        VARCHAR(20),
    professional_email VARCHAR(255) UNIQUE NOT NULL,
    personal_email  VARCHAR(255),
    clinic_address  TEXT,
    home_address    TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100) DEFAULT 'Delhi',
    pincode         VARCHAR(10),
    gps_pin         VARCHAR(100),
    nmc_reg_no      VARCHAR(50) UNIQUE,
    smc_name        VARCHAR(200) DEFAULT 'Delhi Medical Council',
    reg_type        VARCHAR(50) DEFAULT 'Permanent',
    reg_year        VARCHAR(10),
    reg_expiry      DATE,
    lifetime_expiry BOOLEAN DEFAULT FALSE,
    mbbs_university VARCHAR(300),
    mbbs_year       VARCHAR(10),
    pg_degree       VARCHAR(100),
    pg_specialization VARCHAR(200) DEFAULT 'None',
    super_specialization VARCHAR(200),
    additional_certs TEXT,
    nmc_uid         VARCHAR(50),
    experience_years INTEGER DEFAULT 0,
    employment_types TEXT[],           -- Array of strings
    primary_hospital VARCHAR(300),
    secondary_clinics TEXT[],
    telemedicine_only BOOLEAN DEFAULT FALSE,
    consult_languages TEXT[],
    clinic_fee      DECIMAL(10,2) DEFAULT 500.00,
    online_fee      DECIMAL(10,2) DEFAULT 300.00,
    consult_duration VARCHAR(20) DEFAULT '15 min',
    avail_days      TEXT[],
    avail_time_start TIME DEFAULT '09:00',
    avail_time_end   TIME DEFAULT '17:00',
    bio             TEXT,
    research_interests TEXT,
    publications_count INTEGER DEFAULT 0,
    pubmed_id       VARCHAR(50),
    awards          TEXT[],
    password_hash   VARCHAR(255) NOT NULL,
    consent_dpdp    BOOLEAN DEFAULT FALSE,
    consent_telemedicine BOOLEAN DEFAULT FALSE,
    consent_tnc     BOOLEAN DEFAULT FALSE,
    bank_name       VARCHAR(200),
    bank_account_no VARCHAR(30),
    bank_ifsc       VARCHAR(20),
    gst_no          VARCHAR(30),
    emergency_name  VARCHAR(200),
    emergency_relation VARCHAR(100),
    emergency_phone VARCHAR(20),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. DOCTOR SPECIALTIES (JSON per specialty)
-- ============================================
CREATE TABLE doctor_specialties (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    specialty_type  VARCHAR(100) NOT NULL,  -- e.g. 'Cardiology', 'Dermatology'
    specialty_data  JSONB NOT NULL DEFAULT '{}'
);

-- ============================================
-- 3. PATIENTS TABLE
-- ============================================
CREATE TABLE patients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    age             INTEGER,
    gender          VARCHAR(20),
    dob             DATE,
    phone           VARCHAR(20),
    email           VARCHAR(255),
    address         TEXT,
    condition       VARCHAR(200),
    last_visit      DATE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. APPOINTMENTS TABLE
-- ============================================
CREATE TABLE appointments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id         UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id        UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name      VARCHAR(200),       -- Denormalized for quick access
    patient_age       INTEGER,
    visit_type        VARCHAR(20) NOT NULL DEFAULT 'Clinic',  -- Clinic | Video | Home
    appointment_date  DATE NOT NULL,
    appointment_time  TIME NOT NULL,
    status            VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
                      -- Scheduled | Confirmed | Waiting | Completed | Cancelled | Missed
    condition         VARCHAR(200),
    notes             TEXT,
    vitals            JSONB,              -- {blood_glucose, hrv, spo2, temp, sleep, rhr}
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. CONSULTATION REQUESTS
-- ============================================
CREATE TABLE consultation_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_name    VARCHAR(200) NOT NULL,
    request_time    VARCHAR(100),
    request_type    VARCHAR(50) DEFAULT 'Virtual',
    priority        VARCHAR(20) DEFAULT 'Medium',   -- High | Medium | Low
    notes           TEXT,
    status          VARCHAR(30) DEFAULT 'Pending',  -- Pending | Accepted | Rejected
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. SCHEDULE SLOTS
-- ============================================
CREATE TABLE schedule_slots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id     UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week     VARCHAR(15) NOT NULL,   -- monday, tuesday, etc.
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    slot_type       VARCHAR(30) NOT NULL DEFAULT 'Clinic', -- Clinic | Video | Home Visit | Break
    is_available    BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 7. WEEKLY AVAILABILITY
-- ============================================
CREATE TABLE availability (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_name        VARCHAR(15) NOT NULL,
    total_slots     INTEGER DEFAULT 0,
    working_hours   VARCHAR(50),
    status          VARCHAR(20) DEFAULT 'Active'   -- Active | Inactive
);

-- ============================================
-- 8. MESSAGE THREADS
-- ============================================
CREATE TABLE message_threads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id      UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name    VARCHAR(200),
    patient_avatar  VARCHAR(500),
    last_message    TEXT,
    last_message_at TIMESTAMP DEFAULT NOW(),
    patient_online  BOOLEAN DEFAULT FALSE
);

-- ============================================
-- 9. MESSAGES
-- ============================================
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id       UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_type     VARCHAR(20) NOT NULL DEFAULT 'doctor', -- doctor | patient
    content         TEXT NOT NULL,
    sent_at         TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 10. NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id           UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    title               VARCHAR(200) NOT NULL,
    body                TEXT,
    notification_type   VARCHAR(20) DEFAULT 'info', -- success | info | warning | danger
    category            VARCHAR(50),                 -- Appointment | Inbox | Review | Urgent
    patient_name        VARCHAR(200),
    is_read             BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 11. PRESCRIPTIONS
-- ============================================
CREATE TABLE prescriptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    medication      TEXT NOT NULL,
    dosage          TEXT,
    instructions    TEXT,
    prescribed_date DATE DEFAULT CURRENT_DATE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 12. MEDICAL RECORDS
-- ============================================
CREATE TABLE medical_records (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    record_type     VARCHAR(100),         -- Diagnosis, Lab Report, etc.
    diagnosis       TEXT,
    notes           TEXT,
    vitals          JSONB,                -- {weight, height, bmi, blood_pressure}
    assessment      JSONB,                -- {main_complaint, nursing_plan, status}
    record_date     DATE DEFAULT CURRENT_DATE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_notifications_doctor ON notifications(doctor_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_schedule_doctor_day ON schedule_slots(doctor_id, day_of_week);
