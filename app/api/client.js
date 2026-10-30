export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://konvoy-innovatex-2026-1.onrender.com/api";

export const ENDPOINTS = {
  requestOtp: (base) => `${base}/auth/otp/request`,
  verifyOtp: (base) => `${base}/auth/otp/verify`,
  refresh: (base) => `${base}/auth/refresh`,
  getUser: (base) => `${base}/auth/me`,
  updateUser: (base) => `${base}/auth/me`,
};

export async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await res.json();
  } catch (_) {}

  if (!res.ok) {
    const raw = data?.error?.message ?? data?.message ?? data?.error;
    const message =
      typeof raw === "string" ? raw : `Request failed (${res.status})`;

    const err = new Error(message);
    err.status = res.status;
    err.code = data?.error?.code ?? data?.code;
    throw err;
  }

  return data;
}
