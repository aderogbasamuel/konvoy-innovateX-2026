\import type { ReactNode } from "react";
import { DISPLAY, h2 } from "./styles";

const svg = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

interface Stage {
  title: string;
  text: string;
  icon: ReactNode;
}

// Keep this copy true to how the product really works.
const stages: Stage[] = [
  {
    title: "Before you book",
    text: "Every transport company is checked by hand: licence, vehicle inspection and driver ID. Only companies that pass are listed.",
    icon: (
      <svg {...svg}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "On the road",
    text: "Your family follows the trip live from a link on WhatsApp or SMS, with no account needed. If GPS drops, they see the last known location and when it was recorded.",
    icon: (
      <svg {...svg}>
        <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
        <circle cx="12" cy="11" r="2" />
      </svg>
    ),
  },
  {
    title: "With other corpers",
    text: "See who else is travelling your route and date, and ask a State Buddy about camp before you arrive.",
    icon: (
      <svg {...svg}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function Safety() {
  return (
    <section id="safety" aria-labelledby="safety-heading" className="bg-[#F2F6F1] px-5 py-16 text-[#10201A] md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1120px] gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        <div>
          <h2 id="safety-heading" className={`${DISPLAY} ${h2} max-w-[16ch]`}>
            Safety you can see, before and during the trip.
          </h2>
          <p className="mt-4 max-w-[44ch] text-[1.05rem] leading-relaxed text-[#4C5F55]">
            Travelling to a new state is a big step for you and for your family. We show you who is driving, and we let the people who worry about you follow along.
          </p>
        </div>

        <ul className="m-0 grid list-none divide-y divide-[#DCE6DD] rounded-3xl bg-white p-0 shadow-[0_8px_24px_rgba(10,59,34,0.08)]">
          {stages.map((s) => (
            <li key={s.title} className="grid grid-cols-[44px_1fr] gap-4 p-5 md:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#DCEBDD] text-[#11603A]">{s.icon}</span>
              <div>
                <h3 className={`${DISPLAY} m-0 text-xl font-semibold`}>{s.title}</h3>
                <p className="m-0 mt-1 max-w-[52ch] leading-relaxed text-[#4C5F55]">{s.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}