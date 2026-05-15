"use client";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import GlowOrb from "./ui/GlowOrb";
import ScoreRing from "./ui/ScoreRing";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  score: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We were losing ₦2M+ monthly to fake supplier transfers. vproof eliminated that overnight. Our finance team can actually breathe now.",
    name: "Adaeze Nwosu",
    role: "CFO",
    company: "Nwosu Agro Ltd",
    score: 94,
  },
  {
    quote:
      "A vendor tried to divert a ₦15M payment. vproof flagged the recipient's score of 23. Transaction blocked. Case reported. Done.",
    name: "Emeka Obiora",
    role: "Head of Finance",
    company: "Obiora Holdings",
    score: 89,
  },
  {
    quote:
      "Finally, a Nigerian fintech that understands our actual problems. The vScore system is exactly what SMEs needed yesterday.",
    name: "Fatima Bello",
    role: "Founder",
    company: "Bellmart Stores",
    score: 97,
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      <GlowOrb className="w-150 h-150 bg-indigo-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-xs text-violet-400 font-mono tracking-[0.3em] uppercase mb-3">Testimonials</p>
          <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Built for the Real Nigeria
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-2xl border border-white/8 bg-white/3 p-7 backdrop-blur-sm"
            >
              <p className="text-white/50 text-sm leading-relaxed mb-6 italic">&quot;{t.quote}&quot;</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.role} · {t.company}</p>
                </div>
                <div className="relative">
                  <ScoreRing score={t.score} size={44} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-bold text-emerald-400">{t.score}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}