import { InterestProvider } from "@/components/landing/interest-context";
import { InterestModal } from "@/components/landing/interest-modal";
import { LenisProvider } from "@/components/landing/lenis-provider";
import { NoiseOverlay } from "@/components/landing/noise";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { Problems } from "@/components/landing/problems";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Bento } from "@/components/landing/bento";
import { Stats } from "@/components/landing/stats";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <InterestProvider>
      <LenisProvider />
<NoiseOverlay />
      <Navbar />
      <main className="relative flex flex-1 flex-col">
        <Hero />
        <Marquee />
        <Problems />
        <HowItWorks />
        <Bento />
        <Stats />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <InterestModal />
    </InterestProvider>
  );
}
