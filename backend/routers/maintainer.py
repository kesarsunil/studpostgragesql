from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import (
    User, FacultyProfile, StudentProfile, Course, 
    FacultyCourse, StudentCourse, AttendanceSession, AttendanceRecord
)
from schemas import FacultyCreate, StudentCreate, CourseCreate, CourseAssignFaculty, CourseAssignStudent

router = APIRouter(prefix="/api/maintainer", tags=["Maintainer / Admin Management"])

# 1. System Statistics
@router.get("/stats")
def get_system_stats(db: Session = Depends(get_db)):
    faculty_count = db.query(FacultyProfile).count()
    student_count = db.query(StudentProfile).count()
    course_count = db.query(Course).count()
    session_count = db.query(AttendanceSession).count()
    
    total_records = db.query(AttendanceRecord).count()
    present_records = db.query(AttendanceRecord).filter(AttendanceRecord.status == "present").count()
    late_records = db.query(AttendanceRecord).filter(AttendanceRecord.status == "late").count()
    
    avg_attendance = round(((present_records + 0.5 * late_records) / total_records * 100), 1) if total_records > 0 else 88.5

    return {
        "total_faculty": faculty_count,
        "total_students": student_count,
        "total_courses": course_count,
        "total_sessions": session_count,
        "avg_attendance_rate": avg_attendance,
        "total_attendance_records": total_records
    }

# 2. Add New Faculty (Maintainer adds faculty credentials & profile)
@router.post("/faculty")
def add_faculty(payload: FacultyCreate, db: Session = Depends(get_db)):
    # Check if user email already exists
    existing_user = db.query(User).filter(User.email.ilike(payload.email.strip())).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")
    
    # Check if employee ID exists
    existing_emp = db.query(FacultyProfile).filter(FacultyProfile.employee_id == payload.employee_id.strip()).first()
    if existing_emp:
        raise HTTPException(status_code=400, detail="Employee ID already exists.")

    new_user = User(
        email=payload.email.strip().lower(),
        password_hash=payload.password.strip(),
        full_name=payload.full_name.strip(),
        role="faculty",
        phone=payload.phone,
        avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={payload.full_name.strip()}"
    )
    db.add(new_user)
    db.flush()

    new_faculty = FacultyProfile(
        user_id=new_user.id,
        employee_id=payload.employee_id.strip(),
        department=payload.department.strip(),
        designation=payload.designation.strip() if payload.designation else "Assistant Professor"
    )
    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)

    return {
        "message": "Faculty account created successfully!",
        "faculty_id": new_faculty.id,
        "user_id": new_user.id,
        "email": new_user.email,
        "employee_id": new_faculty.employee_id,
        "full_name": new_user.full_name
    }

# 3. List All Faculty
@router.get("/faculty")
def list_faculty(db: Session = Depends(get_db)):
    faculties = db.query(FacultyProfile).join(User).all()
    result = []
    for f in faculties:
        courses = [fc.course.course_code for fc in f.faculty_courses if fc.course]
        result.append({
            "faculty_id": f.id,
            "user_id": f.user.id,
            "full_name": f.user.full_name,
            "email": f.user.email,
            "employee_id": f.employee_id,
            "department": f.department,
            "designation": f.designation,
            "phone": f.user.phone,
            "assigned_courses": courses,
            "joining_date": str(f.joining_date)
        })
    return result

# 4. Delete Faculty
@router.delete("/faculty/{faculty_id}")
def delete_faculty(faculty_id: int, db: Session = Depends(get_db)):
    faculty = db.query(FacultyProfile).filter(FacultyProfile.id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty member not found")
    user = db.query(User).filter(User.id == faculty.user_id).first()
    if user:
        db.delete(user)
    db.delete(faculty)
    db.commit()
    return {"message": "Faculty member deleted successfully"}

# 5. Add New Student (Maintainer adds student credentials & profile)
@router.post("/student")
def add_student(payload: StudentCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email.ilike(payload.email.strip())).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

    # Check if roll number exists
    existing_roll = db.query(StudentProfile).filter(StudentProfile.roll_number == payload.roll_number.strip()).first()
    if existing_roll:
        raise HTTPException(status_code=400, detail="Roll number already exists.")

    new_user = User(
        email=payload.email.strip().lower(),
        password_hash=payload.password.strip(),
        full_name=payload.full_name.strip(),
        role="student",
        phone=payload.phone,
        avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={payload.full_name.strip()}"
    )
    db.add(new_user)
    db.flush()

    new_student = StudentProfile(
        user_id=new_user.id,
        roll_number=payload.roll_number.strip(),
        department=payload.department.strip(),
        semester=payload.semester,
        batch=payload.batch.strip(),
        section=payload.section.strip() if payload.section else "A",
        parent_phone=payload.parent_phone
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    # Automatically enroll new student in department courses for this semester
    courses = db.query(Course).filter(
        Course.department == payload.department.strip(),
        Course.semester == payload.semester
    ).all()
    for c in courses:
        enrollment = StudentCourse(student_id=new_student.id, course_id=c.id, academic_year=payload.batch.strip())
        db.add(enrollment)
    db.commit()

    return {
        "message": "Student created successfully and enrolled into matching semester courses!",
        "student_id": new_student.id,
        "roll_number": new_student.roll_number,
        "email": new_user.email,
        "full_name": new_user.full_name
    }

# 6. List All Students
@router.get("/students")
def list_students(db: Session = Depends(get_db)):
    students = db.query(StudentProfile).join(User).all()
    result = []
    for s in students:
        total_classes = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == s.id).count()
        present_count = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == s.id, 
            AttendanceRecord.status == "present"
        ).count()
        pct = round((present_count / total_classes * 100), 1) if total_classes > 0 else 100.0

        result.append({
            "student_id": s.id,
            "user_id": s.user.id,
            "full_name": s.user.full_name,
            "email": s.user.email,
            "roll_number": s.roll_number,
            "department": s.department,
            "semester": s.semester,
            "batch": s.batch,
            "section": s.section,
            "phone": s.user.phone,
            "attendance_rate": pct,
            "total_classes": total_classes,
            "present_count": present_count
        })
    return result

# 7. Delete Student
@router.delete("/student/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    user = db.query(User).filter(User.id == student.user_id).first()
    if user:
        db.delete(user)
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}

# 8. Manage Courses
@router.get("/courses")
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    result = []
    for c in courses:
        faculties = [fc.faculty.user.full_name for fc in c.faculty_courses if fc.faculty and fc.faculty.user]
        enrolled_students = db.query(StudentCourse).filter(StudentCourse.course_id == c.id).count()
        result.append({
            "id": c.id,
            "course_code": c.course_code,
            "course_name": c.course_name,
            "department": c.department,
            "semester": c.semester,
            "credits": c.credits,
            "description": c.description,
            "faculty_assigned": faculties,
            "enrolled_count": enrolled_students
        })
    return result

@router.post("/courses")
def create_course(payload: CourseCreate, db: Session = Depends(get_db)):
    existing = db.query(Course).filter(Course.course_code == payload.course_code.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course code already exists.")
    
    course = Course(
        course_code=payload.course_code.strip().upper(),
        course_name=payload.course_name.strip(),
        department=payload.department.strip(),
        semester=payload.semester,
        credits=payload.credits or 3,
        description=payload.description
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"message": "Course created successfully", "course": course}

# 9. Assign Faculty to Course
@router.post("/assign-faculty")
def assign_faculty_to_course(payload: CourseAssignFaculty, db: Session = Depends(get_db)):
    existing = db.query(FacultyCourse).filter(
        FacultyCourse.faculty_id == payload.faculty_id,
        FacultyCourse.course_id == payload.course_id,
        FacultyCourse.academic_year == payload.academic_year
    ).first()
    if existing:
        return {"message": "Faculty is already assigned to this course"}
    
    assignment = FacultyCourse(
        faculty_id=payload.faculty_id,
        course_id=payload.course_id,
        academic_year=payload.academic_year,
        section=payload.section
    )
    db.add(assignment)
    db.commit()
    return {"message": "Faculty assigned to course successfully"}
