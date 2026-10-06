"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";
import { formatDate } from "@/lib/format";
import { CHAT, SQUAD, TRIPS, type ChatMessage } from "@/lib/mock";

const FACE_COLORS = ["bg-[#11603A]", "bg-[#B5651D]", "bg-[#5B4B8A]", "bg-[#2F6F8F]"];

type Tab = "members" | "chat";

function Squad() {
  const params = useSearchParams();
  const fallback = TRIPS.find((t) => t.status === "upcoming");
  const from = params.get("from") || fallback?.from || "Lagos";
  const to = params.get("to") || fallback?.to || "Camp";
  const date = params.get("date") || fallback?.date || "";

  const [tab, setTab] = useState<Tab>("members");
  const [optedIn, setOptedIn] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT);
  const [draft, setDraft] = useState("");

  function send(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    // TODO: POST /squads/{id}/messages { text }
    setMessages((m) => [...m, { id: `me-${m.length}`, from: "You", text, mine: true }]);
    setDraft("");
  }

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-28 font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader title="Your squad" subtitle={`${from} to ${to}${date ? `, ${formatDate(date)}` : ""}`} showBack={false}>
        <div role="group" aria-label="Squad view" className="mt-4 flex gap-2">
          {(["members", "chat"] as Tab[]).map((t) => (
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
        <section className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>{SQUAD.length + 1} corpers on this route</h2>
              <p className="m-0 mt-1 text-sm text-[#4C5F55]">
                Joining shows your first name to the squad and unlocks the group chat. You do not have to travel in the same vehicle.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={optedIn}
              aria-label="Join the squad"
              onClick={() => setOptedIn((v) => !v)}
              className={`relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#11603A] ${optedIn ? "bg-[#11603A]" : "bg-[#B7CDBB]"}`}
            >
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${optedIn ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </section>

        {tab === "members" ? (
          <ul aria-label="Squad members" className="m-0 grid list-none gap-2.5 p-0">
            {SQUAD.map((m, i) => (
              <li key={m.id} className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3">
                <span className={`${FACE_COLORS[i % FACE_COLORS.length]} grid h-11 w-11 place-items-center rounded-full text-sm font-semibold text-white`} aria-hidden="true">
                  {m.initials}
                </span>
                <span className="flex-1 font-semibold">{m.optedIn ? m.firstName : "Private member"}</span>
                {m.optedIn && <span className="rounded-full bg-[#DCEBDD] px-2.5 py-1 text-xs font-semibold text-[#11603A]">In the chat</span>}
              </li>
            ))}
          </ul>
        ) : !optedIn ? (
          <div className="rounded-3xl bg-white p-6 text-center">
            <p className="m-0 font-semibold">Join the squad to read and send messages.</p>
            <button type="button" onClick={() => setOptedIn(true)} className="mt-3 min-h-12 rounded-[14px] bg-[#FFC20E] px-6 font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0A3B22]">
              Join the squad
            </button>
          </div>
        ) : (
          <section aria-label="Squad chat" className="grid gap-3 rounded-3xl bg-white p-4">
            <div role="log" aria-live="polite" className="grid max-h-[360px] gap-2 overflow-y-auto">
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.95rem] ${m.mine ? "justify-self-end rounded-br bg-[#0A3B22] text-white" : "rounded-bl bg-[#E4EFE5]"}`}>
                  {!m.mine && <small className="mb-0.5 block text-[0.78rem] font-semibold text-[#4C5F55]">{m.from}</small>}
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Say hi to your squad"
                aria-label="Message"
                className="min-h-12 flex-1 rounded-[14px] border-2 border-[#D5E3D7] px-3.5 focus-visible:border-[#0A3B22] focus-visible:outline-none"
              />
              <button type="submit" aria-label="Send message" className="grid h-12 w-12 place-items-center rounded-[14px] bg-[#FFC20E] text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0A3B22]">
                <Send className="h-5 w-5" aria-hidden="true" />
              </button>
            </form>
          </section>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

export default function SquadPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#F2F6F1]" />}>
      <Squad />
    </Suspense>
  );
}