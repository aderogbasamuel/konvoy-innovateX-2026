"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import RideCard from "@/components/rides/RideCard";
import { DISPLAY } from "@/components/landing/styles";
import { formatDate } from "@/lib/format";
import { RIDES } from "@/lib/rides";

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
  const to = params.get("to") || "Orientation camp";
  const date = params.get("date") || "";
  const distanceKm = 360; // replace with value from your API

  const [filter, setFilter] = useState<Filter>("all");

  const rides = useMemo(() => {
    const list = [...RIDES];
    if (filter === "price") list.sort((a, b) => a.price - b.price);
    if (filter === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [filter]);

  const tripQuery = new URLSearchParams({ from, to, ...(date ? { date } : {}) }).toString();

  const meta = [formatDate(date), `${distanceKm} km`].filter(Boolean).join(", ");

  return (
    <main className="min-h-dvh bg-[#F2F6F1] font-[family-name:var(--font-body)] text-[#10201A]">
      {/* header band */}
      <div className="bg-[#0A3B22] px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
        <header className="mx-auto max-w-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="-ml-3 grid h-12 w-12 place-items-center rounded-full hover:bg-white/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFC20E]"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <h1 className={`${DISPLAY} m-0 text-lg font-semibold`}>Available rides</h1>
          </div>

          <p className={`${DISPLAY} m-0 mt-3 text-[1.6rem] font-extrabold leading-tight tracking-[-0.02em]`}>
            {from} to {to}
          </p>
          <p className="m-0 mt-1 text-sm text-[#8FD1A9]">{meta}</p>
        </header>
      </div>

      {/* sort chips */}
      <div className="sticky top-0 z-10 bg-[#F2F6F1]/95 px-5 py-3 backdrop-blur">
        <div role="group" aria-label="Sort rides" className="mx-auto flex max-w-md gap-2">
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(key)}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#11603A] ${
                  active ? "bg-[#0A3B22] text-white" : "border-[1.5px] border-[#B7CDBB] bg-white text-[#10201A]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* list */}
      <section aria-label="Rides" className="mx-auto grid max-w-md gap-4 px-5 pb-10 pt-1">
        {rides.map((ride) => (
          <RideCard
            key={ride.id}
            ride={ride}
            onBook={() => router.push(`/book/${ride.id}?${tripQuery}`)}
            onViewSquad={() => router.push(`/squad?ride=${ride.id}&${tripQuery}`)}
          />
        ))}
      </section>
    </main>
  );
}

export default function RidesPage() {
  // useSearchParams needs a Suspense boundary in the App Router
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#F2F6F1]" />}>
      <Rides />
    </Suspense>
  );
}