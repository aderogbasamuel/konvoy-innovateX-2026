from ..extensions import db
from ..utils.time import utcnow

ROLE_CORPER = "corper"
ROLE_ADMIN = "admin"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(16), unique=True, nullable=False, index=True)  # E.164
    full_name = db.Column(db.String(120))
    role = db.Column(db.String(20), nullable=False, default=ROLE_CORPER)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    last_login_at = db.Column(db.DateTime)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "phone": self.phone,
            "full_name": self.full_name,
            "role": self.role,
            "created_at": self.created_at.isoformat() + "Z",
        }
