"use client";

import { useEffect, useId, useRef, useState } from "react";

interface Props {
  code?: string;
  className?: string;
}

// Small "!" button that reveals the fixed testing code. Delete this component
// (and its usages) once real codes are in place.
export default function TestCodeHint({ code = "123456", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={wrapRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Testing code info"
        aria-expanded={open}
        aria-controls={panelId}
        className="grid h-6 w-6 place-items-center rounded-full bg-[#FFC20E] text-sm font-bold leading-none text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#11603A]"
      >
        !
      </button>

      {open && (
        <span
          id={panelId}
          role="status"
          className="absolute right-0 top-8 z-20 w-56 rounded-[14px] bg-[#10201A] px-3.5 py-3 text-left text-sm text-white shadow-[0_12px_24px_rgba(10,59,34,0.25)]"
        >
          We are currently testing. Use the code{" "}
          <b className="rounded bg-white/15 px-1.5 py-0.5 tracking-widest">{code}</b>
        </span>
      )}
    </span>
  );
}