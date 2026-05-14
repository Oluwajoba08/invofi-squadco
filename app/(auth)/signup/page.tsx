'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

type Role = 'Individual' | 'Vendor' | 'Institution';

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors duration-200';

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] mt-2"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Creating account…
        </span>
      ) : (
        label
      )}
    </button>
  );
}

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

function IndividualForm() {
  const router = useRouter();
  const { setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bvn: '',
    nin: '',
    bankAccount: '',
    bankCode: '',
    phoneNumber: '',
    dateOfBirth: '',
  });

  const set = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.bvn.length !== 11) {
      setError('BVN must be exactly 11 digits.');
      return;
    }
    if (formData.nin.length !== 11) {
      setError('NIN must be exactly 11 digits.');
      return;
    }

    setLoading(true);
    try {
      const { token } = await ApiService.individuals.create({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        bvn: formData.bvn,
        nin: formData.nin,
        bankAccount: formData.bankAccount,
        bankCode: formData.bankCode,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
      }) as any;

      setToken(token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} />}

      <Field label="Full Name" id="fullName">
        <Input id="fullName" type="text" placeholder="Emeka Okafor" required value={formData.fullName} onChange={set('fullName')} />
      </Field>

      <Field label="Email Address" id="email">
        <Input id="email" type="email" placeholder="emeka@example.com" required value={formData.email} onChange={set('email')} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Password" id="password">
          <Input id="password" type="password" placeholder="••••••••" required value={formData.password} onChange={set('password')} />
        </Field>
        <Field label="Confirm Password" id="confirmPassword">
          <Input id="confirmPassword" type="password" placeholder="••••••••" required value={formData.confirmPassword} onChange={set('confirmPassword')} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="BVN (11 digits)" id="bvn">
          <Input id="bvn" type="text" inputMode="numeric" pattern="\d{11}" maxLength={11} placeholder="12345678901" required value={formData.bvn} onChange={set('bvn')} />
        </Field>
        <Field label="NIN (11 digits)" id="nin">
          <Input id="nin" type="text" inputMode="numeric" pattern="\d{11}" maxLength={11} placeholder="12345678901" required value={formData.nin} onChange={set('nin')} />
        </Field>
      </div>

      <Field label="Phone Number" id="phoneNumber">
        <Input id="phoneNumber" type="tel" placeholder="+2348012345678" required value={formData.phoneNumber} onChange={set('phoneNumber')} />
      </Field>

      <Field label="Date of Birth (DD/MM/YYYY)" id="dateOfBirth">
        <Input id="dateOfBirth" type="text" placeholder="01/01/1990" pattern="\d{2}/\d{2}/\d{4}" required value={formData.dateOfBirth} onChange={set('dateOfBirth')} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Bank Account No." id="bankAccount">
          <Input id="bankAccount" type="text" inputMode="numeric" maxLength={10} placeholder="0123456789" required value={formData.bankAccount} onChange={set('bankAccount')} />
        </Field>
        <Field label="Bank Code" id="bankCode">
          <Input id="bankCode" type="text" placeholder="058" required value={formData.bankCode} onChange={set('bankCode')} />
        </Field>
      </div>

      <SubmitButton loading={loading} label="Create Individual Account →" />
    </form>
  );
}

function VendorForm() {
  const router = useRouter();
  const { setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    rcNumber: '',
    directorBvn: '',
    bankAccount: '',
    bankCode: '',
    address: '',
    registrationDate: '',
    contactEmail: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  const set = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { token } = await ApiService.vendors.create({
        companyName: formData.companyName,
        rcNumber: formData.rcNumber,
        directorBvn: formData.directorBvn,
        bankAccount: formData.bankAccount,
        bankCode: formData.bankCode,
        address: formData.address,
        registrationDate: formData.registrationDate,
        contactEmail: formData.contactEmail,
      }) as any;

      setToken(token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} />}

      <Field label="Company Name" id="companyName">
        <Input id="companyName" type="text" placeholder="Acme Supplies Ltd." required value={formData.companyName} onChange={set('companyName')} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="RC Number" id="rcNumber">
          <Input id="rcNumber" type="text" placeholder="RC1234567" required value={formData.rcNumber} onChange={set('rcNumber')} />
        </Field>
        <Field label="Registration Date" id="registrationDate">
          <Input id="registrationDate" type="text" placeholder="01/01/2020" required value={formData.registrationDate} onChange={set('registrationDate')} />
        </Field>
      </div>

      <Field label="Contact Email" id="contactEmail">
        <Input id="contactEmail" type="email" placeholder="info@acmesupplies.com" required value={formData.contactEmail} onChange={set('contactEmail')} />
      </Field>

      <Field label="Director BVN (11 digits)" id="directorBvn">
        <Input id="directorBvn" type="text" inputMode="numeric" pattern="\d{11}" maxLength={11} placeholder="12345678901" required value={formData.directorBvn} onChange={set('directorBvn')} />
      </Field>

      <Field label="Business Address" id="address">
        <Input id="address" type="text" placeholder="12 Marina St, Lagos Island" required value={formData.address} onChange={set('address')} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Bank Account No." id="bankAccount">
          <Input id="bankAccount" type="text" inputMode="numeric" maxLength={10} placeholder="0123456789" required value={formData.bankAccount} onChange={set('bankAccount')} />
        </Field>
        <Field label="Bank Code" id="bankCode">
          <Input id="bankCode" type="text" placeholder="058" required value={formData.bankCode} onChange={set('bankCode')} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Password" id="vendorPassword">
          <Input id="vendorPassword" type="password" placeholder="••••••••" required value={formData.password} onChange={set('password')} />
        </Field>
        <Field label="Confirm Password" id="vendorConfirmPassword">
          <Input id="vendorConfirmPassword" type="password" placeholder="••••••••" required value={formData.confirmPassword} onChange={set('confirmPassword')} />
        </Field>
      </div>

      <SubmitButton loading={loading} label="Register as Vendor →" />
    </form>
  );
}

function InstitutionForm() {
  const router = useRouter();
  const { setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rcNumber: '',
    phoneNumber: '',
    address: '',
  });

  const set = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { token } = await ApiService.institutions.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        businessName: formData.businessName,
        email: formData.email,
        password: formData.password,
        rcNumber: formData.rcNumber,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      }) as any;

      setToken(token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" id="firstName">
          <Input id="firstName" type="text" placeholder="Chukwuemeka" required value={formData.firstName} onChange={set('firstName')} />
        </Field>
        <Field label="Last Name" id="lastName">
          <Input id="lastName" type="text" placeholder="Obiora" required value={formData.lastName} onChange={set('lastName')} />
        </Field>
      </div>

      <Field label="Business Name" id="businessName">
        <Input id="businessName" type="text" placeholder="Obiora Holdings Ltd." required value={formData.businessName} onChange={set('businessName')} />
      </Field>

      <Field label="RC Number" id="instRcNumber">
        <Input id="instRcNumber" type="text" placeholder="RC1234567" required value={formData.rcNumber} onChange={set('rcNumber')} />
      </Field>

      <Field label="Email Address" id="instEmail">
        <Input id="instEmail" type="email" placeholder="admin@obioraholdings.com" required value={formData.email} onChange={set('email')} />
      </Field>

      <Field label="Phone Number" id="instPhone">
        <Input id="instPhone" type="tel" placeholder="+2348012345678" required value={formData.phoneNumber} onChange={set('phoneNumber')} />
      </Field>

      <Field label="Business Address" id="instAddress">
        <Input id="instAddress" type="text" placeholder="25 Adeola Odeku St, Victoria Island" required value={formData.address} onChange={set('address')} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Password" id="instPassword">
          <Input id="instPassword" type="password" placeholder="••••••••" required value={formData.password} onChange={set('password')} />
        </Field>
        <Field label="Confirm Password" id="instConfirmPassword">
          <Input id="instConfirmPassword" type="password" placeholder="••••••••" required value={formData.confirmPassword} onChange={set('confirmPassword')} />
        </Field>
      </div>

      <SubmitButton loading={loading} label="Register Institution →" />
    </form>
  );
}

const ROLE_META: Record<Role, { icon: string; desc: string }> = {
  Individual: { icon: '◎', desc: 'Protect your personal transfers with a verified identity.' },
  Vendor: { icon: '◈', desc: 'Build trust with institutions by verifying your business.' },
  Institution: { icon: '⬡', desc: 'Screen vendors and reduce fraud across your payments.' },
};

export default function SignupPage() {
  const [role, setRole] = useState<Role>('Individual');

  return (
    <>
      <div className="min-h-screen flex" style={{ backgroundColor: '#06060e' }}>

        {/* ── Left panel (decorative) ── */}
        <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 border-r border-white/5 p-10 relative overflow-hidden">
          {/* bg glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-700 blur-[120px] opacity-20 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-16">
              <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-white font-bold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>vproof</span>
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Join the Trust
              <br />
              <span style={{ background: 'linear-gradient(135deg,#a78bfa,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Network
              </span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed">
              Every naira you send or receive is protected by verified identity — not assumption.
            </p>
          </div>

          {/* Animated role card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="relative z-10 rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm"
            >
              <span className="text-2xl text-violet-400 mb-3 block">{ROLE_META[role].icon}</span>
              <p className="text-white font-semibold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{role}</p>
              <p className="text-white/40 text-sm leading-relaxed">{ROLE_META[role].desc}</p>
            </motion.div>
          </AnimatePresence>

          <p className="relative z-10 text-white/20 text-xs">© 2025 vproof Technologies Ltd.</p>
        </div>

        {/* ── Right panel (form) ── */}
        <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto py-12 px-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 self-start">
            <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>vproof</span>
          </div>

          <div className="w-full max-w-lg">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                Create Account
              </h1>
              <p className="text-white/40 text-sm mb-8">
                Already have an account?{' '}
                <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
                  Sign in →
                </Link>
              </p>

              {/* Role selector */}
              <div className="flex bg-white/5 border border-white/8 p-1 rounded-xl mb-8">
                {(['Individual', 'Vendor', 'Institution'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all duration-200 ${role === r
                      ? 'bg-violet-600 text-white shadow-lg'
                      : 'text-white/40 hover:text-white/70'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Form swap with animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={role}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {role === 'Individual' && <IndividualForm />}
                  {role === 'Vendor' && <VendorForm />}
                  {role === 'Institution' && <InstitutionForm />}
                </motion.div>
              </AnimatePresence>

              <p className="text-center text-white/20 text-xs mt-8 leading-relaxed">
                By creating an account you agree to our{' '}
                <a href="#" className="underline hover:text-white/40">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-white/40">Privacy Policy</a>.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}