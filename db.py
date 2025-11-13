import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("app.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # me e lexu rezultatin si dictionary
    return conn

def init_db():
    with get_connection() as conn:
        schema_sql = Path(__file__).with_name("schema.sql").read_text(encoding="utf-8")
        conn.executescript(schema_sql)
        print("✅ Database initialized (tables created).")

if __name__ == "__main__":
    init_db()
