from ..extensions import db
from ..utils.time import utcnow


class Buddy(db.Model):
    __tablename__ = "buddies"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True, index=True)
    state = db.Column(db.String(64), nullable=False, index=True)
    whatsapp = db.Column(db.String(16), nullable=False)  # E.164; shown only because the buddy consented
    bio = db.Column(db.String(280))
    is_approved = db.Column(db.Boolean, nullable=False, default=False, index=True)  # admin moderation
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    user = db.relationship("User")
