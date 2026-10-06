"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";
import { formatDate, naira } from "@/lib/format";
import { TRIPS } from "@/lib/mock";

type Tab = "upcoming" | "past";

export default function TripsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const trips = TRIPS.filter((t) => t.status === tab);

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-28 font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader title="My trips" showBack={false}>
        <div role="group" aria-label="Filter trips" className="mt-4 flex gap-2">
          {(["upcoming", "past"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
              className={`min-h-11 rounded-full px-5 text-sm font-semibold capitalize focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFC20E] ${
                tab === t ? "bg-[#FFC20E] text-[#241A00]" : "border-[1.5px] border-white/35 text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </ScreenHeader>

      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        {trips.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
            <p className="m-0 font-semibold">No {tab} trips yet.</p>
            {tab === "upcoming" && (
              <Link href="/home" className="mt-2 inline-block min-h-12 py-3 font-semibold text-[#11603A] underline">Find a ride</Link>
            )}
          </div>
        ) : (
          trips.map((t) => (
            <Link
              key={t.id}
              href={`/trips/${t.id}`}
              className="flex items-center gap-3 rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]"
            >
              <div className="min-w-0 flex-1">
                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${t.status === "upcoming" ? "bg-[#DCEBDD] text-[#11603A]" : "bg-[#E4EBE4] text-[#4C5F55]"}`}>
                  {t.status === "upcoming" ? "Confirmed" : "Completed"}
                </span>
                <p className={`${DISPLAY} m-0 mt-2 text-[1.2rem] font-semibold tracking-tight`}>{t.from} to {t.to}</p>
                <p className="m-0 mt-0.5 text-sm text-[#4C5F55]">{formatDate(t.date)}</p>
                <p className="m-0 text-sm text-[#4C5F55]">{t.operator}, seat {t.seat}, {naira(t.price)}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-[#4C5F55]" aria-hidden="true" />
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}