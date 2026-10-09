"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Copy, MapPinned, MessagesSquare, Share2, Square, Users } from "lucide-react";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";
import { formatTripDate, safeDate, naira } from "@/lib/format";
import { getBooking } from "@/lib/bookings";
import { getRide } from "@/lib/rides-api";
import {
  createTrackingLink,
  revokeTrackingLink,
  sendLocation,
  type TrackingLink,
} from "@/lib/tracking";

type Sharing = "idle" | "sharing" | "ended";

interface Point {
  lat: number;
  lng: number;
  accuracy: number;
  recordedAt: string;
}

type Booking = {
  id: number | string;
  createdAt: string;
  price: number;
  rideId: string | number;
  seat: number;
  status: string;
};

type Trip = {
  id: string;
  rideId: string;
  from: string;
  to: string;
  date: string;
  operator: string;
  seat: string;
  price: number;
  status: string;
};

const FLUSH_MS = 15_000;

function isUpcoming(t: Trip) {
  const cancelled = t.status.toLowerCase().includes("cancel");
  const departure = safeDate(t.date);
  return !cancelled && (departure === null || departure.getTime() > Date.now());
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [tracking, setTracking] = useState<TrackingLink | null>(null);
  const [linkError, setLinkError] = useState("");
  const [linkKey, setLinkKey] = useState(0);

  const [sharing, setSharing] = useState<Sharing>("idle");
  const [error, setError] = useState("");
  const [lastFix, setLastFix] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const watchId = useRef<number | null>(null);
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const buffer = useRef<Point[]>([]);
  const tokenRef = useRef<string | null>(null);
  const firstSent = useRef(false);

  const link = tracking?.shareUrl ?? "";

  // Load the booking, then its ride
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    async function load() {
      try {
        const booking = (await getBooking(id)) as unknown as Booking;
        const ride = await getRide(booking.rideId).catch(() => null);

        if (cancelled) return;
        setTrip({
          id: String(booking.id),
          rideId: String(booking.rideId),
          from: ride?.route.originState ?? "—",
          to: ride?.route.destination ?? "—",
          date: ride?.departsAt ?? booking.createdAt,
          operator: ride?.operator.name ?? "Operator",
          seat: String(booking.seat),
          price: booking.price,
          status: booking.status,
        });
      } catch (err) {
        if (cancelled) return;
        setTrip(null);
        setLoadError(err instanceof Error ? err.message : "Unable to load this trip.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  // Get the real family tracking link (returns the existing one if active)
  useEffect(() => {
    if (!trip || !isUpcoming(trip)) return;
    let cancelled = false;
    setLinkError("");

    createTrackingLink(trip.id)
      .then((t) => {
        if (cancelled) return;
        setTracking(t);
        tokenRef.current = t.token;
      })
      .catch((err) => {
        if (cancelled) return;
        setLinkError(err instanceof Error ? err.message : "Could not create your tracking link.");
      });

    return () => {
      cancelled = true;
    };
  }, [trip, linkKey]);

  // Send the latest buffered point (backend takes one point per call)
  async function flush() {
    const token = tokenRef.current;
    if (!token) return;
    const points = buffer.current.splice(0);
    const latest = points[points.length - 1];
    if (!latest) return;
    try {
      await sendLocation(token, { lat: latest.lat, lng: latest.lng });
    } catch {
      buffer.current.unshift(latest); // retry on the next tick
    }
  }

  // Upload while sharing
  useEffect(() => {
    if (sharing !== "sharing") return;
    const timer = setInterval(flush, FLUSH_MS);
    return () => clearInterval(timer);
  }, [sharing]);

  // Stop everything if the page closes
  useEffect(() => () => stopWatching(), []);

  function stopWatching() {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    wakeLock.current?.release().catch(() => {});
    wakeLock.current = null;
  }

  function start() {
    if (!tokenRef.current) {
      setError("Your tracking link is not ready yet. Please try again in a moment.");
      return;
    }
    if (!("geolocation" in navigator)) {
      setError("This browser cannot share your location.");
      return;
    }
    setError("");
    firstSent.current = false;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        buffer.current.push({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          recordedAt: new Date(pos.timestamp).toISOString(),
        });
        setLastFix(pos.timestamp);
        // Send the first fix straight away so family does not wait 15 seconds
        if (!firstSent.current) {
          firstSent.current = true;
          flush();
        }
      },
      (err) =>
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location is turned off for this site. Allow it in your browser settings to share your trip."
            : "We could not get your location. Check your signal and try again."
        ),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 }
    );
    // Keep the screen on, because browsers can pause location when it sleeps
    navigator.wakeLock?.request("screen").then((l) => (wakeLock.current = l)).catch(() => {});
    setSharing("sharing");
  }

  async function stop() {
    stopWatching();
    setSharing("ended");
    await flush(); // send the last point before the link is revoked
    if (trip) await revokeTrackingLink(trip.id).catch(() => {});
    tokenRef.current = null;
    setTracking(null);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  async function share() {
    const text = `I'm travelling with Konvoy. Follow my trip live here: ${link}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Follow my trip", text, url: link });
      } catch {
        /* dismissed */
      }
      return;
    }
    await copy();
  }

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F2F6F1] px-5 text-center text-[#10201A]">
        <p className="m-0 text-[#4C5F55]">Loading trip…</p>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F2F6F1] px-5 text-center text-[#10201A]">
        <div>
          <p className="m-0 font-semibold">{loadError ?? "We could not find that trip."}</p>
          <div className="mt-3 flex items-center justify-center gap-4">
            {loadError && (
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="min-h-12 py-3 font-semibold text-[#11603A] underline"
              >
                Try again
              </button>
            )}
            <Link href="/trips" className="inline-block min-h-12 py-3 font-semibold text-[#11603A] underline">
              Back to my trips
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const cancelled = trip.status.toLowerCase().includes("cancel");
  const upcoming = isUpcoming(trip);
  const statusLabel = cancelled ? "Cancelled" : upcoming ? "Confirmed" : "Completed";

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-10 font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader title={`${trip.from} to ${trip.to}`} subtitle={formatTripDate(trip.date)} />

      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        <section aria-label="Trip details" className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
          <dl className="m-0 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Operator", trip.operator],
              ["Seat", trip.seat],
              ["Paid", naira(trip.price)],
              ["Status", statusLabel],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[14px] bg-[#F2F6F1] px-3.5 py-3">
                <dt className="text-[0.8rem] text-[#4C5F55]">{k}</dt>
                <dd className="m-0 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {upcoming && (
          <section aria-label="Share your trip live" className="rounded-3xl bg-white p-5">
            <h2 className={`${DISPLAY} m-0 flex items-center gap-2 text-[1.1rem] font-semibold`}>
              <MapPinned className="h-5 w-5 text-[#11603A]" aria-hidden="true" />
              Live trip sharing
            </h2>

            {sharing === "idle" && (
              <>
                <p className="m-0 mt-1 text-sm text-[#4C5F55]">
                  Start sharing when you set off. Your family sees your location on the link you sent them, until you stop or arrive.
                </p>
                <button
                  type="button"
                  onClick={start}
                  disabled={!tracking}
                  className="mt-4 min-h-[52px] w-full rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22] disabled:opacity-50"
                >
                  Start trip
                </button>
              </>
            )}

            {sharing === "sharing" && (
              <>
                <p role="status" className="m-0 mt-2 inline-flex items-center gap-2 rounded-full bg-[#DCEBDD] px-3 py-1.5 text-sm font-semibold text-[#11603A]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#11603A] motion-reduce:animate-none" />
                  {lastFix
                    ? `Sharing. Last location ${new Date(lastFix).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}`
                    : "Sharing. Waiting for your first location..."}
                </p>
                <p className="m-0 mt-2 text-sm text-[#4C5F55]">
                  Keep this page open while you travel. We keep your screen awake, because browsers can pause location when it sleeps.
                </p>
                <button type="button" onClick={stop} className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#9B1C12] font-semibold text-[#9B1C12] hover:bg-[#FBEAE8] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#9B1C12]">
                  <Square className="h-4 w-4" aria-hidden="true" />
                  Stop sharing
                </button>
              </>
            )}

            {sharing === "ended" && (
              <p className="m-0 mt-2 text-sm text-[#4C5F55]">Sharing stopped. Your family can no longer see your location.</p>
            )}

            {error && <p role="alert" className="m-0 mt-3 text-sm font-semibold text-[#9B1C12]">{error}</p>}
          </section>
        )}

        {upcoming && sharing !== "ended" && (
          <section aria-label="Share tracking link" className="rounded-3xl bg-white p-5">
            <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>Family tracking link</h2>

            {linkError && (
              <p role="alert" className="m-0 mt-2 text-sm font-semibold text-[#9B1C12]">
                {linkError}{" "}
                <button
                  type="button"
                  onClick={() => setLinkKey((k) => k + 1)}
                  className="font-semibold text-[#11603A] underline"
                >
                  Try again
                </button>
              </p>
            )}

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button type="button" onClick={share} disabled={!link} className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#0A3B22] font-semibold text-[#0A3B22] hover:bg-[#E4EFE5] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A] disabled:opacity-50">
                <Share2 className="h-4 w-4" aria-hidden="true" />Share
              </button>
              <button type="button" onClick={copy} disabled={!link} className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#0A3B22] font-semibold text-[#0A3B22] hover:bg-[#E4EFE5] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A] disabled:opacity-50">
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
              </button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link href="/squad" className="flex min-h-14 items-center justify-center gap-2 rounded-3xl bg-[#DCEBDD] font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]">
            <Users className="h-4 w-4 text-[#11603A]" aria-hidden="true" />Squad
          </Link>
          <Link href={`/buddies?state=${encodeURIComponent(trip.to)}`} className="flex min-h-14 items-center justify-center gap-2 rounded-3xl bg-[#DCEBDD] font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]">
            <MessagesSquare className="h-4 w-4 text-[#11603A]" aria-hidden="true" />Buddies
          </Link>
        </div>
      </div>
    </main>
  );
}
