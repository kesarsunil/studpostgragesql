from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, get_db_status
from seed_data import seed_database_defaults
from routers import auth, maintainer, faculty, student

app = FastAPI(
    title="Student Attendance System API",
    description="Fullstack FastAPI & PostgreSQL backend for Maintainer, Faculty, and Student portals.",
    version="1.0.0"
)

# CORS Middleware to allow React frontend to connect seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows Vite dev server (http://localhost:5173) and any port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all role-based API routers
app.include_router(auth.router)
app.include_router(maintainer.router)
app.include_router(faculty.router)
app.include_router(student.router)

@app.on_event("startup")
def on_startup():
    print("Initializing database tables and default records...")
    seed_database_defaults()
    # Sync PostgreSQL sequences if connected
    try:
        from database import is_postgres_active
        if is_postgres_active:
            from sync_sequences import tables_with_sequences
            import psycopg, os
            url = os.getenv("DATABASE_URL")
            if url:
                with psycopg.connect(url, autocommit=True) as conn:
                    with conn.cursor() as cur:
                        for table, seq in tables_with_sequences:
                            try:
                                cur.execute(f"SELECT COALESCE(MAX(id), 0) + 1 FROM {table};")
                                next_id = cur.fetchone()[0]
                                cur.execute(f"SELECT setval('{seq}', {next_id}, false);")
                            except Exception:
                                pass
                print("PostgreSQL sequences verified and synchronized.")
    except Exception as e:
        print("Sequence check info:", e)
    print("Student Attendance API is ready and listening.")

@app.get("/api/health")
def health_check():
    db_info = get_db_status()
    return {
        "status": "online",
        "service": "Student Attendance Management System API",
        "database": db_info
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
