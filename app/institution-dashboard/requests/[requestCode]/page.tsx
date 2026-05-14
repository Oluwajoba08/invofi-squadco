'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  FileText,
  MoreHorizontal,
  Activity,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Link as LinkIcon,
  Sparkles,
  ShieldCheck as ShieldIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiService } from '@/services/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AnimatePresence } from 'framer-motion';

export default function RequestDetailsPage({ params }: { params: Promise<{ requestCode: string }> }) {
  const { requestCode } = use(params);
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequest = useCallback(async () => {
    try {
      setLoading(true);

      const response = await ApiService.verifications.getAVerificationRequest(requestCode);
      console.log(response, "Response")
      if (response.success) {
        setRequest(response.data);
      } else {
        setError('Request not found');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch request details');
    } finally {
      setLoading(false);
    }
  }, [requestCode]);

  useEffect(() => {
    Promise.resolve().then(() => fetchRequest());
  }, [fetchRequest]);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const response = await ApiService.verifications.approveRequest(requestCode);
      if (response.success) {
        await fetchRequest();
      }
    } catch (err: any) {
      console.error('Error approving request:', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRelease = async () => {
    if (!request?.verificationId) return;

    try {
      setIsReleasing(true);
      const response = await ApiService.payments.release(request.verificationId);
      if (response.success) {
        await fetchRequest();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to release payment');
    } finally {
      setIsReleasing(false);
      setShowReleaseModal(false);
    }
  };

  const handleCopyLink = () => {
    const link = `http://localhost:3000/verify/${requestCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/20">
          <div className="animate-spin h-10 w-10 border-2 border-violet-500 border-t-transparent rounded-full" />
          <p className="text-xs font-mono uppercase tracking-widest">Decrypting Secure Payload...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#020205] p-8 flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-white/40 mb-8 max-w-md">{error || 'The requested verification packet is unavailable or has been purged from active memory.'}</p>
        <Button
          onClick={() => router.back()}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl px-8 h-14 font-bold"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'trusted':
      case 'completed':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'blocked': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'review': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-7xl mx-auto">
      {/* --- Navigation --- */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
      </button>

      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
              <FileText className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{request.requestCode}</h1>
              <p className="text-white/40 text-sm font-medium">Initialized on {format(new Date(request.createdAt), 'MMMM dd, yyyy')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest", getStatusColor(request.status))}>
              {request.status.replace(/_/g, ' ')}
            </Badge>
            <Badge className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60">
              {request.isGuest ? 'Guest Vendor' : 'Registered Vendor'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {request.status === 'review' && (
            <Button
              disabled={isApproving}
              onClick={() => setShowWarningModal(true)}
              className="bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/30 rounded-2xl h-14 px-8 font-bold transition-all active:scale-95"
            >
              Verify Manually
            </Button>
          )}

          <AnimatePresence>
            {showWarningModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowWarningModal(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                  <div className="relative h-32 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-amber-600/20 to-red-600/20" />
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[20px_20px]" />
                    <div className="relative z-10 h-16 w-16 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                      <AlertTriangle className="h-8 w-8 text-amber-400" />
                    </div>
                  </div>

                  <div className="p-8 text-center space-y-4">
                    <h3 className="text-2xl font-bold text-white">Manual Verification Warning</h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      By proceeding with manual verification, you are overriding the AI security protocols. This action assumes all liability for the vendor&apos;s authenticity and payment security.
                    </p>

                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-left">
                      <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest mb-1">Risk Factors</p>
                      <ul className="text-xs text-white/60 space-y-1.5 list-disc pl-4">
                        <li>Bypasses behavioral anomaly detection</li>
                        <li>Overrides network integrity checks</li>
                        <li>Suppresses document authenticity warnings</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => setShowWarningModal(false)}
                        className="rounded-2xl h-14 text-white/40 hover:text-white hover:bg-white/5 font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setShowWarningModal(false);
                          handleApprove();
                        }}
                        disabled={isApproving}
                        className="bg-amber-600 hover:bg-amber-500 text-white rounded-2xl h-14 font-bold shadow-lg shadow-amber-600/20 transition-all active:scale-95"
                      >
                        {isApproving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Approval'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          <Button
            disabled={request.status.toLowerCase() !== 'trusted' || isReleasing}
            onClick={() => setShowReleaseModal(true)}
            className={cn(
              "rounded-2xl h-14 px-8 font-bold shadow-lg transition-all active:scale-95",
              request.status.toLowerCase() === 'trusted'
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
            )}
          >
            {isReleasing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Release Payment'}
          </Button>

          <AnimatePresence>
            {showReleaseModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowReleaseModal(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                  <div className="relative h-32 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-600/20 to-blue-600/20" />
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[20px_20px]" />
                    <div className="relative z-10 h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <ShieldIcon className="h-8 w-8 text-emerald-400" />
                    </div>
                  </div>

                  <div className="p-8 text-center space-y-4">
                    <h3 className="text-2xl font-bold text-white">Release Escrow Funds</h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      You are about to release <span className="text-white font-bold">₦{request.paymentAmount?.toLocaleString()}</span> to <span className="text-white font-bold">{request.vendorName}</span>. This action is irreversible.
                    </p>

                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest">Trust Verification</p>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px]">PASSED</Badge>
                      </div>
                      <p className="text-xs text-white/60">
                        AI Identity verification and behavioral analysis have successfully confirmed the vendor&apos;s authenticity.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Button
                        variant="ghost"
                        onClick={() => setShowReleaseModal(false)}
                        className="rounded-2xl h-14 text-white/40 hover:text-white hover:bg-white/5 font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          handleRelease();
                        }}
                        disabled={isReleasing}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl h-14 font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                      >
                        {isReleasing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Release'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleCopyLink}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl h-14 px-6 font-bold transition-all active:scale-95"
          >
            {copied ? (
              <span className="flex items-center gap-2 text-emerald-400">
                <ShieldIcon className="h-4 w-4" />
                Copied!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Copy Link
              </span>
            )}
          </Button>

          <Button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl h-14 w-14 flex items-center justify-center transition-all active:scale-95">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Left Column: Vendor Info --- */}
        <div className="lg:col-span-2 space-y-8">
          {/* Vendor Profile Card */}
          <section className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Vendor Profile</h3>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Verification</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-white/40" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Legal Name</p>
                      <p className="text-white font-medium">{request.vendorName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-white/40" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Email Address</p>
                      <p className="text-white font-medium">{request.vendorEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-white/40" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Phone Number</p>
                      <p className="text-white font-medium">{request.vendorPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <CreditCard className="h-5 w-5 text-white/40" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Escrow Amount</p>
                      <p className="text-white font-bold text-xl">₦{request.paymentAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 ml-1">Payment Purpose</p>
                <div className="p-4 rounded-2xl bg-white/2 border border-white/5 text-sm text-white/60 leading-relaxed">
                  {request.paymentDescription || 'No description provided for this transaction.'}
                </div>
              </div>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] p-8">
            <h3 className="text-lg font-bold mb-8">Verification Timeline</h3>
            <div className="space-y-8 relative">
              <div className="absolute left-5 top-2 bottom-2 w-px bg-white/5" />

              {[
                { label: 'Request Initialized', time: request.createdAt, status: 'completed' },
                { label: 'Vendor Joined', time: request.vendorJoinedAt, status: request.vendorJoinedAt ? 'completed' : 'pending' },
                { label: 'Identity Verified', time: request.trustScore ? request.createdAt : null, status: request.trustScore ? 'completed' : 'pending' },
                { label: 'Payment Released', time: request.releasedAt, status: request.releasedAt ? 'completed' : 'pending' },
              ].map((step, i) => (
                <div key={i} className="relative flex gap-6">
                  <div className={cn(
                    "relative z-10 h-10 w-10 rounded-full flex items-center justify-center border transition-all duration-500",
                    step.status === 'completed' ? "bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]" : "bg-[#0a0a0f] border-white/10"
                  )}>
                    {step.status === 'completed' ? (
                      <ShieldIcon className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className="h-5 w-5 text-white/20" />
                    )}
                  </div>
                  <div className="pt-2">
                    <p className={cn("font-bold text-sm", step.status === 'completed' ? "text-white" : "text-white/20")}>
                      {step.label}
                    </p>
                    {step.time && (
                      <p className="text-[11px] text-white/40 mt-1">
                        {format(new Date(step.time), 'MMM dd, yyyy • HH:mm')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* --- Right Column: Trust Score --- */}
        <div className="space-y-8">
          <section className="bg-linear-to-br from-violet-600 to-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-transform group-hover:scale-150 duration-700" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-white/60" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Trust Integrity Score</h3>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold tabular-nums">{request.trustScore || 0}</span>
                <span className="text-xl font-medium text-white/60">/ 100</span>
              </div>

              <div className="space-y-2">
                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${request.trustScore || 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
                  <span>Vulnerable</span>
                  <span>Trusted</span>
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed pt-2">
                {request.verdict || 'Verification is currently in progress. The score will stabilize once identity protocols are complete.'}
              </p>
            </div>
          </section>

          <section className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/20">Trust Subscores</h3>
            <div className="space-y-6">
              {[
                { label: 'Document Authenticity', score: request.subScores?.documentScore || 0 },
                { label: 'Behavioral Anomaly', score: request.subScores?.anomalyScore || 0 },
                { label: 'Network Integrity', score: request.subScores?.networkScore || 0 },
              ].map((sub, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{sub.label}</span>
                    <span className="text-xs font-bold text-white">{sub.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.score}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        sub.score > 70 ? "bg-emerald-400" : sub.score > 40 ? "bg-amber-400" : "bg-red-400"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {request.verification?.claudeReasoning && (
            <section className="bg-[#0a0a0f] border border-violet-500/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="h-12 w-12 text-violet-400" />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">AI Analysis Insight</h3>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-white/80 leading-relaxed italic">
                  &ldquo;{request.verification.claudeReasoning}&rdquo;
                </p>

                {request.verification.flags && request.verification.flags.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Risk Indicators</p>
                    <div className="grid grid-cols-1 gap-2">
                      {request.verification.flags.map((flag: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-white/60 leading-tight">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
