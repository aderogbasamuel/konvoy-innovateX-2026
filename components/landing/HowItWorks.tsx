import { DISPLAY, h2 } from "./styles";

interface Step {
  title: string;
  text: string;
}

const steps: Step[] = [
  { title: "Pick your route", text: "Choose where you are leaving from and whether you are heading to camp or your posting state." },
  { title: "Book a verified seat", text: "Compare price, vehicle and ratings. Pay by card, bank transfer or USSD." },
  { title: "Meet your squad", text: "See other corpers on your route and date. Join the group chat before travel day if you want company." },
  { title: "Share your trip", text: "Send a link on WhatsApp or SMS. Your family follows live without making an account." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-[#F2F6F1] px-5 py-16 text-[#10201A] md:px-8 md:py-24">
      <div className="mx-auto max-w-[1120px]">
        <h2 className={`${DISPLAY} ${h2} max-w-[18ch]`}>From booking to camp gate in four steps.</h2>
        <p className="mt-4 max-w-[50ch] text-[1.05rem] text-[#4C5F55]">
          Everything you need for the journey is in one place, from choosing a ride to letting your family know you arrived.
        </p>
        <ol className="mt-10 grid list-none p-0 md:grid-cols-4 md:gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="relative grid grid-cols-[44px_1fr] gap-4 pb-7 md:grid-cols-1 md:pb-0">
              <span className={`${DISPLAY} relative z-10 grid h-11 w-11 place-items-center rounded-full bg-[#0A3B22] font-extrabold text-[#FFC20E]`}>
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <span aria-hidden="true" className="absolute bottom-0 left-[21px] top-11 w-0.5 bg-[#B7CDBB] md:bottom-auto md:left-14 md:right-[-12px] md:top-[21px] md:h-0.5 md:w-auto" />
              )}
              <div>
                <h3 className={`${DISPLAY} mb-1 mt-2 text-xl font-semibold md:mt-0`}>{s.title}</h3>
                <p className="m-0 max-w-[44ch] text-[#4C5F55]">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}