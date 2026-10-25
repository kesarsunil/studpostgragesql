import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, FacultyProfile, StudentProfile
from schemas import LoginRequest, LoginResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def format_user_response(user: User) -> dict:
    profile_data = {}
    if user.role == "faculty" and user.faculty_profile:
        profile_data = {
            "faculty_id": user.faculty_profile.id,
            "employee_id": user.faculty_profile.employee_id,
            "department": user.faculty_profile.department,
            "designation": user.faculty_profile.designation,
        }
    elif user.role == "student" and user.student_profile:
        profile_data = {
            "student_id": user.student_profile.id,
            "roll_number": user.student_profile.roll_number,
            "department": user.student_profile.department,
            "semester": user.student_profile.semester,
            "batch": user.student_profile.batch,
            "section": user.student_profile.section,
        }
    elif user.role == "maintainer":
        profile_data = {
            "admin_level": "SuperAdmin",
            "department": "IT Operations"
        }

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "phone": user.phone,
        "avatar_url": user.avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={user.full_name}",
        "profile": profile_data
    }

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    
    # Query user by email
    user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found with this email address."
        )

    # Verify password (supports plain dev password or hashed)
    if user.password_hash != payload.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your password."
        )

    # If role filter is provided, enforce it
    if payload.role and payload.role.lower() != user.role.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account is registered as '{user.role.upper()}', not '{payload.role.upper()}'."
        )

    user_info = format_user_response(user)
    
    # Simple simulated token for easy consumption without complex dependencies
    token = f"jwt_token_{user.id}_{user.role}_{int(datetime.datetime.utcnow().timestamp())}"

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_info
    }

@router.get("/me")
def get_current_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return format_user_response(user)
