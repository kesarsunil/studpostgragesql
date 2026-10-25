from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import (
    StudentProfile, Course, StudentCourse, 
    AttendanceSession, AttendanceRecord, User
)

router = APIRouter(prefix="/api/student", tags=["Student Portal"])

# 1. Student Dashboard Summary
@router.get("/dashboard")
def get_student_dashboard(student_id: int = Query(...), db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Enrolled courses
    enrollments = db.query(StudentCourse).filter(StudentCourse.student_id == student_id).all()
    enrolled_courses_count = len(enrollments)

    # Attendance stats across all courses
    records = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == student_id).all()
    total_classes = len(records)
    present_count = sum(1 for r in records if r.status == "present")
    late_count = sum(1 for r in records if r.status == "late")
    absent_count = sum(1 for r in records if r.status == "absent")

    # Percentage: full credit for present, 0.5 for late
    overall_percentage = round(((present_count + 0.5 * late_count) / total_classes * 100), 1) if total_classes > 0 else 100.0

    # Status classification
    if overall_percentage >= 75:
        attendance_status = "Safe"
        status_color = "emerald"
        status_message = "Your attendance is above the mandatory 75% threshold."
    elif overall_percentage >= 65:
        attendance_status = "Warning"
        status_color = "amber"
        status_message = "Your attendance is between 65% and 75%. Please attend upcoming lectures."
    else:
        attendance_status = "Critical"
        status_color = "rose"
        status_message = "Your attendance is below 65%. Risk of debarment from semester examinations!"

    return {
        "student_name": student.user.full_name,
        "roll_number": student.roll_number,
        "department": student.department,
        "semester": student.semester,
        "section": student.section,
        "batch": student.batch,
        "overall_percentage": overall_percentage,
        "total_classes": total_classes,
        "present_count": present_count,
        "late_count": late_count,
        "absent_count": absent_count,
        "enrolled_courses": enrolled_courses_count,
        "attendance_status": attendance_status,
        "status_color": status_color,
        "status_message": status_message
    }

# 2. Subject-wise Attendance Breakdown
@router.get("/courses-attendance")
def get_courses_attendance(student_id: int = Query(...), db: Session = Depends(get_db)):
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    enrollments = db.query(StudentCourse).filter(StudentCourse.student_id == student_id).all()
    result = []

    for e in enrollments:
        course = e.course
        if not course:
            continue

        # Find faculty teaching this course
        faculty_name = "Not Assigned"
        if course.faculty_courses:
            first_fac = course.faculty_courses[0].faculty
            if first_fac and first_fac.user:
                faculty_name = first_fac.user.full_name

        # Find all attendance records for this student in this course
        course_records = (
            db.query(AttendanceRecord)
            .join(AttendanceSession)
            .filter(
                AttendanceRecord.student_id == student_id,
                AttendanceSession.course_id == course.id
            )
            .all()
        )

        total_classes = len(course_records)
        present = sum(1 for r in course_records if r.status == "present")
        late = sum(1 for r in course_records if r.status == "late")
        absent = sum(1 for r in course_records if r.status == "absent")

        pct = round(((present + 0.5 * late) / total_classes * 100), 1) if total_classes > 0 else 100.0

        if pct >= 75:
            badge = "Safe"
            badge_color = "emerald"
        elif pct >= 65:
            badge = "Warning"
            badge_color = "amber"
        else:
            badge = "Critical"
            badge_color = "rose"

        result.append({
            "course_id": course.id,
            "course_code": course.course_code,
            "course_name": course.course_name,
            "faculty_name": faculty_name,
            "credits": course.credits,
            "total_classes": total_classes,
            "present_count": present,
            "late_count": late,
            "absent_count": absent,
            "percentage": pct,
            "badge": badge,
            "badge_color": badge_color
        })

    return result

# 3. Day-by-Day Attendance History Log
@router.get("/attendance-history")
def get_student_history(student_id: int = Query(...), course_id: int = Query(None), db: Session = Depends(get_db)):
    query = (
        db.query(AttendanceRecord)
        .join(AttendanceSession)
        .filter(AttendanceRecord.student_id == student_id)
    )

    if course_id:
        query = query.filter(AttendanceSession.course_id == course_id)

    records = query.order_by(AttendanceSession.session_date.desc(), AttendanceSession.id.desc()).all()
    history = []

    for r in records:
        session = r.session
        faculty_name = "Instructor"
        if session and session.faculty and session.faculty.user:
            faculty_name = session.faculty.user.full_name

        history.append({
            "record_id": r.id,
            "date": str(session.session_date) if session else "",
            "time": session.session_time if session else "",
            "course_code": session.course.course_code if session and session.course else "",
            "course_name": session.course.course_name if session and session.course else "",
            "faculty_name": faculty_name,
            "topic": session.topic if session else "Regular Lecture",
            "room_number": session.room_number if session else "",
            "status": r.status,
            "remarks": r.remarks or ""
        })

    return history
