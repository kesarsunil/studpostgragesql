from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime

# --- AUTH SCHEMAS ---
class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None # 'maintainer', 'faculty', 'student'

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- MAINTAINER SCHEMAS ---
class FacultyCreate(BaseModel):
    email: str
    password: str
    full_name: str
    employee_id: str
    department: str
    designation: Optional[str] = "Assistant Professor"
    phone: Optional[str] = None

class StudentCreate(BaseModel):
    email: str
    password: str
    full_name: str
    roll_number: str
    department: str
    semester: int = 1
    batch: str # e.g. '2023-2027'
    section: Optional[str] = "A"
    phone: Optional[str] = None
    parent_phone: Optional[str] = None

class CourseCreate(BaseModel):
    course_code: str
    course_name: str
    department: str
    semester: int
    credits: Optional[int] = 3
    description: Optional[str] = None

class CourseAssignFaculty(BaseModel):
    faculty_id: int
    course_id: int
    academic_year: str = "2026-2027"
    section: str = "A"

class CourseAssignStudent(BaseModel):
    student_id: int
    course_id: int
    academic_year: str = "2026-2027"

# --- ATTENDANCE SCHEMAS ---
class SingleStudentAttendance(BaseModel):
    student_id: int
    status: str # 'present', 'absent', 'late'
    remarks: Optional[str] = ""

class MarkAttendanceRequest(BaseModel):
    course_id: int
    session_date: Optional[str] = None # YYYY-MM-DD, defaults to today
    session_time: Optional[str] = "10:00 AM"
    topic: Optional[str] = ""
    room_number: Optional[str] = "Room 101"
    records: List[SingleStudentAttendance]

class AttendanceRecordOut(BaseModel):
    id: int
    student_id: int
    student_name: str
    roll_number: str
    status: str
    remarks: Optional[str] = None
    marked_at: Optional[datetime] = None

class AttendanceSessionOut(BaseModel):
    id: int
    course_id: int
    course_name: str
    course_code: str
    faculty_name: str
    session_date: date
    session_time: str
    topic: Optional[str] = None
    total_students: int
    present_count: int
    absent_count: int
    late_count: int
    percentage: float
