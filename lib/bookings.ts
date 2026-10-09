const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://konvoy-innovatex-2026-1.onrender.com/api";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("konvoy_access_token");
}

export class BookingApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "BookingApiError";
  }
}
async function bookingRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
    
  const token = getAccessToken();

  if (!token) {
    throw new Error("Please sign in to continue.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  
if (!response.ok) {
  throw new BookingApiError(
    data.message || data.error || `Request failed (${response.status})`,
    response.status,
    data.code
  );
}

  return data as T;
}

export type CreateBookingInput = {
  rideId: string;
  seat: number;
  paymentMethod: "card" | "transfer";
  price: number;
};

export type CreateBookingResponse = {
  bookingId: number;
  status: string;
  payment: {
    checkout_url?: string;
    status?: string;
    [key: string]: unknown;
  };
};

export function createBooking(
  input: CreateBookingInput,
  idempotencyKey: string,
) {
  return bookingRequest<CreateBookingResponse>("/bookings", {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(input),
  });
}

export function getBooking(bookingId: number | string) {
  return bookingRequest<Record<string, unknown>>(`/bookings/${bookingId}`);
}

export function getBookings(status?: "upcoming" | "past") {
  const query = status ? `?status=${status}` : "";

  return bookingRequest<{
    items: Record<string, unknown>[];
    nextCursor: string | null;
  }>(`/bookings${query}`);
}

export function cancelBooking(bookingId: number | string) {
  return bookingRequest<Record<string, unknown>>(
    `/bookings/${bookingId}/cancel`,
    { method: "POST" },
  );
}
