import { DISPLAY, btn, h2 } from "./styles";

export default function Partners() {
  return (
    <section id="partner" className="bg-[#11603A] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1120px] gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <h2 className={`${DISPLAY} ${h2}`}>Run a transport company?</h2>
          <p className="mt-4 max-w-[52ch] text-[#E2F1E7]">
            Get steady bookings from corpers on the routes you already drive. We check your licence, vehicle inspection and driver ID by hand before you are listed.
          </p>
        </div>
        {/* Point this at your partner application page when it exists */}
        <a href="#partner" className={`${btn} bg-[#FFC20E] text-[#241A00] hover:bg-[#FFD13F] md:justify-self-end`}>
          Apply to partner
        </a>
      </div>
    </section>
  );
}