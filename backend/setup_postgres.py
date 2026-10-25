"""
Automated PostgreSQL Setup Script
Only asks for your password!
"""
import sys
import os
import psycopg
from psycopg import sql

def main():
    print("=" * 60)
    print("  POSTGRESQL DATABASE INITIALIZER FOR STUDENT ATTENDANCE")
    print("=" * 60)

    host = "localhost"
    port = 5432
    user = "postgres"

    print(f"Connecting to local PostgreSQL on port {port} as user '{user}'...\n")
    password = input("Enter your PostgreSQL Password (e.g. Kesar$777): ").strip()

    try:
        # Connect to default maintenance database
        conn = psycopg.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            dbname="postgres",
            autocommit=True
        )
        print("\n✓ Successfully connected to PostgreSQL server!")

        # Physical data directory
        with conn.cursor() as cur:
            cur.execute("SHOW data_directory;")
            data_dir = cur.fetchone()[0]
            print(f"✓ Physical data directory on disk: {data_dir}")

            # Check if attendance_db exists
            cur.execute("SELECT 1 FROM pg_database WHERE datname = 'attendance_db'")
            exists = cur.fetchone()
            if not exists:
                print("Creating database 'attendance_db'...")
                cur.execute(sql.SQL("CREATE DATABASE attendance_db"))
                print("✓ Database 'attendance_db' created successfully!")
            else:
                print("✓ Database 'attendance_db' already exists.")

        conn.close()

        # Connect to attendance_db and load init.sql
        print("\nLoading tables and seed data into 'attendance_db'...")
        db_conn = psycopg.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            dbname="attendance_db",
            autocommit=True
        )

        init_sql_path = os.path.join(os.path.dirname(__file__), "..", "database", "init.sql")
        if os.path.exists(init_sql_path):
            with open(init_sql_path, "r", encoding="utf-8") as f:
                init_script = f.read()
            with db_conn.cursor() as cur:
                cur.execute(init_script)
            print("✓ All tables created and initial records loaded!")
        db_conn.close()

        # Update backend/.env file
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        new_url = f"postgresql://{user}:{password}@{host}:{port}/attendance_db"

        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
            with open(env_path, "w", encoding="utf-8") as f:
                for line in lines:
                    if line.startswith("DATABASE_URL="):
                        f.write(f"DATABASE_URL={new_url}\n")
                    else:
                        f.write(line)
            print(f"✓ Updated backend/.env to connect to PostgreSQL!")

        print("\n" + "=" * 60)
        print("🎉 SUCCESS! Your PostgreSQL database is fully set up and connected!")
        print("Now open pgAdmin to see 'attendance_db' -> Schemas -> public -> Tables.")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Could not connect with that password: {e}")
        print("Please verify the password you set when installing PostgreSQL.")

if __name__ == "__main__":
    main()
