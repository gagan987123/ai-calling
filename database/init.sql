-- AI Call Center Database Schema
-- Hospital Management System for Testing AI + MCP

-- Drop tables if they exist
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors Table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    phone VARCHAR(20),
    email VARCHAR(100),
    experience_years INTEGER,
    available BOOLEAN DEFAULT true,
    languages VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients Table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    age INTEGER,
    gender VARCHAR(10),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES doctors(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    symptoms TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Dummy Data

-- Departments
INSERT INTO departments (name, description) VALUES
('Cardiology', 'Heart and cardiovascular system specialists'),
('Neurology', 'Brain and nervous system specialists'),
('Orthopedics', 'Bone, joint, and muscle specialists'),
('Pediatrics', 'Child healthcare specialists'),
('General Medicine', 'General health and common ailments'),
('Dermatology', 'Skin, hair, and nail specialists'),
('ENT', 'Ear, Nose, and Throat specialists'),
('Gynecology', 'Women''s health specialists');

-- Doctors
INSERT INTO doctors (name, specialization, department_id, phone, email, experience_years, available, languages) VALUES
('Dr. Rajesh Kumar', 'Cardiologist', 1, '+91-9876543210', 'rajesh.kumar@hospital.com', 15, true, 'English, Hindi, Kannada'),
('Dr. Priya Sharma', 'Cardiologist', 1, '+91-9876543211', 'priya.sharma@hospital.com', 12, true, 'English, Hindi, Tamil'),
('Dr. Amit Patel', 'Neurologist', 2, '+91-9876543212', 'amit.patel@hospital.com', 18, true, 'English, Hindi, Gujarati'),
('Dr. Sneha Reddy', 'Neurologist', 2, '+91-9876543213', 'sneha.reddy@hospital.com', 10, false, 'English, Telugu, Kannada'),
('Dr. Vikram Singh', 'Orthopedic Surgeon', 3, '+91-9876543214', 'vikram.singh@hospital.com', 20, true, 'English, Hindi, Punjabi'),
('Dr. Anita Desai', 'Pediatrician', 4, '+91-9876543215', 'anita.desai@hospital.com', 14, true, 'English, Hindi, Marathi'),
('Dr. Suresh Iyer', 'General Physician', 5, '+91-9876543216', 'suresh.iyer@hospital.com', 8, true, 'English, Hindi, Malayalam, Tamil'),
('Dr. Kavita Nair', 'Dermatologist', 6, '+91-9876543217', 'kavita.nair@hospital.com', 11, true, 'English, Hindi, Malayalam'),
('Dr. Ravi Krishnan', 'ENT Specialist', 7, '+91-9876543218', 'ravi.krishnan@hospital.com', 13, true, 'English, Tamil, Kannada'),
('Dr. Meera Joshi', 'Gynecologist', 8, '+91-9876543219', 'meera.joshi@hospital.com', 16, true, 'English, Hindi, Marathi');

-- Patients
INSERT INTO patients (name, phone, email, age, gender, address) VALUES
('Ramesh Gupta', '+91-9123456780', 'ramesh.gupta@email.com', 45, 'Male', 'MG Road, Bangalore'),
('Sunita Verma', '+91-9123456781', 'sunita.verma@email.com', 38, 'Female', 'Indiranagar, Bangalore'),
('Arun Kumar', '+91-9123456782', 'arun.kumar@email.com', 52, 'Male', 'Koramangala, Bangalore'),
('Lakshmi Menon', '+91-9123456783', 'lakshmi.menon@email.com', 29, 'Female', 'Jayanagar, Bangalore'),
('Vijay Rao', '+91-9123456784', 'vijay.rao@email.com', 61, 'Male', 'Whitefield, Bangalore');

-- Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, symptoms, status, notes) VALUES
(1, 1, '2026-04-05', '10:00:00', 'Chest pain, shortness of breath', 'scheduled', 'First consultation'),
(2, 6, '2026-04-05', '11:30:00', 'Child fever and cough', 'scheduled', 'Follow-up required'),
(3, 5, '2026-04-06', '09:00:00', 'Knee pain, difficulty walking', 'scheduled', 'X-ray recommended'),
(4, 10, '2026-04-06', '14:00:00', 'Routine checkup', 'scheduled', 'Annual checkup'),
(5, 3, '2026-04-07', '10:30:00', 'Headache, dizziness', 'scheduled', 'MRI scan pending');

-- Create indexes for better performance
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_available ON doctors(available);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_patients_phone ON patients(phone);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
