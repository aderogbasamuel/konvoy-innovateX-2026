"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { BadgeCheck, ShieldCheck, Star } from "lucide-react";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";
import { compact, formatDate, naira } from "@/lib/format";
import { REVIEWS, VERIFICATION } from "@/lib/mock";
import { RIDES } from "@/lib/rides";

function RideDetails() {
  const { id } = useParams<{ id: string }>();
  const query = useSearchParams().toString(); // keeps from, to and date for booking
  const ride = RIDES.find((r) => r.id === id);

  if (!ride) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F2F6F1] px-5 text-center text-[#10201A]">
        <div>
          <p className="m-0 font-semibold">We could not find that ride.</p>
          <Link href="/rides" className="mt-3 inline-block min-h-12 py-3 font-semibold text-[#11603A] underline">Back to available rides</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-32 font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader title={ride.operator} subtitle={ride.vehicle}>
        <p className="m-0 mt-3 flex items-center gap-1.5 text-sm">
          <Star className="h-4 w-4 fill-[#FFC20E] text-[#FFC20E]" aria-hidden="true" />
          <b>{ride.rating}</b>
          <span className="text-[#8FD1A9]">({compact(ride.reviews)} reviews)</span>
        </p>
      </ScreenHeader>

      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        <section aria-label="Verification" className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
          <h2 className={`${DISPLAY} m-0 flex items-center gap-2 text-[1.1rem] font-semibold`}>
            <ShieldCheck className="h-5 w-5 text-[#11603A]" aria-hidden="true" />
            Verified by Konvoy
          </h2>
          <ul className="m-0 mt-3 grid list-none gap-2.5 p-0">
            {VERIFICATION.map((v) => (
              <li key={v.label} className="flex items-start gap-3 rounded-[14px] bg-[#F2F6F1] px-3.5 py-3">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#11603A]" aria-hidden="true" />
                <span>
                  <span className="block font-semibold">{v.label}</span>
                  <span className="block text-sm text-[#4C5F55]">{v.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="m-0 mt-3 text-sm text-[#4C5F55]">We check every document by hand before a company is listed.</p>
        </section>

        <section aria-label="Reviews" className="rounded-3xl bg-white p-5">
          <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>What corpers say</h2>
          <ul className="m-0 mt-3 grid list-none gap-3 p-0">
            {REVIEWS.map((r) => (
              <li key={r.id} className="border-t border-[#E4EBE4] pt-3 first:border-t-0 first:pt-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{r.name}</span>
                  <span className="flex" role="img" aria-label={`${r.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-[#FFC20E] text-[#FFC20E]" : "text-[#B7CDBB]"}`} aria-hidden="true" />
                    ))}
                  </span>
                </div>
                <p className="m-0 mt-1 text-[0.95rem]">{r.text}</p>
                <p className="m-0 mt-1 text-xs text-[#4C5F55]">{formatDate(r.date)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#DCE6DD] bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex max-w-md items-center gap-4">
          <p className={`${DISPLAY} m-0 text-xl font-extrabold tracking-tight`}>{naira(ride.price)}</p>
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
      <RideDetails />
    </Suspense>
  );
}