import { DISPLAY } from "./styles";

// Fill these in with your real details.
const CONTACT_EMAIL = "hello@konvoy.com";
const WHATSAPP_URL = "https://wa.me/2348146998074";
import Logo from "@/components/Logo";
interface LinkItem {
  label: string;
  href: string;
}

const columns: { title: string; links: LinkItem[] }[] = [
  {
    title: "For corpers",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Safety", href: "#safety" },
      { label: "Find a ride", href: "#book" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "For transport companies",
    links: [{ label: "Apply to partner", href: "#partner" }],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const linkClass =
  "rounded text-[0.95rem] text-[#D5E8DB] hover:text-white hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFC20E]";

export default function Footer() {
  return (
    <footer className="bg-[#062A19] px-5 pb-10 pt-14 text-white md:px-8 md:pt-16">
      <div className="mx-auto grid max-w-[1120px] gap-10 md:grid-cols-[1.3fr_2fr] md:gap-16">
        <div>
          <a
            href="#"
            className={`${DISPLAY} text-white inline-flex items-center gap-2 rounded text-2xl font-extrabold tracking-tight focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFC20E]`}
          >
            Konvoy
          </a>
          <p className="mt-3 max-w-[32ch] leading-relaxed text-[#8FD1A9]">
            Verified rides for corpers, with people who have your back.
          </p>
          <p className="mt-5 grid gap-1.5 text-[0.95rem]">
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
              {CONTACT_EMAIL}
            </a>
            <a href={WHATSAPP_URL} className={linkClass} rel="noopener noreferrer">
              Chat on WhatsApp
            </a>
          </p>
        </div>

        <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className={`${DISPLAY} m-0 text-base font-semibold text-white`}>{col.title}</h2>
              <ul className="m-0 mt-3 grid list-none gap-2.5 p-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className={linkClass}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1120px] flex-col gap-2 border-t border-white/15 pt-6 text-sm text-[#8FD1A9] md:flex-row md:items-center md:justify-between">
        <p className="m-0">© {new Date().getFullYear()} Konvoy. All rights reserved.</p>
        {/* Keep this line only if it is true for your company */}
        <p className="m-0 max-w-[60ch]">Konvoy is an independent service and is not run by the NYSC.</p>
      </div>
    </footer>
  );
}