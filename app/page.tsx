import Navbar from "@/components/home/Navbar";
import HowItWorks from "@/components/home/HowItWorks";
import RiskDemo from "@/components/home/RiskDemo";
import Hero from "@/components/home/Hero";
import ProofOfWork from "@/components/home/ProofOfWork";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";

export default function VproofLanding() {
  return (
    <>
      <div style={{ backgroundColor: "#06060e", minHeight: "100vh" }}>
        <Navbar />
        <Hero />
        <ProofOfWork />
        <Features />
        <HowItWorks />
        <RiskDemo />
        <Testimonials />
        <CTA />

        {/* Footer */}
        <footer className="border-t border-white/5 py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">V</span>
              </div>
              <span className="text-white/60 text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
                vproof — Nigeria&apos;s Verification Layer
              </span>
            </div>
            <p className="text-white/20 text-xs font-mono">© 2026 Invofi Ltd. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}