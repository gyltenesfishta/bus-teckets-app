
from flask import Flask, jsonify, request
from db import get_connection

app = Flask(__name__)

@app.route("/")
def home():
    return "<h1>Bus Tickets App is running! 🚍</h1>"

@app.route("/api/routes")
def api_routes():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, name, origin, destination FROM routes ORDER BY id"
        ).fetchall()
        routes = [dict(r) for r in rows]
    return jsonify(routes)

@app.route("/api/trips")
def api_trips():
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT t.id, t.route_id, r.name AS route_name,
                   t.departure_at, t.base_price, t.total_seats
            FROM trips t
            JOIN routes r ON r.id = t.route_id
            ORDER BY t.departure_at
            """
        ).fetchall()
        trips = [dict(r) for r in rows]
    return jsonify(trips)

# ---------------------------------
#   API: TICKETS + GREEDY ALG
# ---------------------------------
@app.route("/api/tickets", methods=["POST"])
def api_tickets():
    trip_id = request.json.get("trip_id")
    if not trip_id:
        return jsonify({"error": "trip_id is required"}), 400

    with get_connection() as conn:
        # 1. Gjej total seats & base_price
        trip = conn.execute(
            "SELECT total_seats, base_price FROM trips WHERE id = ?",
            (trip_id,)
        ).fetchone()

        if not trip:
            return jsonify({"error": "Trip not found"}), 404

        total_seats = trip["total_seats"]
        base_price = trip["base_price"]

        # 2. Gjej vendet e zëna
        taken_seats = conn.execute(
            "SELECT seat_no FROM tickets WHERE trip_id = ? ORDER BY seat_no",
            (trip_id,)
        ).fetchall()
        taken_seats = {row["seat_no"] for row in taken_seats}

        # 3. ALGORITMI GREEDY – fillon nga mesi
        middle = total_seats // 2
        chosen_seat = None

        for offset in range(total_seats):
            seat1 = middle + offset
            seat2 = middle - offset

            # kontrollo për seat1
            if 1 <= seat1 <= total_seats and seat1 not in taken_seats:
                chosen_seat = seat1
                break

            # kontrollo për seat2
            if 1 <= seat2 <= total_seats and seat2 not in taken_seats:
                chosen_seat = seat2
                break

        if chosen_seat is None:
            return jsonify({"error": "No seats available"}), 400

        # 4. Fut biletën në databazë
        conn.execute(
            "INSERT INTO tickets (trip_id, seat_no, price, status) VALUES (?, ?, ?, 'reserved')",
            (trip_id, chosen_seat, base_price)
        )
        conn.commit()

        # 5. Kthe tiketen
        return jsonify({
            "trip_id": trip_id,
            "seat_no": chosen_seat,
            "price": base_price,
            "status": "reserved"
        })

# ---------------------------------
#   RUN SERVER
# ---------------------------------
if __name__ == "__main__":
    app.run(debug=True)
