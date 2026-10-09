"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import RideCard from "@/components/rides/RideCard";
import { DISPLAY } from "@/components/landing/styles";
import { formatDate } from "@/lib/format";
import { searchRides, type TransportRide } from "@/lib/rides-api";

type Filter = "all" | "price" | "rating";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "price", label: "Lowest price" },
  { key: "rating", label: "Top rated" },
];

function Rides() {
  const router = useRouter();
  const params = useSearchParams();

  const from = params.get("from") || "Lagos";
  const to = params.get("to") || "";
  const date = params.get("date") || "";

  const [filter, setFilter] = useState<Filter>("all");
  const [rides, setRides] = useState<TransportRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadRides() {
      setLoading(true);
      setError("");

      try {
        const results = await searchRides({
          origin: from,
          destination: to,
          date: date || undefined,
        });

        if (active) setRides(results);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "We couldn't load rides. Please try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRides();

    return () => {
      active = false;
    };
  }, [from, to, date]);

  const sortedRides = useMemo(() => {
    const list = [...rides];

    if (filter === "price") {
      list.sort((a, b) => a.price - b.price);
    }

    if (filter === "rating") {
      list.sort(
        (a, b) => (b.operator.ratingAvg ?? 0) - (a.operator.ratingAvg ?? 0),
      );
    }

    return list;
  }, [rides, filter]);

  const tripQuery = new URLSearchParams({
    from,
    to,
    ...(date ? { date } : {}),
  }).toString();

  const meta = [formatDate(date)].filter(Boolean).join(", ");

  return (
    <main className="min-h-dvh bg-[#F2F6F1] font-[family-name:var(--font-body)] text-[#10201A]">
      {" "}
      <div className="bg-[#0A3B22] px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
        {" "}
        <header className="mx-auto max-w-md">
          {" "}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="-ml-3 grid h-12 w-12 place-items-center rounded-full hover:bg-white/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFC20E]"
            >
              {" "}
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />{" "}
            </button>

            <h1 className={`${DISPLAY} m-0 text-lg font-semibold`}>
              Available rides
            </h1>
          </div>
          <p
            className={`${DISPLAY} m-0 mt-3 text-[1.6rem] font-extrabold leading-tight tracking-[-0.02em]`}
          >
            {from} to {to || "Your destination"}
          </p>
          <p className="m-0 mt-1 text-sm text-[#8FD1A9]">
            {meta || "Choose your travel date"}
          </p>
        </header>
      </div>
      <div className="sticky top-0 z-10 bg-[#F2F6F1]/95 px-5 py-3 backdrop-blur">
        <div
          role="group"
          aria-label="Sort rides"
          className="mx-auto flex max-w-md gap-2"
        >
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;

            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(key)}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#11603A] ${
                  active
                    ? "bg-[#0A3B22] text-white"
                    : "border-[1.5px] border-[#B7CDBB] bg-white text-[#10201A]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <section
        aria-label="Rides"
        aria-live="polite"
        className="mx-auto grid max-w-md gap-4 px-5 pb-10 pt-1"
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-[#52665A]">
            Finding available rides...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-5 text-center">
            <p className="font-semibold text-[#10201A]">Couldn't load rides</p>
            <p className="mt-2 text-sm text-[#52665A]">{error}</p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-4 rounded-full bg-[#0A3B22] px-5 py-3 text-sm font-semibold text-white"
            >
              Refresh page
            </button>
          </div>
        ) : sortedRides.length === 0 ? (
          <div className="rounded-2xl border border-[#D8E4D9] bg-white p-6 text-center">
            <p className="font-semibold">No rides found yet</p>
            <p className="mt-2 text-sm text-[#52665A]">
              Try another date or route. New verified rides will appear here
              when available.
            </p>
          </div>
        ) : (
          sortedRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onBook={() => router.push(`/rides/${ride.id}?${tripQuery}`)}
              onViewSquad={() =>
                router.push(`/squad?ride=${ride.id}&${tripQuery}`)
              }
            />
          ))
        )}
      </section>
    </main>
  );
}

export default function RidesPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#F2F6F1]" />}>
      {" "}
      <Rides />{" "}
    </Suspense>
  );
}
