"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeCheck, ShieldCheck, TriangleAlert } from "lucide-react";
import Logo from "@/components/Logo";
import { DISPLAY } from "@/components/landing/styles";
import { API_BASE } from "@/app/api/client"; // adjust if your alias differs

const POLL_MS = 15_000; // PRD: 10 to 15 seconds
const ROUTE = "M24 118 C 90 130, 120 60, 190 80 S 290 90, 336 28";

interface TrackData {
  corper: string;
  from: string;
  to: string;
  operator: string;
  vehicle: string;
  lastSeenAt: string | null;
  stale: boolean;
  progress: number | null;
  totalMinutes: number | null;
}

type LoadState = "loading" | "ok" | "inactive" | "error";

export default function TrackPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<TrackData | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [now, setNow] = useState(() => Date.now());
  const pathRef = useRef<SVGPathElement>(null);
  const [marker, setMarker] = useState({ x: 24, y: 118, done: 0 });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/tracking/${token}`);
        if (cancelled) return;
        if (res.status === 404 || res.status === 410) return setState("inactive");
        if (!res.ok) return setState((s) => (s === "ok" ? s : "error"));
        setData(await res.json());
        setState("ok");
      } catch {
        if (!cancelled) setState((s) => (s === "ok" ? s : "error"));
      } finally {
        if (!cancelled) setNow(Date.now());
      }
    }
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [token]);

  const progress = data?.progress ?? 0;
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const p = path.getPointAtLength(len * progress);
    setMarker({ x: p.x, y: p.y, done: len * progress });
  }, [progress, state]);

  if (state === "loading") {
    return <main role="status" className="grid min-h-dvh place-items-center bg-[#F2F6F1] text-[#4C5F55]">Loading trip...</main>;
  }
  if (state === "inactive" || state === "error" || !data) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F2F6F1] px-5 text-center text-[#10201A]">
        <p className="m-0 max-w-xs">
          {state === "error"
            ? "We could not load this trip. Check your connection and try again."
            : "This tracking link is no longer active. Ask for a new link if you still need to follow the trip."}
        </p>
      </main>
    );
  }

  const hasFix = data.lastSeenAt !== null;
  const stale = data.stale;
  const arrived = data.progress !== null && data.progress >= 1;
  const mins = hasFix ? Math.max(0, Math.round((now - Date.parse(data.lastSeenAt!)) / 60_000)) : 0;
  const seen = mins < 1 ? "just now" : `${mins} min ago`;
  const eta =
    data.totalMinutes && data.progress !== null
      ? new Date(now + (1 - data.progress) * data.totalMinutes * 60_000).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })
      : null;
  const status = arrived ? "Arrived" : !hasFix ? "Waiting" : stale ? "Weak signal" : "Live trip";

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
            {!arrived && eta && <span className="text-sm text-[#4C5F55]">Arrives about {eta}</span>}
          </div>

          <h1 className={`${DISPLAY} m-0 mt-4 text-[1.5rem] font-extrabold leading-tight tracking-tight`}>
            {arrived ? `${data.corper} has arrived` : `${data.corper} is on the way`}
          </h1>
          <p className="m-0 mt-1 text-sm text-[#4C5F55]">
            {data.from} to {data.to}.{" "}
            {hasFix ? `${stale && !arrived ? "Last known location" : "Last seen"} ${seen}.` : "Waiting for the first location update."}
          </p>

          {stale && hasFix && !arrived && (
            <p role="status" className="m-0 mt-3 flex items-start gap-2 rounded-[14px] bg-[#FFF3C4] px-3.5 py-3 text-sm text-[#5C4400]">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Signal is weak, so the map shows the last known location from {seen}. It will update when the connection returns.</span>
            </p>
          )}

          <svg viewBox="0 0 360 150" role="img" aria-label={`Route from ${data.from} to ${data.to}, ${Math.round(progress * 100)} percent complete`} className="mt-4 block h-auto w-full">
            <path ref={pathRef} d={ROUTE} fill="none" stroke="#C9D9CC" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 12" />
            <path d={ROUTE} fill="none" stroke="#11603A" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${marker.done} 1000`} />
            <circle cx="24" cy="118" r="8" fill="#11603A" />
            <circle cx="336" cy="28" r="8" fill="#fff" stroke="#11603A" strokeWidth="4" />
            {hasFix && !stale && !arrived && (
              <circle cx={marker.x} cy={marker.y} r="16" fill="#FFC20E" opacity=".35">
                <animate attributeName="r" values="12;20;12" dur="2.4s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={marker.x} cy={marker.y} r="9" fill={stale ? "#fff" : "#FFC20E"} stroke="#241A00" strokeWidth="2.5" strokeDasharray={stale ? "3 3" : undefined} />
            <text x="24" y="142" fontSize="12" fill="#4C5F55">{data.from}</text>
            <text x="296" y="16" fontSize="12" fill="#4C5F55">Camp</text>
          </svg>

          <div className="mt-3 flex items-center gap-2 rounded-[14px] bg-[#F2F6F1] px-3.5 py-3 text-sm">
            <BadgeCheck className="h-4 w-4 shrink-0 text-[#11603A]" aria-hidden="true" />
            <span><b>{data.operator}</b>, {data.vehicle}. Licence, vehicle and driver ID verified.</span>
          </div>
        </section>

        <p className="m-0 flex items-start gap-2.5 text-sm text-[#4C5F55]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#11603A]" aria-hidden="true" />
          <span>
            You can see this trip because {data.corper} shared the link with you. Their location is shown only until they arrive, and you do not need an account.
          </span>
        </p>
      </div>
    </main>
  );
}
