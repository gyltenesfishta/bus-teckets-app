from flask import Flask, jsonify, request
from db import get_connection
import hmac
import hashlib

SECRET_KEY = b"super-secret-key-change-this"

app = Flask(__name__)

# ------------------ Home ------------------
@app.route("/")
def home():
    return "<h1>Bus Tickets App is running! 🚍</h1>"

# ------------------ Routes list ------------------
@app.route("/api/routes")
def api_routes():
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, name, origin, destination FROM routes ORDER BY id"
        ).fetchall()
        routes = [dict(r) for r in rows]
    return jsonify(routes)

# ------------------ Trips list ------------------
@app.route("/api/trips")
def api_trips():
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT t.id,
                   t.route_id,
                   r.name AS route_name,
                   t.departure_at,
                   t.base_price,
                   t.total_seats
            FROM trips t
            JOIN routes r ON r.id = t.route_id
            ORDER BY t.departure_at
            """
        ).fetchall()
        trips = [dict(r) for r in rows]
    return jsonify(trips)

# ------------------ Book ticket (GREEDY + Dynamic pricing + HMAC) ------------------
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
        taken_rows = conn.execute(
            "SELECT seat_no FROM tickets WHERE trip_id = ? ORDER BY seat_no",
            (trip_id,)
        ).fetchall()
        taken_seats = {row["seat_no"] for row in taken_rows}

        # 3. Llogaris occupancy për dynamic pricing
        sold_count = len(taken_seats)
        occupancy = sold_count / total_seats if total_seats > 0 else 0

        # Dynamic pricing algorithm
        if occupancy < 0.3:
            factor = 1.0
        elif occupancy < 0.7:
            factor = 1.2
        else:
            factor = 1.5

        price = round(base_price * factor, 2)

        # 4. Algoritmi GREEDY – fillon nga mesi
        middle = total_seats // 2
        chosen_seat = None

        for offset in range(total_seats):
            seat1 = middle + offset
            seat2 = middle - offset

            if 1 <= seat1 <= total_seats and seat1 not in taken_seats:
                chosen_seat = seat1
                break

            if 1 <= seat2 <= total_seats and seat2 not in taken_seats:
                chosen_seat = seat2
                break

        if chosen_seat is None:
            return jsonify({"error": "No seats available"}), 400

        # 5. Genero token me HMAC
        message = f"{trip_id}:{chosen_seat}".encode("utf-8")
        token = hmac.new(SECRET_KEY, message, hashlib.sha256).hexdigest()

        # 6. Ruaj biletën – me token
        try:
            conn.execute(
                "INSERT INTO tickets (trip_id, seat_no, price, status, token) "
                "VALUES (?, ?, ?, 'reserved', ?)",
                (trip_id, chosen_seat, price, token)
            )
            conn.commit()
        except Exception as e:
            return jsonify({"error": "Database error", "details": str(e)}), 500

        # 7. Kthe tiketën
        return jsonify({
            "trip_id": trip_id,
            "seat_no": chosen_seat,
            "price": price,
            "status": "reserved",
            "token": token
        })

# ------------------ Start server ------------------
if __name__ == "__main__":
    app.run(debug=True)
