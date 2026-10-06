import { DISPLAY, h2 } from "./styles";

interface Point {
  title: string;
  text: string;
}

const points: Point[] = [
  { title: "Works on low-end phones", text: "Light pages that load on weak networks." },
  { title: "Tracking that survives bad signal", text: "If GPS drops, family sees the last known location and the time it was recorded." },
  { title: "Pay the way you already do", text: "Card, bank transfer or USSD." },
];

export default function StateBuddies() {
  return (
    <section className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1120px] gap-9 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <h2 className={`${DISPLAY} ${h2} max-w-[18ch]`}>Ask someone who has already done it.</h2>
          <p className="mt-4 max-w-[50ch] text-[1.05rem] text-[#D5E8DB]">
            State Buddies are corpers already serving in your destination state. Message them in the app or on WhatsApp about camp registration, where to stay and what to expect.
          </p>
        </div>
        <div aria-label="Example conversation with a State Buddy" className="grid w-full max-w-[440px] gap-3 justify-self-center rounded-3xl bg-white p-5 text-[#10201A] md:justify-self-end">
          <div className="max-w-[88%] justify-self-end rounded-2xl rounded-br bg-[#0A3B22] px-3.5 py-3 text-[0.95rem] text-white">
            <small className="mb-0.5 block text-[0.78rem] font-semibold text-[#8FD1A9]">You</small>
            Where do I register when I get to camp, and what should I carry?
          </div>
          <div className="max-w-[88%] rounded-2xl rounded-bl bg-[#E4EFE5] px-3.5 py-3 text-[0.95rem]">
            <small className="mb-0.5 block text-[0.78rem] font-semibold text-[#4C5F55]">State Buddy, serving in Kaduna</small>
            Go straight to the registration hall on arrival. Keep your call-up letter and original credentials in your hand luggage, not the boot.
          </div>
          <p className="m-0 text-sm font-semibold text-[#11603A]">Reply in the app or continue on WhatsApp</p>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1120px] gap-5 md:grid-cols-3 md:gap-8">
        {points.map((p) => (
          <div key={p.title} className="border-l-4 border-[#FFC20E] pl-4">
            <b className={`${DISPLAY} block text-[1.1rem]`}>{p.title}</b>
            <span className="text-[0.95rem] text-[#8FD1A9]">{p.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}