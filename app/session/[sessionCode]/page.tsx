'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Banknote,
  Lock,
  UploadCloud,
  ChevronRight,
  Shield,
  UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ApiService } from '@/services/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { FaceCapture } from '@/components/verification/FaceCapture';

type WorkflowStep = 'landing' | 'join' | 'document' | 'biometric' | 'processing' | 'score_reveal' | 'success';

export default function SessionPublicPage({ params }: { params: Promise<{ sessionCode: string }> }) {
  const { sessionCode } = use(params);
  const router = useRouter();

  const [step, setStep] = useState<WorkflowStep>('landing');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);

  const [guestInfo, setGuestInfo] = useState({ fullName: '', phoneNumber: '' });
  const [extraDetails, setExtraDetails] = useState({
    dateOfBirth: '',
    bvn: '',
    bankAccount: '',
    bankCode: ''
  });
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<any>(null);

  useEffect(() => {
    async function fetchBanks() {
      try {
        const data = await ApiService.wallet.getBanks();
        setBanks(data.data);
      } catch (error) {
        console.error('Error fetching banks:', error);
      }
    }
    fetchBanks();
  }, []);

  useEffect(() => {
    async function fetchSessionDetails() {
      try {
        setLoading(true);
        const response = await ApiService.sessions.getDetails(sessionCode);

        if (response.success) {
          setSession(response.data);
          if (response.data.status === 'both_verifying') {
            setStep('document');
          }
        }
      } catch (error: any) {
        console.error('Error fetching session:', error);
        console.log('Error status:', error?.response?.status);
        console.log('Error data:', error?.response?.data);
        toast.error('Invalid or expired payment session');
      } finally {
        setLoading(false);
      }
    }
    fetchSessionDetails();
  }, [sessionCode]);

  const pollStatus = useCallback(async () => {
    if (!guestToken && !session) return;
    try {
      const response = await ApiService.sessions.getStatus(sessionCode);
      if (response.success) {
        setSessionStatus(response.data);

        if (response.data.status === 'awaiting_both_consent' ||
          response.data.status === 'awaiting_initiator_consent' ||
          response.data.status === 'awaiting_recipient_consent') {
          if (step === 'processing' || step === 'success') {
            setStep('score_reveal');
          }
        } else if (response.data.status === 'payment_released') {
          setStep('success');
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [sessionCode, guestToken, session, step]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'processing' || step === 'score_reveal') {
      interval = setInterval(pollStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [step, pollStatus]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await ApiService.sessions.joinGuest(sessionCode, guestInfo);
      if (response.data.guestToken) {
        setGuestToken(response.data.guestToken);
        setStep('document');
        toast.success('Identity synchronized. Please provide verification documents.');
      }
    } catch (error: any) {
      if (error?.status === 409 || error?.response?.status === 409) {
        setStep('document');
        if (error?.data?.guestToken || error?.response?.data?.guestToken) {
          setGuestToken(error?.data?.guestToken || error?.response?.data?.guestToken);
        }
        return;
      }
      toast.error(error?.message || 'Failed to join session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFaceCapture = (image: string) => {
    setFaceImage(image);
    setStep('processing');
    submitVerification(image);
  };

  const handleConsent = async () => {
    if (!guestToken) return;
    try {
      setIsSubmitting(true);
      const response = await ApiService.sessions.giveConsentAsGuest(sessionCode, guestToken);
      if (response.success) {
        toast.success('Consent recorded. Awaiting initiator...');
        pollStatus();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to record consent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitVerification = async (capturedImage: string) => {
    if (!selectedFile || !guestToken) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('guestToken', guestToken);

      Object.entries(extraDetails).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const res = await fetch(capturedImage);
      const blob = await res.blob();
      formData.append('selfie', blob, 'selfie.jpg');

      const response = await ApiService.sessions.submitVerificationGuest(sessionCode, formData);
      if (response.success) {
        setStep('processing'); // Move to processing while AI works
        toast.success('Verification submitted. Syncing results...');
      }
    } catch (error: any) {
      setStep('biometric');
      toast.error(error?.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center gap-4 text-white/20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Locating Secure Session...</p>
      </div>
    );
  }

  if (!session || session.status === 'expired') {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <ShieldAlert className="h-10 w-10 text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {session?.status === 'expired' ? 'Session Expired' : 'Session Unavailable'}
          </h1>
          <p className="text-white/40 max-w-xs mx-auto">
            {session?.status === 'expired'
              ? 'This payment session has expired for security reasons. Please ask the initiator to create a new session.'
              : 'This payment session may have expired or is no longer active.'}
          </p>
        </div>
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-2xl border-white/10 text-white">
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12 md:py-20 min-h-screen flex flex-col items-center justify-center">
        {/* Progress Stepper */}
        <div className="flex items-center gap-2 mb-12">
          <div className="h-1 w-12 rounded-full bg-emerald-600" />
          <div className={cn("h-1 w-12 rounded-full transition-colors duration-500", step !== 'landing' ? "bg-emerald-600" : "bg-white/10")} />
          <div className={cn("h-1 w-12 rounded-full transition-colors duration-500", (['biometric', 'processing', 'success'].includes(step)) ? "bg-emerald-600" : "bg-white/10")} />
        </div>

        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-2">
                  <ShieldCheck className="h-8 w-8 text-emerald-400" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Secure Payment Session
                </h1>
                <p className="text-white/40 text-lg">
                  <span className="text-white font-semibold">{session.initiatorName}</span> initiated a peer-to-peer escrow for you.
                </p>
              </div>

              <div className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Banknote size={120} />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Escrow Balance</p>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">Locked</Badge>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>
                    ₦{session.amount?.toLocaleString()}
                  </h2>
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Description</p>
                    <p className="text-sm text-white/80 leading-relaxed italic">&quot;{session.description}&quot;</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => setStep('join')}
                  className="h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl text-lg font-bold shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  Verify to Proceed
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="text-center text-[11px] text-white/20 uppercase tracking-widest">
                  Verified Identity Required for Both Parties
                </p>
              </div>
            </motion.div>
          )}

          {step === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-bold">Who are you?</h2>
                <p className="text-white/40 text-sm">We need to match your details with the session invite.</p>
              </div>

              <form onSubmit={handleJoin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Full Legal Name</label>
                    <Input
                      required
                      placeholder="e.g. Jude Oscar"
                      value={guestInfo.fullName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, fullName: e.target.value })}
                      className="h-14 bg-white/5 border-white/10 rounded-2xl px-5 text-white placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Phone Number</label>
                    <Input
                      required
                      type="tel"
                      placeholder="e.g. 080XXXXXXXX"
                      value={guestInfo.phoneNumber}
                      onChange={(e) => setGuestInfo({ ...guestInfo, phoneNumber: e.target.value })}
                      className="h-14 bg-white/5 border-white/10 rounded-2xl px-5 text-white placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-16 bg-white text-black hover:bg-white/90 rounded-3xl text-lg font-bold transition-all active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "Verify Identity"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep('landing')}
                    className="text-center text-[11px] text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Back
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'document' && (
            <motion.div
              key="document"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full space-y-8"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400/60 uppercase tracking-tighter">Privacy Mode Active</Badge>
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Identity Evidence</h2>
                <p className="text-white/40 text-sm">Upload a valid government-issued ID (NIN, Passport, or DL).</p>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 mt-4">
                  <Lock className="h-3 w-3 text-violet-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-violet-300/60 leading-relaxed italic">
                    Privacy Note: Your document and sensitive data (BVN) are used only for real-time AI verification and will NOT be stored on our servers unless you choose to create an account.
                  </p>
                </div>
              </div>

              {/* Extra Details Form */}
              <div className="bg-white/2 border border-white/5 rounded-3xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Date of Birth</label>
                    <Input
                      type="date"
                      required
                      value={extraDetails.dateOfBirth}
                      onChange={(e) => setExtraDetails({ ...extraDetails, dateOfBirth: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-xl px-4 h-12 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">BVN (11 Digits)</label>
                    <Input
                      type="password"
                      maxLength={11}
                      required
                      placeholder="•••••••••••"
                      value={extraDetails.bvn}
                      onChange={(e) => setExtraDetails({ ...extraDetails, bvn: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-xl px-4 h-12 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Settlement Bank</label>
                    <select
                      required
                      value={extraDetails.bankCode}
                      onChange={(e) => setExtraDetails({ ...extraDetails, bankCode: e.target.value })}
                      className="w-full bg-[#0a0a0f]border border-white/10 rounded-xl h-12 px-4 text-white text-sm outline-none focus:border-violet-500/50 appearance-none"
                    >
                      <option value="">Select Bank</option>
                      {banks.map((bank, i) => (
                        <option key={i} value={bank.code}>{bank.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Account Number</label>
                    <Input
                      maxLength={10}
                      required
                      placeholder="0000000000"
                      value={extraDetails.bankAccount}
                      onChange={(e) => setExtraDetails({ ...extraDetails, bankAccount: e.target.value })}
                      className="bg-white/5 border-white/10 rounded-xl px-4 h-12 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "relative h-64 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden",
                  selectedFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/2 hover:bg-white/4 hover:border-white/20"
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) setSelectedFile(file);
                }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />

                {selectedFile ? (
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/20">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Ready for biometric sync</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                      <UploadCloud className="h-8 w-8 text-white/20" />
                    </div>
                    <div className="text-center px-8">
                      <p className="text-sm font-semibold">Upload Identity Document</p>
                      <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2">NIN Slip, Passport, or License</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  disabled={!selectedFile}
                  onClick={() => setStep('biometric')}
                  className="h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl text-lg font-bold shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  Continue to Biometrics
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <button
                  type="button"
                  onClick={() => setStep('join')}
                  className="text-center text-[11px] text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          )}

          {step === 'biometric' && (
            <motion.div
              key="biometric"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold">Liveness Check</h2>
                <p className="text-white/40 text-sm">Position your face and blink when prompted.</p>
              </div>

              <FaceCapture
                onCapture={handleFaceCapture}
                onCancel={() => setStep('document')}
              />
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center justify-center text-center space-y-10 py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-ping bg-emerald-600/20 rounded-full" />
                <div className="relative h-24 w-24 rounded-[2.5rem] bg-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-600/40">
                  <UserCheck className="h-10 w-10 text-white animate-pulse" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Biometric Sync</h2>
                <div className="space-y-2">
                  <p className="text-sm text-white/60">AI is matching your live face with the ID document...</p>
                  <div className="w-64 h-1.5 bg-white/5 rounded-full mx-auto overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-600"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 10, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {[
                  { label: 'Liveness Check', status: 'verified' },
                  { label: 'Face Matching', status: 'active' },
                  { label: 'Integrity Check', status: 'pending' },
                  { label: 'Reputation Sync', status: 'pending' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center gap-3">
                    <div className={cn("h-2 w-2 rounded-full", item.status === 'verified' ? "bg-emerald-500" : "bg-white/10")} />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'score_reveal' && (
            <motion.div
              key="score_reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-xl md:text-2xl font-bold">Mutual Trust Revelation</h2>
                <p className="text-white/40 text-sm">Review scores before finalizing the payout.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Initiator Score */}
                <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Initiator</p>
                    <Badge className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] uppercase",
                      sessionStatus?.initiatorVerdict === 'trusted' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                    )}>
                      {sessionStatus?.initiatorVerdict || 'Verified'}
                    </Badge>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{sessionStatus?.initiatorScore || '??'}</span>
                    <span className="text-[10px] text-white/20 mb-1.5 uppercase font-bold">vScore™</span>
                  </div>
                  {sessionStatus?.theirConsent && (
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                      <CheckCircle2 className="h-3 w-3" /> Consented
                    </div>
                  )}
                </div>

                {/* Recipient Score (You) */}
                <div className="p-6 rounded-3xl bg-white/2 border border-emerald-500/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-emerald-400/40 uppercase tracking-widest">Recipient (You)</p>
                    <Badge className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md text-[9px] uppercase">Verified</Badge>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{sessionStatus?.recipientScore || '??'}</span>
                    <span className="text-[10px] text-white/20 mb-1.5 uppercase font-bold">vScore™</span>
                  </div>
                  {sessionStatus?.yourConsent && (
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                      <CheckCircle2 className="h-3 w-3" /> Consented
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-emerald-600/5 border border-emerald-500/10 flex items-center gap-4">
                <ShieldCheck className="h-10 w-10 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white mb-1">Secure Escrow Active</p>
                  <p className="text-[11px] text-white/40 leading-relaxed">Funds are locked and ready for release. Both parties must confirm to complete the transfer.</p>
                </div>
              </div>

              {!sessionStatus?.yourConsent ? (
                <Button
                  onClick={handleConsent}
                  disabled={isSubmitting}
                  className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl text-lg font-bold shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "Confirm & Receive Funds"}
                </Button>
              ) : (
                <div className="w-full h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center gap-3 text-white/40 font-bold">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Awaiting Initiator Confirmation...
                </div>
              )}
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full text-center space-y-12 py-12"
            >
              <div className="space-y-6">
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-0 animate-pulse bg-emerald-500/5 rounded-full" />
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Payment Released</h2>
                  <p className="text-white/40 max-w-sm mx-auto">
                    The transaction was successful. ₦{session.amount?.toLocaleString()} has been transferred to your settlement account.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-white/2 border border-white/5 text-left space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Transaction Receipt</p>
                  <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400 uppercase tracking-widest">Success</Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <div>
                      <p className="text-[9px] text-white/20 uppercase font-bold mb-1">Amount</p>
                      <p className="text-2xl font-black text-white">₦{session.amount?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-white/20 uppercase font-bold mb-1">Reference</p>
                      <p className="text-xs font-mono text-white/60">{sessionStatus?.squadTransactionRef || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-white/20 uppercase font-bold mb-1">From</p>
                      <p className="text-sm font-bold text-white/80">{session.initiatorName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-white/20 uppercase font-bold mb-1">To</p>
                      <p className="text-sm font-bold text-white/80">{session.guestDetails?.fullName || 'You'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-600/20 text-left space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Keep your TrustScore™</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    You just completed a verified transaction. Create an account to permanently claim this successful reputation.
                  </p>
                </div>
                <Button className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-bold flex items-center justify-center gap-2" onClick={() => router.push('/signup')}>
                  Claim Profile
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 pb-12 text-center">
        <div className="flex items-center justify-center gap-2 opacity-20">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-bold tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>invofi</span>
        </div>
      </footer>
    </div>
  );
}
