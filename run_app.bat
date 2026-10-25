@echo off
title CampusTrack Attendance App Starter
echo ====================================================
echo Starting CampusTrack Student Attendance System
echo ====================================================

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start cmd /k "cd frontendd && npm run dev"

echo ====================================================
echo Application is starting!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo ====================================================
pause
