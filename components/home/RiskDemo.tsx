"use client"
import { motion, AnimatePresence, useInView } from "motion/react";
import { useRef, useState } from "react";
import GlowOrb from "./ui/GlowOrb";
import ScoreRing from "./ui/ScoreRing";

export default function RiskDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeScore, setActiveScore] = useState(23);

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      <GlowOrb className="w-125 h-125 bg-red-600 top-1/2 right-0 -translate-y-1/2 opacity-10" />
      <GlowOrb className="w-100 h-100 bg-green-600 top-1/2 left-0 -translate-y-1/2 opacity-10" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-xs text-violet-400 font-mono tracking-[0.3em] uppercase mb-3">Live Simulation</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            The vScore™ in Action
          </h2>
          <p className="text-white/40 mt-4 text-sm">Toggle below to see how vproof responds</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-xl mx-auto"
        >
          {/* Score toggle */}
          <div className="flex gap-3 mb-8 justify-center">
            {[
              { score: 23, label: "Low Risk (23)", color: "red" },
              { score: 87, label: "High Trust (87)", color: "green" },
            ].map((opt) => (
              <button
                key={opt.score}
                onClick={() => setActiveScore(opt.score)}
                className={`rounded-full px-5 py-2 text-sm font-medium border transition-all duration-300 ${
                  activeScore === opt.score
                    ? opt.color === "red"
                      ? "bg-red-500/20 border-red-500/40 text-red-300"
                      : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "border-white/10 bg-white/5 text-white/40 hover:text-white/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeScore}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl border p-8 backdrop-blur-md ${
                activeScore < 50
                  ? "border-red-500/20 bg-red-500/5"
                  : "border-emerald-500/20 bg-emerald-500/5"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Recipient</p>
                  <p className="text-white font-semibold text-lg">
                    {activeScore < 50 ? "Unknown Vendor XYZ" : "Certified Supplies Ltd."}
                  </p>
                  <p className="text-xs text-white/30 font-mono mt-0.5">
                    {activeScore < 50 ? "2234 567 8901 • Kuda" : "0987 654 3210 • Zenith"}
                  </p>
                </div>
                <div className="relative">
                  <ScoreRing score={activeScore} size={80} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-xl font-bold leading-none ${
                        activeScore < 50 ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {activeScore}
                    </span>
                    <span className="text-[8px] text-white/40 uppercase tracking-wider">vScore</span>
                  </div>
                </div>
              </div>

              {activeScore < 50 ? (
                <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-4 mb-5">
                  <p className="text-red-400 font-semibold text-sm mb-1">⚠ High Fraud Risk Detected</p>
                  <p className="text-red-300/70 text-xs leading-relaxed">
                    This recipient&apos;s vScore is below 50. They have incomplete or unverifiable documentation.
                    Proceed only if you can independently confirm this entity&apos;s legitimacy.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 mb-5">
                  <p className="text-emerald-400 font-semibold text-sm mb-1">✓ Verified — Safe to Transact</p>
                  <p className="text-emerald-300/70 text-xs leading-relaxed">
                    This recipient is fully verified. CAC, BVN, and address confirmed. High trust score.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-white/30 text-sm">Amount</span>
                <span className="text-white font-bold text-xl">₦5,000,000</span>
              </div>

              <button
                className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-300 ${
                  activeScore < 50
                    ? "bg-red-600/60 hover:bg-red-600/80 text-red-100 border border-red-500/30"
                    : "bg-violet-600 hover:bg-violet-500 text-white"
                }`}
              >
                {activeScore < 50 ? "Proceed Anyway (Not Recommended)" : "Confirm Transfer"}
              </button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}