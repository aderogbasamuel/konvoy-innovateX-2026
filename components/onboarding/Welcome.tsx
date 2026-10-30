"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import Logo from "@/components/Logo";
import { DISPLAY } from "@/components/landing/styles";
import { buttonPrimary } from "@/components/ui/buttons";

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
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#11603A]";

// Every slide sits in the same grid cell and crossfades. The cell is as tall as the
// tallest slide, so nothing jumps when the text length changes.
const stacked = "[grid-area:1/1] transition-opacity duration-300 motion-reduce:transition-none";

const clamp = (i: number) => Math.min(slides.length - 1, Math.max(0, i));

/*
 * Layout
 * - Mobile (< md): one centred column, in order: logo, text, image, dots, buttons.
 * - md and up: two columns. Logo on top, text + dots + buttons stacked and vertically
 *   centred on the left, the image on the right. The two 1fr rows around the text
 *   block are what centre it.
 */
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
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center bg-[#F2F6F1] pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-[#10201A] md:grid md:max-w-5xl md:grid-cols-2 md:grid-rows-[auto_1fr_auto_auto_auto_1fr] md:items-center md:gap-x-12 md:px-10 md:text-left lg:gap-x-20 lg:px-12"
    >
      <div className="mt-4 flex justify-center sm:mt-6 md:col-span-2 md:row-start-1 md:mt-2 md:justify-self-start">
        <Logo />
      </div>

      {/* On md+ this wrapper disappears (display: contents) so its children join the page grid */}
      <div
        className="flex w-full flex-1 touch-pan-y flex-col md:contents"
        onTouchStart={(e) => (touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={handleTouchEnd}
      >
        {/* Announces the slide to screen readers; the visual copy below is crossfaded */}
        <p className="sr-only" aria-live="polite">
          {`Slide ${active + 1} of ${slides.length}: ${slides[active].title.replace("\n", " ")}`}
        </p>

        <div className="mt-4 grid px-6 md:col-start-1 md:row-start-3 md:mt-0 md:px-0">
          {slides.map((s, i) => {
            const Title = i === active ? "h1" : "div"; // one h1 in the accessibility tree
            return (
              <div
                key={s.title}
                aria-hidden={i !== active}
                className={`${stacked} ${i === active ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <Title
                  className={`${DISPLAY} m-0 whitespace-pre-line text-[clamp(1.9rem,8.5vw,2.4rem)] font-extrabold leading-[1.1] tracking-[-0.02em] md:text-5xl lg:text-6xl`}
                >
                  {s.title}
                </Title>
                <p className="mx-auto mt-3 max-w-[32ch] text-sm leading-snug text-[#4C5F55] md:mx-0 md:mt-5 md:max-w-[36ch] md:text-lg md:leading-relaxed">
                  {s.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Scene: bottom of the column on mobile, right-hand column on md+ */}
        <div className="grid flex-1 items-end justify-items-center md:col-start-2 md:row-span-5 md:row-start-2 md:items-center">
          {slides.map((s, i) => (
            <Image
              key={s.image}
              src={s.image}
              width={600}
              height={600}
              sizes="(max-width: 767px) 100vw, 50vw"
              alt={i === active ? s.alt : ""}
              aria-hidden={i !== active}
              priority={i === 0}
              className={`${stacked} h-auto max-h-[44vh] w-full object-contain md:max-h-[70vh] ${i === active ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
      </div>

      <div
        className="mb-5 flex justify-center gap-1 md:col-start-1 md:row-start-4 md:mb-0 md:mt-8 md:justify-start"
        role="group"
        aria-label="Onboarding slides"
      >
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
                i === active ? "w-5 bg-[#0A3B22]" : "w-[7px] bg-[#B7CDBB]"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="w-full px-6 md:col-start-1 md:row-start-5 md:mt-6 md:max-w-sm md:px-0">
        <button
          type="button"
          onClick={onGetStarted ?? (() => router.push("/signup"))}
          className={`${buttonPrimary} w-full rounded-full`}
        >
          Get Started
        </button>
        <button
          type="button"
          onClick={onSignIn ?? (() => router.push("/signin"))}
          className={`mt-2 text-sm font-medium text-[#0A3B22] underline hover:text-[#11603A] md:mt-4 md:text-base ${focusRing}`}
        >
          I already have an account
        </button>
      </div>
    </main>
  );
}