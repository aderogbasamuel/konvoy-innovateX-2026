from datetime import datetime, timedelta

from app import create_app
from app.extensions import db
from app.models.transport import Operator, Ride, Route

NEW_NAME = "Haifa Express"
NEW_PHONE = "+2348034670275"
OLD_NAME = "Demo Express"  # the name from the first seed run

app = create_app()

with app.app_context():
    # 1. Operator: reuse the existing one (renaming it) or create it
    op = (
        Operator.query.filter_by(name=NEW_NAME).first()
        or Operator.query.filter_by(name=OLD_NAME).first()
    )
    if op is None:
        op = Operator(name=NEW_NAME)
        db.session.add(op)
    op.name = NEW_NAME
    op.contact_phone = NEW_PHONE
    op.license_verified = True
    op.vehicle_inspection_verified = True
    op.driver_id_verified = True
    op.is_verified = True
    db.session.flush()

    # 2. Route: reuse or create
    route = Route.query.filter_by(origin_state="Lagos", destination="Kaduna").first()
    if route is None:
        route = Route(origin_state="Lagos", destination="Kaduna")
        db.session.add(route)
        db.session.flush()

    # 3. Rides: only add them if this operator has none yet
    if Ride.query.filter_by(operator_id=op.id).count() == 0:
        base = datetime.utcnow().replace(hour=7, minute=0, second=0, microsecond=0)
        for days in (7, 8, 9):
            db.session.add(Ride(
                operator_id=op.id, route_id=route.id,
                departs_at=base + timedelta(days=days),
                price=25000, vehicle_type="Toyota Sienna", seats_total=7,
            ))
        print("Seeded demo rides")

    db.session.commit()
    print(f"Seed done: operator '{op.name}'")
