import sqlite3

conn = sqlite3.connect("app.db")
cur = conn.cursor()

rows = cur.execute("SELECT id, departure_at FROM trips").fetchall()

for trip_id, dep in rows:
    if " " in dep and "T" not in dep:
        new_dep = dep.replace(" ", "T", 1)
        cur.execute(
            "UPDATE trips SET departure_at = ? WHERE id = ?",
            (new_dep, trip_id)
        )
        print("Fixed:", dep, "→", new_dep)

conn.commit()
conn.close()
print("Done.")
