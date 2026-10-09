import { BadgeCheck, Bus, CalendarClock, MapPin, Star, Users } from "lucide-react";

import { DISPLAY } from "@/components/landing/styles";
import { compact, naira } from "@/lib/format";
import type { Ride } from "@/lib/rides";

interface RideCardProps {
  ride: Ride;
  onBook: () => void;
  onViewSquad?: () => void;
}

export default function RideCard({ ride, onBook }: RideCardProps) {
  const departure = new Date(ride.departsAt);

  const operatorName =
    typeof ride.operator === "string"
      ? ride.operator
      : typeof ride.operator === "object" && ride.operator && "name" in ride.operator
        ? ride.operator.name
        : "K";

  const departureDate = departure.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });

  const departureTime = departure.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  });

  return (
    <article className="rounded-3xl bg-white p-5 text-[#10201A] shadow-[0_8px_24px_rgba(10,59,34,0.08)]">
      {/* Operator */}
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`${DISPLAY} grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#0A3B22] text-base font-extrabold text-[#FFC20E]`}
        >
          {operatorName.charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <h2
            className={`${DISPLAY} m-0 break-words text-[1.05rem] font-semibold leading-snug`}
          >
            {operatorName}
          </h2>

          <p className="m-0 mt-1 flex items-center gap-1 text-sm text-[#4C5F55]">
            <Star
              className="h-3.5 w-3.5 fill-[#FFC20E] text-[#FFC20E]"
              aria-hidden="true"
            />

            {ride.reviews > 0 && ride.rating !== null ? (
              <>
                <span className="font-semibold text-[#10201A]">
                  {ride.rating.toFixed(1)}
                </span>
                <span>({compact(ride.reviews)} reviews)</span>
              </>
            ) : (
              <span>No ratings yet</span>
            )}
          </p>
        </div>

        {ride.verified && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#DCEBDD] px-2.5 py-1 text-xs font-semibold text-[#11603A]">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified
          </span>
        )}
      </div>

      {/* Route */}
      <div className="mt-5 rounded-2xl bg-[#F2F6F1] p-4">
        <div className="flex items-center gap-2 text-sm text-[#4C5F55]">
          <MapPin className="h-4 w-4 shrink-0 text-[#11603A]" />
          <span className="font-semibold text-[#10201A]">
            {ride.origin}
          </span>

          <span aria-hidden="true">→</span>

          <span className="font-semibold text-[#10201A]">
            {ride.destination}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-[#4C5F55]">
          <CalendarClock className="h-4 w-4 shrink-0 text-[#11603A]" />
          <span>
            {departureDate} · {departureTime}
          </span>
        </div>
      </div>

      {/* Vehicle and total seats */}
      <ul className="m-0 mt-4 grid list-none gap-2 p-0 text-sm text-[#4C5F55]">
        <li className="flex items-center gap-2">
          <Bus className="h-4 w-4 shrink-0" aria-hidden="true" />
          {ride.vehicle}
        </li>

        <li className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
          {ride.seatsTotal} total seats
        </li>
      </ul>

      {/* Price and booking */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <p
            className={`${DISPLAY} m-0 text-2xl font-extrabold tracking-tight`}
          >
            {naira(ride.price)}
          </p>

          <p className="m-0 mt-0.5 text-sm text-[#4C5F55]">
            per seat
          </p>
        </div>

        <button
          type="button"
          onClick={onBook}
          aria-label={`Book a seat with ${ride.operator}`}
          className="min-h-12 shrink-0 rounded-[14px] bg-[#FFC20E] px-6 font-semibold text-[#241A00] transition hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22]"
        >
          Book now
        </button>
      </div>
    </article>
  );
}