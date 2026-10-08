import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


def _database_url() -> str:
    url = os.getenv("DATABASE_URL", "sqlite:///konvoy.db")
    # Some hosts still hand out the legacy "postgres://" scheme, which SQLAlchemy rejects
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-secret")
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")]
    BEHIND_PROXY = os.getenv("BEHIND_PROXY", "0") == "1"

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # OTP
    OTP_LENGTH = 6
    OTP_TTL_SECONDS = 300
    OTP_MAX_ATTEMPTS = 5
    OTP_RESEND_COOLDOWN_SECONDS = 60
    OTP_MAX_PER_HOUR = 5

    # SMS
    SMS_PROVIDER = os.getenv("SMS_PROVIDER", "console")
    TERMII_API_KEY = os.getenv("TERMII_API_KEY", "")
    TERMII_SENDER_ID = os.getenv("TERMII_SENDER_ID", "")
    TERMII_CHANNEL = os.getenv("TERMII_CHANNEL", "generic")

    # Rate limiting (per client IP, on top of the per-phone OTP limits)
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_ENABLED = True

    # Bachs payments (docs.bachs.io). sk_sandbox_... / sk_live_... picks the
    # environment automatically — see app/services/bachs.py.
    BACHS_SECRET_KEY = os.getenv("BACHS_SECRET_KEY", "")
    
    # Public https URL of the frontend. Bachs rejects localhost for success/cancel
    # redirects, so this must be a real deployed URL even during local dev.
    FRONTEND_URL = os.getenv("FRONTEND_URL", "")
    BACHS_WEBHOOK_SECRET = os.getenv("BACHS_WEBHOOK_SECRET", "")


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SECRET_KEY = "test-secret"
    JWT_SECRET_KEY = "test-jwt-secret-that-is-long-enough-for-hs256"
    SMS_PROVIDER = "console"
    OTP_RESEND_COOLDOWN_SECONDS = 0
    RATELIMIT_ENABLED = False
    BACHS_SECRET_KEY = "sk_sandbox_test"
    BACHS_WEBHOOK_SECRET = "whsec_test"
