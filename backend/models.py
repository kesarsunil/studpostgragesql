import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(String(50), nullable=False, default="student") # maintainer, faculty, student
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    faculty_profile = relationship("FacultyProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class FacultyProfile(Base):
    __tablename__ = "faculty_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)
    designation = Column(String(100), default="Assistant Professor")
    joining_date = Column(Date, default=datetime.date.today)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="faculty_profile")
    faculty_courses = relationship("FacultyCourse", back_populates="faculty", cascade="all, delete-orphan")
    attendance_sessions = relationship("AttendanceSession", back_populates="faculty")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, default=1, nullable=False)
    batch = Column(String(20), nullable=False)
    section = Column(String(10), default="A")
    parent_phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    student_courses = relationship("StudentCourse", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="student")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String(20), unique=True, index=True, nullable=False)
    course_name = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False)
    credits = Column(Integer, default=3)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    faculty_courses = relationship("FacultyCourse", back_populates="course", cascade="all, delete-orphan")
    student_courses = relationship("StudentCourse", back_populates="course", cascade="all, delete-orphan")
    attendance_sessions = relationship("AttendanceSession", back_populates="course")

class FacultyCourse(Base):
    __tablename__ = "faculty_courses"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty_profiles.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    academic_year = Column(String(20), nullable=False)
    section = Column(String(10), default="A")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint("faculty_id", "course_id", "academic_year", "section", name="_fac_course_uc"),)

    faculty = relationship("FacultyProfile", back_populates="faculty_courses")
    course = relationship("Course", back_populates="faculty_courses")

class StudentCourse(Base):
    __tablename__ = "student_courses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    academic_year = Column(String(20), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint("student_id", "course_id", "academic_year", name="_stud_course_uc"),)

    student = relationship("StudentProfile", back_populates="student_courses")
    course = relationship("Course", back_populates="student_courses")

class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty_profiles.id", ondelete="CASCADE"), nullable=False)
    session_date = Column(Date, default=datetime.date.today, nullable=False)
    session_time = Column(String(20), default="10:00 AM")
    topic = Column(String(255), nullable=True)
    room_number = Column(String(50), default="Room 101")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    course = relationship("Course", back_populates="attendance_sessions")
    faculty = relationship("FacultyProfile", back_populates="attendance_sessions")
    records = relationship("AttendanceRecord", back_populates="session", cascade="all, delete-orphan")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("attendance_sessions.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), nullable=False, default="present") # present, absent, late
    remarks = Column(String(255), nullable=True)
    marked_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint("session_id", "student_id", name="_session_stud_uc"),)

    session = relationship("AttendanceSession", back_populates="records")
    student = relationship("StudentProfile", back_populates="attendance_records")
