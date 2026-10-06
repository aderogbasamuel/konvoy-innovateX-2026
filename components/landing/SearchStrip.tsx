import { DISPLAY, btn, h2 } from "./styles";

interface Field {
  label: string;
  type: "text" | "date";
  placeholder?: string;
}

const fields: Field[] = [
  { label: "Leaving from", type: "text", placeholder: "e.g. Lagos" },
  { label: "Going to", type: "text", placeholder: "Camp or posting state" },
  { label: "Travel date", type: "date" },
];

export default function SearchStrip() {
  return (
    <section id="book" className="bg-[#FFC20E] px-5 py-16 text-[#241A00] md:px-8 md:py-24">
      <div className="mx-auto max-w-[1120px]">
        <h2 className={`${DISPLAY} ${h2} max-w-[14ch]`}>Where are you headed?</h2>
        {/* Wire this up to your search route or handler */}
        <div role="group" aria-label="Find a ride" className="mt-7 grid max-w-[760px] gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          {fields.map((f) => (
            <label key={f.label} className="grid gap-1.5 text-sm font-semibold">
              {f.label}
              <input
                type={f.type}
                placeholder={f.placeholder}
                autoComplete="off"
                className="min-h-[52px] w-full rounded-[14px] border-2 border-transparent bg-white px-3.5 font-normal text-[#10201A] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#0A3B22]"
              />
            </label>
          ))}
          <button type="button" className={`${btn} bg-[#0A3B22] text-white hover:bg-[#11603A]`}>
            Find a ride
          </button>
        </div>
      </div>
    </section>
  );
}