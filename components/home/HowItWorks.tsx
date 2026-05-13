"use client"
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import GlowOrb from "./ui/GlowOrb";

const HOW_IT_WORKS = [
  { step: "01", title: "Create your account", desc: "Sign up and begin your identity journey with vproof." },
  { step: "02", title: "Submit documents", desc: "Upload CAC, NIN, BVN, proofs of address. AI processes instantly." },
  { step: "03", title: "Receive your vScore™", desc: "Get a verified score from 0–100 reflecting your trust level." },
  { step: "04", title: "Transact with confidence", desc: "Every transfer you make — or receive — is protected." },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      <GlowOrb className="w-125 h-125 bg-violet-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs text-violet-400 font-mono tracking-[0.3em] uppercase mb-3">Process</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Four Steps to Trust
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[calc(12.5%)] right-[calc(12.5%)] h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />

          <div className="grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((h, i) => (
              <motion.div
                key={h.step}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 mb-6">
                  <span className="text-violet-400 font-mono text-sm font-bold">{h.step}</span>
                </div>
                <h3 className="text-white font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {h.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}