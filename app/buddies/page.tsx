"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, MessageCircle, UserPlus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";
import { api, toRequestError, type ApiRequestError, type BuddyListItem } from "@/lib/api";
import { STATES } from "@/lib/states";

const QUICK_QUESTIONS: string[] = ["Where do I register at camp?", "What should I pack?", "Where can I stay nearby?"];

type Load =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: ApiRequestError }
  | { status: "ready"; items: BuddyListItem[] };

// Adds the chosen question to the message the API already prefilled
function whatsappLink(buddy: BuddyListItem, question: string): string {
  if (!question) return buddy.whatsappUrl;
  try {
    const url = new URL(buddy.whatsappUrl);
    url.searchParams.set("text", `${url.searchParams.get("text") ?? ""} ${question}`.trim());
    return url.toString();
  } catch {
    return buddy.whatsappUrl;
  }
}

function BuddyCard({ buddy }: { buddy: BuddyListItem }) {
  const [question, setQuestion] = useState<string>("");

  return (
    <li className="rounded-3xl bg-white p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className={`${DISPLAY} grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#0A3B22] text-lg font-extrabold text-[#FFC20E]`}>
          {buddy.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>{buddy.name}</h2>
          <p className="m-0 text-sm text-[#4C5F55]">Serving in {buddy.state}</p>
        </div>
      </div>
      {buddy.bio && <p className="m-0 mt-3 text-[0.95rem]">{buddy.bio}</p>}

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Add a question to your message">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            aria-pressed={question === q}
            onClick={() => setQuestion((cur) => (cur === q ? "" : q))}
            className={`min-h-11 rounded-full px-3.5 text-sm font-medium focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A] ${
              question === q ? "bg-[#0A3B22] text-white" : "border-[1.5px] border-[#B7CDBB]"
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      <a
        href={whatsappLink(buddy, question)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22]"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Message {buddy.name} on WhatsApp
      </a>
    </li>
  );
}

function Buddies() {
  const params = useSearchParams();
  const [state, setState] = useState<string>(params.get("state") ?? "");
  const [attempt, setAttempt] = useState<number>(0);
  const [load, setLoad] = useState<Load>({ status: "idle" });

  useEffect(() => {
    if (!state) {
      setLoad({ status: "idle" });
      return;
    }
    let cancelled = false;
    setLoad({ status: "loading" });
    api.buddies
      .list(state)
      .then((r) => !cancelled && setLoad({ status: "ready", items: r.items }))
      .catch((e: unknown) => !cancelled && setLoad({ status: "error", error: toRequestError(e) }));
    return () => {
      cancelled = true;
    };
  }, [state, attempt]);

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-28 font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader title="State Buddies" subtitle="Corpers already serving in your state, happy to answer questions." showBack={false} />

      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        <label className="grid gap-1.5 rounded-3xl bg-white p-5 text-sm font-semibold shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
          State
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="min-h-[52px] w-full rounded-[14px] border-2 border-[#D5E3D7] bg-white px-3.5 text-base font-normal focus-visible:border-[#0A3B22] focus-visible:outline-none"
          >
            <option value="">Choose a state</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        {load.status === "idle" && (
          <p className="m-0 rounded-3xl bg-white p-6 text-center text-[#4C5F55]">Choose your destination state to see who can help.</p>
        )}

        {load.status === "loading" && (
          <p role="status" className="m-0 rounded-3xl bg-white p-6 text-center text-[#4C5F55]">Loading State Buddies...</p>
        )}

        {load.status === "error" && (
          <div role="alert" className="rounded-3xl bg-white p-6 text-center">
            <p className="m-0 font-semibold">{load.error.message}</p>
            <div className="mt-3 flex justify-center gap-4">
              {load.error.status === 401 ? (
                <Link href="/signin" className="min-h-12 py-3 font-semibold text-[#11603A] underline">Sign in</Link>
              ) : (
                <button type="button" onClick={() => setAttempt((n) => n + 1)} className="min-h-12 font-semibold text-[#11603A] underline">Try again</button>
              )}
            </div>
          </div>
        )}

        {load.status === "ready" &&
          (load.items.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 text-center">
              <p className="m-0 font-semibold">No State Buddies in {state} yet.</p>
              <p className="m-0 mt-1 text-sm text-[#4C5F55]">We are adding more every week. Try a nearby state for now.</p>
            </div>
          ) : (
            <ul aria-label={`State Buddies in ${state}`} className="m-0 grid list-none gap-4 p-0">
              {load.items.map((b) => (
                <BuddyCard key={b.id} buddy={b} />
              ))}
            </ul>
          ))}

        <Link
          href="/buddies/join"
          className="flex min-h-14 items-center gap-3 rounded-3xl bg-[#DCEBDD] px-4 py-3 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#0A3B22] text-[#FFC20E]">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">Already serving? Become a State Buddy</span>
            <span className="block text-sm text-[#4C5F55]">Help new corpers heading to your state.</span>
          </span>
          <ChevronRight className="h-4 w-4 text-[#4C5F55]" aria-hidden="true" />
        </Link>
      </div>

      <BottomNav />
    </main>
  );
}

export default function BuddiesPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#F2F6F1]" />}>
      <Buddies />
    </Suspense>
  );
}