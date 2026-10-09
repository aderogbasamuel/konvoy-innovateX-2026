"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  ShieldCheck,
  Star,
  Clock3,
  MapPin,
  AlertCircle,
} from "lucide-react";

import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";
import { formatDate, naira } from "@/lib/format";
import { getRide, type TransportRide } from "@/lib/rides-api";

function RideDetails() {
  const { id } = useParams<{ id: string }>();
  const query = useSearchParams().toString();

  const [ride, setRide] = useState<TransportRide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchRide() {
      setLoading(true);
      setError("");

      try {
        const rideData = await getRide(id);

        if (active) {
          setRide(rideData);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "We couldn't load this ride. Please try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchRide();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F2F6F1] px-5 text-center text-[#10201A]">
        {" "}
        <div>
          {" "}
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#DCE6DD] border-t-[#11603A]" />{" "}
          <p className="mt-4 text-sm text-[#4C5F55]">
            Loading ride details...{" "}
          </p>{" "}
        </div>{" "}
      </main>
    );
  }

  if (error || !ride) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F2F6F1] px-5 text-center text-[#10201A]">
        {" "}
        <div className="max-w-sm">
          {" "}
          <AlertCircle
            className="mx-auto h-9 w-9 text-[#11603A]"
            aria-hidden="true"
          />{" "}
          <p className="mt-3 font-semibold">
            {error
              ? "Couldn't load this ride"
              : "We couldn't find that ride."}{" "}
          </p>
          {error && <p className="mt-2 text-sm text-[#4C5F55]">{error}</p>}{" "}
          <Link
            href="/rides"
            className="mt-3 inline-block min-h-12 py-3 font-semibold text-[#11603A] underline"
          >
            Back to available rides{" "}
          </Link>{" "}
        </div>{" "}
      </main>
    );
  }

  const checks = [
    {
      label: "Transport operator license",
      detail: ride.operator.verification.license,
    },
    {
      label: "Vehicle inspection",
      detail: ride.operator.verification.vehicleInspection,
    },
    {
      label: "Driver identification",
      detail: ride.operator.verification.driverId,
    },
  ];

  const departure = new Date(ride.departsAt);
  const departureDate = Number.isNaN(departure.getTime())
    ? "Departure time unavailable"
    : `${formatDate(ride.departsAt.slice(0, 10))} · ${departure.toLocaleTimeString(
        "en-NG",
        { hour: "numeric", minute: "2-digit" },
      )}`;

  const rating = ride.operator.ratingAvg;
  const ratingCount = ride.operator.ratingCount;

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-32 font-[family-name:var(--font-body)] text-[#10201A]">
      {" "}
      <ScreenHeader title={ride.operator.name} subtitle={ride.vehicleType}>
        {" "}
        <p className="m-0 mt-3 flex items-center gap-1.5 text-sm">
          {" "}
          <Star
            className="h-4 w-4 fill-[#FFC20E] text-[#FFC20E]"
            aria-hidden="true"
          />{" "}
          <b>{rating == null ? "New" : rating.toFixed(1)}</b>{" "}
          <span className="text-[#8FD1A9]">
            ({ratingCount} {ratingCount === 1 ? "review" : "reviews"}){" "}
          </span>{" "}
        </p>{" "}
      </ScreenHeader>
      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        <section
          aria-label="Trip details"
          className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]"
        >
          <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>
            Your journey
          </h2>

          <div className="mt-4 flex gap-3">
            <MapPin
              className="mt-1 h-5 w-5 shrink-0 text-[#11603A]"
              aria-hidden="true"
            />
            <div>
              <p className="m-0 font-semibold">{ride.route.originState}</p>
              <p className="m-0 mt-1 text-sm text-[#4C5F55]">
                Departure location
              </p>
            </div>
          </div>

          <div className="ml-[9px] my-2 h-6 border-l-2 border-dashed border-[#B7CDBB]" />

          <div className="flex gap-3">
            <MapPin
              className="mt-1 h-5 w-5 shrink-0 text-[#11603A]"
              aria-hidden="true"
            />
            <div>
              <p className="m-0 font-semibold">{ride.route.destination}</p>
              <p className="m-0 mt-1 text-sm text-[#4C5F55]">Destination</p>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 border-t border-[#E4EBE4] pt-4">
            <Clock3
              className="mt-0.5 h-5 w-5 shrink-0 text-[#11603A]"
              aria-hidden="true"
            />
            <div>
              <p className="m-0 font-semibold">{departureDate}</p>
              <p className="m-0 mt-1 text-sm text-[#4C5F55]">
                Scheduled departure
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#F2F6F1] p-4">
            <p className="m-0 text-sm text-[#4C5F55]">Vehicle</p>
            <p className="m-0 mt-1 font-semibold">{ride.vehicleType}</p>
            <p className="m-0 mt-2 text-sm text-[#4C5F55]">
              {ride.seatsTotal} seats in total
            </p>
          </div>
        </section>

        <section
          aria-label="Operator verification"
          className="rounded-3xl bg-white p-5"
        >
          <h2
            className={`${DISPLAY} m-0 flex items-center gap-2 text-[1.1rem] font-semibold`}
          >
            <ShieldCheck
              className="h-5 w-5 text-[#11603A]"
              aria-hidden="true"
            />
            Verified by Konvoy
          </h2>

          <ul className="m-0 mt-3 grid list-none gap-2.5 p-0">
            {checks.map((check) => (
              <li
                key={check.label}
                className="flex items-start gap-3 rounded-[14px] bg-[#F2F6F1] px-3.5 py-3"
              >
                <BadgeCheck
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    check.detail ? "text-[#11603A]" : "text-[#9AA99D]"
                  }`}
                  aria-hidden="true"
                />
                <span>
                  <span className="block font-semibold">{check.label}</span>
                  <span className="block text-sm text-[#4C5F55]">
                    {check.detail ? "Verified" : "Not yet verified"}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <p className="m-0 mt-3 text-sm text-[#4C5F55]">
            We verify operator documents before their rides appear on Konvoy.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-5">
          <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>
            Your transport operator
          </h2>
          <p className="m-0 mt-2 text-sm text-[#4C5F55]">
            {ride.operator.name}
          </p>
          {ride.operator.contactPhone && (
            <p className="m-0 mt-2 text-sm">
              Contact: {ride.operator.contactPhone}
            </p>
          )}
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#DCE6DD] bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex max-w-md items-center gap-4">
          <p className={`${DISPLAY} m-0 text-xl font-extrabold tracking-tight`}>
            {naira(ride.price)}
          </p>

          <Link
            href={`/bookings/${ride.id}${query ? `?${query}` : ""}`}
            className="ml-auto flex min-h-[52px] flex-1 items-center justify-center rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22]"
          >
            Book this ride
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function RideDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#F2F6F1]" />}>
      {" "}
      <RideDetails />{" "}
    </Suspense>
  );
}
