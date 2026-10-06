import { DISPLAY, h2 } from "./styles";

interface Item {
  q: string;
  a: string;
}

// Answers only repeat what the rest of the site already says.
// Add refund, cancellation and luggage answers once your policies are final.
const items: Item[] = [
  {
    q: "Who can book a ride?",
    a: "Any corper heading to camp or to their posting state. Choose where you are leaving from and where you are going, pick a date, and compare the rides on that route.",
  },
  {
    q: "How do I know the vehicle and driver are safe?",
    a: "Every transport company is checked by hand before it is listed. We check the licence, the vehicle inspection and the driver ID. Companies that do not pass are not shown.",
  },
  {
    q: "How can I pay?",
    a: "By card, bank transfer or USSD, so you can use whichever you already do.",
  },
  {
    q: "Can my family follow my trip without the app?",
    a: "Yes. You send them a link on WhatsApp or SMS and they can follow the trip live without making an account.",
  },
  {
    q: "What happens if my phone loses signal?",
    a: "If GPS drops, your family sees the last known location and the time it was recorded, so they know how recent it is.",
  },
  {
    q: "What are State Buddies?",
    a: "Corpers who are already serving in your destination state. You can message them in the app or on WhatsApp about camp registration, where to stay and what to expect.",
  },
  {
    q: "Will it work on my phone and network?",
    a: "Yes. Pages are light, so they load on low-end phones and weak networks.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-[#F2F6F1] px-5 py-16 text-[#10201A] md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1120px] gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <h2 id="faq-heading" className={`${DISPLAY} ${h2} max-w-[14ch]`}>
            Questions before you book.
          </h2>
          <p className="mt-4 max-w-[36ch] text-[1.05rem] leading-relaxed text-[#4C5F55]">
            The things corpers and their families ask us most.
          </p>
        </div>

        <div className="border-t border-[#B7CDBB]">
          {items.map((item) => (
            <details key={item.q} className="group border-b border-[#B7CDBB]">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left marker:hidden focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#11603A] [&::-webkit-details-marker]:hidden">
                <span className={`${DISPLAY} text-[1.05rem] font-semibold`}>{item.q}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#11603A"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0 transition-transform motion-reduce:transition-none group-open:rotate-45"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="m-0 max-w-[56ch] pb-5 leading-relaxed text-[#4C5F55]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}