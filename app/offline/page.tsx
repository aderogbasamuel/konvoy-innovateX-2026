import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { DISPLAY } from "@/components/landing/styles";

export const metadata: Metadata = { title: "You are offline" };

// Static on purpose: this page is cached by the service worker and has to work without JavaScript
export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#F2F6F1] px-6 font-[family-name:var(--font-body)] text-[#10201A]">
      <div className="grid max-w-sm justify-items-center gap-4 text-center">
        <Logo />
        <h1 className={`${DISPLAY} m-0 mt-4 text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em]`}>You are offline</h1>
        <p className="m-0 text-[#4C5F55]">We could not load this page without a connection. Check your signal and try again.</p>
        <a
          href="/home"
          className="mt-2 inline-flex min-h-[52px] items-center justify-center rounded-[14px] bg-[#FFC20E] px-8 font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22]"
        >
          Try again
        </a>
      </div>
    </main>
  );
}