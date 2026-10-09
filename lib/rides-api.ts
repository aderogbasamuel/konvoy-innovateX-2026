
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://konvoy-innovatex-2026-1.onrender.com/api";

export type TransportRide = {
  id: string;
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
    verification: {
      license: boolean;
      vehicleInspection: boolean;
      driverId: boolean;
    };
    ratingAvg: number | null;
    ratingCount: number;
  };
};

type RideSearch = {
  origin?: string;
  destination?: string;
  date?: string;
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || "Unable to load transport data."
    );
  }

  return data as T;
}

export function searchRides(filters: RideSearch = {}) {
  const query = new URLSearchParams();

  if (filters.origin?.trim()) {
    query.set("origin", filters.origin.trim());
  }

  if (filters.destination?.trim()) {
    query.set("destination", filters.destination.trim());
  }

  if (filters.date) {
    query.set("date", filters.date);
  }

  const suffix = query.size ? `?${query.toString()}` : "";

  return request<TransportRide[]>(`/rides${suffix}`);
}

export function getRide(id: string | number) {
  return request<TransportRide>(
    `/rides/${encodeURIComponent(String(id))}`
  );
}