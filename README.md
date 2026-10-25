# 🎓 CampusTrack - Student Attendance Management System

A modern, fullstack Student Attendance Management Platform built with **React**, **FastAPI**, and **PostgreSQL**.

---

## 🏗️ Project Architecture & Folder Structure

```
studp/
├── database/                # 🗄️ PostgreSQL Database Scripts
│   ├── schema.sql           # Complete DDL tables and constraints
│   ├── seed_data.sql        # Realistic initial seed data & test credentials
│   ├── init.sql             # All-in-one DDL + DML initialization script
│   ├── docker-compose.yml   # 1-click Dockerized PostgreSQL setup
│   └── README.md            # Database guide
│
├── backend/                 # ⚡ FastAPI Python Backend
│   ├── main.py              # Application entrypoint & CORS
│   ├── database.py          # SQLAlchemy PostgreSQL connection & auto-fallback
│   ├── models.py            # Database schema models
│   ├── schemas.py           # Pydantic request/response validation
│   ├── seed_data.py         # Automated database seeder
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Database connection settings
│   ├── run_backend.bat      # Windows backend launcher
│   └── routers/
│       ├── auth.py          # Unified multi-role authentication
│       ├── maintainer.py    # Admin control (Add faculty & students, manage courses)
│       ├── faculty.py       # Faculty portal (Take attendance, session history)
│       └── student.py       # Student portal (Attendance %, subject progress, logs)
│
└── frontendd/               # 🎨 Modern React Web Application
    ├── src/
    │   ├── components/
    │   │   ├── auth/        # 3-role login with 1-click demo accounts
    │   │   ├── common/      # Header, badges, and navigation
    │   │   ├── maintainer/  # Admin dashboard, Add Faculty & Add Student modals
    │   │   ├── faculty/     # Daily attendance recorder, live tally, history
    │   │   └── student/     # Overall % gauge, subject-wise breakdown, timeline
    │   ├── services/
    │   │   └── api.js       # API client with FastAPI & reactive offline sync
    │   ├── App.jsx          # Root view orchestrator & quick portal switcher
    │   └── index.css        # Rich glassmorphism design system
    └── package.json
```

---

## 🔑 Default Login Credentials

| Portal Role | Email | Password | Details |
|---|---|---|---|
| **🛡️ Maintainer (Admin)** | `admin@attendance.edu` | `admin123` | System Administrator (Creates Faculty & Students) |
| **👨‍🏫 Faculty (Teacher)** | `dr.sharma@attendance.edu` | `faculty123` | Dr. Ramesh Sharma (CS HOD, DBMS) |
| **👨‍🏫 Faculty (Teacher)** | `prof.patel@attendance.edu` | `faculty123` | Prof. Priya Patel (Operating Systems) |
| **🎓 Student** | `rahul.kumar@student.edu` | `student123` | Rahul Kumar (Roll: `CS2024-001`) |
| **🎓 Student** | `ananya.singh@student.edu` | `student123` | Ananya Singh (Roll: `CS2024-002`) |

*(On the login screen, you can also click the **Instant 1-Click Demo Accounts** at the bottom to test each role with zero typing!)*

---

## 🌟 How the 3 Logins Work

1. **Maintainer / Admin**:
   - Logs in to manage the academic system.
   - Adds new **Faculty members** with their name, email, credentials (password), department, and employee ID.
   - Adds new **Students** with their name, roll number, email, credentials (password), semester, and batch.
   - Manages courses and allocations.

2. **Faculty / Teacher**:
   - Logs in using the credentials created by the Maintainer.
   - Selects their assigned course/subject.
   - Enters lecture topic, room, and date.
   - Marks attendance for each student in the roster (**Present**, **Absent**, or **Late**) with live attendance percentage calculations.
   - Views past attendance history and identifies students with attendance below 75%.

3. **Student**:
   - Logs in using the credentials created by the Maintainer.
   - Views overall attendance percentage meter and safety status:
     - 🟢 **Safe**: $\ge 75\%$
     - 🟡 **Warning**: $65\% - 75\%$
     - 🔴 **Critical**: $< 65\%$ (Exam debarment risk)
   - Checks subject-wise attendance breakdown and day-by-day attendance timeline log.

---

## 🗄️ Connecting to PostgreSQL

### Option A: Using Docker (1 Command)
In the `database/` folder:
```bash
docker compose up -d
```
This starts PostgreSQL 16 on `localhost:5432` with user `postgres` and database `attendance_db`, and automatically loads all tables and seed data from `init.sql`.

### Option B: Using Local PostgreSQL (psql / pgAdmin)
1. In pgAdmin or terminal:
   ```sql
   CREATE DATABASE attendance_db;
   ```
2. Execute the scripts:
   ```bash
   psql -U postgres -d attendance_db -f database/schema.sql
   psql -U postgres -d attendance_db -f database/seed_data.sql
   ```
3. Update `backend/.env` with your PostgreSQL username and password if different:
   ```env
   DATABASE_URL=postgresql://postgres:password123@localhost:5432/attendance_db
   ```

---

## 🚀 Running the Fullstack Application

### 1. Start the FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Swagger API Documentation is available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Start the React Frontend
```bash
cd frontendd
npm run dev
```
Open your browser at: [http://localhost:5173](http://localhost:5173)
