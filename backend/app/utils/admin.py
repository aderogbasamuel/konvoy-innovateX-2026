import os
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from ..extensions import db
from ..models.user import User


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = db.session.get(User, int(get_jwt_identity()))
        admins = {p.strip() for p in os.environ.get("ADMIN_PHONES", "").split(",") if p.strip()}
        if not user or user.phone not in admins:
            return jsonify(error="Admin access required"), 403
        return fn(*args, **kwargs)

    return wrapper
