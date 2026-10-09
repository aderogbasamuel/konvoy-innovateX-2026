"use client";

import {
  useEffect,
  useId,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Bell, Calendar, MapPin, ShieldCheck } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { DISPLAY } from "@/components/landing/styles";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
/* ---------- helpers ---------- */

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(iso: string) {
  if (!iso) return "Select date";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Suggestions only: people can still type any city or town.
// Worth moving to a shared file (e.g. lib/places.ts) so the landing search can reuse it.
const PLACES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

/* ---------- trip field row ---------- */

interface RowProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  /** Sits on the divider below this row. Kept outside the <label> so it doesn't become part of the field's name. */
  action?: ReactNode;
}

function Row({ icon, label, children, action }: RowProps) {
  return (
    <div className="relative">
      <label className="relative flex min-h-[72px] items-center gap-4 px-4 py-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#11603A]">
        <span className="text-[#11603A]">{icon}</span>
        <span className="flex-1">
          <span className="block text-xs font-medium text-[#4C5F55]">
            {label}
          </span>
          {children}
        </span>
      </label>
      {action && (
        <div className="absolute bottom-0 right-4 z-10 translate-y-1/2">
          {action}
        </div>
      )}
    </div>
  );
}

const inputClass =
  "block w-full bg-transparent p-0 text-base font-semibold text-[#10201A] placeholder:font-normal placeholder:text-[#6B7D72] focus:outline-none";

/* ---------- page ---------- */

export default function HomePage() {
  const router = useRouter();
  const placesId = useId();
  const { user, loading } = useAuth();

  const name = user?.full_name?.trim().split(/\s+/)[0] || "Traveler"; // replace with the signed-in user's first name

  // These depend on the device clock, so set them after mount to avoid a hydration mismatch
  const [hello, setHello] = useState("Hello");
  const [today, setToday] = useState("");
  useEffect(() => {
    setHello(greeting());
    setToday(new Date().toLocaleDateString("en-CA")); // YYYY-MM-DD, local time
  }, []);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function swap() {
    setFrom(to);
    setTo(from);
    setError("");
  }

  // Native `required` handles empty fields (focuses the first one and says what's missing)
  function searchRides(e: FormEvent) {
    e.preventDefault();
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      setError("Leaving from and going to can't be the same place.");
      return;
    }
    setError("");
    const params = new URLSearchParams({
      from: from.trim(),
      to: to.trim(),
      date,
    });
    startTransition(() => router.push(`/rides?${params.toString()}`));
  }

  return (
    <main className="min-h-dvh bg-[#F2F6F1] font-[family-name:var(--font-body)] text-[#10201A]">
      {/* header band */}
      <div className="relative overflow-hidden bg-[#0A3B22] px-5 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
        {/* contour lines, same motif as the landing hero */}
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 400 200"
          preserveAspectRatio="xMaxYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <g fill="none" stroke="#8FD1A9" strokeWidth="1.2" opacity="0.18">
            <path d="M-20 170 C 80 130, 160 210, 260 160 S 380 110, 440 140" />
            <path d="M-20 140 C 90 90, 170 180, 270 125 S 380 70, 440 105" />
            <path d="M-20 110 C 100 55, 180 150, 280 90 S 385 35, 440 70" />
            <path d="M-20 80 C 110 20, 190 120, 290 55 S 390 0, 440 35" />
          </g>
        </svg>

        <header className="relative mx-auto flex max-w-md items-start justify-between">
          <div>
            <h1
              className={`${DISPLAY} m-0 text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em]`}
              aria-live="polite"
            >
              {hello},{" "}
              {loading ? (
                <span
                  className="inline-block h-7 w-24 animate-pulse rounded-md bg-white/20 align-middle"
                  aria-label="Loading your name"
                />
              ) : (
                name
              )}
            </h1>
            <p className="mt-1 text-[#8FD1A9]">Where are you heading today?</p>
          </div>
          {/* Hook this up to your notifications screen or panel */}
          <button
            type="button"
            aria-label="Notifications"
            className="grid h-12 w-12 place-items-center rounded-full text-[#FFC20E] hover:bg-white/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFC20E]"
          >
            <Bell className="h-5 w-5" fill="currentColor" aria-hidden="true" />
          </button>
        </header>
      </div>

      <div className="mx-auto -mt-10 max-w-md px-5 pb-28">
        <form onSubmit={searchRides} aria-label="Plan a trip">
          {/* trip card */}
          <div className="divide-y divide-[#E4EBE4] rounded-3xl z-20 relative bg-white shadow-[0_16px_32px_rgba(10,59,34,0.14)] [&>*:first-child>label]:rounded-t-3xl [&>*:last-child>label]:rounded-b-3xl">
            <Row
              icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
              label="Leaving from"
              action={
                <button
                  type="button"
                  onClick={swap}
                  aria-label="Swap leaving from and going to"
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#DCE6DD] bg-white text-[#11603A] shadow-sm hover:bg-[#F2F6F1] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#11603A]"
                >
                  <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
                </button>
              }
            >
              <input
                type="text"
                list={placesId}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="e.g. Lagos"
                autoComplete="off"
                enterKeyHint="next"
                required
                className={inputClass}
              />
            </Row>

            <Row
              icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
              label="Going to"
            >
              <input
                type="text"
                list={placesId}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Camp or posting state"
                autoComplete="off"
                enterKeyHint="next"
                required
                className={inputClass}
              />
            </Row>

            <Row
              icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
              label="Travel date"
            >
              <span
                aria-hidden="true"
                className={`block text-base ${date ? "font-semibold" : "text-[#6B7D72]"}`}
              >
                {formatDate(date)}
              </span>
              {/* Native date picker sits invisibly over the row. showPicker() makes a tap anywhere on the row open it on desktop too. */}
              <input
                type="date"
                value={date}
                min={today || undefined}
                onChange={(e) => setDate(e.target.value)}
                onClick={(e) => {
                  try {
                    (
                      e.currentTarget as HTMLInputElement & {
                        showPicker?: () => void;
                      }
                    ).showPicker?.();
                  } catch {
                    /* some browsers only allow it from a direct tap; the native control still works */
                  }
                }}
                required
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </Row>
          </div>

          <datalist id={placesId}>
            {PLACES.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>

          {error && (
            <p
              role="alert"
              className="mt-3 px-1 text-sm font-semibold text-[#B3261E]"
            >
              {error}
            </p>
          )}

          {/* main action */}
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="mt-5 min-h-[52px] w-full rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22] disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-[#FFC20E]"
          >
            {pending ? "Searching…" : "Search rides"}
          </button>
        </form>
{/* Browse rides */}

<Link
  href="/rides"
  className="mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#B7CDBB] bg-white font-semibold text-[#0A3B22] transition hover:bg-[#DCEBDD] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#11603A]"
>
  View all available rides
  <span aria-hidden="true">→</span>
</Link>

        {/* trust banner */}
        <div className="mt-6 flex items-center gap-4 rounded-3xl bg-[#DCEBDD] p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#0A3B22] text-[#FFC20E]">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className={`${DISPLAY} m-0 font-semibold text-[#0A3B22]`}>
              Safe. Verified. Supported.
            </p>
            <p className="m-0 text-sm text-[#4C5F55]">
              Your safety comes first, from booking to arrival.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
