export const API_BASE =
  import.meta.env.NEXT_PUBLIC_API_BASE_URL ||
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
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}