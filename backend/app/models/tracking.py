from ..extensions import db
from ..utils.time import utcnow


class TrackingSession(db.Model):
    __tablename__ = "tracking_sessions"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False, index=True)
    token = db.Column(db.String(64), nullable=False, unique=True, index=True)  # in the share link
    last_lat = db.Column(db.Float)
    last_lng = db.Column(db.Float)
    last_seen_at = db.Column(db.DateTime)
    expires_at = db.Column(db.DateTime, nullable=False)
    revoked_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
