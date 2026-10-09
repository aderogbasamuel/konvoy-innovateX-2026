import hashlib
import hmac
import secrets
import string
from datetime import timedelta

from flask import current_app

from ..errors import ApiError
from ..extensions import db
from ..models.otp import OTPCode
from ..utils.time import utcnow
from .sms import SMSError, get_sms_provider

INVALID_MSG = "Invalid or expired code"


def _hash(phone: str, code: str) -> str:
    key = current_app.config["SECRET_KEY"].encode()
    return hmac.new(key, f"{phone}:{code}".encode(), hashlib.sha256).hexdigest()


def _generate_code(length: int) -> str:
    return "".join(secrets.choice(string.digits) for _ in range(length))


def issue_otp(phone: str) -> int:
    """Create and send a new OTP. Returns its lifetime in seconds."""
    cfg = current_app.config
    now = utcnow()

    last = OTPCode.query.filter_by(phone=phone).order_by(OTPCode.created_at.desc()).first()
    cooldown = cfg["OTP_RESEND_COOLDOWN_SECONDS"]
    if last and (now - last.created_at).total_seconds() < cooldown:
        raise ApiError("Please wait before requesting another code", 429, "otp_cooldown")

    sent_last_hour = OTPCode.query.filter(
        OTPCode.phone == phone, OTPCode.created_at >= now - timedelta(hours=1)
    ).count()
    if sent_last_hour >= cfg["OTP_MAX_PER_HOUR"]:
        raise ApiError("Too many codes requested. Try again later", 429, "otp_rate_limited")

    # Only the newest code is ever valid
    OTPCode.query.filter(OTPCode.phone == phone, OTPCode.consumed_at.is_(None)).update(
        {"consumed_at": now}
    )

    ttl = cfg["OTP_TTL_SECONDS"]
    static_code = cfg.get("OTP_STATIC_CODE")
    code = static_code or _generate_code(cfg["OTP_LENGTH"])
    otp = OTPCode(phone=phone, code_hash=_hash(phone, code), expires_at=now + timedelta(seconds=ttl))
    db.session.add(otp)
    db.session.commit()

    if static_code:
        # Demo mode: skip the SMS provider entirely, nothing to fail.
        return ttl

    try:
        get_sms_provider().send(phone, f"Your Konvoy code is {code}. It expires in {ttl // 60} minutes.")
    except SMSError:
        current_app.logger.exception("SMS delivery failed")
        otp.consumed_at = utcnow()
        db.session.commit()
        raise ApiError("Could not send the code. Please try again", 502, "sms_failed")
    return ttl


def verify_otp(phone: str, code: str) -> None:
    """Raise ApiError unless `code` matches the latest live OTP for `phone`."""
    cfg = current_app.config
    now = utcnow()

    otp = (
        OTPCode.query.filter(OTPCode.phone == phone, OTPCode.consumed_at.is_(None))
        .order_by(OTPCode.created_at.desc())
        .with_for_update()
        .first()
    )
    if otp is None or otp.expires_at < now:
        raise ApiError(INVALID_MSG, 400, "invalid_otp")
    if otp.attempts >= cfg["OTP_MAX_ATTEMPTS"]:
        raise ApiError("Too many attempts. Request a new code", 429, "otp_locked")

    otp.attempts += 1
    if not hmac.compare_digest(otp.code_hash, _hash(phone, str(code))):
        db.session.commit()  # persist the failed attempt
        raise ApiError(INVALID_MSG, 400, "invalid_otp")

    otp.consumed_at = now
    db.session.commit()
