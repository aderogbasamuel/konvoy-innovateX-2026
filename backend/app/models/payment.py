from ..extensions import db
from ..utils.time import utcnow

METHOD_CARD = "card"
METHOD_TRANSFER = "transfer"

# Bachs has no USSD corridor today (see guides/checkout/checkout-sessions ->
# "Restrict payment methods" corridor table: *_CARD, *_BANK_TRANSFER, MOMO_*,
# CRYPTO — nothing USSD). API.pdf asks for "ussd" as a third method; until
# Bachs adds one, or the team picks a second gateway just for USSD, that
# option is left out rather than faked.
SUPPORTED_METHODS = {METHOD_CARD, METHOD_TRANSFER}

STATUS_PENDING = "pending"
STATUS_SUCCEEDED = "succeeded"
STATUS_FAILED = "failed"
STATUS_REFUNDED = "refunded"


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False, unique=True)

    method = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Integer, nullable=False)  # naira, integer

    # Bachs identifiers (docs.bachs.io/api-reference/checkout-sessions/object)
    checkout_id = db.Column(db.String(64), index=True)  # chk_...
    checkout_url = db.Column(db.String(512))
    charge_id = db.Column(db.String(64), index=True)  # ch_..., set once collection.succeeded/failed arrives
    reference = db.Column(db.String(128), unique=True, nullable=False)  # our idempotency/order ref

    status = db.Column(db.String(20), nullable=False, default=STATUS_PENDING)
    failure_reason = db.Column(db.String(255))

    refund_id = db.Column(db.String(64))  # rfnd_...
    refund_status = db.Column(db.String(20))

    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    booking = db.relationship("Booking", back_populates="payment")

    def to_dict(self) -> dict:
        """Shape matches API.pdf's POST /bookings response: { bookingId, status, payment }."""
        data = {"method": self.method, "status": self.status}
        if self.method == METHOD_CARD and self.checkout_url:
            data["checkoutUrl"] = self.checkout_url
        if self.method == METHOD_TRANSFER:
            # Bachs' hosted checkout_url covers bank transfer too (the customer
            # picks the rail on the hosted page); we still surface it under the
            # same key the frontend already expects from API.pdf's "transfer"
            # case so the client doesn't need a bank-details branch.
            data["checkoutUrl"] = self.checkout_url
        return data
