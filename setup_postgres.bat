@echo off
title PostgreSQL Database Setup
echo ====================================================
echo Connecting to PostgreSQL and creating attendance_db...
echo ====================================================
python backend\setup_postgres.py
pause
