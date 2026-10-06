"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import Logo from "@/components/Logo";
import { DISPLAY } from "@/components/landing/styles";

interface Slide {
  title: string;
  text: string;
  image: string;
  alt: string;
}

// Images live in /public as kv-1.png, kv-2.png, kv-3.png
const slides: Slide[] = [
  {
    title: "Safe travels.\nNew beginnings.",
    text: "Trusted rides for NYSC corpers to camp and their posting states.",
    image: "/kv-1.png",
    alt: "A corper travelling to camp in a verified vehicle",
  },
  {
    title: "You will not\ntravel alone.",
    text: "See other corpers on your route and date, and join your squad before travel day.",
    image: "/kv-2.png",
    alt: "Corpers travelling the same route as a squad",
  },
  {
    title: "Family stays\nclose.",
    text: "Share a live link so your family can follow the trip, and ask State Buddies about camp before you arrive.",
    image: "/kv-3.png",
    alt: "A family following a corper's trip on their phone",
  },
];

interface WelcomeProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
  initialSlide?: number;
}

const focusRing =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#8FC3A6]";

// Every slide sits in the same grid cell and crossfades. The cell is as tall as the
// tallest slide, so nothing jumps when the text length changes.
const stacked = "[grid-area:1/1] transition-opacity duration-300 motion-reduce:transition-none";

const clamp = (i: number) => Math.min(slides.length - 1, Math.max(0, i));

export default function Welcome({ onGetStarted, onSignIn, initialSlide = 0 }: WelcomeProps) {
  const router = useRouter();
  const [active, setActive] = useState(() => clamp(initialSlide));
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // The next screens are one tap away, so load them now
  useEffect(() => {
    router.prefetch("/signup");
    router.prefetch("/signin");
  }, [router]);

  const go = (i: number) => setActive(clamp(i));

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    // Only count mostly-horizontal swipes so scrolling doesn't change slides
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? active + 1 : active - 1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(active + 1);
    if (e.key === "ArrowLeft") go(active - 1);
  };

  return (
    <main
      onKeyDown={handleKeyDown}
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center bg-[#F2F6F1] pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-[#1F3D31]"
    >
      <div className="mt-6 flex justify-center">
        <Logo />
      </div>

      <div
        className="flex w-full flex-1 touch-pan-y flex-col"
        onTouchStart={(e) => (touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={handleTouchEnd}
      >
        {/* Announces the slide to screen readers; the visual copy below is crossfaded */}
        <p className="sr-only" aria-live="polite">
          {`Slide ${active + 1} of ${slides.length}: ${slides[active].title.replace("\n", " ")}`}
        </p>

        <div className="mt-6 grid px-6">
          {slides.map((s, i) => {
            const Title = i === active ? "h1" : "div"; // one h1 in the accessibility tree
            return (
              <div
                key={s.title}
                aria-hidden={i !== active}
                className={`${stacked} ${i === active ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <Title
                  className={`${DISPLAY} m-0 whitespace-pre-line text-[clamp(1.9rem,8.5vw,2.4rem)] font-extrabold leading-[1.1] tracking-[-0.02em]`}
                >
                  {s.title}
                </Title>
                <p className="mx-auto mt-3 max-w-[32ch] text-sm leading-snug text-[#5D6B64]">{s.text}</p>
              </div>
            );
          })}
        </div>

        {/* Full-width scene, sits at the bottom like the design */}
        <div className="grid flex-1 items-end justify-items-center pt-4">
          {slides.map((s, i) => (
            <Image
              key={s.image}
              src={s.image}
              width={600}
              height={600}
              sizes="(max-width: 448px) 100vw, 448px"
              alt={i === active ? s.alt : ""}
              aria-hidden={i !== active}
              priority={i === 0}
              className={`${stacked} h-auto max-h-[44vh] w-full object-contain ${i === active ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
      </div>

      <div className="mb-5 mt-3 flex justify-center gap-1" role="group" aria-label="Onboarding slides">
        {slides.map((s, i) => (
          <button
            key={s.image}
            type="button"
            aria-label={`Go to slide ${i + 1} of ${slides.length}`}
            aria-current={i === active ? "true" : undefined}
            onClick={() => go(i)}
            className={`grid h-6 min-w-6 place-items-center rounded-full ${focusRing}`}
          >
            <span
              className={`block h-[7px] rounded-full transition-all motion-reduce:transition-none ${
                i === active ? "w-5 bg-[#2F6B4F]" : "w-[7px] bg-[#C9D3CD]"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="w-full px-6">
        <button
          type="button"
          onClick={onGetStarted ?? (() => router.push("/signup"))}
          className={`h-[52px] w-full rounded-[14px] border-2 border-[#2F6B4F] bg-[#2F6B4F] text-base font-bold text-white hover:bg-[#245640] ${focusRing}`}
        >
          Get Started
        </button>
        <button
          type="button"
          onClick={onSignIn ?? (() => router.push("/signin"))}
          className={`mt-3 h-[52px] w-full rounded-[14px] border-2 border-[#2F6B4F] bg-white text-base font-semibold text-[#1F3D31] hover:bg-[#EEF5EF] ${focusRing}`}
        >
          I already have an account
        </button>
      </div>
    </main>
  );
}