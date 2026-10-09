from datetime import datetime, timedelta

from app import create_app
from app.extensions import db
from app.models.transport import Operator, Ride, Route

app = create_app()

with app.app_context():
    if Ride.query.count() == 0:  # only seeds an empty database
        op = Operator(
            name="Demo Express",
            contact_phone="+2348000000000",
            license_verified=True,
            vehicle_inspection_verified=True,
            driver_id_verified=True,
            is_verified=True,
        )
        route = Route(origin_state="Lagos", destination="Kaduna")
        db.session.add_all([op, route])
        db.session.flush()
        base = datetime.utcnow().replace(hour=7, minute=0, second=0, microsecond=0)
        for days in (7, 8, 9):
            db.session.add(Ride(
                operator_id=op.id, route_id=route.id,
                departs_at=base + timedelta(days=days),
                price=25000, vehicle_type="Toyota Sienna", seats_total=7,
            ))
        db.session.commit()
        print("Seeded demo rides")
