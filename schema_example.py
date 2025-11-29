from db import get_connection

with get_connection() as conn:
    rows = conn.execute(
        "SELECT id, trip_id, seat_no, price, status, token FROM tickets"
    ).fetchall()

    print("Numri i rreshtave në tickets:", len(rows))
    for r in rows:
        print(
            f"id={r['id']}, trip_id={r['trip_id']}, seat={r['seat_no']}, "
            f"status={r['status']}, token={r['token']}"
        )
