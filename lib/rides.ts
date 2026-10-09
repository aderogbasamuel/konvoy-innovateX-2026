// lib/rides.ts

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://konvoy-innovatex-2026-1.onrender.com/api";

interface ApiRide {
  id: string | number;
  departsAt: string;
  price: number;
  vehicleType: string;
  seatsTotal: number;
  route: {
    id: number;
    originState: string;
    destination: string;
  };
  operator: {
    id: number;
    name: string;
    contactPhone: string | null;
    ratingAvg: number | null;
    ratingCount: number;
    verification: {
      driverId: boolean;
      license: boolean;
      vehicleInspection: boolean;
    };
  };
}

export interface Ride {
  id: string;
  operator: string;
  rating: number | null;
  reviews: number;
  verified: boolean;
  vehicle: string;
  price: number;
  seatsTotal: number;
  departsAt: string;
  origin: string;
  destination: string;
  routeId: number;
  operatorId: number;
  contactPhone: string | null;
}

export interface RideSearchFilters {
  origin?: string;
  destination?: string;
  date?: string;
}

export async function getRides(
  filters: RideSearchFilters = {}
): Promise<Ride[]> {
  const params = new URLSearchParams();

  if (filters.origin?.trim()) {
    params.set("origin", filters.origin.trim());
  }

  if (filters.destination?.trim()) {
    params.set("destination", filters.destination.trim());
  }

  if (filters.date) {
    params.set("date", filters.date);
  }

  const query = params.toString();
  const url = `${API_BASE}/rides${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch rides (${response.status})`);
  }

  const data: ApiRide[] = await response.json();

  return data.map((ride) => ({
    id: String(ride.id),
    operator: ride.operator.name,
    rating: ride.operator.ratingAvg,
    reviews: ride.operator.ratingCount,
    verified: Object.values(ride.operator.verification).every(Boolean),
    vehicle: ride.vehicleType,
    price: ride.price,
    seatsTotal: ride.seatsTotal,
    departsAt: ride.departsAt,
    origin: ride.route.originState,
    destination: ride.route.destination,
    routeId: ride.route.id,
    operatorId: ride.operator.id,
    contactPhone: ride.operator.contactPhone,
  }));
}




export async function getRide(id: string): Promise<Ride> {
  const response = await fetch(
    `${API_BASE}/rides/${encodeURIComponent(id)}`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "This ride could not be found."
        : `Failed to fetch ride (${response.status})`
    );
  }

  const ride: ApiRide = await response.json();

  return {
    id: String(ride.id),
    operator: ride.operator.name,
    rating: ride.operator.ratingAvg,
    reviews: ride.operator.ratingCount,
    verified: Object.values(ride.operator.verification).every(Boolean),
    vehicle: ride.vehicleType,
    price: ride.price,
    seatsTotal: ride.seatsTotal,
    departsAt: ride.departsAt,
    origin: ride.route.originState,
    destination: ride.route.destination,
    routeId: ride.route.id,
    operatorId: ride.operator.id,
    contactPhone: ride.operator.contactPhone,
  };
}