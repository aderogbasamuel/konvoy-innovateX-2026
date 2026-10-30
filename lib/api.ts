// Client for the Flask backend.
// Set NEXT_PUBLIC_API_URL (see .env.example) to the API base URL including its blueprint prefix.

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://konvoy-innovatex-2026-1.onrender.com/api").replace(/\/$/, "");
const TOKEN_KEY = "konvoy_access_token"; // TODO: save the JWT here after OTP verification

export function getAccessToken(): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export class ApiRequestError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

export function toRequestError(e: unknown): ApiRequestError {
  return e instanceof ApiRequestError
    ? e
    : new ApiRequestError("We could not reach the server. Check your signal and try again.", 0, "network");
}

interface ErrorBody {
  error?: { message?: string; code?: string };
  message?: string;
  code?: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw toRequestError(null);
  }

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const body = (data ?? {}) as ErrorBody;
    const err = body.error ?? body;
    const message = res.status === 401 ? "Please sign in to continue." : err.message ?? "Something went wrong. Please try again.";
    throw new ApiRequestError(message, res.status, err.code ?? "unknown");
  }
  return data as T;
}

/* ---------- types (match the Flask responses) ---------- */

export interface BuddyListItem {
  id: number;
  name: string; // first name only
  state: string;
  bio: string | null;
  whatsappUrl: string; // wa.me link with a prefilled message
}

export interface MyBuddy extends BuddyListItem {
  status: "approved" | "pending";
}

export interface BecomeBuddyInput {
  state: string;
  whatsapp: string;
  bio?: string;
  consent: true;
}

export interface Squad {
  rideId: string;
  count: number; // corpers with a paid booking on this route and day
  others: number; // count minus you
  joined: boolean; // you have a paid booking
  whatsappGroupUrl: string | null; // only returned when joined
}

/* ---------- endpoints ---------- */

export const api = {
  buddies: {
    list: (state: string) => request<{ items: BuddyListItem[] }>(`/buddies?state=${encodeURIComponent(state)}`),
    me: () => request<{ buddy: MyBuddy | null }>("/buddies/me"),
    become: (input: BecomeBuddyInput) => request<{ status: "pending" }>("/buddies/me", { method: "POST", body: JSON.stringify(input) }),
    stop: () => request<{ ok: true }>("/buddies/me", { method: "DELETE" }),
  },
  squad: {
    get: (rideId: string) => request<Squad>(`/rides/${encodeURIComponent(rideId)}/squad`),
  },
};