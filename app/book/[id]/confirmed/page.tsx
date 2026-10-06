"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Briefcase, Check, CheckCircle2, ChevronRight, Copy, MessageCircle, MessagesSquare, Share2, Users } from "lucide-react";
import { DISPLAY } from "@/components/landing/styles";
import { formatDate, naira } from "@/lib/format";
import { RIDES } from "@/lib/rides";

function Confirmed() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const ride = RIDES.find((r) => r.id === id);

  const from = params.get("from") || "Lagos";
  const to = params.get("to") || "Orientation camp";
  const date = params.get("date") || "";
  const seat = params.get("seat") || "";

  // Mock token: your API should issue an unguessable one per booking
  const token = `${id}-s${seat}-${date || "open"}`;
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setLink(`${window.location.origin}/track/${token}`), [token]);

  const message = `I'm travelling with Konvoy. Follow my trip live here: ${link}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked, the WhatsApp and share buttons still work */
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Follow my trip", text: message, url: link });
      } catch {
        /* dismissed */
      }
      return;
    }
    await copy();
  }

  const next = [
    { href: "/squad", label: "Meet your squad", hint: "See who else is on your route", Icon: Users },
    { href: "/buddies", label: "Ask a State Buddy", hint: "Questions about camp and the state", Icon: MessagesSquare },
    { href: "/trips", label: "View my trips", hint: "Your bookings in one place", Icon: Briefcase },
  ];

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-10 font-[family-name:var(--font-body)] text-[#10201A]">
      <div className="bg-[#0A3B22] px-5 pb-16 pt-[max(2rem,env(safe-area-inset-top))] text-white">
        <header className="mx-auto max-w-md">
          <CheckCircle2 className="h-10 w-10 text-[#FFC20E]" aria-hidden="true" />
          <h1 className={`${DISPLAY} m-0 mt-3 text-[1.9rem] font-extrabold leading-tight tracking-[-0.02em]`}>You are booked.</h1>
          <p className="m-0 mt-1 text-[#8FD1A9]">Next, let your family follow the trip.</p>
        </header>
      </div>

      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        <section aria-label="Booking summary" className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]">
          <p className={`${DISPLAY} m-0 text-[1.35rem] font-semibold tracking-tight`}>{from} to {to}</p>
          <dl className="m-0 mt-3 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Date", date ? formatDate(date) : "To be confirmed"],
              ["Seat", seat || "-"],
              ["Operator", ride?.operator ?? "-"],
              ["Paid", ride ? naira(ride.price) : "-"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[14px] bg-[#F2F6F1] px-3.5 py-3">
                <dt className="text-[0.8rem] text-[#4C5F55]">{k}</dt>
                <dd className="m-0 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label="Share your trip" className="rounded-3xl bg-white p-5">
          <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>Share your tracking link</h2>
          <p className="m-0 mt-1 text-sm text-[#4C5F55]">
            Family can open it without an account. Anyone with this link can see your trip until you arrive.
          </p>
          <button
            type="button"
            onClick={share}
            disabled={!link}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#FFC20E] font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22] disabled:opacity-50"
          >
            <Share2 className="h-5 w-5" aria-hidden="true" />
            Share tracking link with family
          </button>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#0A3B22] font-semibold text-[#0A3B22] hover:bg-[#E4EFE5] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />WhatsApp
            </a>
            <button
              type="button"
              onClick={copy}
              disabled={!link}
              className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#0A3B22] font-semibold text-[#0A3B22] hover:bg-[#E4EFE5] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A] disabled:opacity-50"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
            </button>
          </div>
        </section>

        <nav aria-label="What next" className="grid gap-2.5">
          {next.map(({ href, label, hint, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-14 items-center gap-3 rounded-3xl bg-[#DCEBDD] px-4 py-3 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#0A3B22] text-[#FFC20E]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{label}</span>
                <span className="block text-sm text-[#4C5F55]">{hint}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-[#4C5F55]" aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#F2F6F1]" />}>
      <Confirmed />
    </Suspense>
  );
}