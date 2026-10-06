"use client"; // needed for useState in the Next.js app router; remove if you're not using it

import { useId, useState, type FormEvent } from "react";
import { DISPLAY, btn, h2 } from "./styles";
import SearchBackground from "./SearchBackground";
export interface RideSearch {
  from: string;
  to: string;
  date: string; // YYYY-MM-DD
}

// Suggestions only: people can still type any city or town.
const PLACES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const inputClass =
  "min-h-[52px] w-full rounded-[14px] border-2 border-transparent bg-white px-3.5 font-normal text-[#10201A] placeholder:text-[#6B7A72] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0A3B22]";

export default function SearchStrip({ onSearch }: { onSearch?: (q: RideSearch) => void }) {
  const listId = useId();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  // en-CA gives YYYY-MM-DD in the visitor's local time
  const today = new Date().toLocaleDateString("en-CA");

  function swap() {
    setFrom(to);
    setTo(from);
    setError("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      setError("Leaving from and going to can't be the same place.");
      return;
    }
    setError("");
    // Wire this up to your search route or handler
    onSearch?.({ from: from.trim(), to: to.trim(), date });
  }

  return (
    // <section id="book" aria-labelledby="book-heading" className="bg-[#FFC20E] px-5 py-16 text-[#241A00] md:px-8 md:py-24">
<section id="book" aria-labelledby="book-heading"
  className="relative overflow-hidden bg-[#FFC20E] px-5 pb-44 pt-16 text-[#241A00] md:px-8 md:pb-64 md:pt-24">
  <SearchBackground />   {/* 3. first child of the section */}
  <div className="relative mx-auto max-w-[1120px]">   {/* add "relative" here */}
        <h2 id="book-heading" className={`${DISPLAY} ${h2} max-w-[14ch]`}>
          Where are you headed?
        </h2>

        <form
          onSubmit={handleSubmit}
          aria-label="Find a ride"
          className="mt-7 grid max-w-[860px] gap-3 md:grid-cols-[1fr_auto_1fr_1fr_auto] md:items-end"
        >
          <label className="grid gap-1.5 text-sm font-semibold">
            Leaving from
            <input
              type="text"
              list={listId}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="e.g. Lagos"
              autoComplete="off"
              enterKeyHint="next"
              required
              className={inputClass}
            />
          </label>

          <button
            type="button"
            onClick={swap}
            aria-label="Swap leaving from and going to"
            className="grid h-10 w-10 shrink-0 place-items-center justify-self-end rounded-full bg-[#241A00]/10 text-[#241A00] hover:bg-[#241A00]/20 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0A3B22] md:mb-1.5 md:justify-self-center"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="rotate-90 md:rotate-0"
            >
              <path d="M8 3 4 7l4 4" />
              <path d="M4 7h16" />
              <path d="m16 21 4-4-4-4" />
              <path d="M20 17H4" />
            </svg>
          </button>

          <label className="grid gap-1.5 text-sm font-semibold">
            Going to
            <input
              type="text"
              list={listId}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Camp or posting state"
              autoComplete="off"
              enterKeyHint="next"
              required
              className={inputClass}
            />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold">
            Travel date
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputClass}
            />
          </label>

          <button type="submit" className={`${btn} bg-[#0A3B22] text-white hover:bg-[#11603A]`}>
            Find a ride
          </button>

          {error && (
            <p role="alert" className="m-0 text-sm font-semibold text-[#7A1810] md:col-span-5">
              {error}
            </p>
          )}

          <datalist id={listId}>
            {PLACES.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </form>
      </div>
    </section>
  );
}