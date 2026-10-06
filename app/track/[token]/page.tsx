"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BadgeCheck, ShieldCheck, TriangleAlert } from "lucide-react";
import Logo from "@/components/Logo";
import { DISPLAY } from "@/components/landing/styles";

// Mock trip: replace with an API response looked up by token
const TRIP = {
  corper: "Samuel",
  from: "Lagos",
  to: "Kaduna",
  operator: "Greenline Travels",
  vehicle: "Luxury Bus (AC)",
  totalMinutes: 540,
};

const POLL_MS = 15_000; // PRD: polling every 10 to 15 seconds is enough for the MVP
const STALE_MS = 2 * 60_000; // after this, show "last known location"
const ROUTE = "M24 118 C 90 130, 120 60, 190 80 S 290 90, 336 28";

interface Snapshot {
  progress: number; // 0 to 1 along the route
  updatedAt: number; // ms timestamp of the last GPS fix
}

function Track() {
  const { token } = useParams<{ token: string }>();
  const forceStale = useSearchParams().get("demo") === "stale"; // add ?demo=stale to preview the weak-signal state

  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [now, setNow] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const [marker, setMarker] = useState({ x: 24, y: 118, done: 0 });

  useEffect(() => {
    const t0 = Date.now();
    setNow(t0);
    setSnap({ progress: 0.64, updatedAt: forceStale ? t0 - 6 * 60_000 : t0 });
    const timer = setInterval(() => {
      const n = Date.now();
      setNow(n);
      // TODO: fetch(`/api/track/${token}`) and set the real snapshot. This only simulates movement.
      if (!forceStale) setSnap((s) => (s ? { progress: Math.min(1, s.progress + 0.004), updatedAt: n } : s));
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [token, forceStale]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || !snap) return;
    const len = path.getTotalLength();
    const p = path.getPointAtLength(len * snap.progress);
    setMarker({ x: p.x, y: p.y, done: len * snap.progress });
  }, [snap]);

  if (!snap) {
    return <main role="status" className="grid min-h-dvh place-items-center bg-[#F2F6F1] text-[#4C5F55]">Loading trip...</main>;
  }

  const stale = now - snap.updatedAt > STALE_MS;
  const arrived = snap.progress >= 1;
  const mins = Math.max(0, Math.round((now - snap.updatedAt) / 60_000));
  const seen = mins < 1 ? "just now" : `${mins} min ago`;
  const eta = new Date(now + (1 - snap.progress) * TRIP.totalMinutes * 60_000).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });

  const status = arrived ? "Arrived" : stale ? "Weak signal" : "Live trip";

  return (
    <main className="min-h-dvh bg-[#F2F6F1] px-5 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))] font-[family-name:var(--font-body)] text-[#10201A]">
      <div className="mx-auto grid max-w-md gap-4">
        <Logo />

        <section aria-label="Trip status" className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
          <div className="flex items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${stale && !arrived ? "bg-[#FFF3C4] text-[#5C4400]" : "bg-[#DCEBDD] text-[#11603A]"}`}>
              <span className={`h-2 w-2 rounded-full ${stale && !arrived ? "bg-[#5C4400]" : "bg-[#11603A]"} ${!stale && !arrived ? "animate-pulse motion-reduce:animate-none" : ""}`} />
              {status}
            </span>
            {!arrived && <span className="text-sm text-[#4C5F55]">Arrives about {eta}</span>}
          </div>

          <h1 className={`${DISPLAY} m-0 mt-4 text-[1.5rem] font-extrabold leading-tight tracking-tight`}>
            {arrived ? `${TRIP.corper} has arrived` : `${TRIP.corper} is on the way`}
          </h1>
          <p className="m-0 mt-1 text-sm text-[#4C5F55]">
            {TRIP.from} to {TRIP.to}. {stale && !arrived ? "Last known location" : "Last seen"} {seen}.
          </p>

          {stale && !arrived && (
            <p role="status" className="m-0 mt-3 flex items-start gap-2 rounded-[14px] bg-[#FFF3C4] px-3.5 py-3 text-sm text-[#5C4400]">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Signal is weak, so the map shows the last known location from {seen}. It will update when the connection returns.</span>
            </p>
          )}

          <svg viewBox="0 0 360 150" role="img" aria-label={`Route from ${TRIP.from} to ${TRIP.to}, ${Math.round(snap.progress * 100)} percent complete`} className="mt-4 block h-auto w-full">
            <path ref={pathRef} d={ROUTE} fill="none" stroke="#C9D9CC" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 12" />
            <path d={ROUTE} fill="none" stroke="#11603A" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${marker.done} 1000`} />
            <circle cx="24" cy="118" r="8" fill="#11603A" />
            <circle cx="336" cy="28" r="8" fill="#fff" stroke="#11603A" strokeWidth="4" />
            {!stale && !arrived && (
              <circle cx={marker.x} cy={marker.y} r="16" fill="#FFC20E" opacity=".35">
                <animate attributeName="r" values="12;20;12" dur="2.4s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={marker.x} cy={marker.y} r="9" fill={stale ? "#fff" : "#FFC20E"} stroke="#241A00" strokeWidth="2.5" strokeDasharray={stale ? "3 3" : undefined} />
            <text x="24" y="142" fontSize="12" fill="#4C5F55">{TRIP.from}</text>
            <text x="296" y="16" fontSize="12" fill="#4C5F55">Camp</text>
          </svg>

          <div className="mt-3 flex items-center gap-2 rounded-[14px] bg-[#F2F6F1] px-3.5 py-3 text-sm">
            <BadgeCheck className="h-4 w-4 shrink-0 text-[#11603A]" aria-hidden="true" />
            <span><b>{TRIP.operator}</b>, {TRIP.vehicle}. Licence, vehicle and driver ID verified.</span>
          </div>
        </section>

        <p className="m-0 flex items-start gap-2.5 text-sm text-[#4C5F55]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#11603A]" aria-hidden="true" />
          <span>
            You can see this trip because {TRIP.corper} shared the link with you. Their location is shown only until they arrive, and you do not need an account.
          </span>
        </p>
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#F2F6F1]" />}>
      <Track />
    </Suspense>
  );
}