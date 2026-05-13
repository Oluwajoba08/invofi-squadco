"use client"
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import GlowOrb from "./ui/GlowOrb";

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      <GlowOrb className="w-200 h-200 bg-violet-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl mx-auto text-center rounded-3xl border border-violet-500/20 bg-violet-500/5 p-16 backdrop-blur-sm"
      >
        <p className="text-xs text-violet-400 font-mono tracking-[0.3em] uppercase mb-4">Join the Network</p>
        <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
          Stop Trusting Blindly.
          <br />
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Start Trusting Verifiably.
          </span>
        </h2>
        <p className="text-white/40 text-base mb-10 max-w-lg mx-auto leading-relaxed">
          Whether you're an individual protecting your savings or a business protecting your bottom line — vproof is your layer of truth.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button className="rounded-full bg-violet-600 px-10 py-4 text-[15px] font-semibold text-white hover:bg-violet-500 hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] transition-all duration-300">
            Get Verified — It's Free
          </button>
          <button className="rounded-full border border-white/10 px-10 py-4 text-[15px] font-medium text-white/60 hover:border-white/20 hover:text-white transition-all duration-300">
            For Businesses →
          </button>
        </div>
      </motion.div>
    </section>
  );
}