-- ========================================================
-- ALL-IN-ONE INITIALIZATION SCRIPT FOR POSTGRESQL
-- (Schema + Initial Seed Data)
-- ========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. FACULTY PROFILES
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) DEFAULT 'Assistant Professor',
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL DEFAULT 1,
    batch VARCHAR(20) NOT NULL,
    section VARCHAR(10) DEFAULT 'A',
    parent_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. COURSES / SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL,
    credits INTEGER DEFAULT 3,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. FACULTY COURSE ASSIGNMENT
CREATE TABLE IF NOT EXISTS faculty_courses (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    section VARCHAR(10) DEFAULT 'A',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (faculty_id, course_id, academic_year, section)
);

-- 6. STUDENT COURSE ENROLLMENT
CREATE TABLE IF NOT EXISTS student_courses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, course_id, academic_year)
);

-- 7. ATTENDANCE SESSIONS
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id INTEGER NOT NULL REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_time VARCHAR(20) DEFAULT '10:00 AM',
    topic VARCHAR(255),
    room_number VARCHAR(50) DEFAULT 'Room 101',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'present',
    remarks VARCHAR(255),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, student_id)
);

-- Insert Initial Users if table is empty
INSERT INTO users (id, email, password_hash, full_name, role, phone, avatar_url)
SELECT 1, 'admin@attendance.edu', 'admin123', 'System Administrator', 'maintainer', '+1-555-0100', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);

INSERT INTO users (id, email, password_hash, full_name, role, phone, avatar_url)
SELECT 2, 'dr.sharma@attendance.edu', 'faculty123', 'Dr. Ramesh Sharma', 'faculty', '+1-555-0101', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 2);

INSERT INTO users (id, email, password_hash, full_name, role, phone, avatar_url)
SELECT 3, 'prof.patel@attendance.edu', 'faculty123', 'Prof. Priya Patel', 'faculty', '+1-555-0102', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 3);

INSERT INTO users (id, email, password_hash, full_name, role, phone, avatar_url)
SELECT 5, 'rahul.kumar@student.edu', 'student123', 'Rahul Kumar', 'student', '+1-555-0201', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 5);

INSERT INTO users (id, email, password_hash, full_name, role, phone, avatar_url)
SELECT 6, 'ananya.singh@student.edu', 'student123', 'Ananya Singh', 'student', '+1-555-0202', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 6);

-- Insert Faculty Profiles
INSERT INTO faculty_profiles (id, user_id, employee_id, department, designation)
SELECT 1, 2, 'EMP-CS-001', 'Computer Science', 'Professor & HOD'
WHERE NOT EXISTS (SELECT 1 FROM faculty_profiles WHERE id = 1);

INSERT INTO faculty_profiles (id, user_id, employee_id, department, designation)
SELECT 2, 3, 'EMP-CS-002', 'Computer Science', 'Associate Professor'
WHERE NOT EXISTS (SELECT 1 FROM faculty_profiles WHERE id = 2);

-- Insert Student Profiles
INSERT INTO student_profiles (id, user_id, roll_number, department, semester, batch, section)
SELECT 1, 5, 'CS2024-001', 'Computer Science', 4, '2023-2027', 'A'
WHERE NOT EXISTS (SELECT 1 FROM student_profiles WHERE id = 1);

INSERT INTO student_profiles (id, user_id, roll_number, department, semester, batch, section)
SELECT 2, 6, 'CS2024-002', 'Computer Science', 4, '2023-2027', 'A'
WHERE NOT EXISTS (SELECT 1 FROM student_profiles WHERE id = 2);

-- Insert Courses
INSERT INTO courses (id, course_code, course_name, department, semester, credits, description)
SELECT 1, 'CS401', 'Database Management Systems', 'Computer Science', 4, 4, 'Relational databases and SQL'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 1);

INSERT INTO courses (id, course_code, course_name, department, semester, credits, description)
SELECT 2, 'CS402', 'Operating Systems', 'Computer Science', 4, 4, 'Processes, memory, storage'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 2);

-- Link faculty to course
INSERT INTO faculty_courses (id, faculty_id, course_id, academic_year, section)
SELECT 1, 1, 1, '2026-2027', 'A'
WHERE NOT EXISTS (SELECT 1 FROM faculty_courses WHERE id = 1);

INSERT INTO faculty_courses (id, faculty_id, course_id, academic_year, section)
SELECT 2, 2, 2, '2026-2027', 'A'
WHERE NOT EXISTS (SELECT 1 FROM faculty_courses WHERE id = 2);

-- Link students to course
INSERT INTO student_courses (student_id, course_id, academic_year)
SELECT 1, 1, '2026-2027' WHERE NOT EXISTS (SELECT 1 FROM student_courses WHERE student_id = 1 AND course_id = 1);
INSERT INTO student_courses (student_id, course_id, academic_year)
SELECT 2, 1, '2026-2027' WHERE NOT EXISTS (SELECT 1 FROM student_courses WHERE student_id = 2 AND course_id = 1);
