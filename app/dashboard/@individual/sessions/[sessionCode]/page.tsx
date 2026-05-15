'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Loader2,
  Banknote,
  User,
  Shield,
  History
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SessionDetailsPage({ params }: { params: Promise<{ sessionCode: string }> }) {
  const { sessionCode } = use(params);
  const router = useRouter();
  const { userId } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      const response = await ApiService.sessions.getStatus(sessionCode);
      if (response.success) {
        setSession(response.data);
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionCode]);

  useEffect(() => {
    Promise.resolve().then(() => fetchDetails());

    const interval = setInterval(fetchDetails, 3000);
    return () => clearInterval(interval);
  }, [fetchDetails]);

  const handleConsent = async () => {
    try {
      setIsReleasing(true);
      const response = await ApiService.sessions.giveConsent(sessionCode, userId!);
      if (response.success) {
        toast.success('Confirmation recorded!');
        fetchDetails();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to record confirmation');
    } finally {
      setIsReleasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center gap-4 text-white/20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Synchronizing Trust Data...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <ShieldAlert className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Session Not Found</h1>
        <Button onClick={() => router.push("/dashboard")} variant="outline" className="rounded-2xl border-white/10 text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const isInitiator = session.initiatorProfileId === userId;

  const statusMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
    initiator_verified: { label: 'Payer Verified', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    recipient_verified: { label: 'Recipient Verified', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    both_verified: { label: 'Both Verified', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    awaiting_both_consent: { label: 'Awaiting Confirmations', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    awaiting_initiator_consent: { label: 'Awaiting Payer', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    awaiting_recipient_consent: { label: 'Awaiting Recipient', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    payment_released: { label: 'Payment Released', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    both_verifying: { label: 'Verification in Progress', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    expired: { label: 'Expired', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    blocked: { label: 'Blocked', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };

  const statusConfig = statusMap[session.status] || {
    label: session.status,
    color: 'text-white/40',
    bg: 'bg-white/5',
    border: 'border-white/10'
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/5 rounded-full text-white/40 transition-colors group"
        >
          <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <Badge className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm", statusConfig.bg, statusConfig.color, statusConfig.border)}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Main Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0f] border border-white/5 p-8 md:p-12 shadow-2xl group"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
          <Banknote size={180} />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Transaction Value</p>
            <h1 className="text-6xl font-black text-white tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>
              ₦{session.amount?.toLocaleString()}
            </h1>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Session Code</p>
              <p className="text-sm font-mono text-emerald-400 font-bold">{session.sessionCode}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Expires At</p>
              <p className="text-sm text-white/60 font-medium">{new Date(session.expiresAt).toLocaleDateString()} · {new Date(session.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Description */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-1">Payment Context</h3>
        <div className="p-6 rounded-3xl bg-white/2 border border-white/5">
          <p className="text-white/80 leading-relaxed italic">&quot;{session.description || 'No description provided'}&quot;</p>
        </div>
      </div>

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Initiator */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-1">Initiator</h3>
          <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{isInitiator ? 'You (Initiator)' : session.initiatorName || 'Verified User'}</p>
                <p className="text-xs text-white/40">{session.initiatorEmail || 'Secured Profile'}</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-400 ml-auto" />
            </div>
          </div>
        </div>

        {/* Recipient */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-1">Recipient</h3>
          <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{!isInitiator ? 'You (Recipient)' : session.recipientEmail || session.recipientPhone || 'Guest Recipient'}</p>
                <p className="text-xs text-white/40">{session.status === 'both_verified' || session.status === 'completed' ? 'Verified & Validated' : 'Verification Pending'}</p>
              </div>
              {session.status === 'both_verified' || session.status === 'completed' || session.status === 'payment_released' || session.status === 'recipient_verified' || session.status.includes('consent') ? (
                <ShieldCheck className="h-5 w-5 text-emerald-400 ml-auto" />
              ) : (
                <Clock className="h-5 w-5 text-amber-400 ml-auto animate-pulse" />
              )}
            </div>
            {session.theirConsent && (
              <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                <CheckCircle2 className="h-3 w-3" /> Confirmed Confirmation
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipient Verification Details */}
      {(session.recipientVerificationId || session.recipientTrustScore !== undefined) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Verification Insights</h3>
            <Badge className={cn(
              "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
              session.recipientVerdict === 'passed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                session.recipientVerdict === 'review' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              Verdict: {session.recipientVerdict || 'Pending'}
            </Badge>
          </div>

          <div className="bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-linear-to-br from-white/2 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative h-20 w-20 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-white/5"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 36}
                      strokeDashoffset={2 * Math.PI * 36 * (1 - (session.recipientTrustScore || 0) / 100)}
                      className={cn(
                        "transition-all duration-1000",
                        (session.recipientTrustScore || 0) >= 70 ? "text-emerald-500" :
                          (session.recipientTrustScore || 0) >= 40 ? "text-amber-500" :
                            "text-red-500"
                      )}
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-white">{(session.recipientTrustScore || 0)}</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">TrustScore™</h4>
                  <p className="text-xs text-white/40">Aggregated AI identity confidence</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 max-w-lg">
                {[
                  { label: 'Document', score: session.recipientVerificationId?.subScores?.documentScore || 0 },
                  { label: 'Anomaly', score: session.recipientVerificationId?.subScores?.anomalyScore || 0 },
                  { label: 'Network', score: session.recipientVerificationId?.subScores?.networkScore || 0 },
                  { label: 'Face', score: session.recipientVerificationId?.subScores?.faceScore || 0 },
                ].map((s, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase tracking-widest">
                      <span>{s.label}</span>
                      <span>{s.score}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-1000", s.score >= 70 ? "bg-emerald-500" : s.score >= 40 ? "bg-amber-500" : "bg-red-500")}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 space-y-6">
              {session.recipientVerificationId?.claudeReasoning && (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-violet-400" />
                    AI Analysis Result
                  </h5>
                  <p className="text-sm text-white/70 leading-relaxed italic">
                    &quot;{session.recipientVerificationId.claudeReasoning}&quot;
                  </p>
                </div>
              )}

              {session.recipientVerificationId?.flags && session.recipientVerificationId.flags.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="h-3 w-3 text-amber-500" />
                    Security Flags
                  </h5>
                  <div className="grid grid-cols-1 gap-2">
                    {session.recipientVerificationId.flags.map((flag: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <p className="text-[11px] text-white/50 leading-normal">{flag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-1">Trust Timeline</h3>
        <div className="p-8 rounded-[2rem] bg-white/2 border border-white/5 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-[2.45rem] w-px bg-white/5" />

          <div className="flex items-start gap-6 relative z-10">
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Session Created</p>
              <p className="text-xs text-white/40 mt-0.5">Funds deposited into secure escrow by {session.initiatorName || 'Initiator'}.</p>
            </div>
          </div>

          <div className="flex items-start gap-6 relative z-10">
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0",
              (['recipient_verified', 'both_verified', 'completed'].includes(session.status)) ? "bg-emerald-600 shadow-lg shadow-emerald-600/20" : "bg-white/5")}>
              {(['recipient_verified', 'both_verified', 'completed'].includes(session.status)) ? <CheckCircle2 className="h-4 w-4 text-white" /> : <Loader2 className="h-4 w-4 text-white/20 animate-spin" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white">Recipient Verification</p>
              <p className="text-xs text-white/40 mt-0.5">AI Biometric & Document validation for the recipient.</p>
            </div>
          </div>

          <div className="flex items-start gap-6 relative z-10">
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0",
              (['payment_released', 'completed'].includes(session.status)) ? "bg-emerald-600 shadow-lg shadow-emerald-600/20" : "bg-white/5")}>
              {['payment_released', 'completed'].includes(session.status) ? <CheckCircle2 className="h-4 w-4 text-white" /> : <History className="h-4 w-4 text-white/20" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white">Fund Release</p>
              <p className="text-xs text-white/40 mt-0.5">Final settlement to the recipient&apos;s verified account.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8">
        {['awaiting_both_consent', 'awaiting_initiator_consent', 'awaiting_recipient_consent'].includes(session.status) && (
          <div className="space-y-4">
            {isInitiator && (session.recipientScore || 0) < 75 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-xs leading-relaxed"
              >
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                <p>
                  <span className="text-amber-400 font-bold">Risk Warning:</span> The recipient&apos;s TrustScore™ ({(session.recipientScore || 0)}) is below the recommended threshold of 75. Proceed with caution.
                </p>
              </motion.div>
            )}

            {!session.yourConsent ? (
              <Button
                onClick={handleConsent}
                disabled={isReleasing}
                className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl text-lg font-bold shadow-2xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isReleasing ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>
                    <ShieldCheck className="h-6 w-6" />
                    {isInitiator ? 'Confirm & Release Payment' : 'Confirm & Receive Payment'}
                  </>
                )}
              </Button>
            ) : (
              <div className="w-full h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center gap-3 text-white/40 font-bold italic">
                <Loader2 className="h-5 w-5 animate-spin" />
                Waiting for the other party to confirm...
              </div>
            )}
          </div>
        )}

        {!isInitiator && (session.status === 'initiator_verified' || session.status === 'both_verifying') && (
          <Button
            onClick={() => router.push(`/session/${sessionCode}`)}
            className="w-full h-16 bg-violet-600 hover:bg-violet-500 text-white rounded-3xl text-lg font-bold shadow-2xl shadow-violet-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <ShieldCheck className="h-6 w-6" />
            Complete My Verification
          </Button>
        )}

        {session.status === 'payment_released' && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
              <p className="font-bold">Transaction Successfully Released</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0a0a0f] border border-white/5 space-y-4">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Payment Reference</p>
              <div className="flex items-center justify-between bg-white/2 p-4 rounded-xl border border-white/5 font-mono text-sm text-emerald-400/80">
                {session.squadTransactionRef}
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-[8px] uppercase">Success</Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="pt-12 text-center opacity-20">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-bold tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>invofi</span>
        </div>
      </footer>
    </div>
  );
}
