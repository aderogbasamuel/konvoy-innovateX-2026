export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export function compact(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function safeDate(value?: string | null): Date | null {
  if (!value) return null;
  // Trim microseconds to milliseconds so every browser can parse it
  const d = new Date(value.replace(/(\.\d{3})\d+/, "$1"));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatTripDate(value?: string | null): string {
  const d = safeDate(value);
  if (!d) return "Date unavailable";

  const day = d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
  const time = d.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  });

  return `${day} · ${time}`;
}
