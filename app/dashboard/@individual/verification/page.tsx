'use client';
// Latest Trust Insights View

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Shield,
  FileText,
  User,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiService } from '@/services/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function LatestVerificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<any>(null);

  const fetchLatestVerification = useCallback(async () => {
    try {
      setLoading(true);
      // First get dashboard to find latest verification ID
      const dashboardRes = await ApiService.individuals.getDashboard();
      if (dashboardRes.success && dashboardRes.data.recentVerifications?.length > 0) {
        const latestId = dashboardRes.data.recentVerifications[0]._id;
        
        // Then fetch full details for that ID
        const detailRes = await ApiService.verifications.getDetails(latestId) as any;
        if (detailRes.success) {
          setVerification(detailRes.data);
        }
      }
    } catch (error) {
      console.error('Error fetching latest verification:', error);
      toast.error('Failed to load verification details');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestVerification();
  }, [fetchLatestVerification]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-white/20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Retrieving Latest Trust Data...</p>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <Shield className="h-12 w-12 text-white/20" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">No Verifications Yet</h1>
          <p className="text-white/40 max-w-xs mx-auto text-sm leading-relaxed">
            You haven&apos;t completed any identity scans. Start your first verification to see detailed insights here.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard")} className="bg-violet-600 hover:bg-violet-500 text-white rounded-2xl px-8 h-12 font-bold shadow-xl shadow-violet-600/20 transition-all active:scale-95">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const getVerdictConfig = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'trusted':
      case 'verified':
      case 'approved':
      case 'passed':
        return { label: 'Trusted', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: ShieldCheck };
      case 'review':
        return { label: 'In Review', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle };
      case 'blocked':
      case 'rejected':
      case 'failed':
        return { label: 'Blocked', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: ShieldAlert };
      default:
        return { label: verdict, color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10', icon: Shield };
    }
  };

  const config = getVerdictConfig(verification.verdict);
  const VerdictIcon = config.icon;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Trust Insight</p>
          <h1 className="text-2xl font-bold text-white">Latest Verification</h1>
        </div>
        <Badge className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm", config.bg, config.color, config.border)}>
          {config.label}
        </Badge>
      </div>

      {/* Main Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0f] border border-white/5 p-8 md:p-12 shadow-2xl group"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
          <VerdictIcon size={180} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 58}
                  strokeDashoffset={2 * Math.PI * 58 * (1 - (verification.trustScore || 0) / 100)}
                  className={cn(
                    "transition-all duration-1000",
                    (verification.trustScore || 0) >= 70 ? "text-emerald-500" :
                      (verification.trustScore || 0) >= 40 ? "text-amber-500" :
                        "text-red-500"
                  )}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{verification.trustScore || 0}</span>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Score</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                vScore™ Results
              </h1>
              <p className="text-sm text-white/40 mt-1 max-w-xs leading-relaxed">
                Comprehensive identity confidence metrics based on your most recent scan.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">Scan Metadata</p>
            <div className="space-y-1">
              <p className="text-xs font-mono text-violet-400 font-bold">{verification._id.toUpperCase()}</p>
              <p className="text-xs text-white/40">{new Date(verification.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Breakdown Card */}
        <div className="md:col-span-3 space-y-6">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-1">Analysis Breakdown</h3>
            <div className="p-8 rounded-[2.5rem] bg-white/2 border border-white/5 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { label: 'Document Integrity', score: verification.subScores?.documentScore || 0, icon: FileText, color: 'text-blue-400' },
                  { label: 'Biometric Match', score: verification.subScores?.faceScore || 0, icon: User, color: 'text-violet-400' },
                  { label: 'Anomaly Detection', score: verification.subScores?.anomalyScore || 0, icon: Zap, color: 'text-amber-400' },
                  { label: 'Network Reputation', score: verification.subScores?.networkScore || 0, icon: Shield, color: 'text-indigo-400' },
                ].map((s, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <s.icon className={cn("h-4 w-4", s.color)} />
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{s.label}</span>
                      </div>
                      <span className="text-sm font-black text-white">{s.score}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        className={cn("h-full", s.score >= 70 ? "bg-emerald-500" : s.score >= 40 ? "bg-amber-500" : "bg-red-500")}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {verification.claudeReasoning && (
                <div className="pt-8 border-t border-white/5 space-y-4">
                  <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-violet-400" />
                    AI Orchestration Result
                  </h4>
                  <p className="text-sm text-white/70 leading-relaxed italic bg-white/2 p-6 rounded-2xl border border-white/5">
                    &quot;{verification.claudeReasoning}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status & Flags */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] ml-1">Scan Highlights</h3>
            <div className="p-6 rounded-[2rem] bg-white/2 border border-white/5 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Status</span>
                  <Badge variant="outline" className={cn("px-2 py-0.5 rounded text-[9px] uppercase font-bold", config.bg, config.color, config.border)}>
                    {verification.verdict}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Type</span>
                  <span className="text-xs font-bold text-white/70">Individual</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Method</span>
                  <span className="text-xs font-bold text-white/70">AI Orchestrated</span>
                </div>
              </div>

              {verification.flags && verification.flags.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">Security Flags</p>
                  <div className="space-y-2">
                    {verification.flags.map((flag: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-amber-200/60 leading-normal">{flag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-2 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                  <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">No Flags Detected</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-linear-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/10">
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-2 px-1">Identity Security</p>
            <p className="text-xs text-white/40 leading-relaxed px-1">
              Your vScore™ is a cryptographic proof of identity. Keep your scans frequent to maintain high trust levels.
            </p>
          </div>
        </div>
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
