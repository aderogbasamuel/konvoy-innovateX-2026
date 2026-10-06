import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import StateBuddies from "@/components/landing/StateBuddies";
import Safety from "@/components/landing/Safety";
import Partners from "@/components/landing/Partners";
import FAQ from "@/components/landing/FAQ";
import SearchStrip from "@/components/landing/SearchStrip";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="bg-[#0A3B22] font-[family-name:var(--font-body)] leading-relaxed text-white antialiased">
      <Hero />
      <main>
        {/* light, dark, light, green, light, yellow: the background alternates so sections read as separate blocks */}
        <HowItWorks />
        <StateBuddies />
        <Safety />
        <Partners />
        <FAQ />
        <SearchStrip />
      </main>
      <Footer />
    </div>
  );
}