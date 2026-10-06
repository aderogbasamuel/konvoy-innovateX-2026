import { DISPLAY, btn, h2 } from "./styles";

// Point this at your partner application page when it exists
// (a form URL, a WhatsApp link, or mailto:partners@yourdomain.com all work).
const APPLY_HREF = "#partner";

const checks = ["Operating licence", "Vehicle inspection", "Driver ID"];

const svg = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export default function Partners() {
  return (
    <section id="partner" aria-labelledby="partners-heading" className="bg-[#11603A] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1120px] gap-10 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <h2 id="partners-heading" className={`${DISPLAY} ${h2}`}>
            Run a transport company?
          </h2>
          <p className="mt-4 max-w-[46ch] text-[1.05rem] leading-relaxed text-[#E2F1E7]">
            Get steady bookings from corpers on the routes you already drive.
          </p>
          <a
            href={APPLY_HREF}
            className={`${btn} mt-7 w-fit bg-[#FFC20E] text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
          >
            Apply to partner
          </a>
        </div>

        <div className="w-full max-w-[440px] justify-self-center rounded-3xl bg-[#0A3B22] p-6 text-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)] md:justify-self-end">
          <div className="flex items-center gap-2.5 text-[#FFC20E]">
            <svg {...svg}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <h3 className={`${DISPLAY} text-[1.1rem] text-white`}>We check every partner by hand</h3>
          </div>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-[#8FD1A9]">
            Before you are listed, we verify:
          </p>
          <ul className="mt-4 grid gap-2.5">
            {checks.map((c) => (
              <li key={c} className="flex items-center gap-3 rounded-xl bg-[#11603A] px-4 py-3 text-[0.95rem] font-semibold">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#FFC20E] text-[#241A00]">
                  <svg {...svg} width={14} height={14} strokeWidth={3}>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}