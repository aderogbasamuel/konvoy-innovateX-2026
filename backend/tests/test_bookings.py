import hashlib
import hmac
import json
import time
from unittest.mock import patch
 
from app.extensions import db
from app.models.booking import Booking
from app.models.payment import Payment
 
 
def _auth_headers(login):
    token = login().get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
 
 
def _fake_checkout_session(**kwargs):
    return {
        "checkout_id": "chk_test123",
        "checkout_url": "https://checkout.bachs.io/c/test123",
        "status": "open",
    }
 
 
def test_create_booking_starts_checkout(client, login):
    headers = _auth_headers(login)
    with patch("app.api.bookings.BachsClient.create_checkout_session", side_effect=_fake_checkout_session):
        r = client.post(
            "/api/bookings",
            headers=headers,
            json={"rideId": "greenline-2026-10-27", "seat": 4, "paymentMethod": "card", "price": 18000},
        )
    assert r.status_code == 201
    body = r.get_json()
    assert body["status"] == "pending_payment"
    assert body["payment"]["checkoutUrl"] == "https://checkout.bachs.io/c/test123"
 
    booking = Booking.query.get(body["bookingId"])
    assert booking.price == 18000
    assert booking.payment.checkout_id == "chk_test123"
 
 
def test_seat_already_held_returns_409(client, login):
    headers = _auth_headers(login)
    with patch("app.api.bookings.BachsClient.create_checkout_session", side_effect=_fake_checkout_session):
        client.post(
            "/api/bookings",
            headers=headers,
            json={"rideId": "greenline-2026-10-27", "seat": 7, "paymentMethod": "card", "price": 18000},
        )
        r = client.post(
            "/api/bookings",
            headers=headers,
            json={"rideId": "greenline-2026-10-27", "seat": 7, "paymentMethod": "transfer", "price": 18000},
        )
    assert r.status_code == 409
    assert r.get_json()["error"]["code"] == "seat_taken"
 
 
def test_invalid_payment_method_rejected(client, login):
    headers = _auth_headers(login)
    r = client.post(
        "/api/bookings",
        headers=headers,
        json={"rideId": "x", "seat": 1, "paymentMethod": "ussd", "price": 1000},
    )
    assert r.status_code == 400
    assert r.get_json()["error"]["code"] == "invalid_payment_method"
 
 
def _sign(body: bytes, secret: str, timestamp: int) -> str:
    message = f"{timestamp}.".encode() + body
    return hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
 
 
def test_webhook_marks_booking_paid(app, client, login):
    headers = _auth_headers(login)
    with patch("app.api.bookings.BachsClient.create_checkout_session", side_effect=_fake_checkout_session):
        r = client.post(
            "/api/bookings",
            headers=headers,
            json={"rideId": "ride-1", "seat": 2, "paymentMethod": "card", "price": 5000},
        )
    booking_id = r.get_json()["bookingId"]
    payment = Payment.query.filter_by(booking_id=booking_id).one()
 
    event = {
        "id": "evt_1",
        "type": "collection.succeeded",
        "data": {"charge_id": "ch_abc", "reference": payment.reference, "status": "SUCCEEDED"},
    }
    raw = json.dumps(event).encode()
    ts = str(int(time.time()))
    sig = _sign(raw, app.config["BACHS_WEBHOOK_SECRET"], int(ts))
 
    r = client.post(
        "/api/webhooks/bachs",
        data=raw,
        content_type="application/json",
        headers={"X-Bachs-Timestamp": ts, "X-Bachs-Signature": sig},
    )
    assert r.status_code == 200
 
    booking = Booking.query.get(booking_id)
    assert booking.status == "paid"
    assert booking.payment.status == "succeeded"
    assert booking.payment.charge_id == "ch_abc"
 
 
def test_webhook_rejects_bad_signature(client):
    event = {"id": "evt_1", "type": "collection.succeeded", "data": {"reference": "nope"}}
    raw = json.dumps(event).encode()
    r = client.post(
        "/api/webhooks/bachs",
        data=raw,
        content_type="application/json",
        headers={"X-Bachs-Timestamp": str(int(time.time())), "X-Bachs-Signature": "deadbeef"},
    )
    assert r.status_code == 401
 
 
def test_paid_seat_cannot_be_booked_again(app, client, login):
    headers = _auth_headers(login)
    with patch("app.api.bookings.BachsClient.create_checkout_session", side_effect=_fake_checkout_session):
        r = client.post(
            "/api/bookings",
            headers=headers,
            json={"rideId": "ride-9", "seat": 5, "paymentMethod": "card", "price": 5000},
        )
        booking = db.session.get(Booking, r.get_json()["bookingId"])
        booking.status = "paid"
        db.session.commit()
 
        r = client.post(
            "/api/bookings",
            headers=headers,
            json={"rideId": "ride-9", "seat": 5, "paymentMethod": "card", "price": 5000},
        )
    assert r.status_code == 409
    assert r.get_json()["error"]["code"] == "seat_taken"