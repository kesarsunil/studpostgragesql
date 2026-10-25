import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("attendance_backend")

# PostgreSQL connection string from environment
POSTGRES_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password123@localhost:5432/attendance_db"
)

# SQLite fallback URL
SQLITE_FALLBACK_URL = "sqlite:///./attendance_dev.db"

engine = None
is_postgres_active = False

# Try connecting to PostgreSQL first
try:
    # Test connection with a quick pool timeout
    test_engine = create_engine(
        POSTGRES_DATABASE_URL, 
        pool_pre_ping=True, 
        connect_args={"connect_timeout": 3}
    )
    with test_engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    engine = test_engine
    is_postgres_active = True
    logger.info("Successfully connected to PostgreSQL database!")
except Exception as e:
    logger.warning(
        f"PostgreSQL connection at {POSTGRES_DATABASE_URL} failed ({e}). "
        f"Falling back to local SQLite engine ({SQLITE_FALLBACK_URL}) so backend remains fully operational!"
    )
    engine = create_engine(
        SQLITE_FALLBACK_URL, 
        connect_args={"check_same_thread": False}
    )
    is_postgres_active = False

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_status():
    return {
        "postgres_connected": is_postgres_active,
        "database_url": POSTGRES_DATABASE_URL if is_postgres_active else SQLITE_FALLBACK_URL,
        "engine_type": "PostgreSQL" if is_postgres_active else "SQLite (Local Fallback)"
    }
