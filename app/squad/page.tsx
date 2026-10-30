"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";
import { api, toRequestError, type ApiRequestError, type Squad } from "@/lib/api";

type Load =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: ApiRequestError }
  | { status: "ready"; squad: Squad };

function SquadView() {
  const ride = useSearchParams().get("ride");
  const [attempt, setAttempt] = useState<number>(0);
  const [load, setLoad] = useState<Load>({ status: "idle" });

  useEffect(() => {
    if (!ride) {
      setLoad({ status: "idle" });
      return;
    }
    let cancelled = false;
    setLoad({ status: "loading" });
    api.squad
      .get(ride)
      .then((squad) => !cancelled && setLoad({ status: "ready", squad }))
      .catch((e: unknown) => !cancelled && setLoad({ status: "error", error: toRequestError(e) }));
    return () => {
      cancelled = true;
    };
  }, [ride, attempt]);

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-28 font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader title="Your squad" subtitle="Corpers travelling your route on your day." showBack={false} />

      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        {load.status === "idle" && (
          <div className="rounded-3xl bg-white p-6 text-center shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
            <p className="m-0 font-semibold">Open a squad from a ride or one of your trips.</p>
            <Link href="/trips" className="mt-2 inline-block min-h-12 py-3 font-semibold text-[#11603A] underline">Go to my trips</Link>
          </div>
        )}

        {load.status === "loading" && (
          <p role="status" className="m-0 rounded-3xl bg-white p-6 text-center text-[#4C5F55] shadow-[0_16px_32px_rgba(10,59,34,0.14)]">Loading your squad...</p>
        )}

        {load.status === "error" && (
          <div role="alert" className="rounded-3xl bg-white p-6 text-center shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
            <p className="m-0 font-semibold">{load.error.status === 404 ? "We could not find that ride." : load.error.message}</p>
            {load.error.status === 401 ? (
              <Link href="/signin" className="mt-2 inline-block min-h-12 py-3 font-semibold text-[#11603A] underline">Sign in</Link>
            ) : load.error.status !== 404 ? (
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className="mt-2 min-h-12 font-semibold text-[#11603A] underline">Try again</button>
            ) : null}
          </div>
        )}

        {load.status === "ready" && (
          <>
            <section aria-label="Squad size" className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
              <p className={`${DISPLAY} m-0 text-[2.4rem] font-extrabold leading-none tracking-tight`}>{load.squad.count}</p>
              <p className="m-0 mt-1 text-[#4C5F55]">{load.squad.count === 1 ? "corper" : "corpers"} booked on this route and day</p>
              {load.squad.joined && load.squad.others > 0 && (
                <p className="m-0 mt-2 text-sm font-semibold text-[#11603A]">
                  You and {load.squad.others} {load.squad.others === 1 ? "other" : "others"}
                </p>
              )}
            </section>

            {load.squad.joined ? (
              load.squad.whatsappGroupUrl ? (
                <a
                  href={load.squad.whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22]"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Join the squad on WhatsApp
                </a>
              ) : (
                <p className="m-0 rounded-3xl bg-[#FFF3C4] p-4 text-sm text-[#5C4400]">Your squad&apos;s WhatsApp group is not ready yet. Check back soon.</p>
              )
            ) : (
              <Link
                href={`/rides/${encodeURIComponent(ride ?? "")}`}
                className="flex min-h-[52px] items-center justify-center rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22]"
              >
                Book a seat to join the squad
              </Link>
            )}

            <p className="m-0 text-sm text-[#4C5F55]">Squads are for company before travel day. You do not have to travel in the same vehicle.</p>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

export default function SquadPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#F2F6F1]" />}>
      <SquadView />
    </Suspense>
  );
}