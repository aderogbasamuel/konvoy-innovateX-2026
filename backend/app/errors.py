from flask import jsonify
from werkzeug.exceptions import HTTPException

from .extensions import jwt


class ApiError(Exception):
    """Raise anywhere in a request to return a consistent JSON error."""

    def __init__(self, message: str, status: int = 400, code: str = "bad_request"):
        super().__init__(message)
        self.message = message
        self.status = status
        self.code = code


def error_response(message: str, status: int, code: str):
    return jsonify({"error": {"code": code, "message": message}}), status


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(err: ApiError):
        return error_response(err.message, err.status, err.code)

    @app.errorhandler(HTTPException)
    def handle_http_error(err: HTTPException):
        return error_response(err.description, err.code or 500, err.name.lower().replace(" ", "_"))

    @app.errorhandler(Exception)
    def handle_unexpected(err: Exception):
        app.logger.exception("Unhandled error")
        return error_response("Something went wrong", 500, "internal_error")

    # flask-jwt-extended failures, in the same shape as everything else
    @jwt.expired_token_loader
    def expired(_header, _payload):
        return error_response("Token has expired", 401, "token_expired")

    @jwt.invalid_token_loader
    def invalid(reason):
        return error_response(reason, 401, "token_invalid")

    @jwt.unauthorized_loader
    def missing(reason):
        return error_response("Authorization token required", 401, "token_missing")
