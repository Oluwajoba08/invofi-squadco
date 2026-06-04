'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api';
import { UserType } from '@/services/types';
import { Building, UserCircle, Store, ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const inputCls =
  'w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 pl-11 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors duration-200';

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

function SuccessBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-400 flex flex-col gap-2"
    >
      <div className="font-semibold text-emerald-300">Reset Email Sent</div>
      <div>{message}</div>
    </motion.div>
  );
}

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<UserType>('individual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const USER_TYPES: { value: UserType; label: string; icon: React.ReactNode; hint: string }[] = [
    { value: 'individual', label: t('Individual'), icon: <UserCircle className="w-5 h-5" />, hint: 'Personal' },
    { value: 'institution', label: t('Institution'), icon: <Building className="w-5 h-5" />, hint: 'Employer' },
    { value: 'vendor', label: t('Vendor'), icon: <Store className="w-5 h-5" />, hint: 'Business' },
    { value: 'admin', label: t('Admin'), icon: <ShieldCheck className="w-5 h-5" />, hint: 'System' },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await ApiService.auth.forgotPassword({ email, userType });
      // If backend returns ok status, display success
      setSuccess(response.data?.message || t('We have sent a password reset link to your email if it exists in our system.'));
    } catch (err: any) {
      setError(err?.message ?? 'Request failed. Please verify your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen flex" style={{ backgroundColor: '#06060e' }}>

        {/* ── Left decorative panel ── */}
        <div className="hidden lg:flex flex-col justify-between w-115 shrink-0 border-r border-white/5 p-10 relative overflow-hidden">
          {/* bg glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-violet-700 blur-[140px] opacity-15 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-75 h-75 rounded-full bg-indigo-600 blur-[100px] opacity-10 pointer-events-none" />

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
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>{t('vproof')}</span>
          </div>

          {/* Side Info */}
          <div className="relative z-10 my-auto text-left max-w-sm">
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              {t('Secure Recovery')}
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              {t('To protect your vScore™ profile and financial credentials, password recovery requires multi-layered verification.')}
            </p>
            <div className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse shrink-0" />
              <span className="text-white/60 text-xs font-medium">
                {t('Make sure you select the correct account type linked to your registration.')}
              </span>
            </div>
          </div>

          <p className="relative z-10 text-white/20 text-xs">{t('© 2025 vproof Technologies Ltd.')}</p>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-6 py-12">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 self-start">
            <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>{t('vproof')}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Back to login */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('Back to login')}
            </Link>

            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              {t('Forgot Password')}
            </h1>
            <p className="text-white/40 text-sm mb-8">
              {t("Enter your email address and we'll send you a link to reset your password.")}
            </p>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-6"
                >
                  <SuccessBanner message={success} />
                  <Link
                    href="/login"
                    className="w-full py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white text-center text-sm font-semibold transition-all duration-200"
                  >
                    {t('Go to login')}
                  </Link>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <AnimatePresence>
                    {error && <ErrorBanner key="err" message={error} />}
                  </AnimatePresence>

                  {/* User type selector */}
                  <div>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">{t('Select your account type')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {USER_TYPES.map((ut) => (
                        <button
                          key={ut.value}
                          type="button"
                          onClick={() => setUserType(ut.value)}
                          className={`rounded-xl border p-3 text-left transition-all duration-200 flex items-center gap-3 ${userType === ut.value
                            ? 'border-violet-500/50 bg-violet-500/10'
                            : 'border-white/8 bg-white/3 hover:border-white/15'
                            }`}
                        >
                          <span className={`${userType === ut.value ? 'text-violet-400' : 'text-white/30'}`}>
                            {ut.icon}
                          </span>
                          <div>
                            <span className={`text-xs font-semibold block ${userType === ut.value ? 'text-white' : 'text-white/50'}`}>
                              {ut.label}
                            </span>
                            <span className="text-[9px] text-white/20 block">{ut.hint}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                      {t('Email Address')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
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
                  </div>

                  {/* Submit Button */}
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
                        {t('Sending link…')}
                      </span>
                    ) : (
                      t('Request reset link')
                    )}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}
