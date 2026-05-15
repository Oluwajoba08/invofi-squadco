"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import GlowOrb from "./ui/GlowOrb";
import ScoreRing from "./ui/ScoreRing";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-6 pt-28">
      {/* Background glows */}
      <GlowOrb className="w-175 h-175 bg-violet-600 top-[-10%] left-1/2 -translate-x-1/2" />
      <GlowOrb className="w-100 h-100 bg-indigo-500 bottom-10 right-10" />
      <GlowOrb className="w-75 h-75 bg-fuchsia-600 bottom-0 left-10" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div style={{ y, opacity }} className="relative z-10 flex flex-col md:flex-row max-w-5xl">
        {/* Headline */}
        <motion.div className="flex flex-col items-center md:items-start">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-[56px] text-center md:text-left md:text-[64px] lg:text-[80px] font-bold leading-[0.95] tracking-[-0.04em] text-white mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Transfer Money.
            <br />
            <span
              className="relative inline-block"
              style={{
                background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Know Who Gets It.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-2xl text-sm md:text-[17px] text-white/50 leading-relaxed font-light mb-10"
          >
            Vproof is Nigeria&apos;s verification layer — every sender sees a recipient&apos;s vScore™ before a naira leaves their account.
            End transfer fraud for good.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button className="group relative overflow-hidden rounded-full bg-violet-600 px-8 py-3.5 text-[14px] font-semibold text-white transition-all duration-300 hover:bg-violet-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]">
              <span className="relative z-10">Get Verified Free →</span>
            </button>
            <button className="rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-[14px] font-medium text-white/70 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10">
              See How It Works
            </button>
          </motion.div>
        </motion.div>

        {/* Floating score demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          className="mt-20 relative"
        >
          {/* Main card */}
          <div className="relative rounded-2xl border border-white/10 bg-white/4 p-6 backdrop-blur-md shadow-2xl w-85 md:w-105 mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/40 font-mono">Transfer Request • Live</span>
            </div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-white/30 mb-1 uppercase tracking-widest">Sending to</p>
                <p className="text-white font-semibold">Chukwuemeka Ltd.</p>
                <p className="text-xs text-white/40 font-mono mt-0.5">0123 456 7890 • GTBank</p>
              </div>
              <div className="relative">
                <ScoreRing score={87} size={72} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[18px] font-bold text-white leading-none">87</span>
                  <span className="text-[8px] text-white/40 uppercase tracking-wider">vScore</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 mb-4">
              <p className="text-emerald-400 text-xs font-medium">✓ Verified Identity · Low risk transfer</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/30 text-sm">Amount</span>
              <span className="text-white font-bold text-lg">₦1,250,000</span>
            </div>
            <button className="mt-4 w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
              Confirm Transfer
            </button>
          </div>

          {/* Floating warning card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="absolute -right-4 md:-right-16 top-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 backdrop-blur-md w-40 shadow-lg"
          >
            <p className="text-[10px] text-red-400 font-medium mb-1">⚠ Risk Alert</p>
            <p className="text-[10px] text-white/50 leading-snug">vScore 23 — Unverified. Proceed with caution.</p>
          </motion.div>

          {/* Floating verified badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="absolute -left-4 md:-left-16 bottom-10 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3.5 backdrop-blur-md w-37.5 shadow-lg"
          >
            <p className="text-[10px] text-violet-400 font-medium mb-1">◈ Vproof Badge</p>
            <p className="text-[10px] text-white/50 leading-snug">Identity verified in 47 seconds.</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Logos strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 mt-16 flex flex-wrap items-center justify-center gap-8 text-white/20 text-xs font-mono tracking-widest"
      >
        <span>TRUSTED BY BUSINESSES ACROSS NIGERIA</span>
        {["GTBank", "Access", "UBA", "Zenith", "Opay"].map((b) => (
          <span key={b} className="text-white/30 font-semibold text-[11px]">
            {b}
          </span>
        ))}
      </motion.div>
    </section>
  );
}