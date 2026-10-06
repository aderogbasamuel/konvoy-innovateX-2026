"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DISPLAY } from "@/components/landing/styles";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  showBack?: boolean;
}

// Deep green band with a back button, used at the top of sub-screens
export default function ScreenHeader({ title, subtitle, children, showBack }: ScreenHeaderProps) {
  const router = useRouter();
  return (
    <div className="bg-[#0A3B22] px-5 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
      <header className="mx-auto max-w-md">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="-ml-3 grid h-12 w-12 place-items-center rounded-full hover:bg-white/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#FFC20E]"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className={`${DISPLAY} m-0 mt-2 text-[1.75rem] font-extrabold leading-tight tracking-[-0.02em]`}>{title}</h1>
        {subtitle && <p className="m-0 mt-1 text-[#8FD1A9]">{subtitle}</p>}
        {children}
      </header>
    </div>
  );
}