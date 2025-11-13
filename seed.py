from db import get_connection

def seed():
    with get_connection() as conn:
        cur = conn.cursor()

        # Fshij të dhënat ekzistuese (për zhvillim)
        cur.execute("DELETE FROM tickets;")
        cur.execute("DELETE FROM trips;")
        cur.execute("DELETE FROM routes;")

        # Rutat
        routes = [
            ("Prishtinë - Pejë", "Prishtinë", "Pejë"),
            ("Prishtinë - Prizren", "Prishtinë", "Prizren"),
            ("Prishtinë - Gjakovë", "Prishtinë", "Gjakovë"),
        ]
        cur.executemany(
            "INSERT INTO routes (name, origin, destination) VALUES (?, ?, ?)",
            routes,
        )

        # Udhëtimet (orare të ndryshme për secilën linjë)
        trips = [
            (1, "2025-11-14 08:00", 5.0, 40),
            (1, "2025-11-14 12:00", 5.0, 40),
            (2, "2025-11-14 09:30", 6.0, 40),
            (2, "2025-11-14 15:00", 6.0, 40),
            (3, "2025-11-14 10:00", 7.0, 40),
        ]
        cur.executemany(
            "INSERT INTO trips (route_id, departure_at, base_price, total_seats) VALUES (?, ?, ?, ?)",
            trips,
        )

        conn.commit()
        print("✅ Seed data inserted (routes & trips).")

if __name__ == "__main__":
    seed()
