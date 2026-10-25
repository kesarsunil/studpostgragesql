FROM postgres:16-alpine

# Default environment configuration (can be overridden by docker-compose)
ENV POSTGRES_DB=attendance_db \
    POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=password123

# Copy the complete initialization script (schema + seed data)
# PostgreSQL automatically executes all .sql scripts in this directory on first container boot
COPY init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432

# Health check to ensure PostgreSQL is ready to accept connections
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=5 \
    CMD pg_isready -U postgres -d attendance_db || exit 1
