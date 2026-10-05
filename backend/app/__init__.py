from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

from .cli import register_cli
from .config import Config
from .errors import register_error_handlers
from .extensions import db, jwt, limiter, migrate


def create_app(config_object=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object)

    if app.config["BEHIND_PROXY"]:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"])

    from . import models  # noqa: F401  (registers models for migrations)
    from .api import api_bp

    app.register_blueprint(api_bp, url_prefix="/api")
    register_error_handlers(app)
    register_cli(app)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    return app
