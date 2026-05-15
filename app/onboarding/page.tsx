'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

function GlowOrb({ className }: { className?: string }) {
  return <div className={`absolute rounded-full blur-[100px] opacity-20 pointer-events-none ${className}`} />;
}

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-white/25 font-mono">{hint}</p>}
    </div>
  );
}

const STEPS = [
  { id: 1, icon: '◎', label: 'Welcome', title: 'Welcome to vproof' },
  { id: 2, icon: '⬡', label: 'Wallet', title: 'Set Up Your Wallet' },
  { id: 3, icon: '◈', label: 'Documents', title: 'Your Verification Roadmap' },
  { id: 4, icon: '▣', label: 'Done', title: 'You\'re Protected' },
];

function StepWelcome({ onNext }: { onNext: () => void }) {
  const { displayName, userType } = useAuthStore();

  const highlights = [
    { icon: '◈', label: 'vScore™ calculated from your documents' },
    { icon: '⬡', label: 'Every transfer shows recipient trust score' },
    { icon: '▣', label: 'Risk alerts protect your money automatically' },
    { icon: '◎', label: 'Unverified recipients prompted before payment' },
  ];

  return (
    <div className="flex flex-col items-center text-center gap-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-4xl">
          ◈
        </div>
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#06060e]" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          Welcome{displayName ? `, ${displayName.split(' ')[0]}` : ''}. 🎉
        </h2>
        <p className="text-white/40 text-sm leading-relaxed max-w-sm">
          Your account is created. Let&apos;s get your trust layer active in the next 3 quick steps.
        </p>
        <Badge variant="outline" className="mt-3 border-violet-500/30 text-violet-400 bg-violet-500/10 capitalize">
          {userType ?? 'individual'} account
        </Badge>
      </div>

      <div className="w-full grid grid-cols-1 gap-2.5 text-left">
        {highlights.map((h, i) => (
          <motion.div
            key={h.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3"
          >
            <span className="text-violet-400 text-base">{h.icon}</span>
            <span className="text-white/60 text-sm">{h.label}</span>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={onNext}
        className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-3 h-auto font-semibold hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-200"
      >
        Let&apos;s get started →
      </Button>
    </div>
  );
}

function StepWallet({ onNext }: { onNext: () => void }) {
  const { userId, userType } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bvn: '',
    gender: '' as 'male' | 'female' | '',
    address: '',
    accountNumber: '',
  });

  const set = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!formData.gender) { setError('Please select your gender.'); return; }
    if (formData.bvn.length !== 11) { setError('BVN must be 11 digits.'); return; }

    setLoading(true);
    try {
      await ApiService.wallet.create({
        ownerId: userId!,
        ownerType: userType === 'institution' ? 'institution' : 'individual',
        bvn: formData.bvn,
        gender: formData.gender as 'male' | 'female',
        address: formData.address,
        accountNumber: formData.accountNumber,
      });
      onNext();
    } catch (err: any) {
      setError(err?.message ?? 'Wallet creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
          Set Up Your Wallet
        </h2>
        <p className="text-white/40 text-sm">Your wallet enables secure payment releases tied to your verified identity.</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Field label="BVN" id="w-bvn" hint="11-digit Bank Verification Number">
        <Input
          id="w-bvn" type="text" inputMode="numeric" maxLength={11} placeholder="12345678901" required
          value={formData.bvn} onChange={set('bvn')}
          className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-violet-500 rounded-xl"
        />
      </Field>

      <Field label="Gender" id="w-gender">
        <Select onValueChange={(v) => setFormData((p) => ({ ...p, gender: v as 'male' | 'female' }))}>
          <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl focus:border-violet-500">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Residential Address" id="w-address">
        <Input
          id="w-address" type="text" placeholder="14 Awolowo Road, Ikoyi, Lagos" required
          value={formData.address} onChange={set('address')}
          className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-violet-500 rounded-xl"
        />
      </Field>

      <Field label="Bank Account Number" id="w-acct" hint="The account linked to your BVN">
        <Input
          id="w-acct" type="text" inputMode="numeric" maxLength={10} placeholder="0123456789" required
          value={formData.accountNumber} onChange={set('accountNumber')}
          className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-violet-500 rounded-xl"
        />
      </Field>

      <Button
        type="submit" disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-3 h-auto font-semibold transition-all duration-200 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Creating wallet…
          </span>
        ) : 'Create Wallet →'}
      </Button>

      <p className="text-center text-white/20 text-xs">
        Your BVN is encrypted at rest and never shared with third parties.
      </p>
    </form>
  );
}

function StepDocuments({ onNext }: { onNext: () => void }) {
  const { userType } = useAuthStore();
  const isVendor = userType === 'vendor';

  const docs = isVendor
    ? [
      { label: 'CAC Certificate', hint: 'Corporate Affairs Commission registration', required: true },
      { label: 'Director BVN', hint: 'Already collected during signup', required: true, done: true },
      { label: 'Bank Statement', hint: 'Last 6 months — any format', required: true },
      { label: 'Utility Bill', hint: 'Business address proof', required: false },
      { label: 'Tax Clearance', hint: 'FIRS clearance certificate', required: false },
    ]
    : [
      { label: 'NIN', hint: 'National Identity Number slip or card', required: true },
      { label: 'BVN', hint: 'Already collected during signup', required: true, done: true },
      { label: 'Bank Statement', hint: 'Last 3 months', required: true },
      { label: 'Utility Bill', hint: 'Home address proof', required: false },
    ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
          Your Verification Roadmap
        </h2>
        <p className="text-white/40 text-sm">
          Each document adds points to your vScore™. Required docs unlock your account. Optional docs boost your score.
        </p>
      </div>

      <div className="space-y-2">
        {docs.map((d, i) => (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 ${d.done
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-white/6 bg-white/3'
              }`}
          >
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${d.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20'
              }`}>
              {d.done ? '✓' : i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${d.done ? 'text-emerald-300' : 'text-white/80'}`}>
                  {d.label}
                </p>
                {d.required && !d.done && (
                  <Badge variant="outline" className="text-[9px] border-violet-500/30 text-violet-400 bg-violet-500/10 px-1.5 py-0">
                    required
                  </Badge>
                )}
                {!d.required && (
                  <Badge variant="outline" className="text-[9px] border-white/10 text-white/30 px-1.5 py-0">
                    optional
                  </Badge>
                )}
              </div>
              <p className="text-white/30 text-xs mt-0.5">{d.hint}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5">
        <p className="text-amber-400 text-sm font-medium mb-1">📋 You can upload documents anytime</p>
        <p className="text-white/40 text-xs leading-relaxed">
          Head to the Verification section after onboarding to upload your documents. Your vScore updates within minutes of each upload.
        </p>
      </div>

      <Button
        onClick={onNext}
        className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-3 h-auto font-semibold transition-all duration-200 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
      >
        Got it — take me to my dashboard →
      </Button>
    </div>
  );
}

function StepDone({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative w-28 h-28"
      >
        <div className="absolute inset-0 rounded-full bg-emerald-500 blur-10 opacity-30" />
        <div className="relative w-28 h-28 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-5xl">
          ✓
        </div>
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          You&apos;re all set!
        </h2>
        <p className="text-white/40 text-sm leading-relaxed max-w-sm">
          Your vproof account is active. Upload your documents to get your vScore™ and start making protected transfers.
        </p>
      </div>

      {[
        '✓ Account created & secured',
        '✓ Wallet initialized',
        '✓ Verification roadmap ready',
      ].map((item) => (
        <div key={item} className="text-emerald-400 text-sm font-medium">{item}</div>
      ))}

      <Button
        onClick={onFinish}
        className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-3 h-auto font-semibold transition-all duration-200 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
      >
        Go to Dashboard →
      </Button>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboarded, userType } = useAuthStore();
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => Math.min(s + 1, 4));

  function finish() {
    setOnboarded();
    // if (userType === 'individual') {
    //   router.push('/(individual)/dashboard');
    // } else if (userType === 'vendor') {
    //   router.push('/(vendor)/dashboard');
    // } else {
    //   router.push('/(institution)/dashboard');
    // }
    router.push('/dashboard');
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#06060e' }}>
        <GlowOrb className="w-150 h-150 bg-violet-700 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
        <GlowOrb className="w-75 h-75 bg-indigo-500 top-0 right-0 opacity-15" />

        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs" style={{ fontFamily: 'Syne, sans-serif' }}>V</span>
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>vproof</span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0 ${step > s.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : step === s.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-white/5 text-white/20 border border-white/6'
                    }`}
                >
                  {step > s.id ? '✓' : s.icon}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-white/6 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: step > s.id ? '100%' : '0%' }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/6 bg-white/3 p-8 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {step === 1 && <StepWelcome onNext={next} />}
                {step === 2 && <StepWallet onNext={next} />}
                {step === 3 && <StepDocuments onNext={next} />}
                {step === 4 && <StepDone onFinish={finish} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-center text-white/20 text-xs mt-6 font-mono">
            Step {step} of {STEPS.length} — {STEPS[step - 1].label}
          </p>
        </div>
      </div>
    </>
  );
}