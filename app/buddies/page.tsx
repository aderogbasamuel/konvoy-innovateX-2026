"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";
import { STATES } from "@/lib/states";
import { BUDDIES, TRIPS, type Buddy } from "@/lib/mock";

const QUICK_QUESTIONS: string[] = ["Where do I register at camp?", "What should I pack?", "Where can I stay nearby?"];

interface BuddyCardProps {
  buddy: Buddy;
}

function BuddyCard({ buddy }: BuddyCardProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [sent, setSent] = useState<boolean>(false);

  function send(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (!message.trim()) return;
    // TODO: POST /buddies/{id}/conversations { message }. The API returns whatsappUrl after contact starts.
    setSent(true);
  }

  return (
    <li className="rounded-3xl bg-white p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className={`${DISPLAY} grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#0A3B22] text-lg font-extrabold text-[#FFC20E]`}>
          {buddy.firstName[0]}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>{buddy.firstName}</h2>
          <p className="m-0 text-sm text-[#4C5F55]">Serving in {buddy.state}. Speaks {buddy.languages.join(", ")}.</p>
        </div>
      </div>
      <p className="m-0 mt-3 text-[0.95rem]">{buddy.bio}</p>

      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-4 min-h-12 w-full rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22]">
          Message {buddy.firstName}
        </button>
      ) : sent ? (
        <div role="status" className="mt-4 grid gap-3">
          <p className="m-0 rounded-[14px] bg-[#DCEBDD] px-3.5 py-3 text-sm font-semibold text-[#11603A]">Message sent. {buddy.firstName} will reply in the app.</p>
          <a
            href={`https://wa.me/${buddy.whatsapp}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#0A3B22] font-semibold text-[#0A3B22] hover:bg-[#E4EFE5] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />Continue on WhatsApp
          </a>
        </div>
      ) : (
        <form onSubmit={send} className="mt-4 grid gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Quick questions">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} type="button" onClick={() => setMessage(q)} className="min-h-11 rounded-full border-[1.5px] border-[#B7CDBB] px-3.5 text-sm font-medium focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]">
                {q}
              </button>
            ))}
          </div>
          <label className="grid gap-1.5 text-sm font-semibold">
            Your question
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder={`Ask ${buddy.firstName} anything about camp or ${buddy.state}`}
              className="rounded-[14px] border-2 border-[#D5E3D7] px-3.5 py-3 font-normal focus-visible:border-[#0A3B22] focus-visible:outline-none"
            />
          </label>
          <button type="submit" disabled={!message.trim()} className="min-h-12 rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22] disabled:opacity-50">
            Send message
          </button>
        </form>
      )}
    </li>
  );
}

function Buddies() {
  const params = useSearchParams();
  const fallback = TRIPS.find((t) => t.status === "upcoming")?.to;
  const [state, setState] = useState(params.get("state") || fallback || "Kaduna");
  const buddies = BUDDIES.filter((b) => b.state.toLowerCase() === state.toLowerCase());

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-28 font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader title="State Buddies" subtitle="Corpers already serving in your state, happy to answer questions." showBack={false} />

      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        <label className="grid gap-1.5 rounded-3xl bg-white p-5 text-sm font-semibold shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
          State
          <select
            value={STATES.includes(state) ? state : ""}
            onChange={(e) => setState(e.target.value)}
            className="min-h-[52px] w-full rounded-[14px] border-2 border-[#D5E3D7] bg-white px-3.5 text-base font-normal focus-visible:border-[#0A3B22] focus-visible:outline-none"
          >
            {!STATES.includes(state) && <option value="">Choose a state</option>}
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        {buddies.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-center">
            <p className="m-0 font-semibold">No State Buddies in {state} yet.</p>
            <p className="m-0 mt-1 text-sm text-[#4C5F55]">We are adding more every week. Try a nearby state for now.</p>
          </div>
        ) : (
          <ul aria-label={`State Buddies in ${state}`} className="m-0 grid list-none gap-4 p-0">
            {buddies.map((b) => (
              <BuddyCard key={b.id} buddy={b} />
            ))}
          </ul>
        )}
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