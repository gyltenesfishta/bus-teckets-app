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
from datetime import datetime, timedelta
import stripe
from flask import Flask, request, jsonify

stripe.api_key = "sk_test_51Sa08OLEYnCumwJRFHnSnI63SaAfohFjJI9wkPXYlIRdexcahCdeonHDJ6Vx0PqNL9kyKCfjHuSHfnt4AtY4LBfD004VxdqPy9"

STRIPE_WEBHOOK_SECRET = "whsec_d6348e43b184b3074ba89b7ba5b9ad541c5c61ccc9d5838136761963722df5b5"




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

    route_id = data.get("trip_id")
    adults = data.get("adults", 0)
    children = data.get("children", 0)
    email = data.get("email")

    if not email:
        return jsonify({"error": "email is required"}), 400

    if not route_id:
        return jsonify({"error": "trip_id is required"}), 400

    # Sigurohemi që janë numra
    try:
        adults = int(adults)
        children = int(children)
    except (TypeError, ValueError):
        return jsonify({"error": "adults/children must be integers"}), 400

    if adults < 0 or children < 0:
        return jsonify({"error": "adults/children must be >= 0"}), 400

    count = adults + children
    if count < 1:
        return jsonify({"error": "At least 1 passenger is required"}), 400

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

                base_seat_price = round(base_price * factor, 2)

                # Zbritja 10% për children
                if i < adults:
                    # këto vende i llogarisim për adult
                    price = base_seat_price
                    passenger_type = "adult"
                else:
                    # pjesa tjetër e vendeve janë children → -10%
                    price = round(base_seat_price * 0.9, 2)
                    passenger_type = "child"

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
                        "passenger_type": passenger_type,
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

        # Teksti i email-it: info + seat & price për secilën biletë
        body_lines = [
            "Thank you for your reservation!",
            f"Route ID: {route_id}",
            f"Number of tickets: {len(tickets)}",
            "",
            "Ticket details:",
        ]

        for t in tickets:
            line = f"- Seat: {t['seat_no']}  |  Price: {t['price']} €"
            if t.get("passenger_type") == "child":
                line += "  (Child -10%)"
            body_lines.append(line)

        body_lines.append("")
        body_lines.append("Your tickets are attached as QR codes.")

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

    # ---- VALIDITY WINDOW ----
    departure = datetime.fromisoformat(row["departure_at"])
    now = datetime.now()

    valid_from = departure - timedelta(hours=1)
    valid_until = departure + timedelta(hours=1)

    if now < valid_from:
        return jsonify({
            "error": "Ticket not valid yet.",
            "status": "not_valid_yet",
            "departure_at": row["departure_at"]
        }), 400

    if now > valid_until:
        return jsonify({
            "error": "Ticket expired.",
            "status": "expired",
            "departure_at": row["departure_at"]
        }), 400

  

    return jsonify({
        "token": row["token"],
        "status": row["status"],
        "seat_no": row["seat_no"],
        "price": row["price"],
        "departure_at": row["departure_at"],
        "from": row["origin"],
        "to": row["destination"]
    })


@app.post("/api/tickets/<token>/checkin")
def checkin_ticket(token):
    with get_connection() as conn:
        row = conn.execute(
            """
            SELECT t.id, t.status, tr.departure_at
            FROM tickets t
            JOIN trips tr ON t.trip_id = tr.id
            WHERE t.token = ?
            """,
            (token,),
        ).fetchone()

        if not row:
            return jsonify({"error": "Ticket not found"}), 404

        status = row["status"]

        # kontrolli i pageses
        if status == "reserved":
            return jsonify({"error": "Ticket is not paid yet."}), 400

        if status == "used":
            return jsonify({"error": "Ticket already used."}), 400

        # ---- VALIDITY CHECK ----
        from datetime import datetime, timedelta

        departure = datetime.fromisoformat(row["departure_at"])
        now = datetime.now()

        valid_from = departure - timedelta(hours=1)
        valid_until = departure + timedelta(hours=1)

        if now < valid_from:
            return jsonify({"error": "Ticket not valid yet."}), 400

        if now > valid_until:
            return jsonify({"error": "Ticket expired."}), 400


        # check-in OK
        conn.execute(
            "UPDATE tickets SET status = 'used' WHERE id = ?",
            (row["id"],),
        )
        conn.commit()

    return jsonify({"ok": True, "status": "used"})
    

@app.get("/api/stats/routes")
def stats_routes():
    """
    Kthen statistika bazë për çdo linjë:
    - emri i routes
    - numri i biletave të shitura (paid + used)
    - të ardhurat totale
    - çmimi mesatar
    """
    with get_connection() as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        rows = cur.execute(
            """
            SELECT
                r.name AS route_name,
                COUNT(t.id) AS tickets_sold,
                COALESCE(SUM(t.price), 0) AS total_revenue,
                CASE
                    WHEN COUNT(t.id) > 0 THEN ROUND(AVG(t.price), 2)
                    ELSE 0
                END AS avg_price
            FROM routes r
            LEFT JOIN trips tr ON tr.route_id = r.id
            LEFT JOIN tickets t ON t.trip_id = tr.id
                  AND t.status IN ('paid', 'used')
            GROUP BY r.id
            ORDER BY r.id;
            """
        ).fetchall()

    stats = []
    for row in rows:
        stats.append({
            "route_name": row["route_name"],
            "tickets_sold": row["tickets_sold"],
            "total_revenue": row["total_revenue"],
            "avg_price": row["avg_price"],
        })

    return jsonify({"routes": stats})

@app.route("/api/payments/create-checkout-session", methods=["POST"])
def create_checkout_session():
    data = request.get_json() or {}
    tokens = data.get("tokens", [])
    amount = data.get("amount")  # në cent (p.sh. 400 = 4.00 €)
    email = data.get("email")

    if not tokens or not amount:
        return {"error": "Missing tokens or amount"}, 400

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": f"Bus tickets ({len(tokens)} passenger(s))",
                        },
                        "unit_amount": int(amount),  # në cent
                    },
                    "quantity": 1,
                }
            ],
            success_url="http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:5173/payment-cancelled",
            customer_email=email,
            metadata={
                "ticket_tokens": ",".join(tokens),
            },
        )

        return {"url": session.url}
    except Exception as e:
        print("Stripe error:", e)
        return {"error": "Failed to create checkout session"}, 500


@app.route("/api/stripe/webhook", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        print("❌ Invalid payload")
        return "", 400
    except stripe.error.SignatureVerificationError:
        print("❌ Invalid signature")
        return "", 400

    print("✅ Webhook event received:", event["type"])

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        # lexojmë token-at e biletave nga metadata (nga create_checkout_session)
        metadata = session.get("metadata", {}) or {}
        tokens_str = metadata.get("ticket_tokens", "")
        tokens = [t for t in tokens_str.split(",") if t]

        print("💳 Payment completed for tokens:", tokens)

        if tokens:
            # Pjesa POSHTË është e njëjtë me api_confirm_tickets, por pa kthyer JSON
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
                    print("⚠️ No tickets found for provided tokens in webhook.")
                else:
                    already_paid = [r["token"] for r in rows if r["status"] == "paid"]
                    to_pay_ids = [r["id"] for r in rows if r["status"] == "reserved"]

                    if to_pay_ids:
                        placeholders_ids = ",".join(["?"] * len(to_pay_ids))
                        conn.execute(
                            f"UPDATE tickets SET status = 'paid' WHERE id IN ({placeholders_ids})",
                            to_pay_ids,
                        )
                        conn.commit()

                    print(
                        f"✅ Tickets updated via webhook. "
                        f"paid_count={len(to_pay_ids)}, already_paid={already_paid}, tokens={tokens}"
                    )
        else:
            print("⚠️ No ticket_tokens found in session metadata.")

    # Stripe pret vetëm një status 2xx, s’ka nevojë për JSON
    return "", 200


if __name__ == "__main__":
    app.run(debug=True)