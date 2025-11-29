import sqlite3
from pathlib import Path

# *** GJITHMONË përdor app.db që është në folderin "bus-ticks"
BASE_DIR = Path(__file__).resolve().parent   # C:\Users\Admin\Desktop\bus-ticks
DB_PATH = BASE_DIR / "app.db"
print(">>> USING DB:", DB_PATH)  # për debug

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # lexojmë rezultatet si dictionary
    return conn

def init_db():
    schema_sql = (BASE_DIR / "schema.sql").read_text(encoding="utf-8")
    with get_connection() as conn:
        conn.executescript(schema_sql)
        print("✅ Database initialized (tables created).")

if __name__ == "__main__":
    init_db()

