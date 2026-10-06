import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import StateBuddies from "@/components/landing/StateBuddies";
import Partners from "@/components/landing/Partners";
import SearchStrip from "@/components/landing/SearchStrip";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="bg-[#0A3B22] font-[family-name:var(--font-body)] leading-relaxed text-white antialiased">
      <Hero />
      <main>
        <HowItWorks />
        <StateBuddies />
        <Partners />
        <SearchStrip />
      </main>
      <Footer />
    </div>
  );
}