-- ========================================================
-- STUDENT ATTENDANCE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- PostgreSQL DDL Script
-- ========================================================

-- Create custom ENUM types if they don't already exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('maintainer', 'faculty', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop tables if needed in reverse dependency order
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_sessions CASCADE;
DROP TABLE IF EXISTS student_courses CASCADE;
DROP TABLE IF EXISTS faculty_courses CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS faculty_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE (Base authentication table for Maintainer, Faculty, and Student)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student', -- 'maintainer', 'faculty', 'student'
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. FACULTY PROFILES (Added and managed by Maintainer)
CREATE TABLE faculty_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) DEFAULT 'Assistant Professor',
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faculty_emp_id ON faculty_profiles(employee_id);
CREATE INDEX idx_faculty_dept ON faculty_profiles(department);

-- 3. STUDENT PROFILES (Added and managed by Maintainer)
CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL DEFAULT 1,
    batch VARCHAR(20) NOT NULL, -- e.g., '2023-2027'
    section VARCHAR(10) DEFAULT 'A',
    parent_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_roll_number ON student_profiles(roll_number);
CREATE INDEX idx_students_dept_sem ON student_profiles(department, semester);

-- 4. COURSES / SUBJECTS TABLE
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL,
    credits INTEGER DEFAULT 3,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. FACULTY COURSE ASSIGNMENT (Maintainer assigns Faculty to teach Course)
CREATE TABLE faculty_courses (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL, -- e.g., '2026-2027'
    section VARCHAR(10) DEFAULT 'A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (faculty_id, course_id, academic_year, section)
);

-- 6. STUDENT COURSE ENROLLMENT (Maintainer enrolls Students in Course)
CREATE TABLE student_courses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, course_id, academic_year)
);

-- 7. ATTENDANCE SESSIONS (Created by Faculty when taking attendance for a lecture)
CREATE TABLE attendance_sessions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id INTEGER NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_time VARCHAR(20) DEFAULT '10:00 AM',
    topic VARCHAR(255),
    room_number VARCHAR(50) DEFAULT 'Room 101',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_course_date ON attendance_sessions(course_id, session_date);

-- 8. ATTENDANCE RECORDS (Individual student attendance status in each session)
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'present', -- 'present', 'absent', 'late'
    remarks VARCHAR(255),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, student_id)
);

CREATE INDEX idx_records_student ON attendance_records(student_id);
CREATE INDEX idx_records_session ON attendance_records(session_id);
