"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { createBooking, BookingApiError } from "@/lib/bookings";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  CreditCard,
  Hash,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { DISPLAY } from "@/components/landing/styles";
import { formatDate, naira } from "@/lib/format";
import { RIDES } from "@/lib/rides";

type Method = "card" | "transfer";

interface MethodOption {
  key: Method;
  label: string;
  hint: string;
  Icon: LucideIcon;
}

const METHODS: MethodOption[] = [
  {
    key: "card",
    label: "Card",
    hint: "Debit or credit card",
    Icon: CreditCard,
  },
  {
    key: "transfer",
    label: "Bank transfer",
    hint: "Pay from your banking app",
    Icon: Landmark,
  },
];

function Book() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const params = useSearchParams();
  const ride = RIDES.find((r) => r.id === id);

  const from = params.get("from") || "Lagos";
  const to = params.get("to") || "Orientation camp";
  const date = params.get("date") || "";

  const [seat, setSeat] = useState<number | null>(null);
  const [method, setMethod] = useState<Method>("card");
  const [paying, setPaying] = useState(false);

  const [error, setError] = useState("");
  const idempotencyKey = useRef<string | null>(null);

  const capacity = ride ? ride.seatsLeft + ride.booked : 0;
  // Mock: replace with the real taken seats from your API
  const taken = useMemo(
    () =>
      new Set(
        Array.from(
          { length: ride?.booked ?? 0 },
          (_, i) => ((i * 7 + 3) % Math.max(capacity, 1)) + 1,
        ),
      ),
    [ride, capacity],
  );

  if (!ride) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F2F6F1] px-5 text-center text-[#10201A]">
        <div>
          <p className="m-0 font-semibold">We could not find that ride.</p>
          <Link
            href="/rides"
            className="mt-3 inline-block min-h-12 py-3 font-semibold text-[#11603A] underline"
          >
            Back to available rides
          </Link>
        </div>
      </main>
    );
  }

  const rows = Array.from({ length: Math.ceil(capacity / 4) }, (_, r) =>
    [1, 2, 3, 4].map((c) => r * 4 + c).filter((n) => n <= capacity),
  );

  const seatButton = (n: number) => {
    const isTaken = taken.has(n);
    const selected = seat === n;
    return (
      <button
        key={n}
        type="button"
        disabled={isTaken}
        aria-pressed={selected}
        aria-label={`Seat ${n}, ${isTaken ? "taken" : "available"}`}
        onClick={() => {
          setSeat(n);
          idempotencyKey.current = null;
        }}
        
        className={`h-12 rounded-xl text-sm font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A] ${
          selected
            ? "bg-[#0A3B22] text-[#FFC20E]"
            : isTaken
              ? "cursor-not-allowed bg-[#E4EBE4] text-[#8A9B90] line-through"
              : "border-[1.5px] border-[#B7CDBB] bg-white hover:border-[#0A3B22]"
        }`}
      >
        {n}
      </button>
    );
  };

  async function pay() {
    if (seat === null || !ride || paying) return;

    setPaying(true);
    setError("");

    if (!idempotencyKey.current) {
      idempotencyKey.current = crypto.randomUUID();
    }

    try {
      const result = await createBooking(
        {
          rideId: ride.id,
          seat,
          paymentMethod: method,
          price: ride.price,
        },
        idempotencyKey.current,
      );

      const checkoutUrl = result.payment?.checkout_url;

      if (!checkoutUrl) {
        throw new Error("The payment checkout link was not returned.");
      }

      // Only redirect to a trusted HTTPS checkout URL.
      const checkout = new URL(checkoutUrl);

      if (checkout.protocol !== "https:") {
        throw new Error("The checkout link is invalid.");
      }

      window.location.assign(checkout.href);
    } catch (err) {
      if (err instanceof BookingApiError && err.code === "seat_taken") {
        setError(
          "Sorry, someone just booked that seat. Please choose another.",
        );
        setSeat(null);
        idempotencyKey.current = null;
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "We couldn't start your booking. Please try again.",
        );
      }

      setPaying(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-36 font-[family-name:var(--font-body)] text-[#10201A]">
      <ScreenHeader
        title="Book your seat"
        subtitle={`${from} to ${to}${date ? `, ${formatDate(date)}` : ""}`}
      />

      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        {/* trip summary */}
        <section
          aria-label="Trip summary"
          className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>
              {ride.operator}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#DCEBDD] px-2.5 py-1 text-xs font-semibold text-[#11603A]">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verified
            </span>
          </div>
          <p className="m-0 mt-1 text-sm text-[#4C5F55]">{ride.vehicle}</p>
          <p
            className={`${DISPLAY} m-0 mt-3 text-2xl font-extrabold tracking-tight`}
          >
            {naira(ride.price)}
          </p>
        </section>

        {/* seats */}
        <section
          aria-label="Choose a seat"
          className="rounded-3xl bg-white p-5"
        >
          <h2 className={`${DISPLAY} m-0 text-[1.1rem] font-semibold`}>
            Choose a seat
          </h2>
          <p className="m-0 mt-1 text-sm text-[#4C5F55]">
            {ride.seatsLeft} seats left. Front of the vehicle is at the top.
          </p>
          <div className="mt-4 grid max-h-[340px] gap-2 overflow-y-auto pr-1">
            {rows.map((row) => (
              <div
                key={row[0]}
                className="grid grid-cols-[1fr_1fr_20px_1fr_1fr] gap-2"
              >
                {row.slice(0, 2).map(seatButton)}
                <span aria-hidden="true" />
                {row.slice(2).map(seatButton)}
              </div>
            ))}
          </div>
        </section>

        {/* payment */}
        <fieldset className="m-0 rounded-3xl border-0 bg-white p-5">
          <legend
            className={`${DISPLAY} float-left mb-3 w-full text-[1.1rem] font-semibold`}
          >
            How would you like to pay?
          </legend>
          <div className="clear-both grid gap-2.5">
            {METHODS.map(({ key, label, hint, Icon }) => (
              <label key={key} className="block cursor-pointer">
                <input
                  type="radio"
                  name="method"
                  value={key}
                  checked={method === key}
                  onChange={() => {
  setMethod(key);
  idempotencyKey.current = null;
}}
                  className="peer sr-only"
                />
                <span className="flex min-h-14 items-center gap-3 rounded-[14px] border-[1.5px] border-[#B7CDBB] px-4 py-2.5 peer-checked:border-[#0A3B22] peer-checked:bg-[#EAF4EC] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-[#11603A]">
                  <Icon className="h-5 w-5 text-[#11603A]" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">{label}</span>
                    <span className="block text-sm text-[#4C5F55]">{hint}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
        >
          {error}
        </p>
      )}
      {/* pay bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#DCE6DD] bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex max-w-md items-center gap-4">
          <p className="m-0 text-sm leading-tight text-[#4C5F55]">
            {seat === null ? (
              "Pick a seat to continue"
            ) : (
              <>
                Seat <b className="text-[#10201A]">{seat}</b>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={pay}
            disabled={seat === null || paying}
            className="ml-auto min-h-[52px] flex-1 rounded-[14px] bg-[#FFC20E] px-5 font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#FFC20E]"
          >
            {paying ? "Opening payment..." : `Pay ${naira(ride.price)}`}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function BookPage() {
  // useSearchParams needs a Suspense boundary in the App Router
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#F2F6F1]" />}>
      <Book />
    </Suspense>
  );
}
