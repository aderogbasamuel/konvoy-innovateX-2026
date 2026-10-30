"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { BadgeCheck, ShieldCheck, TriangleAlert } from "lucide-react";
import Logo from "@/components/Logo";
import { DISPLAY } from "@/components/landing/styles";
import { BookingApiError } from "@/lib/bookings";
import { getPublicTracking, type PublicTracking } from "@/lib/tracking";

// Leaflet touches `window`, so it must only load in the browser.
const TrackMap = dynamic(() => import("@/components/TrackMap"), {
  ssr: false,
  loading: () => <div className="mt-4 h-72 w-full animate-pulse rounded-2xl bg-[#E6EEE6] motion-reduce:animate-none" />,
});

const POLL_MS = 15_000; // PRD: 10 to 15 seconds

type LoadState = "loading" | "ok" | "inactive" | "error";

export default function TrackPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicTracking | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const d = await getPublicTracking(token);
        if (cancelled) return;
        setData(d);
        setState("ok");
      } catch (err) {
        if (cancelled) return;
        if (err instanceof BookingApiError && (err.status === 404 || err.status === 410)) {
          setState("inactive");
        } else {
          // keep showing the last good data if a poll fails
          setState((s) => (s === "ok" ? s : "error"));
        }
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

  const progress = data.progress ?? 0;
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

  // Real coordinates from the API (see the PublicTracking additions in the notes).
const position =
  hasFix && data.lat !== null && data.lng !== null
    ? { lat: data.lat, lng: data.lng }
    : null;

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

          {data.origin && data.destination && (
  <TrackMap
    origin={data.origin}
    destination={data.destination}
    position={position}
    stale={stale}
    arrived={arrived}
    fromLabel={data.from}
    toLabel="Camp"
    ariaLabel={`Map of the route from ${data.from} to ${data.to}, ${Math.round(progress * 100)} percent complete`}
  />
)}

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