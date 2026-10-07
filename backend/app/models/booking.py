from ..extensions import db
from ..utils.time import utcnow

# Mirrors the status machine in API.pdf section 4 (GET /bookings/{id})
STATUS_PENDING_PAYMENT = "pending_payment"
STATUS_PAID = "paid"
STATUS_FAILED = "failed"
STATUS_EXPIRED = "expired"
STATUS_CANCELLED = "cancelled"

ALL_STATUSES = {
    STATUS_PENDING_PAYMENT,
    STATUS_PAID,
    STATUS_FAILED,
    STATUS_EXPIRED,
    STATUS_CANCELLED,
}


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    # No Ride/Operator models exist yet, so a booking carries just enough about
    # the ride to show the user and to price the checkout. Once a real Ride
    # model lands, ride_id becomes a proper db.ForeignKey("rides.id") and these
    # three columns move onto that model instead of being duplicated here.
    ride_id = db.Column(db.String(64), nullable=False, index=True)
    seat = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Integer, nullable=False)  # naira, integer (see API.pdf conventions)

    status = db.Column(db.String(20), nullable=False, default=STATUS_PENDING_PAYMENT, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    payment = db.relationship("Payment", back_populates="booking", uselist=False)

    __table_args__ = (db.Index("ix_bookings_ride_seat", "ride_id", "seat"),)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "rideId": self.ride_id,
            "seat": self.seat,
            "price": self.price,
            "status": self.status,
            "payment": self.payment.to_dict() if self.payment else None,
            "createdAt": self.created_at.isoformat() + "Z",
        }