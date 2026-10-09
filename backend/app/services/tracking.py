import math
import secrets

from ..models.tracking import TrackingSession
from ..utils.time import utcnow

ARRIVAL_THRESHOLD = 0.98  # treat "close enough to dest" as arrived


def generate_token() -> str:
    return secrets.token_urlsafe(16)


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def compute_progress(session: TrackingSession) -> float:
    """Straight-line progress from origin to dest, 0 to 1.

    Approximate (ignores actual road route), which is fine for an MVP: the
    frontend already renders its own illustrative path, not a real map.
    """
    if session.current_lat is None or session.current_lng is None:
        return 0.0
    total = haversine_km(session.origin_lat, session.origin_lng, session.dest_lat, session.dest_lng)
    if total <= 0:
        return 1.0
    remaining = haversine_km(session.current_lat, session.current_lng, session.dest_lat, session.dest_lng)
    progress = 1 - (remaining / total)
    return max(0.0, min(1.0, progress))


def update_location(session: TrackingSession, lat: float, lng: float) -> float:
    session.current_lat = lat
    session.current_lng = lng
    session.last_location_at = utcnow()
    progress = compute_progress(session)
    if progress >= ARRIVAL_THRESHOLD and session.arrived_at is None:
        session.arrived_at = utcnow()
        session.is_active = False
    return progress
