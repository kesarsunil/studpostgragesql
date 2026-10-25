# 🗄️ Database Setup - PostgreSQL

This directory contains the database scripts for the **Student Attendance Management System**.

## 🚀 Ways to Run PostgreSQL

### Option A: Using Docker (Recommended & Easiest)
Run this command from this folder:
```bash
docker compose up -d
```
This automatically boots PostgreSQL 16 on port `5432` with username `postgres`, password `password123`, database `attendance_db`, and loads `init.sql` automatically!

---

### Option B: Using Local PostgreSQL (psql / pgAdmin)
1. Open pgAdmin or your terminal with `psql`:
   ```bash
   psql -U postgres
   ```
2. Create the database:
   ```sql
   CREATE DATABASE attendance_db;
   ```
3. Connect to the database and execute `schema.sql` and `seed_data.sql`:
   ```bash
   psql -U postgres -d attendance_db -f schema.sql
   psql -U postgres -d attendance_db -f seed_data.sql
   ```

---

## 🔑 Default Seed Credentials for Immediate Testing

| Role | Email | Password | Full Name / Details |
|---|---|---|---|
| **Maintainer (Admin)** | `admin@attendance.edu` | `admin123` | System Administrator |
| **Faculty (Teacher)** | `dr.sharma@attendance.edu` | `faculty123` | Dr. Ramesh Sharma (CS HOD) |
| **Faculty (Teacher)** | `prof.patel@attendance.edu` | `faculty123` | Prof. Priya Patel (OS) |
| **Student** | `rahul.kumar@student.edu` | `student123` | Rahul Kumar (Roll: CS2024-001) |
| **Student** | `ananya.singh@student.edu` | `student123` | Ananya Singh (Roll: CS2024-002) |

---

## 📊 Database Schema Overview
1. **`users`**: Base credentials, email, password, full name, role (`maintainer`, `faculty`, `student`).
2. **`faculty_profiles`**: Employee ID, department, designation, user reference.
3. **`student_profiles`**: Roll number, department, semester, batch, section.
4. **`courses`**: Course code, name, department, semester, credits.
5. **`faculty_courses`**: Mapping assigned courses to faculty.
6. **`student_courses`**: Enrolled students in each course.
7. **`attendance_sessions`**: Sessions/lectures conducted with date, time, topic, faculty.
8. **`attendance_records`**: Individual attendance status (`present`, `absent`, `late`) per student.
