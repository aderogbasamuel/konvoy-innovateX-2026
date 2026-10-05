from functools import wraps

from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from ..errors import ApiError
from ..extensions import db
from ..models.user import ROLE_ADMIN, User


def get_current_user() -> User:
    """Load the user behind the current access token (call after @jwt_required)."""
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None or not user.is_active:
        raise ApiError("Account not found or disabled", 401, "account_unavailable")
    return user


def admin_required(fn):
    """Use for admin-only routes (company onboarding, buddy moderation, ...)."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        if get_jwt().get("role") != ROLE_ADMIN:
            raise ApiError("Admin access required", 403, "forbidden")
        user = get_current_user()
        if user.role != ROLE_ADMIN:  # token role could be stale
            raise ApiError("Admin access required", 403, "forbidden")
        return fn(*args, **kwargs)

    return wrapper
