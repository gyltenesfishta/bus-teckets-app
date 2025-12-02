from flask import Flask, jsonify, request
import sqlite3
from flask_cors import CORS
from db import get_connection
import hmac
import hashlib
from flask_mail import Mail, Message
import os
import smtplib
import qrcode
from io import BytesIO



app = Flask(__name__)
CORS(app)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = "gyltene.sfishta@gmail.com"
app.config['MAIL_PASSWORD'] = "tishwsyryxeoovhm"   
app.config['MAIL_DEFAULT_SENDER'] = "gyltene.sfishta@gmail.com"

mail = Mail(app)

SECRET_KEY = b"super-secret-key-change-this"

@app.route("/api/tickets", methods=["POST"])
def api_tickets():
    data = request.json or {}

    # nga frontendi po vjen route_id, por fusha quhet "trip_id"
    route_id = data.get("trip_id")
    count = data.get("count", 1)
    email = data.get("email")

    if not email:
        return jsonify({"error": "email is required"}), 400

    if not route_id:
        return jsonify({"error": "trip_id is required"}), 400

    try:
        count = int(count)
    except (TypeError, ValueError):
        return jsonify({"error": "count must be an integer"}), 400

    if count < 1:
        return jsonify({"error": "count must be >= 1"}), 400

    with get_connection() as conn:
        # zgjedhim njërin trip për këtë route_id
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

        # vendet e zëna aktualisht për këtë trip
        taken_rows = conn.execute(
            "SELECT seat_no FROM tickets WHERE trip_id = ? ORDER BY seat_no",
            (trip_id,),
        ).fetchall()
        taken_seats = {row["seat_no"] for row in taken_rows}

        # gjejmë një bllok me 'count' ulëse njera pas tjetrës, sa më afër mesit
        middle = total_seats / 2.0
        best_block = None
        best_distance = None

        for start in range(1, total_seats - count + 2):
            block = list(range(start, start + count))

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

                # HMAC token
                message = f"{trip_id}:{seat_no}".encode("utf-8")
                token = hmac.new(SECRET_KEY, message, hashlib.sha256).hexdigest()

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

    # ----------------- DËRGO EMAILIN KËTU, Brenda funksionit -----------------
    try:
        msg = Message(
            subject="Your Bus Ticket Reservation",
            recipients=[email],
        )

        # text fallback – pa tokena në body, vetëm info bazike
        body_lines = [
            "Thank you for your reservation!",
            f"Route ID: {route_id}",
            f"Number of tickets: {len(tickets)}",
            "",
            "Your tickets are attached as QR codes.",
        ]
        msg.body = "\n".join(body_lines)

        # Për secilën biletë gjenero QR code dhe e bashkangjesim
        for t in tickets:
            token = t["token"]

            qr = qrcode.make(token)
            buffer = BytesIO()
            qr.save(buffer, format="PNG")
            buffer.seek(0)

            msg.attach(
                filename=f"ticket_{t['seat_no']}.png",
                content_type="image/png",
                data=buffer.read()
            )

        mail.send(msg)

    except Exception as e:
        print("Error sending email:", e)

    # Rezultati që ia kthen front-end-it
    result = {
        "trip_id": trip_id,
        "count": len(tickets),
        "tickets": tickets,
    }
    return jsonify(result)


# ---------------------------------------------------
# 2) KONFIRMIMI I PAGESËS /api/tickets/confirm (POST)
# ---------------------------------------------------
@app.route("/api/tickets/confirm", methods=["POST"])
def api_confirm_tickets():
    data = request.json or {}
    tokens = data.get("tokens")

    if not tokens or not isinstance(tokens, list):
        return jsonify({"error": "tokens list is required"}), 400

    with get_connection() as conn:
        placeholders = ",".join(["?"] * len(tokens))

        rows = conn.execute(
            f"""
            SELECT id, token, status
            FROM tickets
            WHERE token IN ({placeholders})
            """,
            tokens,
        ).fetchall()

        if not rows:
            return jsonify({"error": "No tickets found for provided tokens"}), 404

        already_paid = [r["token"] for r in rows if r["status"] == "paid"]
        to_pay_ids = [r["id"] for r in rows if r["status"] == "reserved"]

        if to_pay_ids:
            placeholders_ids = ",".join(["?"] * len(to_pay_ids))
            conn.execute(
                f"UPDATE tickets SET status = 'paid' WHERE id IN ({placeholders_ids})",
                to_pay_ids,
            )
            conn.commit()

        return jsonify({
            "paid_count": len(to_pay_ids),
            "already_paid": already_paid,
            "total_found": len(rows),
            "tokens": tokens,
        })


@app.get("/api/tickets/<token>")
def get_ticket(token):
    conn = sqlite3.connect("app.db")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    row = cur.execute(
        """
        SELECT 
            t.token,
            t.status,
            t.seat_no,
            t.price,
            tr.departure_at,
            r.origin,
            r.destination
        FROM tickets t
        JOIN trips tr ON t.trip_id = tr.id
        JOIN routes r ON tr.route_id = r.id
        WHERE t.token = ?
        """,
        (token,)
    ).fetchone()

    if row is None:
        return jsonify({"error": "Bileta nuk u gjet."}), 404

    return jsonify({
        "token": row["token"],
        "status": row["status"],
        "seat_no": row["seat_no"],
        "price": row["price"],
        "departure_at": row["departure_at"],
        "from": row["origin"],
        "to": row["destination"]
    })





if __name__ == "__main__":
    app.run(debug=True)
