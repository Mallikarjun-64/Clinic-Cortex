-- Seeding Initial Data for ClinicCortex

-- ============================================
-- 1. SEED DOCTORS
-- ============================================
-- Password hash is a bcrypt hash for 'Test@1234'
INSERT INTO doctors (
    id, salutation, first_name, middle_name, last_name, dob, gender, nationality, 
    profile_photo_url, professional_email, mobile, clinic_address, nmc_reg_no, 
    smc_name, pg_specialization, experience_years, employment_types, clinic_fee, 
    online_fee, password_hash, consent_dpdp, consent_telemedicine, consent_tnc
) VALUES (
    '8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'Dr.', 'Sarah', '', 'Johnson', '1984-06-15', 'Female', 'Indian',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300', 
    'sarah.johnson@clinic.com', '+91 98765 43210', 'Apex Cardiac Care, Sector 15, New Delhi', 'NMC-12345', 
    'Delhi Medical Council', 'Cardiology', 12, ARRAY['Permanent', 'Consultant'], 1000.00, 
    800.00, '$2a$12$R9h/lIPzNgbpcG4dy5wUTuQqT12vW3.EswU1R0sH74fXlXgE.1J6i', true, true, true
) ON CONFLICT (professional_email) DO NOTHING;

-- Seed Doctor Specialty details
INSERT INTO doctor_specialties (doctor_id, specialty_type, specialty_data) VALUES (
    '8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'Cardiology', 
    '{"subType": "Interventional Cardiology", "focus": "Adult", "cathLabExp": "8 years", "deviceExp": ["Pacemaker", "ICD"]}'
);

-- ============================================
-- 2. SEED PATIENTS
-- ============================================
INSERT INTO patients (id, name, age, gender, dob, phone, email, address, condition, last_visit) VALUES
('b2a95c96-3c05-4f40-84e1-a083a216db8e', 'Meghna k Gunaga', 45, 'Male', '1981-03-24', '+1 234-567-8901', 'john.smith@email.com', '123 Main St, City', 'Hypertension', '2026-03-28'),
('c3b06d87-4d16-5e51-95f2-b194b327ec9f', 'Emma Wilson', 32, 'Female', '1994-08-12', '+1 234-567-8902', 'emma.wilson@email.com', '456 Oak Ave, City', 'Diabetes Type 2', '2026-03-30'),
('d4c17e98-5e27-6f62-a603-c2a5c438fd0a', 'Michael Brown', 58, 'Male', '1968-11-05', '+1 234-567-8903', 'michael.brown@email.com', '789 Pine Rd, City', 'Asthma', '2026-04-01'),
('e5d28f09-6f38-7g73-b714-d3b6d549fe1b', 'Sarah Davis', 41, 'Female', '1985-02-14', '+1 234-567-8904', 'sarah.davis@email.com', '321 Elm St, City', 'Migraine', '2026-03-25'),
('f6e39g10-7g49-8h84-c825-e4c7e650gf2c', 'James Miller', 36, 'Male', '1990-09-22', '+1 234-567-8905', 'james.miller@email.com', '654 Birch Ln, City', 'Back Pain', '2026-04-02');

-- ============================================
-- 3. SEED APPOINTMENTS
-- ============================================
INSERT INTO appointments (doctor_id, patient_id, patient_name, patient_age, visit_type, appointment_date, appointment_time, status, condition, vitals) VALUES
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'b2a95c96-3c05-4f40-84e1-a083a216db8e', 'Meghna k Gunaga', 45, 'Clinic', '2026-04-05', '10:30:00', 'Confirmed', 'Hypertension Follow-up', '{"blood_glucose": 95, "hrv": 74.4, "spo2": 96.5, "temp": 36.6, "sleep": 380, "rhr": 62}'),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'c3b06d87-4d16-5e51-95f2-b194b327ec9f', 'Emma Wilson', 32, 'Video', '2026-04-05', '11:30:00', 'Scheduled', 'Diabetes Checkup', '{"blood_glucose": 130, "hrv": 68.2, "spo2": 98.0, "temp": 36.8, "sleep": 420, "rhr": 68}'),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'd4c17e98-5e27-6f62-a603-c2a5c438fd0a', 'Michael Brown', 58, 'Home', '2026-04-06', '09:00:00', 'Scheduled', 'Asthma Consult', '{"blood_glucose": 110, "hrv": 55.0, "spo2": 94.2, "temp": 37.1, "sleep": 310, "rhr": 74}');

-- ============================================
-- 4. SEED CONSULTATION REQUESTS
-- ============================================
INSERT INTO consultation_requests (doctor_id, patient_name, request_time, request_type, priority, notes, status) VALUES
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'David Warner', '10 min ago', 'Virtual', 'High', 'Chest pain symptoms since last night', 'Pending'),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'Karan Johar', '1 hour ago', 'In-Person', 'Medium', 'Regular ECG assessment and review', 'Pending');

-- ============================================
-- 5. SEED SCHEDULE SLOTS
-- ============================================
INSERT INTO schedule_slots (doctor_id, day_of_week, start_time, end_time, slot_type, is_available) VALUES
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'monday', '09:00:00', '09:30:00', 'Clinic', true),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'monday', '09:30:00', '10:00:00', 'Clinic', true),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'monday', '10:00:00', '10:30:00', 'Video', true),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'monday', '10:30:00', '11:00:00', 'Video', false),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'monday', '11:00:00', '11:30:00', 'Break', false);

-- Seed Availability configuration per day
INSERT INTO availability (doctor_id, day_name, total_slots, working_hours, status) VALUES
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'Monday', 12, '09:00 AM - 05:00 PM', 'Active'),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'Tuesday', 12, '09:00 AM - 05:00 PM', 'Active'),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'Wednesday', 12, '09:00 AM - 05:00 PM', 'Active'),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'Thursday', 12, '09:00 AM - 05:00 PM', 'Active'),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'Friday', 12, '09:00 AM - 05:00 PM', 'Active'),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'Saturday', 6, '09:00 AM - 01:00 PM', 'Active'),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'Sunday', 0, 'Closed', 'Inactive');

-- ============================================
-- 6. SEED MESSAGING THREADS
-- ============================================
INSERT INTO message_threads (id, doctor_id, patient_id, patient_name, patient_avatar, last_message, patient_online) VALUES
('aa295c96-3c05-4f40-84e1-a083a216db8e', '8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'b2a95c96-3c05-4f40-84e1-a083a216db8e', 'Meghna k Gunaga', 'M', 'Slight headache since morning.', true),
('ab306d87-4d16-5e51-95f2-b194b327ec9f', '8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'c3b06d87-4d16-5e51-95f2-b194b327ec9f', 'Emma Wilson', 'E', 'Got it. Sharing a quick assessment chart 📎', false);

-- Seed Messages
INSERT INTO messages (thread_id, sender_type, content) VALUES
('aa295c96-3c05-4f40-84e1-a083a216db8e', 'doctor', 'Hi! How are you feeling today?'),
('aa295c96-3c05-4f40-84e1-a083a216db8e', 'patient', 'Slight headache since morning.'),
('ab306d87-4d16-5e51-95f2-b194b327ec9f', 'doctor', 'Emma, your blood glucose checks look clean.'),
('ab306d87-4d16-5e51-95f2-b194b327ec9f', 'patient', 'Thank you Doctor, will continue the supplements.');

-- ============================================
-- 7. SEED NOTIFICATIONS
-- ============================================
INSERT INTO notifications (doctor_id, title, body, notification_type, category, patient_name, is_read) VALUES
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'New Appointment Booked', 'Meghna k Gunaga booked an In-Clinic appointment for Wed, Nov 04 at 10:30 AM', 'info', 'Appointment', 'Meghna k Gunaga', false),
('8ee16766-3d23-4c91-91a5-e1ab8529f8f2', 'Emergency SOS Alert', 'James Miller has triggered emergency vitals threshold support requests.', 'danger', 'Urgent', 'James Miller', false);
