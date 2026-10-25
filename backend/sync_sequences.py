import os
from dotenv import load_dotenv
import psycopg

load_dotenv()
url = os.getenv("DATABASE_URL")

tables_with_sequences = [
    ("users", "users_id_seq"),
    ("faculty_profiles", "faculty_profiles_id_seq"),
    ("student_profiles", "student_profiles_id_seq"),
    ("courses", "courses_id_seq"),
    ("faculty_courses", "faculty_courses_id_seq"),
    ("student_courses", "student_courses_id_seq"),
    ("attendance_sessions", "attendance_sessions_id_seq"),
    ("attendance_records", "attendance_records_id_seq")
]

with psycopg.connect(url, autocommit=True) as conn:
    with conn.cursor() as cur:
        for table, seq in tables_with_sequences:
            try:
                cur.execute(f"SELECT COALESCE(MAX(id), 0) + 1 FROM {table};")
                next_id = cur.fetchone()[0]
                cur.execute(f"SELECT setval('{seq}', {next_id}, false);")
                print(f"[SYNCED] {seq} -> next ID will be {next_id}")
            except Exception as e:
                print(f"[SKIP] {seq}: {e}")

print("All PostgreSQL sequences are now synchronized!")
