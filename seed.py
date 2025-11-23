from db import get_connection

def seed():
    with get_connection() as conn:
        cur = conn.cursor()

        # Fshij të dhënat ekzistuese (për zhvillim)
        cur.execute("DELETE FROM tickets;")
        cur.execute("DELETE FROM trips;")
        cur.execute("DELETE FROM routes;")

        # Rutat – DUHET të jenë në të njëjtin rend si në frontend (id 1..9)
        routes = [
            ("Prishtinë - Podujevë",   "Prishtinë", "Podujevë"),
            ("Prishtinë - Fushë Kosovë","Prishtinë", "Fushë Kosovë"),
            ("Prishtinë - Lipjan",     "Prishtinë", "Lipjan"),
            ("Prishtinë - Pejë",       "Prishtinë", "Pejë"),
            ("Prishtinë - Gjilan",     "Prishtinë", "Gjilan"),
            ("Prishtinë - Ferizaj",    "Prishtinë", "Ferizaj"),
            ("Prishtinë - Prizren",    "Prishtinë", "Prizren"),
            ("Prishtinë - Deçan",      "Prishtinë", "Deçan"),
            ("Prishtinë - Malishevë",  "Prishtinë", "Malishevë"),
        ]

        cur.executemany(
            "INSERT INTO routes (name, origin, destination) VALUES (?, ?, ?)",
            routes,
        )

        # Udhëtimet (tripet) – nga route_id 1 deri 9, me çmimet që kemi përdorur
        trips = [
            (1, "2025-11-23 08:00", 1.5, 40),  # Podujevë
            (2, "2025-11-23 08:20", 1.5, 40),  # Fushë Kosovë
            (3, "2025-11-23 08:40", 1.5, 40),  # Lipjan
            (4, "2025-11-23 09:00", 4.5, 40),  # Pejë
            (5, "2025-11-23 09:20", 4.0, 40),  # Gjilan
            (6, "2025-11-23 09:40", 4.0, 40),  # Ferizaj
            (7, "2025-11-23 10:00", 5.0, 40),  # Prizren
            (8, "2025-11-23 10:20", 5.0, 40),  # Deçan
            (9, "2025-11-23 10:40", 3.5, 40),  # Malishevë
        ]

        cur.executemany(
            "INSERT INTO trips (route_id, departure_at, base_price, total_seats) VALUES (?, ?, ?, ?)",
            trips,
        )

        conn.commit()
        print("✅ Seed data inserted (routes & trips).")


if __name__ == "__main__":
    seed()

