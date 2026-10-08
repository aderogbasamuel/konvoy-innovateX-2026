import Logo from "../Logo";
import HeroBackground from "./HeroBackground";
import TripCard from "./TripCard";
import { DISPLAY, btn } from "./styles";

const focus =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFC20E]";

export default function Hero() {
  return (
    <div className="relative overflow-hidden">
      <HeroBackground />

      <header className="relative z-10 mx-auto max-w-[1120px] px-5 pb-44 pt-5 text-white md:px-8 md:pb-[88px] md:pt-7">
        <nav aria-label="Main" className="flex min-h-14 items-center justify-between rounded-full bg-white/90 py-1.5 pl-5 pr-2 text-black shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
          <a href="#" aria-label="Konvoy home" className="inline-flex min-h-12 items-center">
          <Logo tone="light" priority />
        </a>
          <div className="flex items-center gap-1 md:gap-2">
            <a href="#how" className="rounded-full px-3 py-2.5 text-[0.95rem] font-medium text-[#1f3327] hover:bg-[#F2F6F1] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0A3B22]">
              How it works
            </a>
            <a href="#partner" className="hidden rounded-full px-3 py-2.5 text-[0.95rem] font-medium text-[#1f3327] hover:bg-[#F2F6F1] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0A3B22] md:inline-block">
              For transport companies
            </a>
            <a href="/onboarding" className="hidden rounded-full bg-[#0A3B22] px-5 py-2.5 text-[0.95rem] font-semibold text-white hover:bg-[#11603A] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0A3B22] md:inline-block">
              Find a ride
            </a>
          </div>
        </nav>

        <div className="mt-9 grid gap-10 md:mt-[72px] md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-16">
          <div>
            <h1 className={`${DISPLAY} m-0 max-w-[13ch] text-[clamp(2.4rem,9vw,4.4rem)] font-extrabold leading-[1.02] tracking-[-0.03em]`}>
              Your trip to camp, with people who have your back.
            </h1>
            <p className="mt-5 max-w-[46ch] text-[1.1rem] leading-relaxed text-[#D5E8DB]">
              Book a verified ride to camp or your posting state. See which other corpers are travelling your route, and let your family follow the journey live.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/onboarding" className={`${btn} ${focus} bg-[#FFC20E] text-[#241A00] hover:bg-[#FFD13F]`}>
                Find a ride
              </a>
              <a href="#how" className={`${btn} ${focus} border-[1.5px] border-white/35 hover:border-white`}>
                See how it works
              </a>
            </div>
            <p className="mt-5 flex max-w-[46ch] items-start gap-2.5 text-[0.92rem] text-[#8FD1A9]">
              <svg className="mt-0.5 flex-none" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8FD1A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
                <path d="M8.5 12l2.5 2.5 4.5-5" />
              </svg>
              <span>Every transport company is checked by hand before it is listed.</span>
            </p>
          </div>
          <TripCard />
        </div>
      </header>
    </div>
  );
}