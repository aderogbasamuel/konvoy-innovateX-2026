import re
from datetime import timedelta
from urllib.parse import quote

from flask import jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy import func

from ..errors import ApiError
from ..extensions import db, limiter
from ..models.booking import STATUS_PAID, Booking
from ..models.buddy import Buddy
from ..models.transport import Ride
from ..utils.auth import admin_required, get_current_user
from ..utils.phone import normalize_ng_phone
from . import api_bp
from .auth import _json_body

GROUP_PREFIX = "https://chat.whatsapp.com/"


def _wa_url(number: str, text: str) -> str:
    digits = re.sub(r"\D", "", number)
    return f"https://wa.me/{digits}?text={quote(text)}"

def _buddy_json(b: Buddy) -> dict:
    first = ((b.user.full_name or "").split() or ["A corper"])[0]
    return {
        "id": b.id,
        "name": first,
        "state": b.state,
        "bio": b.bio,
        "whatsappUrl": _wa_url(
            b.whatsapp,
            f"Hi {first}, I'm a new corper heading to {b.state}. Could I ask you a few questions?",
        ),
    }


# ---------- State Buddy: for new arrivals ----------

@api_bp.get("/buddies")
@jwt_required()
@limiter.limit("60 per hour")
def list_buddies():
    get_current_user()
    q = Buddy.query.filter_by(is_approved=True)
    state = request.args.get("state", "").strip()
    if state:
        q = q.filter(func.lower(Buddy.state) == state.lower())
    buddies = q.order_by(Buddy.created_at).limit(50).all()
    return jsonify({"items": [_buddy_json(b) for b in buddies]}), 200


# ---------- State Buddy: signing up and opting out ----------

@api_bp.get("/buddies/me")
@jwt_required()
def my_buddy():
    b = Buddy.query.filter_by(user_id=get_current_user().id).first()
    if b is None:
        return jsonify({"buddy": None}), 200
    return jsonify({"buddy": {**_buddy_json(b), "status": "approved" if b.is_approved else "pending"}}), 200


@api_bp.post("/buddies/me")
@jwt_required()
@limiter.limit("10 per hour")
def become_buddy():
    user = get_current_user()
    body = _json_body()
    state = body.get("state")
    if not isinstance(state, str) or not (2 <= len(state.strip()) <= 64):
        raise ApiError("State is required", 400, "invalid_state")
    bio = body.get("bio")
    if bio is not None and (not isinstance(bio, str) or len(bio) > 280):
        raise ApiError("Bio must be 280 characters or fewer", 400, "invalid_bio")
    if body.get("consent") is not True:
        raise ApiError("Consent is required to share your WhatsApp number", 400, "consent_required")
    whatsapp = normalize_ng_phone(body.get("whatsapp"))

    b = Buddy.query.filter_by(user_id=user.id).first()
    if b is None:
        b = Buddy(user_id=user.id)
        db.session.add(b)
    b.state = state.strip()
    b.whatsapp = whatsapp
    b.bio = bio.strip() if isinstance(bio, str) and bio.strip() else None
    b.is_approved = False  # new or changed listings are re-checked by an admin
    db.session.commit()
    return jsonify({"status": "pending"}), 201


@api_bp.delete("/buddies/me")
@jwt_required()
def stop_being_buddy():
    b = Buddy.query.filter_by(user_id=get_current_user().id).first()
    if b is not None:
        db.session.delete(b)
        db.session.commit()
    return jsonify({"ok": True}), 200


# ---------- State Buddy: moderation (admin) ----------

@api_bp.get("/admin/buddies")
@admin_required
def admin_list_buddies():
    approved = request.args.get("status", "pending") == "approved"
    rows = Buddy.query.filter_by(is_approved=approved).order_by(Buddy.created_at).limit(100).all()
    return jsonify({"items": [
        {"id": b.id, "name": b.user.full_name, "state": b.state, "whatsapp": b.whatsapp,
         "bio": b.bio, "approved": b.is_approved}
        for b in rows
    ]}), 200


@api_bp.patch("/admin/buddies/<int:buddy_id>")
@admin_required
def admin_moderate_buddy(buddy_id: int):
    approved = _json_body().get("approved")
    if not isinstance(approved, bool):
        raise ApiError("approved must be true or false", 400, "invalid_body")
    b = db.session.get(Buddy, buddy_id)
    if b is None:
        raise ApiError("Buddy not found", 404, "not_found")
    b.is_approved = approved
    db.session.commit()
    return jsonify({"id": b.id, "approved": b.is_approved}), 200


# ---------- Squad ----------

def _same_day_rides(ride: Ride) -> list[Ride]:
    day = ride.departs_at.replace(hour=0, minute=0, second=0, microsecond=0)
    return Ride.query.filter(
        Ride.route_id == ride.route_id,
        Ride.departs_at >= day,
        Ride.departs_at < day + timedelta(days=1),
    ).all()


@api_bp.get("/rides/<int:ride_id>/squad")
@jwt_required()
def ride_squad(ride_id: int):
    user = get_current_user()
    ride = db.session.get(Ride, ride_id)
    if ride is None or not ride.operator.is_verified:
        raise ApiError("Ride not found", 404, "not_found")

    rides = _same_day_rides(ride)  # same route, same day, any operator
    paid = Booking.query.filter(
        Booking.ride_id.in_([str(r.id) for r in rides]),
        Booking.status == STATUS_PAID,
    ).all()
    travellers = {b.user_id for b in paid}
    joined = user.id in travellers
    group = next((r.whatsapp_group_url for r in rides if r.whatsapp_group_url), None) if joined else None
    return jsonify({
        "rideId": str(ride.id),
        "count": len(travellers),
        "others": len(travellers) - (1 if joined else 0),
        "joined": joined,
        "whatsappGroupUrl": group,  # only for people with a paid booking
    }), 200


@api_bp.patch("/admin/rides/<int:ride_id>/whatsapp-group")
@admin_required
def set_squad_group(ride_id: int):
    url = _json_body().get("url")
    if url is not None and (
        not isinstance(url, str) or not url.startswith(GROUP_PREFIX) or len(url) > 255
    ):
        raise ApiError(f"url must start with {GROUP_PREFIX} (or be null to clear it)", 400, "invalid_url")
    ride = db.session.get(Ride, ride_id)
    if ride is None:
        raise ApiError("Ride not found", 404, "not_found")
    ride.whatsapp_group_url = url
    db.session.commit()
    return jsonify({"rideId": str(ride.id), "whatsappGroupUrl": ride.whatsapp_group_url}), 200
