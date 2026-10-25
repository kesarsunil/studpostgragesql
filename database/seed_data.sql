-- ========================================================
-- STUDENT ATTENDANCE MANAGEMENT SYSTEM - SEED DATA
-- Default Credentials for immediate testing:
-- Maintainer: admin@attendance.edu     / admin123
-- Faculty:    dr.sharma@attendance.edu / faculty123
-- Student:    rahul.kumar@student.edu  / student123
-- ========================================================

-- Clear existing data (optional, safe for clean seed)
TRUNCATE TABLE attendance_records CASCADE;
TRUNCATE TABLE attendance_sessions CASCADE;
TRUNCATE TABLE student_courses CASCADE;
TRUNCATE TABLE faculty_courses CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE student_profiles CASCADE;
TRUNCATE TABLE faculty_profiles CASCADE;
TRUNCATE TABLE users CASCADE;

-- 1. INSERT USERS (Maintainer, Faculty, Students)
-- Default passwords are stored with both plain identifier & sha256/bcrypt compatible
INSERT INTO users (id, email, password_hash, full_name, role, phone, avatar_url) VALUES
-- Maintainer / Admin
(1, 'admin@attendance.edu', 'admin123', 'System Administrator', 'maintainer', '+1-555-0100', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),

-- Faculty Members (Created by Maintainer)
(2, 'dr.sharma@attendance.edu', 'faculty123', 'Dr. Ramesh Sharma', 'faculty', '+1-555-0101', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(3, 'prof.patel@attendance.edu', 'faculty123', 'Prof. Priya Patel', 'faculty', '+1-555-0102', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
(4, 'dr.verma@attendance.edu', 'faculty123', 'Dr. Arvind Verma', 'faculty', '+1-555-0103', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),

-- Students (Created by Maintainer)
(5, 'rahul.kumar@student.edu', 'student123', 'Rahul Kumar', 'student', '+1-555-0201', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
(6, 'ananya.singh@student.edu', 'student123', 'Ananya Singh', 'student', '+1-555-0202', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(7, 'rohit.verma@student.edu', 'student123', 'Rohit Verma', 'student', '+1-555-0203', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
(8, 'sneha.reddy@student.edu', 'student123', 'Sneha Reddy', 'student', '+1-555-0204', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
(9, 'vikram.aditya@student.edu', 'student123', 'Vikram Aditya', 'student', '+1-555-0205', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'),
(10, 'meera.iyer@student.edu', 'student123', 'Meera Iyer', 'student', '+1-555-0206', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150');

-- Reset users sequence
ALTER SEQUENCE users_id_seq RESTART WITH 11;

-- 2. INSERT FACULTY PROFILES
INSERT INTO faculty_profiles (id, user_id, employee_id, department, designation, joining_date) VALUES
(1, 2, 'EMP-CS-001', 'Computer Science', 'Professor & HOD', '2020-08-15'),
(2, 3, 'EMP-CS-002', 'Computer Science', 'Associate Professor', '2021-01-10'),
(3, 4, 'EMP-IT-003', 'Information Technology', 'Assistant Professor', '2022-07-20');

ALTER SEQUENCE faculty_profiles_id_seq RESTART WITH 4;

-- 3. INSERT STUDENT PROFILES
INSERT INTO student_profiles (id, user_id, roll_number, department, semester, batch, section, parent_phone) VALUES
(1, 5, 'CS2024-001', 'Computer Science', 4, '2023-2027', 'A', '+1-555-0901'),
(2, 6, 'CS2024-002', 'Computer Science', 4, '2023-2027', 'A', '+1-555-0902'),
(3, 7, 'CS2024-003', 'Computer Science', 4, '2023-2027', 'A', '+1-555-0903'),
(4, 8, 'CS2024-004', 'Computer Science', 4, '2023-2027', 'A', '+1-555-0904'),
(5, 9, 'CS2024-005', 'Computer Science', 4, '2023-2027', 'A', '+1-555-0905'),
(6, 10, 'CS2024-006', 'Computer Science', 4, '2023-2027', 'A', '+1-555-0906');

ALTER SEQUENCE student_profiles_id_seq RESTART WITH 7;

-- 4. INSERT COURSES
INSERT INTO courses (id, course_code, course_name, department, semester, credits, description) VALUES
(1, 'CS401', 'Database Management Systems', 'Computer Science', 4, 4, 'Relational databases, SQL queries, transaction management, and indexing.'),
(2, 'CS402', 'Operating Systems', 'Computer Science', 4, 4, 'Process management, synchronization, memory virtualization, and file systems.'),
(3, 'CS403', 'Computer Networks', 'Computer Science', 4, 3, 'OSI model, TCP/IP protocol suite, network routing, and socket programming.'),
(4, 'CS404', 'Design & Analysis of Algorithms', 'Computer Science', 4, 4, 'Divide and conquer, dynamic programming, greedy algorithms, and graph theory.');

ALTER SEQUENCE courses_id_seq RESTART WITH 5;

-- 5. FACULTY COURSE ALLOCATIONS
INSERT INTO faculty_courses (id, faculty_id, course_id, academic_year, section) VALUES
(1, 1, 1, '2026-2027', 'A'), -- Dr. Sharma teaches DBMS
(2, 1, 4, '2026-2027', 'A'), -- Dr. Sharma teaches Algorithms
(3, 2, 2, '2026-2027', 'A'), -- Prof. Patel teaches Operating Systems
(4, 3, 3, '2026-2027', 'A'); -- Dr. Verma teaches Computer Networks

ALTER SEQUENCE faculty_courses_id_seq RESTART WITH 5;

-- 6. STUDENT ENROLLMENTS
INSERT INTO student_courses (student_id, course_id, academic_year) VALUES
(1, 1, '2026-2027'), (1, 2, '2026-2027'), (1, 3, '2026-2027'), (1, 4, '2026-2027'),
(2, 1, '2026-2027'), (2, 2, '2026-2027'), (2, 3, '2026-2027'), (2, 4, '2026-2027'),
(3, 1, '2026-2027'), (3, 2, '2026-2027'), (3, 3, '2026-2027'), (3, 4, '2026-2027'),
(4, 1, '2026-2027'), (4, 2, '2026-2027'), (4, 3, '2026-2027'), (4, 4, '2026-2027'),
(5, 1, '2026-2027'), (5, 2, '2026-2027'), (5, 3, '2026-2027'), (5, 4, '2026-2027'),
(6, 1, '2026-2027'), (6, 2, '2026-2027'), (6, 3, '2026-2027'), (6, 4, '2026-2027');

-- 7. ATTENDANCE SESSIONS
INSERT INTO attendance_sessions (id, course_id, faculty_id, session_date, session_time, topic, room_number) VALUES
(1, 1, 1, CURRENT_DATE - INTERVAL '6 days', '09:00 AM', 'ER Modeling & Relational Schema', 'Lab 301'),
(2, 1, 1, CURRENT_DATE - INTERVAL '4 days', '09:00 AM', 'SQL Joins and Aggregations', 'Lab 301'),
(3, 1, 1, CURRENT_DATE - INTERVAL '2 days', '09:00 AM', 'Normalization and Normal Forms (1NF-3NF)', 'Lab 301'),
(4, 1, 1, CURRENT_DATE, '09:00 AM', 'Transactions & ACID Properties', 'Lab 301'),
(5, 2, 2, CURRENT_DATE - INTERVAL '3 days', '11:00 AM', 'Process Control Block & Context Switching', 'Room 204'),
(6, 2, 2, CURRENT_DATE - INTERVAL '1 days', '11:00 AM', 'Deadlock Detection & Prevention', 'Room 204'),
(7, 4, 1, CURRENT_DATE - INTERVAL '5 days', '02:00 PM', 'Asymptotic Notations & Master Theorem', 'Room 102'),
(8, 4, 1, CURRENT_DATE - INTERVAL '2 days', '02:00 PM', 'Dijkstra and Prim Algorithms', 'Room 102');

ALTER SEQUENCE attendance_sessions_id_seq RESTART WITH 9;

-- 8. ATTENDANCE RECORDS FOR STUDENTS
INSERT INTO attendance_records (session_id, student_id, status, remarks) VALUES
-- Session 1 (DBMS)
(1, 1, 'present', 'On time'),
(1, 2, 'present', 'On time'),
(1, 3, 'absent', 'Unexcused absence'),
(1, 4, 'present', 'On time'),
(1, 5, 'present', 'On time'),
(1, 6, 'late', '15 mins late'),

-- Session 2 (DBMS)
(2, 1, 'present', 'Active in lab'),
(2, 2, 'present', 'Active in lab'),
(2, 3, 'present', 'On time'),
(2, 4, 'present', 'On time'),
(2, 5, 'late', 'Bus delay'),
(2, 6, 'absent', 'Medical leave'),

-- Session 3 (DBMS)
(3, 1, 'present', 'Good engagement'),
(3, 2, 'present', 'On time'),
(3, 3, 'absent', 'Sports practice'),
(3, 4, 'present', 'On time'),
(3, 5, 'present', 'On time'),
(3, 6, 'present', 'On time'),

-- Session 4 (DBMS - Today)
(4, 1, 'present', 'On time'),
(4, 2, 'present', 'On time'),
(4, 3, 'present', 'On time'),
(4, 4, 'present', 'On time'),
(4, 5, 'present', 'On time'),
(4, 6, 'present', 'On time'),

-- Session 5 (OS)
(5, 1, 'present', 'On time'),
(5, 2, 'present', 'On time'),
(5, 3, 'present', 'On time'),
(5, 4, 'absent', 'Illness'),
(5, 5, 'present', 'On time'),
(5, 6, 'present', 'On time'),

-- Session 6 (OS)
(6, 1, 'present', 'On time'),
(6, 2, 'late', 'Traffic'),
(6, 3, 'present', 'On time'),
(6, 4, 'present', 'On time'),
(6, 5, 'absent', 'Family emergency'),
(6, 6, 'present', 'On time'),

-- Session 7 (Algorithms)
(7, 1, 'present', 'On time'),
(7, 2, 'present', 'On time'),
(7, 3, 'present', 'On time'),
(7, 4, 'present', 'On time'),
(7, 5, 'present', 'On time'),
(7, 6, 'late', 'Lab transition'),

-- Session 8 (Algorithms)
(8, 1, 'present', 'On time'),
(8, 2, 'present', 'On time'),
(8, 3, 'late', '10 mins late'),
(8, 4, 'present', 'On time'),
(8, 5, 'present', 'On time'),
(8, 6, 'present', 'On time');
