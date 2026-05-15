'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  ArrowRight,
  CheckCircle2,
  Loader2,
  FileText,
  Banknote,
  Lock,
  UploadCloud,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ApiService } from '@/services/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type WorkflowStep = 'landing' | 'join' | 'submit' | 'processing' | 'success';

export default function VerificationPublicPage({ params }: { params: Promise<{ requestCode: string }> }) {
  const { requestCode } = use(params);
  const router = useRouter();

  const [step, setStep] = useState<WorkflowStep>('landing');
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);

  const [guestInfo, setGuestInfo] = useState({ fullName: '', phoneNumber: '' });
  const [submissionData, setSubmissionData] = useState({
    bvn: '',
    bankAccount: '',
    bankCode: '',
    companyName: '',
    rcNumber: '',
    registrationDate: '',
    address: '',
    contactEmail: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchRequestDetails() {
      try {
        setLoading(true);
        const response = await ApiService.guest.getRequest(requestCode);
        if (response) {
          setRequest(response.data);
        }
      } catch (error) {
        console.error('Error fetching request:', error);
        toast.error('Invalid or expired verification request');
      } finally {
        setLoading(false);
      }
    }
    fetchRequestDetails();
  }, [requestCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await ApiService.guest.joinRequest(requestCode, guestInfo);
      if (response.guestToken) {
        setGuestToken(response.guestToken);
        setStep('submit');
        toast.success('Identity verified. Please complete your profile.');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to join request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !guestToken) return;

    try {
      setIsSubmitting(true);
      setStep('processing');

      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('guestToken', guestToken);

      Object.entries(submissionData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await ApiService.guest.submitDocument(requestCode, formData);
      if (response) {
        setStep('success');
        toast.success('Verification submitted successfully');
      }
    } catch (error: any) {
      setStep('submit');
      toast.error(error?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center gap-4 text-white/20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Authenticating Request...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <ShieldAlert className="h-10 w-10 text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Invalid Request</h1>
          <p className="text-white/40 max-w-xs mx-auto">This verification link has expired or the request code is incorrect.</p>
        </div>
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-2xl border-white/10 text-white">
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12 md:py-20 min-h-screen flex flex-col items-center justify-center">
        {/* Progress Stepper (Simple) */}
        <div className="flex items-center gap-2 mb-12">
          <div className="h-1 w-12 rounded-full bg-violet-600" />
          <div className={cn("h-1 w-12 rounded-full transition-colors duration-500", step !== 'landing' ? "bg-violet-600" : "bg-white/10")} />
          <div className={cn("h-1 w-12 rounded-full transition-colors duration-500", (step === 'processing' || step === 'success') ? "bg-violet-600" : "bg-white/10")} />
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
                  <ShieldCheck className="h-8 w-8 text-violet-400" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Verification Request
                </h1>
                <p className="text-white/40 text-lg">
                  <span className="text-white font-semibold">{request.institutionName}</span> wants to verify your business for a payment.
                </p>
              </div>

              <div className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Banknote size={120} />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Escrow Amount</p>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">Pending Release</Badge>
                  </div>
                  <h2 className="text-5xl font-black text-white tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>
                    ₦{request.paymentAmount?.toLocaleString()}
                  </h2>
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Purpose</p>
                    <p className="text-sm text-white/80 leading-relaxed italic">&quot;{request.paymentDescription}&quot;</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => setStep('join')}
                  className="h-16 bg-violet-600 hover:bg-violet-500 text-white rounded-3xl text-lg font-bold shadow-xl shadow-violet-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  Start Verification
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="text-center text-[11px] text-white/20 uppercase tracking-widest">
                  Secure processing by VendorProof AI
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
                <h2 className="text-2xl font-bold">Quick Identity Check</h2>
                <p className="text-white/40 text-sm">Tell us who you are to begin the secure submission.</p>
              </div>

              <form onSubmit={handleJoin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Full Name / Contact Person</label>
                    <Input
                      required
                      placeholder="e.g. John Doe"
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
                      placeholder="e.g. 08012345678"
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
                    {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "Continue to Details"}
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

          {step === 'submit' && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full space-y-8 pb-20"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Business Verification</h2>
                <p className="text-white/40 text-sm">Fill in your business details for AI cross-referencing.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Business Info */}
                <div className="bg-white/2 border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                    <Building2 className="h-4 w-4 text-violet-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Company Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Registered Name</label>
                      <Input
                        required
                        value={submissionData.companyName}
                        onChange={(e) => setSubmissionData({ ...submissionData, companyName: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">RC / BN Number</label>
                      <Input
                        required
                        value={submissionData.rcNumber}
                        onChange={(e) => setSubmissionData({ ...submissionData, rcNumber: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-xl h-12 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Business Address</label>
                    <textarea
                      required
                      value={submissionData.address}
                      onChange={(e) => setSubmissionData({ ...submissionData, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-24 text-white text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Identity & Bank */}
                <div className="bg-white/2 border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                    <ShieldCheck className="h-4 w-4 text-violet-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Identity & Payments</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Director&apos;s BVN</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                        <Input
                          required
                          maxLength={11}
                          type="password"
                          placeholder="•••••••••••"
                          value={submissionData.bvn}
                          onChange={(e) => setSubmissionData({ ...submissionData, bvn: e.target.value })}
                          className="bg-white/5 border-white/10 rounded-xl h-12 pl-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Bank Code (e.g. 058)</label>
                        <Input
                          required
                          maxLength={3}
                          value={submissionData.bankCode}
                          onChange={(e) => setSubmissionData({ ...submissionData, bankCode: e.target.value })}
                          className="bg-white/5 border-white/10 rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Account Number</label>
                        <Input
                          required
                          maxLength={10}
                          value={submissionData.bankAccount}
                          onChange={(e) => setSubmissionData({ ...submissionData, bankAccount: e.target.value })}
                          className="bg-white/5 border-white/10 rounded-xl h-12"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div className="bg-white/2 border border-white/5 rounded-3xl p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                    <FileText className="h-4 w-4 text-violet-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Evidence Upload</h3>
                  </div>

                  <div
                    className={cn(
                      "relative h-48 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer",
                      selectedFile ? "border-violet-500/50 bg-violet-500/5" : "border-white/10 bg-white/2 hover:bg-white/4 hover:border-white/20"
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
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center transition-transform duration-500",
                      selectedFile ? "bg-violet-600 scale-110" : "bg-white/5"
                    )}>
                      {selectedFile ? <CheckCircle2 className="h-6 w-6 text-white" /> : <UploadCloud className="h-6 w-6 text-white/20" />}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">{selectedFile ? selectedFile.name : "Upload CAC or Invoice"}</p>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">PDF, JPG or PNG (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedFile}
                  className="w-full h-16 bg-violet-600 hover:bg-violet-500 text-white rounded-3xl text-lg font-bold shadow-xl shadow-violet-600/20 transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "Submit for Verification"}
                </Button>
              </form>
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
                <div className="absolute inset-0 animate-ping bg-violet-600/20 rounded-full" />
                <div className="relative h-24 w-24 rounded-[2.5rem] bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/40">
                  <Shield className="h-10 w-10 text-white animate-pulse" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Analysing Trust Layer</h2>
                <div className="space-y-2">
                  <p className="text-sm text-white/60">Our AI is cross-referencing your documents with CAC records...</p>
                  <div className="w-64 h-1.5 bg-white/5 rounded-full mx-auto overflow-hidden">
                    <motion.div
                      className="h-full bg-violet-600"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 15, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {[
                  { label: 'Integrity Check', status: 'active' },
                  { label: 'CAC Lookup', status: 'pending' },
                  { label: 'Bank Validation', status: 'pending' },
                  { label: 'Security Score', status: 'pending' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-violet-600/40" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
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
                  <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Submission Complete</h2>
                  <p className="text-white/40 max-w-sm mx-auto">
                    Your details have been securely transmitted to {request.institutionName}. They will review the AI analysis shortly.
                  </p>
                </div>
              </div>

              <div className="bg-linear-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-2xl shadow-violet-600/20 text-left space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Secure your reputation</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Convert this submission into a full VendorProof account to skip verification in future requests and track all your escrow payments.
                  </p>
                </div>
                <Button className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-bold flex items-center justify-center gap-2">
                  Create Vendor Profile
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <button
                onClick={() => router.push('/')}
                className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Return to Landing Page
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 pb-12 text-center">
        <div className="flex items-center justify-center gap-2 opacity-20">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-bold tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>vproof</span>
        </div>
      </footer>
    </div>
  );
}
