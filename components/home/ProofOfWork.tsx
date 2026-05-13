"use client"
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import GlowOrb from "./ui/GlowOrb";

interface StatCard {
  value: string;
  label: string;
  accent?: boolean;
}

const STATS: StatCard[] = [
  { value: "₦0", label: "Lost to verified transfers", accent: true },
  { value: "< 2min", label: "Average verification time" },
  { value: "98.7%", label: "Fraud detection accuracy", accent: true },
  { value: "50k+", label: "Businesses protected" },
];

export default function ProofOfWork() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      <GlowOrb className="w-125 h-125 bg-indigo-600 top-0 right-0 opacity-20" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs text-violet-400 font-mono tracking-[0.3em] uppercase mb-3">Proof of Impact</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Numbers That Matter
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-2xl border p-6 md:p-8 backdrop-blur-sm ${
                s.accent
                  ? "border-violet-500/30 bg-violet-500/10"
                  : "border-white/8 bg-white/3"
              }`}
            >
              <p
                className={`text-3xl md:text-4xl font-bold mb-2 tracking-tight ${
                  s.accent ? "text-violet-300" : "text-white"
                }`}
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {s.value}
              </p>
              <p className="text-xs text-white/40 leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}