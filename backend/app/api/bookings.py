import secrets

from flask import current_app, jsonify, request
from flask_jwt_extended import jwt_required

from ..errors import ApiError
from ..extensions import db
from ..models.booking import ALL_STATUSES, STATUS_FAILED, STATUS_PAID, STATUS_PENDING_PAYMENT, Booking
from ..models.payment import METHOD_CARD, METHOD_TRANSFER, STATUS_FAILED as PAYMENT_FAILED
from ..models.payment import STATUS_PENDING as PAYMENT_PENDING
from ..models.payment import STATUS_SUCCEEDED as PAYMENT_SUCCEEDED
from ..models.payment import SUPPORTED_METHODS, Payment
from ..services.bachs import BachsClient, BachsError, raise_as_api_error, verify_webhook_signature
from ..utils.auth import get_current_user
from . import api_bp


def _json_body() -> dict:
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ApiError("Request body must be JSON", 400, "invalid_body")
    return data


def _bachs_client() -> BachsClient:
    secret_key = current_app.config.get("BACHS_SECRET_KEY")
    if not secret_key:
        raise ApiError("Payments are not configured", 503, "payments_unavailable")
    return BachsClient(secret_key)


@api_bp.post("/bookings")
@jwt_required()
def create_booking():
    """
    POST /bookings — API.pdf section 4.
    Body: { rideId, seat, paymentMethod: "card" | "transfer", price }.

    `price` is accepted here (naira, integer) because there is no Ride model
    yet to look the fare up from. Once Ride exists, replace this with a
    server-side price lookup by rideId and drop the client-supplied price —
    never trust a client-supplied amount for a real payment.
    """
    user = get_current_user()
    body = _json_body()

    ride_id = body.get("rideId")
    seat = body.get("seat")
    method = body.get("paymentMethod")
    price = body.get("price")

    if not isinstance(ride_id, str) or not ride_id.strip():
        raise ApiError("rideId is required", 400, "invalid_ride")
    if not isinstance(seat, int) or seat < 1:
        raise ApiError("seat must be a positive integer", 400, "invalid_seat")
    if method not in SUPPORTED_METHODS:
        raise ApiError(
            f"paymentMethod must be one of: {', '.join(sorted(SUPPORTED_METHODS))}",
            400,
            "invalid_payment_method",
        )
    if not isinstance(price, int) or price <= 0:
        raise ApiError("price must be a positive integer (naira)", 400, "invalid_price")

    # Idempotency-Key support (API.pdf conventions: "Money-moving POSTs accept
    # an Idempotency-Key header"). If the same key was already used for a
    # booking by this user, return that booking instead of creating another.
    idem_key = request.headers.get("Idempotency-Key")
    if idem_key:
        existing = Payment.query.filter_by(reference=idem_key).first()
        if existing and existing.booking.user_id == user.id:
            return jsonify(
                {
                    "bookingId": existing.booking.id,
                    "status": existing.booking.status,
                    "payment": existing.to_dict(),
                }
            ), 200

    # A seat is taken if someone has a pending OR paid booking on it.
    # Failed / expired / cancelled bookings release the seat.
    existing_hold = Booking.query.filter(
        Booking.ride_id == ride_id,
        Booking.seat == seat,
        Booking.status.in_([STATUS_PENDING_PAYMENT, STATUS_PAID]),
    ).first()
    if existing_hold:
        raise ApiError("That seat was just booked.", 409, "seat_taken")

    booking = Booking(user_id=user.id, ride_id=ride_id, seat=seat, price=price)
    db.session.add(booking)
    db.session.flush()  # get booking.id before creating the payment row

    reference = idem_key or f"konvoy_booking_{booking.id}_{secrets.token_hex(4)}"
    payment = Payment(
        booking_id=booking.id,
        method=method,
        amount=price,
        reference=reference,
        status=PAYMENT_PENDING,
    )
    db.session.add(payment)

    frontend_url = (current_app.config.get("FRONTEND_URL") or current_app.config["CORS_ORIGINS"][0]).rstrip("/")
    try:
        session = _bachs_client().create_checkout_session(
            amount_naira=price,
            reference=reference,
            method=method,
            customer_email=f"developersamzy@gmail.com",  # Bachs requires an email; corpers sign up by phone only
            customer_phone=user.phone,
            customer_name=user.full_name,
            success_url=f"{frontend_url}/bookings/{booking.id}/confirmed",
            cancel_url=f"{frontend_url}/book/{ride_id}",

            idempotency_key=reference,
        )
    except BachsError as exc:
        db.session.rollback()
        raise_as_api_error(exc)
        return  # unreachable, keeps type-checkers happy

    payment.checkout_id = session.get("checkout_id")
    payment.checkout_url = session.get("checkout_url")
    db.session.commit()

    return jsonify(
        {
            "bookingId": booking.id,
            "status": booking.status,
            "payment": payment.to_dict(),
        }
    ), 201


@api_bp.get("/bookings/<int:booking_id>")
@jwt_required()
def get_booking(booking_id: int):
    user = get_current_user()
    booking = Booking.query.get(booking_id)
    if booking is None or booking.user_id != user.id:
        raise ApiError("Booking not found", 404, "not_found")
    return jsonify(booking.to_dict()), 200


@api_bp.get("/bookings")
@jwt_required()
def list_bookings():
    user = get_current_user()
    status_filter = request.args.get("status")  # "upcoming" | "past" (API.pdf), kept simple for pilot
    query = Booking.query.filter_by(user_id=user.id)
    if status_filter == "upcoming":
        query = query.filter(Booking.status.in_([STATUS_PENDING_PAYMENT, STATUS_PAID]))
    elif status_filter == "past":
        query = query.filter(Booking.status.in_(["cancelled", "expired", "failed"]))
    bookings = query.order_by(Booking.created_at.desc()).all()
    return jsonify({"items": [b.to_dict() for b in bookings], "nextCursor": None}), 200


@api_bp.post("/bookings/<int:booking_id>/cancel")
@jwt_required()
def cancel_booking(booking_id: int):
    user = get_current_user()
    booking = Booking.query.get(booking_id)
    if booking is None or booking.user_id != user.id:
        raise ApiError("Booking not found", 404, "not_found")
    if booking.status not in (STATUS_PENDING_PAYMENT, STATUS_PAID):
        raise ApiError(f"Booking cannot be cancelled from status {booking.status}", 400, "invalid_state")

    payment = booking.payment
    if booking.status == STATUS_PAID and payment and payment.charge_id:
        try:
            refund = _bachs_client().create_refund(
                charge_id=payment.charge_id,
                reference=f"refund_booking_{booking.id}",
            )
        except BachsError as exc:
            raise_as_api_error(exc)
            return  # unreachable
        payment.refund_id = refund.get("refund_id")
        payment.refund_status = refund.get("status")

    booking.status = "cancelled"
    db.session.commit()
    return jsonify(booking.to_dict()), 200


@api_bp.post("/webhooks/bachs")
def bachs_webhook():
    """
    Public, signature-checked (API.pdf section 4). Source of truth for
    payment state — never trust the success_url redirect alone
    (guides/checkout/checkout-sessions.md warning).
    """
    secret = current_app.config.get("BACHS_WEBHOOK_SECRET")
    if not secret:
        raise ApiError("Webhook not configured", 503, "webhook_unavailable")

    raw_body = request.get_data()
    verified = verify_webhook_signature(
        raw_body=raw_body,
        secret=secret,
        timestamp_header=request.headers.get("X-Bachs-Timestamp"),
        signature_header=request.headers.get("X-Bachs-Signature"),
    )
    if not verified:
        raise ApiError("Invalid signature", 401, "invalid_signature")

    event = request.get_json(silent=True) or {}
    event_type = event.get("type")
    data = event.get("data", {})
    reference = data.get("reference")
    charge_id = data.get("charge_id")

    if not reference:
        # Nothing to match against; ack so Bachs doesn't retry forever, but do nothing.
        return jsonify({"received": True}), 200

    payment = Payment.query.filter_by(reference=reference).first()
    if payment is None:
        return jsonify({"received": True}), 200

    # At-least-once delivery (guides/webhooks/overview.md) — make this idempotent.
    if event_type == "collection.succeeded" and payment.status != PAYMENT_SUCCEEDED:
        payment.status = PAYMENT_SUCCEEDED
        payment.charge_id = charge_id
        payment.booking.status = STATUS_PAID
        db.session.commit()
    elif event_type in ("collection.failed",) and payment.status != PAYMENT_SUCCEEDED:
        payment.status = PAYMENT_FAILED
        payment.failure_reason = data.get("reason")
        payment.booking.status = STATUS_FAILED
        db.session.commit()
    elif event_type == "checkout.expired" and payment.status == PAYMENT_PENDING:
        payment.status = PAYMENT_FAILED
        payment.booking.status = "expired"
        db.session.commit()
    elif event_type in ("refund.paid", "refund.failed"):
        payment.refund_status = "success" if event_type == "refund.paid" else "failed"
        db.session.commit()

    return jsonify({"received": True}), 200