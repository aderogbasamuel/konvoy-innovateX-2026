from flask import Blueprint

api_bp = Blueprint("api", __name__)

from . import auth  # noqa: E402,F401
