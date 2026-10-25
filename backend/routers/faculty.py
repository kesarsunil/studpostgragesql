import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import (
    FacultyProfile, Course, FacultyCourse, StudentCourse, 
    StudentProfile, AttendanceSession, AttendanceRecord, User
)
from schemas import MarkAttendanceRequest

router = APIRouter(prefix="/api/faculty", tags=["Faculty Portal"])

# 1. Faculty Dashboard Stats
@router.get("/dashboard")
def get_faculty_dashboard(faculty_id: int = Query(...), db: Session = Depends(get_db)):
    faculty = db.query(FacultyProfile).filter(FacultyProfile.id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")

    courses_assigned = db.query(FacultyCourse).filter(FacultyCourse.faculty_id == faculty_id).all()
    course_ids = [fc.course_id for fc in courses_assigned]
    
    total_courses = len(course_ids)
    
    # Total unique students in these courses
    student_ids = db.query(StudentCourse.student_id).filter(StudentCourse.course_id.in_(course_ids)).distinct().all()
    total_students = len(student_ids)

    # Sessions conducted by this faculty
    sessions = db.query(AttendanceSession).filter(AttendanceSession.faculty_id == faculty_id).all()
    total_sessions = len(sessions)

    # Calculate average attendance across these sessions
    session_ids = [s.id for s in sessions]
    total_records = db.query(AttendanceRecord).filter(AttendanceRecord.session_id.in_(session_ids)).count() if session_ids else 0
    present_records = db.query(AttendanceRecord).filter(
        AttendanceRecord.session_id.in_(session_ids), 
        AttendanceRecord.status == "present"
    ).count() if session_ids else 0
    
    avg_attendance = round((present_records / total_records * 100), 1) if total_records > 0 else 92.0

    return {
        "faculty_name": faculty.user.full_name,
        "employee_id": faculty.employee_id,
        "department": faculty.department,
        "total_courses": total_courses,
        "total_students": total_students,
        "total_sessions_conducted": total_sessions,
        "average_attendance": avg_attendance
    }

# 2. Get Assigned Courses for this Faculty
@router.get("/courses")
def get_faculty_courses(faculty_id: int = Query(...), db: Session = Depends(get_db)):
    assignments = db.query(FacultyCourse).filter(FacultyCourse.faculty_id == faculty_id).all()
    result = []
    for a in assignments:
        course = a.course
        enrolled_count = db.query(StudentCourse).filter(StudentCourse.course_id == course.id).count()
        sessions_count = db.query(AttendanceSession).filter(
            AttendanceSession.course_id == course.id,
            AttendanceSession.faculty_id == faculty_id
        ).count()

        result.append({
            "course_id": course.id,
            "course_code": course.course_code,
            "course_name": course.course_name,
            "department": course.department,
            "semester": course.semester,
            "section": a.section,
            "academic_year": a.academic_year,
            "enrolled_students": enrolled_count,
            "sessions_taken": sessions_count
        })
    return result

# 3. Get Student Roster for a specific course (for taking attendance)
@router.get("/courses/{course_id}/students")
def get_course_students(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollments = db.query(StudentCourse).filter(StudentCourse.course_id == course_id).all()
    student_ids = [e.student_id for e in enrollments]

    students = db.query(StudentProfile).filter(StudentProfile.id.in_(student_ids)).join(User).all()

    roster = []
    for s in students:
        # Calculate current attendance percentage for this specific course
        course_sessions = db.query(AttendanceSession.id).filter(AttendanceSession.course_id == course_id).all()
        session_ids = [cs[0] for cs in course_sessions]

        total_classes = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == s.id,
            AttendanceRecord.session_id.in_(session_ids)
        ).count() if session_ids else 0

        attended_classes = db.query(AttendanceRecord).filter(
            AttendanceRecord.student_id == s.id,
            AttendanceRecord.session_id.in_(session_ids),
            AttendanceRecord.status == "present"
        ).count() if session_ids else 0

        current_pct = round((attended_classes / total_classes * 100), 1) if total_classes > 0 else 100.0

        roster.append({
            "student_id": s.id,
            "user_id": s.user.id,
            "roll_number": s.roll_number,
            "full_name": s.user.full_name,
            "email": s.user.email,
            "department": s.department,
            "section": s.section,
            "current_attendance_pct": current_pct,
            "classes_attended": attended_classes,
            "total_classes": total_classes
        })

    # Sort by roll number
    roster.sort(key=lambda x: x["roll_number"])
    return {
        "course_id": course.id,
        "course_code": course.course_code,
        "course_name": course.course_name,
        "students": roster
    }

# 4. Submit Attendance (Faculty records lecture attendance)
@router.post("/attendance")
def record_attendance(payload: MarkAttendanceRequest, faculty_id: int = Query(...), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Parse date
    session_date = datetime.date.today()
    if payload.session_date:
        try:
            session_date = datetime.datetime.strptime(payload.session_date, "%Y-%m-%d").date()
        except ValueError:
            session_date = datetime.date.today()

    # Create new attendance session
    new_session = AttendanceSession(
        course_id=payload.course_id,
        faculty_id=faculty_id,
        session_date=session_date,
        session_time=payload.session_time or "10:00 AM",
        topic=payload.topic or "Course Lecture",
        room_number=payload.room_number or "Room 101"
    )
    db.add(new_session)
    db.flush()

    present_count = 0
    absent_count = 0
    late_count = 0

    for rec in payload.records:
        stat = rec.status.lower()
        if stat == "present":
            present_count += 1
        elif stat == "late":
            late_count += 1
        else:
            absent_count += 1

        record = AttendanceRecord(
            session_id=new_session.id,
            student_id=rec.student_id,
            status=stat,
            remarks=rec.remarks
        )
        db.add(record)

    db.commit()

    return {
        "message": "Attendance successfully recorded!",
        "session_id": new_session.id,
        "course_code": course.course_code,
        "session_date": str(session_date),
        "total_marked": len(payload.records),
        "present": present_count,
        "absent": absent_count,
        "late": late_count,
        "percentage": round(((present_count + late_count) / len(payload.records) * 100), 1) if payload.records else 0
    }

# 5. Attendance History for Faculty
@router.get("/attendance-history")
def get_attendance_history(faculty_id: int = Query(...), course_id: int = Query(None), db: Session = Depends(get_db)):
    query = db.query(AttendanceSession).filter(AttendanceSession.faculty_id == faculty_id)
    if course_id:
        query = query.filter(AttendanceSession.course_id == course_id)

    sessions = query.order_by(AttendanceSession.session_date.desc(), AttendanceSession.id.desc()).all()
    result = []

    for s in sessions:
        records = db.query(AttendanceRecord).filter(AttendanceRecord.session_id == s.id).all()
        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        late = sum(1 for r in records if r.status == "late")
        absent = sum(1 for r in records if r.status == "absent")
        pct = round(((present + 0.5 * late) / total * 100), 1) if total > 0 else 0

        result.append({
            "session_id": s.id,
            "course_id": s.course_id,
            "course_code": s.course.course_code if s.course else "",
            "course_name": s.course.course_name if s.course else "",
            "session_date": str(s.session_date),
            "session_time": s.session_time,
            "topic": s.topic,
            "room_number": s.room_number,
            "total_students": total,
            "present_count": present,
            "late_count": late,
            "absent_count": absent,
            "attendance_rate": pct
        })
    return result

# 6. Detailed Session View
@router.get("/attendance-session/{session_id}")
def get_session_details(session_id: int, db: Session = Depends(get_db)):
    session = db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    records = db.query(AttendanceRecord).filter(AttendanceRecord.session_id == session_id).join(StudentProfile).join(User).all()
    record_list = []
    for r in records:
        record_list.append({
            "student_id": r.student_id,
            "roll_number": r.student.roll_number,
            "full_name": r.student.user.full_name,
            "status": r.status,
            "remarks": r.remarks,
            "marked_at": str(r.marked_at)
        })

    return {
        "session_id": session.id,
        "course_code": session.course.course_code if session.course else "",
        "course_name": session.course.course_name if session.course else "",
        "session_date": str(session.session_date),
        "session_time": session.session_time,
        "topic": session.topic,
        "room_number": session.room_number,
        "records": record_list
    }
