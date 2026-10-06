import type { ReactNode } from "react";
import { DISPLAY, h2 } from "./styles";

const svg = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

interface Point {
  title: string;
  text: string;
  icon: ReactNode;
}

const points: Point[] = [
  {
    title: "Works on low-end phones",
    text: "Light pages that load on weak networks.",
    icon: (
      <svg {...svg}>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
  },
  {
    title: "Tracking that survives bad signal",
    text: "If GPS drops, family sees the last known location and the time it was recorded.",
    icon: (
      <svg {...svg}>
        <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
        <circle cx="12" cy="11" r="2" />
      </svg>
    ),
  },
  {
    title: "Pay the way you already do",
    text: "Card, bank transfer or USSD.",
    icon: (
      <svg {...svg}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
];

const topics = ["Camp registration", "Where to stay", "What to expect"];

export default function StateBuddies() {
  return (
    <section aria-labelledby="state-buddies-heading" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1120px] gap-10 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <h2 id="state-buddies-heading" className={`${DISPLAY} ${h2} max-w-[18ch]`}>
            Ask someone who has already done it.
          </h2>
          <p className="mt-4 max-w-[50ch] text-[1.05rem] leading-relaxed text-[#D5E8DB]">
            State Buddies are corpers already serving in your destination state. Message them in the app or on WhatsApp
            before you travel.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {topics.map((t) => (
              <li key={t} className="rounded-full border border-[#2F6F4F] px-3.5 py-1.5 text-sm text-[#D5E8DB]">
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Example chat */}
        <div
          role="group"
          aria-label="Example conversation with a State Buddy"
          className="w-full max-w-[440px] justify-self-center overflow-hidden rounded-3xl bg-white text-[#10201A] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] md:justify-self-end"
        >
          <div className="flex items-center gap-3 bg-[#0A3B22] px-5 py-3.5 text-white">
            <span
              aria-hidden="true"
              className={`${DISPLAY} grid h-9 w-9 place-items-center rounded-full bg-[#FFC20E] text-sm font-bold text-[#0A3B22]`}
            >
              SB
            </span>
            <div className="leading-tight">
              <p className="m-0 text-[0.95rem] font-semibold">State Buddy</p>
              <p className="m-0 flex items-center gap-1.5 text-[0.78rem] text-[#8FD1A9]">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
                Serving in Kaduna · online
              </p>
            </div>
          </div>

          <div className="grid gap-3 bg-[#F1F6F1] px-4 py-5">
            <div className="max-w-[86%] justify-self-end rounded-2xl rounded-br bg-[#0A3B22] px-3.5 py-2.5 text-[0.95rem] leading-snug text-white">
              Where do I register when I get to camp, and what should I carry?
              <span className="mt-1 block text-right text-[0.7rem] text-[#8FD1A9]">9:41 ✓✓</span>
            </div>

            <div className="max-w-[86%] rounded-2xl rounded-bl bg-white px-3.5 py-2.5 text-[0.95rem] leading-snug shadow-sm">
              Go straight to the registration hall on arrival. Keep your call-up letter and original credentials in your
              hand luggage, not the boot.
              <span className="mt-1 block text-[0.7rem] text-[#4C5F55]">9:43</span>
            </div>

            <div className="max-w-[86%] rounded-2xl rounded-bl bg-white px-3.5 py-2.5 text-[0.95rem] leading-snug shadow-sm">
              Message me when you land and I'll point you to the right gate.
              <span className="mt-1 block text-[0.7rem] text-[#4C5F55]">9:43</span>
            </div>

            {/* Typing indicator */}
            <div aria-hidden="true" className="flex w-fit gap-1 rounded-2xl rounded-bl bg-white px-3.5 py-3 shadow-sm">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  style={{ animationDelay: `${d}ms` }}
                  className="h-1.5 w-1.5 rounded-full bg-[#4C5F55] motion-safe:animate-pulse"
                />
              ))}
            </div>
          </div>

          <p className="m-0 border-t border-[#DCE8DE] px-5 py-3 text-sm font-semibold text-[#11603A]">
            Reply in the app or continue on WhatsApp
          </p>
        </div>
      </div>

      <ul className="mx-auto mt-14 grid max-w-[1120px] gap-6 md:grid-cols-3 md:gap-8">
        {points.map((p) => (
          <li key={p.title} className="border-l-4 border-[#FFC20E] pl-4">
            <h3 className={`${DISPLAY} flex items-center gap-2 text-[1.1rem]`}>
              <span className="text-[#FFC20E]">{p.icon}</span>
              {p.title}
            </h3>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-[#8FD1A9]">{p.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}