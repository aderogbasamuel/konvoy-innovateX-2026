"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, ShieldAlert, X } from "lucide-react";
import { DISPLAY } from "@/components/landing/styles";

const HOLD_MS = 1500;
const EMERGENCY_NUMBER = "112"; // Nigeria national emergency line

type Loc = { status: "idle" | "locating" | "ready" | "denied"; url?: string };

export default function PanicButton() {
  const [holding, setHolding] = useState(false);
  const [open, setOpen] = useState(false);
  const [loc, setLoc] = useState<Loc>({ status: "idle" });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  function locate() {
    if (!("geolocation" in navigator)) {
      setLoc({ status: "denied" });
      return;
    }
    setLoc({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLoc({
          status: "ready",
          url: `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`,
        }),
      () => setLoc({ status: "denied" }),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );
  }

  function openSheet() {
    setOpen(true);
    navigator.vibrate?.(60);
    locate();
  }

  function startHold() {
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      openSheet();
    }, HOLD_MS);
  }

  function cancelHold() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  }

  // Clean up the timer if the page closes mid-hold
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Escape closes the sheet, and focus moves into it when it opens
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const message = loc.url
    ? `I need help. This is my location: ${loc.url}`
    : "I need help. Please call me as soon as you can.";

  async function sendLocation() {
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
      } catch {
        /* dismissed */
      }
      return;
    }
    window.location.href = `sms:?&body=${encodeURIComponent(message)}`;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Emergency help. Press and hold for 1.5 seconds to open."
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          // Keyboard users can't hold, so Enter or Space opens it directly
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openSheet();
          }
        }}
        className="relative h-12 touch-none select-none overflow-hidden rounded-full bg-[#B3261E] px-4 text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFC20E]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-white/35"
          style={{
            width: holding ? "100%" : "0%",
            transition: holding ? `width ${HOLD_MS}ms linear` : "none",
          }}
        />
        <span className="relative flex items-center gap-1.5 text-sm font-bold">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Hold SOS
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sos-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-[#10201A] focus:outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="sos-title" className={`${DISPLAY} m-0 text-[1.25rem] font-extrabold`}>
                  Need help?
                </h2>
                <p className="m-0 mt-1 text-sm text-[#4C5F55]">
                  Pick what you need. Konvoy does not receive these alerts, so call or message someone directly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-[#F2F6F1] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <a
              href={`tel:${EMERGENCY_NUMBER}`}
              className="mt-4 flex min-h-[56px] items-center justify-center gap-2 rounded-[14px] bg-[#B3261E] font-semibold text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#10201A]"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
              Call {EMERGENCY_NUMBER} (emergency)
            </a>

            <button
              type="button"
              onClick={sendLocation}
              disabled={loc.status === "locating"}
              className="mt-3 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-[#0A3B22] font-semibold text-[#0A3B22] hover:bg-[#E4EFE5] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#11603A] disabled:opacity-60"
            >
              <MapPin className="h-5 w-5" aria-hidden="true" />
              {loc.status === "locating" ? "Finding your location…" : "Send my location"}
            </button>

            <p role="status" className="m-0 mt-3 text-sm text-[#4C5F55]">
              {loc.status === "ready" && "Your location is ready. Choose WhatsApp or Messages, then pick a contact."}
              {loc.status === "denied" &&
                "We could not get your location, so the message will ask your contact to call you. Allow location in your browser settings to include it."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
