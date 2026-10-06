import type { ReactNode } from "react";
import { DISPLAY, btn, h2 } from "./styles";

interface Step {
  title: string;
  text: string;
  preview: ReactNode;
}

const chip = "rounded-full border border-[#D3E2D6] bg-white px-3 py-1 text-[0.8rem] font-semibold text-[#10201A]";

const steps: Step[] = [
  {
    title: "Pick your route",
    text: "Choose where you are leaving from and whether you are heading to camp or your posting state.",
    preview: (
      <div className="flex items-center gap-2">
        <span className={chip}>Lagos</span>
        <span className="w-7 border-t-2 border-dashed border-[#0A3B22]" />
        <span className={chip}>Camp</span>
      </div>
    ),
  },
  {
    title: "Book a verified seat",
    text: "Compare price, vehicle and ratings. Pay by card, bank transfer or USSD.",
    preview: (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#0A3B22] px-3 py-1 text-[0.8rem] font-semibold text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFC20E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Verified
        </span>
        <span className={chip}>Card</span>
        <span className={chip}>Transfer</span>
        <span className={chip}>USSD</span>
      </div>
    ),
  },
  {
    title: "Meet your squad",
    text: "See other corpers on your route and date. Join the group chat before travel day if you want company.",
    preview: (
      <div className="flex items-center gap-3">
        <div className="flex">
          {["#0A3B22", "#B5651D", "#5B4B8A", "#2F6F8F"].map((c, i) => (
            <span
              key={c}
              style={{ backgroundColor: c }}
              className={`h-7 w-7 rounded-full border-2 border-[#F2F6F1] ${i > 0 ? "-ml-2" : ""}`}
            />
          ))}
        </div>
        <span className="text-[0.8rem] font-semibold text-[#4C5F55]">Group chat</span>
      </div>
    ),
  },
  {
    title: "Share your trip",
    text: "Send a link on WhatsApp or SMS. Your family follows live without making an account.",
    preview: (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={chip}>WhatsApp</span>
        <span className={chip}>SMS</span>
        <span className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-[#11603A]">
          <span className="h-2 w-2 rounded-full bg-[#11603A] motion-safe:animate-pulse" />
          Live
        </span>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-heading" className="bg-[#F2F6F1] px-5 py-16 text-[#10201A] md:px-8 md:py-24">
      <div className="mx-auto max-w-[1120px]">
        <h2 id="how-heading" className={`${DISPLAY} ${h2} max-w-[18ch]`}>
          From booking to camp gate in four steps.
        </h2>
        <p className="mt-4 max-w-[50ch] text-[1.05rem] leading-relaxed text-[#4C5F55]">
          Everything you need for the journey is in one place, from choosing a ride to letting your family know you arrived.
        </p>

        <ol className="mt-12 grid list-none p-0 md:grid-cols-4 md:gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="relative grid grid-cols-[44px_1fr] gap-4 pb-9 last:pb-0 md:grid-cols-1 md:pb-0">
              <span
                className={`${DISPLAY} relative z-10 grid h-11 w-11 place-items-center rounded-full bg-[#0A3B22] font-extrabold text-[#FFC20E]`}
              >
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-[21px] top-11 w-0.5 bg-[#B7CDBB] md:bottom-auto md:left-14 md:right-[-12px] md:top-[21px] md:h-0.5 md:w-auto"
                />
              )}
              <div>
                <h3 className={`${DISPLAY} mb-1 mt-2 text-xl font-semibold md:mt-0`}>{s.title}</h3>
                <p className="m-0 max-w-[44ch] leading-relaxed text-[#4C5F55]">{s.text}</p>
                <div aria-hidden="true" className="mt-4 rounded-2xl border border-[#DCE8DE] bg-white/70 px-3.5 py-3">
                  {s.preview}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <a
          href="#book"
          className={`${btn} mt-12 w-fit bg-[#0A3B22] text-white hover:bg-[#11603A] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0A3B22]`}
        >
          Find a ride
        </a>
      </div>
    </section>
  );
}