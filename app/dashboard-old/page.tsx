'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Shared primitives ────────────────────────────────────────────────────────
function GlowOrb({ className }: { className?: string }) {
  return <div className={`absolute rounded-full blur-[100px] opacity-20 pointer-events-none ${className}`} />;
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 50 ? '#34d399' : '#f87171';
  return (
    <svg width={size} height={size} className="-rotate-90]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a1a2e" strokeWidth={8} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (score / 100) * circ }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
      />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'vScore™',        value: '87',    sub: '▲ Verified',     color: 'emerald' },
  { label: 'Documents',      value: '4/5',   sub: '1 pending review', color: 'violet' },
  { label: 'Safe Transfers', value: '23',    sub: 'All time',        color: 'sky'     },
  { label: 'Risk Alerts',    value: '2',     sub: 'Past 30 days',    color: 'amber'   },
];

const ACTIVITY = [
  { id: 1, type: 'transfer',     title: 'Sent to Chukwuemeka Ltd.',  amount: '₦850,000',  score: 91,  time: '2h ago',    status: 'safe'    },
  { id: 2, type: 'alert',        title: 'Risk alert — Vendor XYZ',   amount: '₦2,000,000', score: 21,  time: '1d ago',    status: 'blocked' },
  { id: 3, type: 'verification', title: 'BVN document verified',     amount: null,         score: null, time: '3d ago',   status: 'verified'},
  { id: 4, type: 'transfer',     title: 'Sent to TechParts Global',  amount: '₦340,000',  score: 78,  time: '5d ago',    status: 'safe'    },
  { id: 5, type: 'request',      title: 'Verification request sent', amount: '₦1,200,000', score: null, time: '1w ago',  status: 'pending' },
];

const DOCS = [
  { label: 'NIN',           status: 'verified', score: 95 },
  { label: 'BVN',           status: 'verified', score: 88 },
  { label: 'Bank Statement',status: 'verified', score: 82 },
  { label: 'Utility Bill',  status: 'pending',  score: null },
  { label: 'CAC (optional)',status: 'missing',  score: null },
];

const STATUS_COLOR: Record<string, string> = {
  safe:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  blocked:  'text-red-400 bg-red-400/10 border-red-400/20',
  verified: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  pending:  'text-amber-400 bg-amber-400/10 border-amber-400/20',
  missing:  'text-white/20 bg-white/5 border-white/10',
};

const ACCENT: Record<string, string> = {
  emerald: 'border-emerald-500/20 bg-emerald-500/5',
  violet:  'border-violet-500/20 bg-violet-500/5',
  sky:     'border-sky-500/20 bg-sky-500/5',
  amber:   'border-amber-500/20 bg-amber-500/5',
};
const ACCENT_TEXT: Record<string, string> = {
  emerald: 'text-emerald-400',
  violet:  'text-violet-400',
  sky:     'text-sky-400',
  amber:   'text-amber-400',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [activityFilter, setActivityFilter] = useState<'all' | 'transfer' | 'alert' | 'verification'>('all');

  const filtered = ACTIVITY.filter((a) => activityFilter === 'all' || a.type === activityFilter);

  return (
    <div ref={ref} className="relative space-y-8 max-w-6xl mx-auto">
      <GlowOrb className="w-125 h-125 bg-violet-700 top-0 right-0 opacity-10" />

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
        <p className="text-white/30 text-sm font-mono mb-0.5">Wednesday, 13 May 2026</p>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          Good morning, Adaeze. 👋
        </h1>
        <p className="text-white/40 text-sm mt-1">Your trust layer is active and protecting your transfers.</p>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`rounded-2xl border p-5 backdrop-blur-sm ${ACCENT[s.color]}`}
          >
            <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-3">{s.label}</p>
            <p className={`text-3xl font-bold mb-1 ${ACCENT_TEXT[s.color]}`} style={{ fontFamily: 'Syne, sans-serif' }}>
              {s.value}
            </p>
            <p className="text-white/30 text-xs">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* vScore card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-white/6 bg-white/3 p-6 flex flex-col items-center gap-4"
        >
          <p className="text-xs text-white/30 uppercase tracking-widest font-mono self-start">vScore™ Breakdown</p>

          <div className="relative">
            <ScoreRing score={87} size={140} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>87</span>
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest">Trusted</span>
            </div>
          </div>

          <div className="w-full space-y-2">
            {DOCS.map((d) => (
              <div key={d.label} className="flex items-center justify-between">
                <span className="text-white/50 text-xs">{d.label}</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${STATUS_COLOR[d.status]}`}>
                  {d.status === 'verified' ? `${d.score}pts` : d.status}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/verification"
            className="w-full text-center rounded-xl border border-violet-500/30 bg-violet-500/10 py-2.5 text-sm text-violet-300 hover:bg-violet-500/20 transition-colors font-medium"
          >
            Upload missing document →
          </Link>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 rounded-2xl border border-white/6 bg-white/3 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs text-white/30 uppercase tracking-widest font-mono">Recent Activity</p>
            <div className="flex gap-1">
              {(['all', 'transfer', 'alert', 'verification'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActivityFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium capitalize transition-all duration-200 ${
                    activityFilter === f
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-4 rounded-xl border border-white/4 bg-white/2 px-4 py-3.5 hover:border-white/8 transition-colors group"
                >
                  <div className={`h-8 w-8 rounded-lg border flex items-center justify-center text-sm shrink-0 ${STATUS_COLOR[a.status]}`}>
                    {a.type === 'transfer' ? '⬡' : a.type === 'alert' ? '⚠' : a.type === 'verification' ? '◈' : '◎'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate">{a.title}</p>
                    <p className="text-white/30 text-xs font-mono">{a.time}</p>
                  </div>
                  {a.amount && <p className="text-white/70 text-sm font-mono shrink-0">{a.amount}</p>}
                  {a.score !== null && (
                    <span className={`text-xs font-bold shrink-0 ${a.score >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {a.score}
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize shrink-0 ${STATUS_COLOR[a.status]}`}>
                    {a.status}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── Quick actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl border border-white/6 bg-white/3 p-6"
      >
        <p className="text-xs text-white/30 uppercase tracking-widest font-mono mb-5">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/payment',      icon: '⬡', label: 'New Transfer',       color: 'violet' },
            { href: '/dashboard/verification', icon: '◈', label: 'Upload Document',    color: 'sky'    },
            { href: '/dashboard/requests',     icon: '◎', label: 'Send Verify Request',color: 'emerald'},
            { href: '/dashboard/settings',     icon: '⊞', label: 'Account Settings',   color: 'amber'  },
          ].map((qa) => (
            <Link
              key={qa.href}
              href={qa.href}
              className={`group rounded-xl border p-4 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.02] ${ACCENT[qa.color]} hover:border-opacity-50`}
            >
              <span className={`text-2xl ${ACCENT_TEXT[qa.color]}`}>{qa.icon}</span>
              <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{qa.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}