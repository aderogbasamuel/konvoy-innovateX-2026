
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BadgeCheck,
  Briefcase,
  ChevronRight,
  MessagesSquare,
  RefreshCw,
  Users,
} from "lucide-react";

import { DISPLAY } from "@/components/landing/styles";
import { naira } from "@/lib/format";
import { getBooking } from "@/lib/bookings";

type Booking = {
  id?: number;
  bookingId?: number;
  ride_id?: string;
  seat?: number;
  price?: number;
  status?: string;
  created_at?: string;
  payment?: {
    status?: string;
    method?: string;
  };
};

const STATUS_INFO: Record<
  string,
  { title: string; description: string }
> = {
  pending_payment: {
    title: "Payment processing",
    description:
      "Your payment hasn't been confirmed yet. Refresh this page to check its status.",
  },
  paid: {
    title: "You're booked!",
    description:
      "Your payment is confirmed. Your booking is ready.",
  },
  failed: {
    title: "Payment unsuccessful",
    description:
      "Your payment failed. Check your booking details or try booking again.",
  },
  expired: {
    title: "Checkout expired",
    description:
      "Your payment session expired. You'll need to start a new booking.",
  },
  cancelled: {
    title: "Booking cancelled",
    description:
      "This booking has been cancelled.",
  },
};

function Confirmed() {
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadBooking = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const result = await getBooking(id);
      setBooking(result as Booking);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't load your booking."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    void loadBooking();
  }, [loadBooking]);

  const status = booking?.status ?? "";
  const statusInfo = STATUS_INFO[status] ?? {
    title: "Booking status unavailable",
    description: "Refresh to check the latest booking status.",
  };

  const paid = status === "paid";

  const next = [
    {
      href: "/squad",
      label: "Meet your squad",
      hint: "See who else is on your route",
      Icon: Users,
    },
    {
      href: "/buddies",
      label: "Ask a State Buddy",
      hint: "Questions about camp and the state",
      Icon: MessagesSquare,
    },
    {
      href: "/trips",
      label: "View my trips",
      hint: "Your bookings in one place",
      Icon: Briefcase,
    },
  ];

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F2F6F1] px-5 text-[#10201A]">
        <p role="status">Loading your booking...</p>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#F2F6F1] px-5 text-center text-[#10201A]">
        <div className="max-w-sm">
          <h1 className={`${DISPLAY} text-2xl font-bold`}>
            Couldn't load your booking
          </h1>
          <p role="alert" className="text-sm text-[#4C5F55]">
            {error || "This booking could not be found."}
          </p>
          <button
            type="button"
            onClick={() => void loadBooking(true)}
            disabled={refreshing}
            className="mt-4 min-h-12 rounded-xl bg-[#FFC20E] px-5 font-semibold disabled:opacity-50"
          >
            {refreshing ? "Checking..." : "Try again"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#F2F6F1] pb-10 font-[family-name:var(--font-body)] text-[#10201A]">
      <header className="bg-[#0A3B22] px-5 pb-16 pt-[max(2rem,env(safe-area-inset-top))] text-white">
        <div className="mx-auto max-w-md">
          {paid ? (
            <BadgeCheck
              className="h-10 w-10 text-[#FFC20E]"
              aria-hidden="true"
            />
          ) : (
            <RefreshCw
              className="h-10 w-10 text-[#FFC20E]"
              aria-hidden="true"
            />
          )}

          <h1 className={`${DISPLAY} m-0 mt-3 text-[1.9rem] font-extrabold leading-tight tracking-[-0.02em]`}>
            {statusInfo.title}
          </h1>

          <p className="mt-2 text-sm text-[#C5E4CF]">
            {statusInfo.description}
          </p>
        </div>
      </header>

      <div className="mx-auto -mt-10 grid max-w-md gap-4 px-5">
        <section
          aria-label="Booking summary"
          className="rounded-3xl bg-white p-5 shadow-[0_16px_32px_rgba(10,59,34,0.14)]"
        >
          <h2 className={`${DISPLAY} m-0 text-xl font-semibold`}>
            Booking details
          </h2>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Booking ID", String(booking.id ?? booking.bookingId ?? id)],
              ["Status", status.replaceAll("_", " ") || "Unknown"],
              ["Seat", booking.seat != null ? String(booking.seat) : "—"],
              [
                "Fare",
                typeof booking.price === "number"
                  ? naira(booking.price)
                  : "—",
              ],
              [
                "Payment",
                booking.payment?.status?.replaceAll("_", " ") ?? "—",
              ],
              [
                "Method",
                booking.payment?.method ?? "—",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[14px] bg-[#F2F6F1] px-3.5 py-3"
              >
                <dt className="text-[0.8rem] capitalize text-[#4C5F55]">
                  {label}
                </dt>
                <dd className="m-0 mt-1 break-words font-semibold capitalize">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => void loadBooking(true)}
            disabled={refreshing}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#B7CDBB] font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Checking status..." : "Refresh booking status"}
          </button>
        </section>

        {paid && (
          <section className="rounded-3xl bg-white p-5">
            <h2 className={`${DISPLAY} text-lg font-semibold`}>
              What's next?
            </h2>
            <p className="text-sm text-[#4C5F55]">
              Keep your booking details handy. We'll add your live trip
              tracking link when the tracking backend is ready.
            </p>
          </section>
        )}

        <nav aria-label="What next" className="grid gap-2.5">
          {next.map(({ href, label, hint, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-14 items-center gap-3 rounded-3xl bg-[#DCEBDD] px-4 py-3 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0A3B22] text-[#FFC20E]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>

              <span className="flex-1">
                <span className="block font-semibold">{label}</span>
                <span className="block text-sm text-[#4C5F55]">
                  {hint}
                </span>
              </span>

              <ChevronRight className="h-4 w-4 text-[#4C5F55]" />
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}

export default function ConfirmedPage() {
  return <Confirmed />;
}