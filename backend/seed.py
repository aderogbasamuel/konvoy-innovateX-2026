from datetime import datetime
from app import create_app
from app.extensions import db
from app.models.transport import Operator, Ride, Route

PHONE = "+2348034670275"
OLD_NAME = "Demo Express"  # the name from the first seed run (renamed to Haifa Express)

# One entry per ride: operator, route, plate number, departure time
SEED = [
    {
        "operator": "Haifa Express",
        "origin": "Lagos",
        "destination": "Kaduna",
        "plate_number": "LSR-482-KJ",
        "departs_at": datetime(2026, 11, 14, 7, 0),
    },
    {
        "operator": "ABC Transport",
        "origin": "Abuja",
        "destination": "Port Harcourt",
        "plate_number": "ABC-215-XA",
        "departs_at": datetime(2026, 11, 15, 7, 0),
    },
    {
        "operator": "GIG Transport",
        "origin": "Ibadan",
        "destination": "Enugu",
        "plate_number": "GGE-730-LA",
        "departs_at": datetime(2026, 11, 16, 7, 0),
    },
]

app = create_app()
with app.app_context():
    for item in SEED:
        name = item["operator"]

        # 1. Operator: reuse the existing one (renaming the old demo one) or create it
        op = Operator.query.filter_by(name=name).first()
        if op is None and name == "Haifa Express":
            op = Operator.query.filter_by(name=OLD_NAME).first()
        if op is None:
            op = Operator(name=name)
            db.session.add(op)
        op.name = name
        op.contact_phone = PHONE
        op.license_verified = True
        op.vehicle_inspection_verified = True
        op.driver_id_verified = True
        op.is_verified = True
        db.session.flush()

        # 2. Route: reuse or create
        route = Route.query.filter_by(
            origin_state=item["origin"], destination=item["destination"]
        ).first()
        if route is None:
            route = Route(origin_state=item["origin"], destination=item["destination"])
            db.session.add(route)
            db.session.flush()

        # 3. Ride: only add it if this operator has none yet
        if Ride.query.filter_by(operator_id=op.id).count() == 0:
            db.session.add(Ride(
                operator_id=op.id, route_id=route.id,
                departs_at=item["departs_at"],
                plate_number=item["plate_number"],
                price=25000, vehicle_type="Toyota Sienna", seats_total=7,
            ))
            print(f"Seeded ride for {name}: {item['origin']} -> {item['destination']}")

    db.session.commit()
    print("Seed done")
