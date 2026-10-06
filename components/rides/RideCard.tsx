import { BadgeCheck, Bus, ChevronRight, Star, Users } from "lucide-react";
import { DISPLAY } from "@/components/landing/styles";
import { compact, naira } from "@/lib/format";
import type { Ride } from "@/lib/rides";

const FACE_COLORS = ["bg-[#11603A]", "bg-[#B5651D]", "bg-[#5B4B8A]", "bg-[#2F6F8F]"];
const LOW_SEATS = 3;

interface RideCardProps {
  ride: Ride;
  onBook: () => void;
  onViewSquad: () => void;
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export default function RideCard({ ride, onBook, onViewSquad }: RideCardProps) {
  const extra = Math.max(0, ride.booked - ride.bookedBy.length);
  const soldOut = ride.seatsLeft <= 0;
  const lowSeats = !soldOut && ride.seatsLeft <= LOW_SEATS;

  return (
    <article className="rounded-3xl bg-white p-5 text-[#10201A] shadow-[0_8px_24px_rgba(10,59,34,0.08)]">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`${DISPLAY} grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#0A3B22] text-base font-extrabold text-[#FFC20E]`}
        >
          {ride.operator[0]}
        </span>

        <div className="min-w-0 flex-1">
          {/* No truncation: a long company name wraps instead of being cut off */}
          <h2 className={`${DISPLAY} m-0 break-words text-[1.05rem] font-semibold leading-snug`}>{ride.operator}</h2>
          <p className="m-0 mt-0.5 flex items-center gap-1 text-sm text-[#4C5F55]">
            <Star className="h-3.5 w-3.5 fill-[#FFC20E] text-[#FFC20E]" aria-hidden="true" />
            <span className="sr-only">Rated </span>
            <span className="font-semibold text-[#10201A]">{ride.rating}</span>
            <span className="sr-only"> out of 5, </span>
            <span>({compact(ride.reviews)} reviews)</span>
          </p>
        </div>

        {ride.verified && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#DCEBDD] px-2.5 py-1 text-xs font-semibold text-[#11603A]">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified
          </span>
        )}
      </div>

      <ul className="m-0 mt-3 grid list-none gap-1.5 p-0 text-sm text-[#4C5F55]">
        <li className="flex items-center gap-2">
          <Bus className="h-4 w-4" aria-hidden="true" />
          {ride.vehicle}
        </li>
        <li className={`flex items-center gap-2 ${lowSeats || soldOut ? "font-semibold text-[#B45309]" : ""}`}>
          <Users className="h-4 w-4" aria-hidden="true" />
          {soldOut
            ? "No seats left"
            : `${lowSeats ? "Only " : ""}${ride.seatsLeft} ${plural(ride.seatsLeft, "seat", "seats")} left`}
        </li>
      </ul>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className={`${DISPLAY} m-0 text-2xl font-extrabold tracking-tight`}>
          {naira(ride.price)}
          {/* Remove if your price is per booking rather than per seat */}
          <span className="ml-1 text-sm font-normal tracking-normal text-[#4C5F55]">per seat</span>
        </p>
        <button
          type="button"
          onClick={onBook}
          disabled={soldOut}
          aria-label={soldOut ? `${ride.operator} is full` : `Book now with ${ride.operator}`}
          className="min-h-12 shrink-0 rounded-[14px] bg-[#FFC20E] px-6 font-semibold text-[#241A00] hover:bg-[#FFD13F] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0A3B22] disabled:cursor-not-allowed disabled:bg-[#E4EBE4] disabled:text-[#6B7D72] disabled:hover:bg-[#E4EBE4]"
        >
          {soldOut ? "Full" : "Book now"}
        </button>
      </div>

      {ride.booked > 0 ? (
        <button
          type="button"
          onClick={onViewSquad}
          aria-label={`${ride.booked} ${plural(ride.booked, "corper", "corpers")} already booked on this route. View squad for ${ride.operator}`}
          className="mt-4 flex min-h-12 w-full items-center gap-3 rounded-[14px] border-[1.5px] border-dashed border-[#B7CDBB] px-3 py-2 text-left hover:bg-[#F2F6F1] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#11603A]"
        >
          <span className="flex" aria-hidden="true">
            {ride.bookedBy.map((initials, i) => (
              <span
                key={initials}
                className={`${FACE_COLORS[i % FACE_COLORS.length]} grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-white text-[0.7rem] font-semibold text-white ${i > 0 ? "-ml-2" : ""}`}
              >
                {initials}
              </span>
            ))}
            {extra > 0 && (
              <span className="-ml-2 grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-white bg-[#2F6F8F] text-[0.7rem] font-semibold text-white">
                +{extra}
              </span>
            )}
          </span>
          <span className="flex-1 text-sm leading-snug" aria-hidden="true">
            <b>
              {ride.booked} {plural(ride.booked, "corper", "corpers")}
            </b>{" "}
            already booked on this route
          </span>
          <ChevronRight className="h-4 w-4 text-[#4C5F55]" aria-hidden="true" />
        </button>
      ) : (
        <p className="m-0 mt-4 rounded-[14px] border-[1.5px] border-dashed border-[#B7CDBB] px-3 py-3 text-sm text-[#4C5F55]">
          Be the first corper to book this ride.
        </p>
      )}
    </article>
  );
}