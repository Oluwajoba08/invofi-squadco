'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api';
import { UserType } from '@/services/types';
import { Building, UserCircle, Store, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const inputCls =
  'w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 pl-11 pr-12 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors duration-200';

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
      <div className="font-semibold text-emerald-300">Password Reset Successful</div>
      <div>{message}</div>
    </motion.div>
  );
}

function ResetPasswordFormContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const token = searchParams.get('token') || '';
  const rawUserType = searchParams.get('userType') || '';
  
  const isValidUserType = ['admin', 'individual', 'institution', 'vendor'].includes(rawUserType);
  const userType = (isValidUserType ? rawUserType : 'individual') as UserType;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const USER_TYPES_METADATA: Record<UserType, { label: string; icon: React.ReactNode }> = {
    individual: { label: t('Individual'), icon: <UserCircle className="w-5 h-5" /> },
    institution: { label: t('Institution'), icon: <Building className="w-5 h-5" /> },
    vendor: { label: t('Vendor'), icon: <Store className="w-5 h-5" /> },
    admin: { label: t('Admin'), icon: <ShieldCheck className="w-5 h-5" /> },
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError(t('Password must be at least 8 characters.'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('Passwords do not match.'));
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.auth.resetPassword({
        token,
        userType,
        password,
      });
      setSuccess(response.data?.message || t('Your password has been successfully reset. You can now log in with your new password.'));
    } catch (err: any) {
      setError(err?.message ?? 'Request failed. Please verify your connection or request a new reset link.');
    } finally {
      setLoading(false);
    }
  }

  // Handle invalid/missing reset query parameters
  if (!token || !isValidUserType) {
    return (
      <div className="flex flex-col gap-6">
        <ErrorBanner message={t('The password reset link is invalid or has expired.')} />
        <Link
          href="/forgot-password"
          className="w-full py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white text-center text-sm font-semibold transition-all duration-200"
        >
          {t('Request new link')}
        </Link>
      </div>
    );
  }

  return (
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
            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-center text-sm font-semibold transition-all duration-200"
          >
            {t('Go to login')}
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AnimatePresence>
            {error && <ErrorBanner key="err" message={error} />}
          </AnimatePresence>

          {/* User Type Indicator */}
          <div className="rounded-xl border border-white/5 bg-white/3 p-4 flex items-center justify-between">
            <span className="text-xs text-white/40">{t('Resetting password for')}</span>
            <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-lg">
              {USER_TYPES_METADATA[userType]?.icon}
              <span>{USER_TYPES_METADATA[userType]?.label}</span>
            </div>
          </div>

          {/* New Password Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              {t('New Password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
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

          {/* Confirm New Password Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              {t('Confirm New Password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
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
                {t('Resetting password…')}
              </span>
            ) : (
              t('Reset Password')
            )}
          </button>
        </form>
      )}
    </AnimatePresence>
  );
}

function ResetFormFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-6 gap-3">
      <svg className="animate-spin h-6 w-6 text-violet-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <span className="text-zinc-500 text-xs">Loading reset page info…</span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useTranslation();

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
              {t('New Credentials')}
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              {t('Choose a strong, unique password to protect your account. Make sure to use combinations of letters, numbers, and symbols.')}
            </p>
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
              {t('Reset Password')}
            </h1>
            <p className="text-white/40 text-sm mb-8">
              {t('Enter your new password below.')}
            </p>

            <Suspense fallback={<ResetFormFallback />}>
              <ResetPasswordFormContent />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </>
  );
}
