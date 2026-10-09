from datetime import datetime, timedelta, timezone

from flask import jsonify, request
from sqlalchemy import func

from ..extensions import db
from ..models.transport import Operator, Ride, Route
from ..utils.auth import admin_required  # change if your decorator file has another name
from . import api_bp


def _operator_json(o):
    return {
        "id": o.id,
        "name": o.name,
        "contactPhone": o.contact_phone,
        "verification": {
            "license": o.license_verified,
            "vehicleInspection": o.vehicle_inspection_verified,
            "driverId": o.driver_id_verified,
        },
        "ratingAvg": o.rating_avg,
        "ratingCount": o.rating_count,
    }


def _route_json(r):
    return {"id": r.id, "originState": r.origin_state, "destination": r.destination}


def _ride_json(r):
    return {
        "id": str(r.id),  # string, to match Booking.ride_id
        "departsAt": r.departs_at.isoformat() + "Z",
        "price": r.price,
        "vehicleType": r.vehicle_type,
        "seatsTotal": r.seats_total,
        "route": _route_json(r.route),
        "operator": _operator_json(r.operator),
    }


def _parse_dt(value):
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo:  # store naive UTC
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


# ---------- public ----------

@api_bp.get("/rides")
def search_rides():
    """GET /api/rides?origin=Lagos&destination=Kaduna&date=2026-11-20"""
    q = (
        Ride.query.join(Route).join(Operator)
        .filter(Operator.is_verified.is_(True))
    )
    origin = request.args.get("origin", "").strip()
    destination = request.args.get("destination", "").strip()
    date = request.args.get("date", "").strip()
    if origin:
        q = q.filter(func.lower(Route.origin_state) == origin.lower())
    if destination:
        q = q.filter(func.lower(Route.destination) == destination.lower())
    if date:
        try:
            day = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            return jsonify(error="date must be YYYY-MM-DD"), 400
        q = q.filter(Ride.departs_at >= day, Ride.departs_at < day + timedelta(days=1))
    rides = q.order_by(Ride.departs_at).limit(50).all()
    return jsonify([_ride_json(r) for r in rides])


@api_bp.get("/rides/<int:ride_id>")
def get_ride(ride_id):
    r = db.session.get(Ride, ride_id)
    if not r or not r.operator.is_verified:
        return jsonify(error="Ride not found"), 404
    return jsonify(_ride_json(r))


# ---------- admin ----------

@api_bp.post("/admin/operators")
@admin_required
def create_operator():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify(error="name is required"), 400
    if Operator.query.filter(func.lower(Operator.name) == name.lower()).first():
        return jsonify(error="An operator with this name already exists"), 409
    o = Operator(
        name=name,
        contact_phone=(data.get("contactPhone") or "").strip() or None,
        license_number=(data.get("licenseNumber") or "").strip() or None,
    )
    db.session.add(o)
    db.session.commit()
    return jsonify(_operator_json(o)), 201


@api_bp.patch("/admin/operators/<int:operator_id>/verify")
@admin_required
def verify_operator(operator_id):
    o = db.session.get(Operator, operator_id)
    if not o:
        return jsonify(error="Operator not found"), 404
    data = request.get_json(silent=True) or {}
    o.license_verified = bool(data.get("license", o.license_verified))
    o.vehicle_inspection_verified = bool(data.get("vehicleInspection", o.vehicle_inspection_verified))
    o.driver_id_verified = bool(data.get("driverId", o.driver_id_verified))
    o.is_verified = o.license_verified and o.vehicle_inspection_verified and o.driver_id_verified
    db.session.commit()
    return jsonify({**_operator_json(o), "isVerified": o.is_verified})


@api_bp.post("/admin/routes")
@admin_required
def create_route():
    data = request.get_json(silent=True) or {}
    origin = (data.get("originState") or "").strip()
    destination = (data.get("destination") or "").strip()
    if not origin or not destination:
        return jsonify(error="originState and destination are required"), 400
    existing = Route.query.filter(
        func.lower(Route.origin_state) == origin.lower(),
        func.lower(Route.destination) == destination.lower(),
    ).first()
    if existing:
        return jsonify(_route_json(existing)), 200
    r = Route(origin_state=origin, destination=destination)
    db.session.add(r)
    db.session.commit()
    return jsonify(_route_json(r)), 201


@api_bp.post("/admin/rides")
@admin_required
def create_ride():
    data = request.get_json(silent=True) or {}
    try:
        operator_id = int(data["operatorId"])
        route_id = int(data["routeId"])
        price = int(data["price"])
        seats_total = int(data["seatsTotal"])
        departs_at = _parse_dt(data["departsAt"])
    except (KeyError, ValueError, TypeError):
        return jsonify(error="operatorId, routeId, departsAt (ISO), price, seatsTotal are required"), 400
    vehicle_type = (data.get("vehicleType") or "").strip()
    if not vehicle_type or price <= 0 or seats_total <= 0:
        return jsonify(error="vehicleType and positive price and seatsTotal are required"), 400
    if not db.session.get(Operator, operator_id) or not db.session.get(Route, route_id):
        return jsonify(error="Unknown operator or route"), 404
    ride = Ride(
        operator_id=operator_id, route_id=route_id, departs_at=departs_at,
        price=price, vehicle_type=vehicle_type, seats_total=seats_total,
    )
    db.session.add(ride)
    db.session.commit()
    return jsonify(_ride_json(ride)), 201
