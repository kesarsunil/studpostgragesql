import datetime
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal, is_postgres_active
import models

def seed_database_defaults():
    # Create all tables first
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Check if users already seeded
        if db.query(models.User).count() > 0:
            print("Database already contains seed users. Skipping re-seed.")
            return

        print("Seeding initial users and academic data...")

        # 1. Maintainer (Admin)
        admin = models.User(
            email="admin@attendance.edu",
            password_hash="admin123",
            full_name="System Administrator",
            role="maintainer",
            phone="+1-555-0100",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        )
        db.add(admin)

        # 2. Faculty
        f1_user = models.User(
            email="dr.sharma@attendance.edu",
            password_hash="faculty123",
            full_name="Dr. Ramesh Sharma",
            role="faculty",
            phone="+1-555-0101",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        )
        f2_user = models.User(
            email="prof.patel@attendance.edu",
            password_hash="faculty123",
            full_name="Prof. Priya Patel",
            role="faculty",
            phone="+1-555-0102",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
        )
        db.add_all([f1_user, f2_user])
        db.flush()

        f1_profile = models.FacultyProfile(
            user_id=f1_user.id,
            employee_id="EMP-CS-001",
            department="Computer Science",
            designation="Professor & HOD"
        )
        f2_profile = models.FacultyProfile(
            user_id=f2_user.id,
            employee_id="EMP-CS-002",
            department="Computer Science",
            designation="Associate Professor"
        )
        db.add_all([f1_profile, f2_profile])

        # 3. Students
        s_data = [
            ("Rahul Kumar", "rahul.kumar@student.edu", "CS2024-001", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"),
            ("Ananya Singh", "ananya.singh@student.edu", "CS2024-002", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"),
            ("Rohit Verma", "rohit.verma@student.edu", "CS2024-003", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"),
            ("Sneha Reddy", "sneha.reddy@student.edu", "CS2024-004", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150"),
            ("Vikram Aditya", "vikram.aditya@student.edu", "CS2024-005", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"),
        ]

        student_profiles = []
        for name, email, roll, avatar in s_data:
            u = models.User(
                email=email,
                password_hash="student123",
                full_name=name,
                role="student",
                phone="+1-555-0200",
                avatar_url=avatar
            )
            db.add(u)
            db.flush()
            sp = models.StudentProfile(
                user_id=u.id,
                roll_number=roll,
                department="Computer Science",
                semester=4,
                batch="2023-2027",
                section="A"
            )
            db.add(sp)
            student_profiles.append(sp)

        # 4. Courses
        c1 = models.Course(
            course_code="CS401",
            course_name="Database Management Systems",
            department="Computer Science",
            semester=4,
            credits=4,
            description="Relational database design, SQL queries, transactions, and indexing."
        )
        c2 = models.Course(
            course_code="CS402",
            course_name="Operating Systems",
            department="Computer Science",
            semester=4,
            credits=4,
            description="Processes, concurrency, memory management, and file systems."
        )
        c3 = models.Course(
            course_code="CS403",
            course_name="Computer Networks",
            department="Computer Science",
            semester=4,
            credits=3,
            description="Networking protocols, IP addressing, TCP/UDP sockets."
        )
        db.add_all([c1, c2, c3])
        db.flush()

        # 5. Faculty Assignments
        fc1 = models.FacultyCourse(faculty_id=f1_profile.id, course_id=c1.id, academic_year="2026-2027", section="A")
        fc2 = models.FacultyCourse(faculty_id=f2_profile.id, course_id=c2.id, academic_year="2026-2027", section="A")
        db.add_all([fc1, fc2])

        # 6. Student Enrollments
        for sp in student_profiles:
            for c in [c1, c2, c3]:
                db.add(models.StudentCourse(student_id=sp.id, course_id=c.id, academic_year="2026-2027"))
        db.flush()

        # 7. Attendance Sessions & Records
        today = datetime.date.today()
        # Session 1: DBMS 4 days ago
        sess1 = models.AttendanceSession(
            course_id=c1.id,
            faculty_id=f1_profile.id,
            session_date=today - datetime.timedelta(days=4),
            session_time="09:00 AM",
            topic="ER Diagram & Relational Schemas",
            room_number="Lab 301"
        )
        # Session 2: DBMS 2 days ago
        sess2 = models.AttendanceSession(
            course_id=c1.id,
            faculty_id=f1_profile.id,
            session_date=today - datetime.timedelta(days=2),
            session_time="09:00 AM",
            topic="SQL Joins & Group By",
            room_number="Lab 301"
        )
        # Session 3: OS 3 days ago
        sess3 = models.AttendanceSession(
            course_id=c2.id,
            faculty_id=f2_profile.id,
            session_date=today - datetime.timedelta(days=3),
            session_time="11:00 AM",
            topic="CPU Scheduling Algorithms",
            room_number="Room 204"
        )
        db.add_all([sess1, sess2, sess3])
        db.flush()

        # Mark attendance records
        # Sess 1: all present except Rohit (absent)
        for i, sp in enumerate(student_profiles):
            status = "absent" if i == 2 else "present"
            db.add(models.AttendanceRecord(session_id=sess1.id, student_id=sp.id, status=status, remarks=""))

        # Sess 2: all present, Vikram late
        for i, sp in enumerate(student_profiles):
            status = "late" if i == 4 else "present"
            db.add(models.AttendanceRecord(session_id=sess2.id, student_id=sp.id, status=status, remarks="Bus delay" if i == 4 else ""))

        # Sess 3: Rahul, Ananya, Sneha present, Rohit late, Vikram absent
        statuses = ["present", "present", "late", "present", "absent"]
        for sp, st in zip(student_profiles, statuses):
            db.add(models.AttendanceRecord(session_id=sess3.id, student_id=sp.id, status=st, remarks=""))

        db.commit()
        print("Database seed completed successfully with Maintainer, Faculty, Students, Courses, and Attendance logs!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database_defaults()
