"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import RideCard from "@/components/rides/RideCard";
import { DISPLAY } from "@/components/landing/styles";
import { formatDate } from "@/lib/format";
import { RIDES } from "@/lib/rides";

type Filter = "all" | "price" | "rating";

const FILTERS: { key: Filter; label: string; note: string }[] = [
  { key: "all", label: "Recommended", note: "recommended first" },
  { key: "price", label: "Lowest price", note: "lowest price first" },
  { key: "rating", label: "Top rated", note: "top rated first" },
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
    // Ties fall back to the other measure so the order is predictable
    if (filter === "price") list.sort((a, b) => a.price - b.price || b.rating - a.rating);
    if (filter === "rating") list.sort((a, b) => b.rating - a.rating || a.price - b.price);
    return list;
  }, [filter]);

  const meta = [formatDate(date), `${distanceKm} km`].filter(Boolean).join(", ");
  const note = FILTERS.find((f) => f.key === filter)?.note;

  // If someone opened this link directly there is nothing to go back to, so send them home
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/home");
  };

  return (
    <main className="min-h-dvh bg-[#F2F6F1] font-[family-name:var(--font-body)] text-[#10201A]">
      {/* header band */}
      <div className="bg-[#0A3B22] px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
        <header className="mx-auto max-w-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goBack}
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
        <div role="group" aria-label="Sort rides" className="mx-auto flex max-w-md gap-2 overflow-x-auto">
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(key)}
                className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#11603A] ${
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
      <section aria-label="Rides" className="mx-auto max-w-md px-5 pb-10 pt-1">
        <p aria-live="polite" className="m-0 mb-3 text-sm text-[#4C5F55]">
          {rides.length} {rides.length === 1 ? "ride" : "rides"}, {note}
        </p>

        {rides.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center">
            <p className={`${DISPLAY} m-0 text-lg font-semibold`}>No rides on this route yet</p>
            <p className="m-0 mt-1 text-sm text-[#4C5F55]">Try another date or a nearby state.</p>
            <button
              type="button"
              onClick={goBack}
              className="mt-4 min-h-12 rounded-[14px] bg-[#FFC20E] px-6 font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22]"
            >
              Change search
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {rides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onBook={() => router.push(`/book/${ride.id}${date ? `?date=${date}` : ""}`)}
                onViewSquad={() => router.push(`/squad?ride=${ride.id}${date ? `&date=${date}` : ""}`)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function RidesSkeleton() {
  return (
    <div className="min-h-dvh bg-[#F2F6F1]" aria-busy="true">
      <div className="h-[170px] bg-[#0A3B22]" />
      <div className="mx-auto grid max-w-md gap-4 px-5 pt-16">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 rounded-3xl bg-white motion-safe:animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function RidesPage() {
  // useSearchParams needs a Suspense boundary in the App Router
  return (
    <Suspense fallback={<RidesSkeleton />}>
      <Rides />
    </Suspense>
  );
}