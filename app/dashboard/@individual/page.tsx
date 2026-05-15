'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Wallet as WalletIcon,
  Shield,
  ArrowLeftRight,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionItem } from '@/components/dashboard/SessionItem';
import { VerificationItem } from '@/components/dashboard/VerificationItem';
import { FundWalletModal } from '@/components/dashboard/FundWalletModal';
import { IdentityVerificationModal } from '@/components/verification/IdentityVerificationModal';
import { CreateSessionModal } from '@/components/dashboard/CreateSessionModal';
import { VerifyTransferModal } from '@/components/dashboard/VerifyTransferModal';
import { ApiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useDashboard } from '@/components/dashboard/DashboardContext';
import { IndividualDashboardData } from '@/services/types';

export default function IndividualDashboard() {
  const { userId, displayName, vScore } = useAuthStore();
  const { wallet: transferWallet, loading: walletLoading } = useDashboard();
  const [dashboardData, setDashboardData] = useState<IndividualDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [isVerifyTransferOpen, setIsVerifyTransferOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await ApiService.individuals.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching individual dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    Promise.resolve().then(fetchDashboardData);
  }, [fetchDashboardData]);

  const profile = dashboardData?.profile;
  const stats = dashboardData?.stats;
  const sessions = dashboardData?.recentSessions || [];
  const verifications = dashboardData?.recentVerifications || [];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 w-full overflow-x-hidden">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
          Individual Dashboard — Home
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-linear-to-br from-violet-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-xl">
            {profile?.fullName?.[0] || displayName?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              {profile?.fullName || displayName || 'User Name'}
            </h1>
            <p className="text-sm text-white/40">Individual profile</p>
          </div>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">
          Score: {profile?.trustScore || vScore || 0}
        </Badge>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group overflow-hidden rounded-[2rem] bg-linear-to-br from-emerald-600 to-teal-700 p-4 md:p-8 shadow-[0_20px_50px_rgba(16,185,129,0.2)]"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <WalletIcon size={120} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Wallet balance</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>
              ₦{stats?.walletBalance?.toLocaleString() || '0'}
            </h2>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl px-6 h-12 font-bold backdrop-blur-md transition-all active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" /> Fund
          </Button>
        </div>
      </motion.div>

      <FundWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wallet={transferWallet}
        onSuccess={fetchDashboardData}
      />

      <IdentityVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onSuccess={fetchDashboardData}
      />

      <CreateSessionModal
        isOpen={isCreateSessionOpen}
        onClose={() => setIsCreateSessionOpen(false)}
        initiatorProfileId={userId || ''}
        onSuccess={fetchDashboardData}
      />

      <VerifyTransferModal
        isOpen={isVerifyTransferOpen}
        onClose={() => setIsVerifyTransferOpen(false)}
      />

      {profile?.verificationStatus === 'review' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-sm"
        >
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p>Your identity is currently under review. Some features may be restricted.</p>
        </motion.div>
      )}

      {!profile?.trustScore && !vScore && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-sm"
        >
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p>Your identity is not yet verified. Verify now to send and receive payments.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <Button
          variant="outline"
          onClick={() => setIsVerifyModalOpen(true)}
          className="w-full h-16 bg-white/2 hover:bg-white/5 border-white/10 rounded-2xl text-white font-bold text-lg group transition-all duration-300 flex items-center justify-center gap-3"
        >
          <Shield className="h-6 w-6 text-violet-400 group-hover:scale-110 transition-transform" />
          Verify my identity
        </Button>

        <div className="space-y-3">
          {(profile?.trustScore || vScore || 0) < 75 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-xs">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <p>Session creation restricted. Your TrustScore™ must be at least 75 to initiate payments.</p>
            </div>
          )}
          <Button
            variant="outline"
            disabled={(profile?.trustScore || vScore || 0) < 75}
            onClick={() => setIsCreateSessionOpen(true)}
            className={cn(
              "w-full h-16 bg-white/2 hover:bg-white/5 border-white/10 rounded-2xl text-white font-bold text-lg group transition-all duration-300 flex items-center justify-center gap-3",
              (profile?.trustScore || vScore || 0) < 75 && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            <ArrowLeftRight className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
            Start a payment session
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => setIsVerifyTransferOpen(true)}
          className="w-full h-16 bg-white/2 hover:bg-white/5 border-white/10 rounded-2xl text-white font-bold text-lg group transition-all duration-300 flex items-center justify-center gap-3"
        >
          <Search className="h-6 w-6 text-indigo-400 group-hover:scale-110 transition-transform" />
          Verify Transfer
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-8 border-b border-white/5 pb-1">
          {['sessions', 'verifications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-sm font-bold uppercase tracking-widest transition-all relative",
                activeTab === tab ? "text-emerald-400" : "text-white/30 hover:text-white/60"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="active-tab-ind"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {activeTab === 'sessions' ? (
                loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-white/20">
                    <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                    <p className="text-xs font-mono">Loading sessions...</p>
                  </div>
                ) : sessions.length > 0 ? (
                  sessions.map((session, i) => (
                    <SessionItem key={i} session={session} index={i} />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-white/30 text-sm font-medium">No active sessions found</p>
                  </div>
                )
              ) : activeTab === 'verifications' ? (
                loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-white/20">
                    <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                    <p className="text-xs font-mono">Loading verifications...</p>
                  </div>
                ) : verifications.length > 0 ? (
                  verifications.map((verification, i) => (
                    <VerificationItem key={verification._id} verification={verification} index={i} />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-white/30 text-sm font-medium">No verification history found</p>
                  </div>
                )
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-white/30 text-sm font-medium">{activeTab} section under development</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
