import { BookingApiError } from "@/lib/bookings";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://konvoy-innovatex-2026-1.onrender.com/api";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("konvoy_access_token");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMessage(data: any, status: number): string {
  const m = data?.message ?? data?.error;
  if (typeof m === "string") return m;
  return `Request failed (${status})`;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getAccessToken();
    if (!token) throw new Error("Please sign in to continue.");
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new BookingApiError(
      extractMessage(data, response.status),
      response.status,
    );
  }

  return data as T;
}

/* ---------- Types ---------- */

export type TrackingLink = {
  token: string;
  shareUrl: string;
  expiresAt: string;
};

export type LocationPoint = {
  lat: number;
  lng: number;
};

export type PublicTracking = {
  corper: string;
  from: string;
  to: string;
  operator: string;
  vehicle: string;
  lat: number | null;
  lng: number | null;
  lastSeenAt: string | null;
  stale: boolean;
  progress: number | null; // 0 to 1
  totalMinutes: number | null;
  expiresAt: string;
};

/* ---------- Corper (needs login) ---------- */

// Returns the existing active link, or creates one. Booking must be paid.
export function createTrackingLink(bookingId: number | string) {
  return request<TrackingLink>(`/bookings/${bookingId}/tracking`, {
    method: "POST",
  });
}

export function revokeTrackingLink(bookingId: number | string) {
  return request<{ ok: boolean }>(`/bookings/${bookingId}/tracking`, {
    method: "DELETE",
  });
}

// Backend takes one point per call and rate limits to 20 per minute.
export function sendLocation(token: string, point: LocationPoint) {
  return request<{ ok: boolean }>(
    `/tracking/${encodeURIComponent(token)}/location`,
    { method: "POST", body: JSON.stringify(point) },
  );
}

/* ---------- Family (public, no login) ---------- */

// 404 = unknown link, 410 = revoked or expired (check error.status).
export function getPublicTracking(token: string) {
  return request<PublicTracking>(
    `/tracking/${encodeURIComponent(token)}`,
    {},
    false,
  );
}
