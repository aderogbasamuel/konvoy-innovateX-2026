from datetime import datetime, timezone


def utcnow() -> datetime:
    """Naive UTC datetime. Used everywhere so SQLite and Postgres behave the same."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
