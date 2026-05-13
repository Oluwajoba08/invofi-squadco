"use client";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import GlowOrb from "./ui/GlowOrb";

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: "⬡",
    title: "Document Intelligence",
    desc: "Upload your CAC, NIN, BVN, utility bills. Our AI cross-references and scores in real-time.",
  },
  {
    icon: "◈",
    title: "Live vScore™",
    desc: "Every transfer shows the recipient's trust score. Send money knowing exactly who's receiving it.",
  },
  {
    icon: "▣",
    title: "Risk Shield",
    desc: "Scores below 50 trigger an intelligent risk warning — protecting businesses and individuals from common fraud patterns.",
  },
  {
    icon: "◎",
    title: "Zero-Party Verification",
    desc: "Recipients who aren't on vproof get a secure link to verify instantly before funds release.",
  },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      <GlowOrb className="w-150 h-150 bg-fuchsia-600 bottom-0 left-0 opacity-15" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-xs text-violet-400 font-mono tracking-[0.3em] uppercase mb-3">The System</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight max-w-2xl leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Verification That Works Like a Layer, Not a Feature.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group rounded-2xl border border-white/8 bg-white/3 p-8 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:bg-violet-500/5"
            >
              <span className="text-2xl text-violet-400 mb-5 block">{f.icon}</span>
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                {f.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}