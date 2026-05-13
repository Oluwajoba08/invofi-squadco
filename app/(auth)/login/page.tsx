'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { UserType } from '@/services/types';

// ─── Shared UI ────────────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors duration-200';

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
    >
      {message}
    </motion.div>
  );
}

// ─── User type config ─────────────────────────────────────────────────────────
const USER_TYPES: { value: UserType; label: string; icon: string; hint: string }[] = [
  { value: 'individual', label: 'Individual', icon: '◎', hint: 'Personal account' },
  { value: 'vendor', label: 'Vendor', icon: '◈', hint: 'Business / supplier' },
  { value: 'institution', label: 'Institution', icon: '⬡', hint: 'Organisation / employer' },
];

// ─── Score ring (decorative) ──────────────────────────────────────────────────
function ScoreRingDeco() {
  return (
    <div className="relative w-[220px] h-[220px] mx-auto">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-violet-600 blur-[60px] opacity-20" />
      <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90">
        {/* Track */}
        <circle cx="110" cy="110" r="90" fill="none" stroke="#1a1a2e" strokeWidth="12" />
        {/* Arc — static decorative fill */}
        <motion.circle
          cx="110" cy="110" r="90"
          fill="none"
          stroke="url(#vg)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 90}
          initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - 0.78) }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.4 }}
        />
        <defs>
          <linearGradient id="vg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>78</span>
        <span className="text-xs text-white/30 uppercase tracking-widest mt-1">vScore™</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('individual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token } = await ApiService.auth.login({ email, password, userType });
      setToken(token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen flex" style={{ backgroundColor: '#06060e' }}>

        {/* ── Left decorative panel ── */}
        <div className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 border-r border-white/5 p-10 relative overflow-hidden">
          {/* bg glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-700 blur-[140px] opacity-15 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-indigo-600 blur-[100px] opacity-10 pointer-events-none" />

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>vproof</span>
          </div>

          {/* Score ring demo */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <ScoreRingDeco />
            <div className="text-center">
              <p className="text-white font-semibold text-lg mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                Adaeze Nwosu-Okonkwo
              </p>
              <p className="text-white/30 text-xs font-mono">Individual · Verified</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">Identity Verified</span>
              </div>
            </div>

            {/* Mini stat cards */}
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              {[
                { label: 'Documents', value: '4 / 4' },
                { label: 'Risk Level', value: 'Low' },
                { label: 'Member Since', value: 'Jan 2025' },
                { label: 'Transfers', value: '23 Safe' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-3.5">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-white font-semibold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-white/20 text-xs">© 2025 vproof Technologies Ltd.</p>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-6 py-12">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 self-start">
            <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>vproof</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
              Welcome back
            </h1>
            <p className="text-white/40 text-sm mb-10">
              Don't have an account?{' '}
              <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
                Get verified free →
              </Link>
            </p>

            {/* User type selector */}
            <div className="mb-7">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Sign in as</p>
              <div className="grid grid-cols-3 gap-2">
                {USER_TYPES.map((ut) => (
                  <button
                    key={ut.value}
                    type="button"
                    onClick={() => setUserType(ut.value)}
                    className={`rounded-xl border p-3.5 text-left transition-all duration-200 ${userType === ut.value
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-white/8 bg-white/3 hover:border-white/15'
                      }`}
                  >
                    <span className={`text-lg block mb-1.5 ${userType === ut.value ? 'text-violet-400' : 'text-white/30'}`}>
                      {ut.icon}
                    </span>
                    <span className={`text-xs font-semibold block ${userType === ut.value ? 'text-white' : 'text-white/50'}`}>
                      {ut.label}
                    </span>
                    <span className="text-[10px] text-white/25 mt-0.5 block">{ut.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <AnimatePresence>
                {error && <ErrorBanner key="err" message={error} />}
              </AnimatePresence>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="emeka@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls + ' pr-12'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  `Sign in as ${USER_TYPES.find((u) => u.value === userType)?.label} →`
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-white/20 text-xs">or continue with</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* OAuth stubs — wired to extend later */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Google', icon: '🔵' },
                { label: 'NIN Portal', icon: '🇳🇬' },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/3 py-3 text-sm text-white/50 hover:border-white/15 hover:text-white/70 transition-all duration-200"
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            <p className="text-center text-white/20 text-xs mt-8">
              By signing in you agree to our{' '}
              <a href="#" className="underline hover:text-white/40">Terms</a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-white/40">Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}