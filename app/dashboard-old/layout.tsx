'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Design tokens ────────────────────────────────────────────────────────────
// bg:      #06060e
// surface: rgba(255,255,255,0.03)
// border:  rgba(255,255,255,0.08)
// accent:  violet-600  (#7c3aed)
// safe:    emerald-400 (#34d399)
// danger:  red-400     (#f87171)
// font-h:  Syne
// font-b:  DM Sans
// font-m:  DM Mono

const NAV_ITEMS = [
  { href: '/dashboard',               icon: '▣',  label: 'Overview'       },
  { href: '/dashboard/verification',  icon: '◈',  label: 'Verification'   },
  { href: '/dashboard/payment',       icon: '⬡',  label: 'Payments'       },
  { href: '/dashboard/requests',      icon: '◎',  label: 'Requests'       },
  { href: '/dashboard/settings',      icon: '⊞',  label: 'Settings'       },
];

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 group">
      <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
        <span className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>V</span>
      </div>
      <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
        vproof
      </span>
    </Link>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
        active
          ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
      }`}
    >
      {active && (
        <motion.div
          layoutId="nav-pill"
          className="absolute inset-0 rounded-xl bg-violet-600/10 border border-violet-500/20"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className={`relative text-base ${active ? 'text-violet-400' : 'text-white/30 group-hover:text-white/50'}`}>
        {icon}
      </span>
      <span className="relative">{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#06060e' }}>

        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden lg:flex flex-col w-55 shrink-0 border-r border-white/6 p-5 gap-6">
          <Logo />

          {/* vScore badge */}
          <div className="rounded-xl border border-white/6 bg-white/3 p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono mb-2">Your vScore™</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>87</span>
              <span className="text-emerald-400 text-xs mb-1">▲ Verified</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-violet-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: '87%' }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>

          {/* User card */}
          <div className="rounded-xl border border-white/6 bg-white/3 p-3.5 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-violet-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
              AO
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Adaeze Okonkwo</p>
              <p className="text-white/30 text-[10px] truncate font-mono">Individual</p>
            </div>
            <Link href="/login" className="ml-auto text-white/20 hover:text-white/50 text-xs transition-colors shrink-0">⏻</Link>
          </div>
        </aside>

        {/* ── Mobile nav overlay ── */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            >
              <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="absolute left-0 top-0 bottom-0 w-55 border-r border-white/6 p-5 flex flex-col gap-6"
                style={{ backgroundColor: '#06060e' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Logo />
                <nav className="flex flex-col gap-1 flex-1">
                  {NAV_ITEMS.map((item) => (
                    <NavItem key={item.href} {...item} />
                  ))}
                </nav>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Topbar */}
          <header className="h-14 border-b border-white/6 flex items-center justify-between px-6 shrink-0">
            <button
              className="lg:hidden text-white/50 hover:text-white transition-colors text-lg"
              onClick={() => setMobileNavOpen(true)}
            >
              ☰
            </button>
            <div className="hidden lg:block" />

            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <button className="relative h-9 w-9 rounded-xl border border-white/6 bg-white/3 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
                <span className="text-sm">◎</span>
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
              </button>
              {/* Avatar */}
              <div className="h-9 w-9 rounded-xl bg-violet-700 flex items-center justify-center text-white text-xs font-bold">
                AO
              </div>
            </div>
          </header>

          {/* Scrollable page content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}