import { DISPLAY } from "./styles";

interface Face {
  label: string;
  bg: string;
}

const faces: Face[] = [
  { label: "TA", bg: "bg-[#11603A]" },
  { label: "CO", bg: "bg-[#B5651D]" },
  { label: "FN", bg: "bg-[#5B4B8A]" },
  { label: "+9", bg: "bg-[#2F6F8F]" },
];

export default function TripCard() {
  return (
    <article
      aria-label="Example of a live trip"
      className="w-full max-w-[420px] justify-self-center rounded-3xl bg-[#F2F6F1] p-5 text-[#10201A] shadow-[0_24px_48px_rgba(0,0,0,0.28)] md:justify-self-end"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#DCEBDD] px-3 py-1.5 text-sm font-semibold text-[#11603A]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#11603A] motion-reduce:animate-none" />
          Live trip
        </span>
        <span className="text-sm text-[#4C5F55]">Arrives about 4:40 pm</span>
      </div>

      <h2 className={`${DISPLAY} mb-1 mt-4 text-[1.35rem] font-semibold tracking-tight`}>Lagos to Kaduna</h2>
      <p className="m-0 text-sm text-[#4C5F55]">Last seen near Ilorin, 2 minutes ago</p>

      <svg
        viewBox="0 0 360 150"
        role="img"
        aria-label="Route from Lagos to Kaduna with the vehicle two thirds of the way"
        className="-mx-1 mb-1.5 mt-3.5 block h-auto w-[calc(100%+8px)]"
      >
        <path d="M24 118 C 90 130, 120 60, 190 80 S 290 90, 336 28" fill="none" stroke="#C9D9CC" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 12" />
        <path d="M24 118 C 90 130, 120 60, 190 80 S 250 86, 262 70" fill="none" stroke="#11603A" strokeWidth="6" strokeLinecap="round" />
        <circle cx="24" cy="118" r="8" fill="#11603A" />
        <circle cx="336" cy="28" r="8" fill="#fff" stroke="#11603A" strokeWidth="4" />
        <circle cx="262" cy="70" r="16" fill="#FFC20E" opacity=".35">
          <animate attributeName="r" values="12;20;12" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="262" cy="70" r="9" fill="#FFC20E" stroke="#241A00" strokeWidth="2.5" />
        <text x="24" y="142" fontSize="12" fill="#4C5F55">Lagos</text>
        <text x="296" y="16" fontSize="12" fill="#4C5F55">Camp</text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2.5">
        <div className="rounded-[14px] bg-white px-3.5 py-3">
          <b className="block">Verified</b>
          <span className="text-[0.8rem] text-[#4C5F55]">Licence and vehicle checked</span>
        </div>
        <div className="rounded-[14px] bg-white px-3.5 py-3">
          <b className="block">Toyota Hiace</b>
          <span className="text-[0.8rem] text-[#4C5F55]">Seat 6, driver ID on file</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-[14px] border-[1.5px] border-dashed border-[#B7CDBB] px-3.5 py-3">
        <div className="flex" aria-hidden="true">
          {faces.map((f, i) => (
            <span
              key={f.label}
              className={`${f.bg} grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-[#F2F6F1] text-[0.7rem] font-semibold text-white ${i > 0 ? "-ml-2" : ""}`}
            >
              {f.label}
            </span>
          ))}
        </div>
        <p className="m-0 text-sm leading-snug"><b>12 corpers</b> are on this route and date</p>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-[#4C5F55]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        Family is following this trip. No sign-up needed.
      </div>
    </article>
  );
}