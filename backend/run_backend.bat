@echo off
title Student Attendance System - FastAPI Backend
echo ====================================================
echo Starting FastAPI & PostgreSQL Backend Server...
echo ====================================================
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
