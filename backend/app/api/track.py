from flask import current_app, jsonify, request
from flask_jwt_extended import jwt_required

from ..errors import ApiError
from ..extensions import db, limiter
from ..models.tracking import TrackingSession
from ..services.tracking import compute_progress, generate_token, update_location
from ..utils.auth import get_current_user
from . import api_bp


def _json_body() -> dict:
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ApiError("Request body must be JSON", 400, "invalid_body")
    return data


def _require_number(body: dict, key: str) -> float:
    value = body.get(key)
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ApiError(f"{key} must be a number", 400, "invalid_body")
    return float(value)


def _require_text(body: dict, key: str, max_len: int = 120) -> str:
    value = body.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ApiError(f"{key} is required", 400, "invalid_body")
    value = value.strip()
    if len(value) > max_len:
        raise ApiError(f"{key} is too long", 400, "invalid_body")
    return value


@api_bp.post("/track/sessions")
@jwt_required()
def create_session():
    user = get_current_user()
    body = _json_body()

    total_minutes = body.get("total_minutes")
    if not isinstance(total_minutes, int) or total_minutes <= 0:
        raise ApiError("total_minutes must be a positive integer", 400, "invalid_body")

    session = TrackingSession(
        token=generate_token(),
        user_id=user.id,
        corper_name=(body.get("corper_name") or user.full_name or "A corper").strip()[:120],
        from_label=_require_text(body, "from"),
        to_label=_require_text(body, "to"),
        operator=_require_text(body, "operator"),
        vehicle=_require_text(body, "vehicle"),
        total_minutes=total_minutes,
        origin_lat=_require_number(body, "origin_lat"),
        origin_lng=_require_number(body, "origin_lng"),
        dest_lat=_require_number(body, "dest_lat"),
        dest_lng=_require_number(body, "dest_lng"),
    )
    db.session.add(session)
    db.session.commit()

    share_url = f"{current_app.config['FRONTEND_URL'].rstrip('/')}/track/{session.token}"
    return jsonify({"token": session.token, "share_url": share_url}), 201


@api_bp.patch("/track/sessions/<token>/location")
@jwt_required()
def update_session_location(token):
    user = get_current_user()
    session = TrackingSession.query.filter_by(token=token).first()
    if session is None:
        raise ApiError("Tracking session not found", 404, "not_found")
    if session.user_id != user.id:
        raise ApiError("You do not own this tracking session", 403, "forbidden")
    if not session.is_active:
        raise ApiError("This trip has already ended", 409, "session_inactive")

    body = _json_body()
    lat = _require_number(body, "lat")
    lng = _require_number(body, "lng")

    progress = update_location(session, lat, lng)
    db.session.commit()

    return jsonify({"progress": progress, "arrived": session.arrived_at is not None}), 200


@api_bp.get("/track/<token>")
@limiter.limit("360 per hour")
def get_session(token):
    session = TrackingSession.query.filter_by(token=token).first()
    if session is None:
        raise ApiError("Trip not found", 404, "not_found")

    progress = compute_progress(session)
    return jsonify(session.to_public_dict(progress)), 200
