from flask import Flask, jsonify, request
from flask_cors import CORS
from db import get_connection
import hmac
import hashlib

SECRET_KEY = b"super-secret-key-change-this"

app = Flask(__name__)
CORS(app)


@app.route("/api/tickets", methods=["POST"])
def api_tickets():
    data = request.json or {}

    # nga frontendi po vjen route_id, por emri i fushës është "trip_id"
    route_id = data.get("trip_id")
    count = data.get("count", 1)

    # validime bazike
    if not route_id:
        return jsonify({"error": "trip_id is required"}), 400

    try:
        count = int(count)
    except (TypeError, ValueError):
        return jsonify({"error": "count must be an integer"}), 400

    if count < 1:
        return jsonify({"error": "count must be >= 1"}), 400

    with get_connection() as conn:
        # Gjejmë një trip për këtë route_id
        trip_row = conn.execute(
            """
            SELECT id AS trip_id, total_seats, base_price
            FROM trips
            WHERE route_id = ?
            ORDER BY departure_at
            LIMIT 1
            """,
            (route_id,),
        ).fetchone()

        if not trip_row:
            return jsonify({"error": "Trip not found"}), 404

        trip_id = trip_row["trip_id"]
        total_seats = trip_row["total_seats"]
        base_price = trip_row["base_price"]

        # Vendet e zëna aktualisht për këtë trip
        taken_rows = conn.execute(
            "SELECT seat_no FROM tickets WHERE trip_id = ? ORDER BY seat_no",
            (trip_id,),
        ).fetchall()
        taken_seats = {row["seat_no"] for row in taken_rows}

        # Gjej një bllok me 'count' ulëse njera pas tjetrës,
        # sa më afër mesit të autobusit
        middle = total_seats / 2.0
        best_block = None
        best_distance = None

        # start nga 1 deri te (total_seats - count + 1)
        for start in range(1, total_seats - count + 2):
            block = list(range(start, start + count))

            # nëse ndonjë prej këtyre ulëseve është e zënë, kalojmë te tjetra
            if any(seat in taken_seats for seat in block):
                continue

            center = start + (count - 1) / 2.0
            distance = abs(center - middle)

            if best_block is None or distance < best_distance:
                best_block = block
                best_distance = distance

        if best_block is None:
            return jsonify({"error": "Not enough adjacent seats available"}), 400

        tickets = []

        try:
            for i, seat_no in enumerate(best_block):
                # sa bileta janë shitur deri tani (për llogaritje të occupancy)
                sold_count = len(taken_seats) + i
                occupancy = sold_count / total_seats if total_seats > 0 else 0

                # Dynamic pricing
                if occupancy < 0.3:
                    factor = 1.0
                elif occupancy < 0.7:
                    factor = 1.2
                else:
                    factor = 1.5

                price = round(base_price * factor, 2)

                # HMAC token për këtë biletë
                message = f"{trip_id}:{seat_no}".encode("utf-8")
                token = hmac.new(SECRET_KEY, message, hashlib.sha256).hexdigest()

                # Ruaj biletën në DB
                conn.execute(
                    """
                    INSERT INTO tickets (trip_id, seat_no, price, status, token)
                    VALUES (?, ?, ?, 'reserved', ?)
                    """,
                    (trip_id, seat_no, price, token),
                )

                tickets.append(
                    {
                        "seat_no": seat_no,
                        "price": price,
                        "status": "reserved",
                        "token": token,
                    }
                )

            conn.commit()
        except Exception as e:
            conn.rollback()
            return jsonify({"error": "Database error", "details": str(e)}), 500

        return jsonify(
            {
                "trip_id": trip_id,
                "count": len(tickets),
                "tickets": tickets,
            }
        )


if __name__ == "__main__":
    app.run(debug=True)
