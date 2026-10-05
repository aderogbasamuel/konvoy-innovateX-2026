from flask import jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required
from sqlalchemy.exc import IntegrityError

from ..errors import ApiError
from ..extensions import db, limiter
from ..models.user import User
from ..services.otp import issue_otp, verify_otp
from ..utils.auth import get_current_user
from ..utils.phone import normalize_ng_phone
from ..utils.time import utcnow
from . import api_bp


def _json_body() -> dict:
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ApiError("Request body must be JSON", 400, "invalid_body")
    return data


def _tokens_for(user: User) -> dict:
    claims = {"role": user.role}
    return {
        "access_token": create_access_token(identity=str(user.id), additional_claims=claims),
        "refresh_token": create_refresh_token(identity=str(user.id), additional_claims=claims),
    }


def _get_or_create_user(phone: str) -> tuple[User, bool]:
    user = User.query.filter_by(phone=phone).first()
    if user:
        return user, False
    user = User(phone=phone)
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:  # two simultaneous first logins
        db.session.rollback()
        return User.query.filter_by(phone=phone).one(), False
    return user, True


@api_bp.post("/auth/otp/request")
@limiter.limit("10 per hour")
def request_otp():
    phone = normalize_ng_phone(_json_body().get("phone"))
    ttl = issue_otp(phone)
    # Same response whether or not the number has an account
    return jsonify({"message": "Code sent", "expires_in": ttl}), 200


@api_bp.post("/auth/otp/verify")
@limiter.limit("30 per hour")
def verify():
    body = _json_body()
    phone = normalize_ng_phone(body.get("phone"))
    code = body.get("code")
    if not isinstance(code, str) or not code.strip():
        raise ApiError("Code is required", 400, "invalid_otp")

    verify_otp(phone, code.strip())

    user, is_new = _get_or_create_user(phone)
    if not user.is_active:
        raise ApiError("Account not found or disabled", 401, "account_unavailable")
    user.last_login_at = utcnow()
    db.session.commit()

    return jsonify({**_tokens_for(user), "user": user.to_dict(), "is_new_user": is_new}), 200


@api_bp.post("/auth/refresh")
@jwt_required(refresh=True)
def refresh():
    user = get_current_user()
    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify({"access_token": token}), 200


@api_bp.get("/auth/me")
@jwt_required()
def me():
    return jsonify({"user": get_current_user().to_dict()}), 200


@api_bp.patch("/auth/me")
@jwt_required()
def update_me():
    user = get_current_user()
    body = _json_body()
    if "full_name" in body:
        name = body["full_name"]
        if not isinstance(name, str) or not (2 <= len(name.strip()) <= 120):
            raise ApiError("Full name must be 2 to 120 characters", 400, "invalid_name")
        user.full_name = name.strip()
    db.session.commit()
    return jsonify({"user": user.to_dict()}), 200
