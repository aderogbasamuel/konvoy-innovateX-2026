from ..extensions import db
from ..utils.time import utcnow


class Operator(db.Model):
    __tablename__ = "operators"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, unique=True)
    contact_phone = db.Column(db.String(16))
    license_number = db.Column(db.String(64))
    license_verified = db.Column(db.Boolean, nullable=False, default=False)
    vehicle_inspection_verified = db.Column(db.Boolean, nullable=False, default=False)
    driver_id_verified = db.Column(db.Boolean, nullable=False, default=False)
    # Listed to users only after all three manual checks pass.
    is_verified = db.Column(db.Boolean, nullable=False, default=False, index=True)
    rating_avg = db.Column(db.Float, nullable=False, default=0.0)
    rating_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    rides = db.relationship("Ride", back_populates="operator", lazy="dynamic")


class Route(db.Model):
    __tablename__ = "routes"
    __table_args__ = (
        db.UniqueConstraint("origin_state", "destination", name="uq_route_origin_destination"),
    )

    id = db.Column(db.Integer, primary_key=True)
    origin_state = db.Column(db.String(64), nullable=False, index=True)
    destination = db.Column(db.String(120), nullable=False, index=True)  # camp or posting state

    rides = db.relationship("Ride", back_populates="route", lazy="dynamic")


class Ride(db.Model):
    __tablename__ = "rides"

    id = db.Column(db.Integer, primary_key=True)
    operator_id = db.Column(db.Integer, db.ForeignKey("operators.id"), nullable=False, index=True)
    route_id = db.Column(db.Integer, db.ForeignKey("routes.id"), nullable=False, index=True)
    departs_at = db.Column(db.DateTime, nullable=False, index=True)
    price = db.Column(db.Integer, nullable=False)  # naira, integer (matches Booking.price)
    vehicle_type = db.Column(db.String(40), nullable=False)
    seats_total = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    operator = db.relationship("Operator", back_populates="rides")
    route = db.relationship("Route", back_populates="rides")
