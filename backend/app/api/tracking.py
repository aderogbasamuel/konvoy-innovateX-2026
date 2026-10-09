import os
import secrets
from datetime import timedelta

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db, limiter
from ..models.booking import STATUS_PAID, Booking  # adjust if Booking lives in another file
from ..models.tracking import TrackingSession
from ..utils.time import utcnow
from . import api_bp
from math import asin, cos, radians, sin, sqrt

from ..models.transport import Ride
from ..models.user import User

LINK_LIFETIME = timedelta(hours=48)
STALE_AFTER = timedelta(minutes=2)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://konvoyapp.vercel.app")


def _own_paid_booking(booking_id):
    b = db.session.get(Booking, booking_id)
    if not b or b.user_id != int(get_jwt_identity()):
        return None, (jsonify(error="Booking not found"), 404)
    if b.status != STATUS_PAID:
        return None, (jsonify(error="Tracking is available once the booking is paid"), 409)
    return b, None


def _active_session(booking_id):
    now = utcnow()
    return TrackingSession.query.filter(
        TrackingSession.booking_id == booking_id,
        TrackingSession.revoked_at.is_(None),
        TrackingSession.expires_at > now,
    ).first()


# ---- corper: create / revoke the share link ----

@api_bp.post("/bookings/<int:booking_id>/tracking")
@jwt_required()
def create_tracking(booking_id):
    b, err = _own_paid_booking(booking_id)
    if err:
        return err
    s = _active_session(b.id)
    if s is None:
        s = TrackingSession(
            booking_id=b.id,
            token=secrets.token_urlsafe(24),
            expires_at=utcnow() + LINK_LIFETIME,
        )
        db.session.add(s)
        db.session.commit()
    return jsonify({
        "token": s.token,
        "shareUrl": f"{FRONTEND_URL}/track/{s.token}",
        "expiresAt": s.expires_at.isoformat() + "Z",
    }), 201


@api_bp.delete("/bookings/<int:booking_id>/tracking")
@jwt_required()
def revoke_tracking(booking_id):
    b = db.session.get(Booking, booking_id)
    if not b or b.user_id != int(get_jwt_identity()):
        return jsonify(error="Booking not found"), 404
    for s in TrackingSession.query.filter_by(booking_id=b.id, revoked_at=None).all():
        s.revoked_at = utcnow()
    db.session.commit()
    return jsonify(ok=True)


# ---- corper's phone: send location ----

@api_bp.post("/tracking/<token>/location")
@jwt_required()
@limiter.limit("20 per minute")
def update_location(token):
    s = TrackingSession.query.filter_by(token=token).first()
    if not s or s.revoked_at or s.expires_at <= utcnow():
        return jsonify(error="Tracking link not active"), 404
    b = db.session.get(Booking, s.booking_id)
    if not b or b.user_id != int(get_jwt_identity()):
        return jsonify(error="Not allowed"), 403
    data = request.get_json(silent=True) or {}
    try:
        lat, lng = float(data["lat"]), float(data["lng"])
    except (KeyError, TypeError, ValueError):
        return jsonify(error="lat and lng are required numbers"), 400
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        return jsonify(error="lat/lng out of range"), 400
    s.last_lat, s.last_lng, s.last_seen_at = lat, lng, utcnow()
    db.session.commit()
    return jsonify(ok=True)


# ---- family: public, no login ----

@api_bp.get("/tracking/<token>")
@limiter.limit("60 per minute")
# Approximate state-capital coordinates, for rough progress only. Add states as routes grow.
STATE_COORDS = {
    "lagos": (6.5244, 3.3792), "ogun": (7.1475, 3.3619), "oyo": (7.3775, 3.9470),
    "kaduna": (10.5105, 7.4165), "abuja": (9.0765, 7.3986), "kano": (12.0022, 8.5920),
    "rivers": (4.8156, 7.0498), "enugu": (6.4584, 7.5464),
}


def _km(a, b):
    la1, lo1, la2, lo2 = map(radians, (*a, *b))
    h = sin((la2 - la1) / 2) ** 2 + cos(la1) * cos(la2) * sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * asin(sqrt(h))


@api_bp.get("/tracking/<token>")
@limiter.limit("60 per minute")
def view_tracking(token):
    s = TrackingSession.query.filter_by(token=token).first()
    if not s:
        return jsonify(error="Tracking link not found"), 404
    if s.revoked_at or s.expires_at <= utcnow():
        return jsonify(error="This tracking link is no longer active"), 410

    b = db.session.get(Booking, s.booking_id)
    ride = db.session.get(Ride, int(b.ride_id)) if b and str(b.ride_id).isdigit() else None
    user = db.session.get(User, b.user_id) if b else None
    first_name = ((user.full_name or "").split() or ["Your traveller"])[0] if user else "Your traveller"

    progress = total_minutes = None
    if ride and s.last_lat is not None:
        origin = STATE_COORDS.get(ride.route.origin_state.strip().lower())
        dest = STATE_COORDS.get(ride.route.destination.strip().lower())
        if origin and dest:
            total = _km(origin, dest)
            if total > 0:
                progress = max(0.0, min(1.0, 1 - _km((s.last_lat, s.last_lng), dest) / total))
                total_minutes = round(total * 1.07)  # very rough road estimate

    stale = s.last_seen_at is None or (utcnow() - s.last_seen_at) > STALE_AFTER
    return jsonify({
        "corper": first_name,  # first name only; no phone or booking id on a public page
        "from": ride.route.origin_state if ride else "",
        "to": ride.route.destination if ride else "",
        "operator": ride.operator.name if ride else "",
        "vehicle": ride.vehicle_type if ride else "",
        "lat": s.last_lat,
        "lng": s.last_lng,
        "lastSeenAt": s.last_seen_at.isoformat() + "Z" if s.last_seen_at else None,
        "stale": stale,
        "progress": progress,
        "totalMinutes": total_minutes,
        "expiresAt": s.expires_at.isoformat() + "Z",
    })
