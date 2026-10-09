from ..extensions import db
from ..utils.time import utcnow


class TrackingSession(db.Model):
    """A shareable link that lets anyone with the token watch one trip's live location.

    Standalone for now (no FK to a booking) since the booking backend doesn't
    exist yet - `booking_id` can be added once it does. `corper_name` is a
    snapshot taken at creation so the public endpoint never has to touch the
    user table.
    """

    __tablename__ = "tracking_sessions"

    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(32), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    corper_name = db.Column(db.String(120), nullable=False)
    from_label = db.Column(db.String(120), nullable=False)
    to_label = db.Column(db.String(120), nullable=False)
    operator = db.Column(db.String(120), nullable=False)
    vehicle = db.Column(db.String(120), nullable=False)
    total_minutes = db.Column(db.Integer, nullable=False)

    origin_lat = db.Column(db.Float, nullable=False)
    origin_lng = db.Column(db.Float, nullable=False)
    dest_lat = db.Column(db.Float, nullable=False)
    dest_lng = db.Column(db.Float, nullable=False)

    current_lat = db.Column(db.Float)
    current_lng = db.Column(db.Float)
    last_location_at = db.Column(db.DateTime)

    started_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    arrived_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    def to_public_dict(self, progress: float) -> dict:
        return {
            "corper": self.corper_name,
            "from": self.from_label,
            "to": self.to_label,
            "operator": self.operator,
            "vehicle": self.vehicle,
            "total_minutes": self.total_minutes,
            "progress": progress,
            "updated_at": (self.last_location_at or self.started_at).isoformat() + "Z",
            "arrived": self.arrived_at is not None,
        }
