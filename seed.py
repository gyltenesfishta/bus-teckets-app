from db import get_connection
from datetime import datetime, timedelta


def seed():
    with get_connection() as conn:
        cur = conn.cursor()

        # Fshij të dhënat ekzistuese (për zhvillim)
        cur.execute("DELETE FROM tickets;")
        cur.execute("DELETE FROM trips;")
        cur.execute("DELETE FROM routes;")

        # Rutat – DUHET të jenë në të njëjtin rend si në frontend (id 1..9)
        routes = [
            ("Prishtinë - Podujevë",    "Prishtinë", "Podujevë"),
            ("Prishtinë - Fushë Kosovë","Prishtinë", "Fushë Kosovë"),
            ("Prishtinë - Lipjan",      "Prishtinë", "Lipjan"),
            ("Prishtinë - Pejë",        "Prishtinë", "Pejë"),
            ("Prishtinë - Gjilan",      "Prishtinë", "Gjilan"),
            ("Prishtinë - Ferizaj",     "Prishtinë", "Ferizaj"),
            ("Prishtinë - Prizren",     "Prishtinë", "Prizren"),
            ("Prishtinë - Deçan",       "Prishtinë", "Deçan"),
            ("Prishtinë - Malishevë",   "Prishtinë", "Malishevë"),
        ]

        cur.executemany(
            "INSERT INTO routes (name, origin, destination) VALUES (?, ?, ?)",
            routes,
        )
        now = datetime.now()

        trip_defs = [
            # (route_id, offset_minuta, base_price)
            (1, 30, 1.5),   # Podujevë  pas 30 min
            (2, 50, 1.5),   # Fushë Kosovë pas 50 min
            (3, 70, 1.5),   # Lipjan    pas 70 min
            (4, 90, 4.5),   # Pejë      pas 90 min
            (5, 110, 4.0),  # Gjilan    pas 110 min
            (6, 130, 4.0),  # Ferizaj   pas 130 min
            (7, 150, 5.0),  # Prizren   pas 150 min
            (8, 170, 5.0),  # Deçan     pas 170 min
            (9, 190, 3.5),  # Malishevë pas 190 min
        ]

        trips = []
        for route_id, offset_min, base_price in trip_defs:
            departure_at = (now + timedelta(minutes=offset_min)).isoformat(timespec="minutes")
            trips.append((route_id, departure_at, base_price, 40))

        cur.executemany(
            "INSERT INTO trips (route_id, departure_at, base_price, total_seats) "
            "VALUES (?, ?, ?, ?)",
            trips,
        )

        conn.commit()
        print("✅ Seed data inserted (routes & trips).")


if __name__ == "__main__":
    seed()
