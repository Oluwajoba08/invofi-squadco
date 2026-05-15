'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Send, MoreHorizontal, Wallet as WalletIcon, TrendingUp, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { RequestItem } from '@/components/dashboard/RequestItem';
import { AuditLogItem } from '@/components/dashboard/AuditLogItem';
import { FundWalletModal } from '@/components/dashboard/FundWalletModal';
import { NewVerificationModal } from '@/components/dashboard/NewVerificationModal';
import { ApiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useDashboard } from '@/components/dashboard/DashboardContext';
import { VerificationRequest, Wallet, Institution, InstitutionDashboardData, AuditLog } from '@/services/types';

export default function InstitutionDashboard() {
  const { userId, displayName } = useAuthStore();
  const { wallet: transferWallet, loading: walletLoading } = useDashboard();
  const [dashboardData, setDashboardData] = useState<InstitutionDashboardData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('recent');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await ApiService.institutions.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    Promise.resolve().then(() => fetchDashboardData());
  }, [fetchDashboardData]);

  useEffect(() => {
    async function fetchAuditLogs() {
      if (!userId || activeTab !== 'audit') return;
      try {
        setAuditLoading(true);
        const response = await ApiService.auditLogs.getAll();

        const logs = Array.isArray(response) ? response : (response as any).data.logs || [];

        setAuditLogs(logs);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setAuditLoading(false);
      }
    }
    Promise.resolve().then(() => fetchAuditLogs());
  }, [userId, activeTab]);

  const inst = dashboardData?.institution;
  const wallet = dashboardData?.wallet;
  const stats = dashboardData?.stats;
  const requests = dashboardData?.recentRequests || [];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10 w-full overflow-x-hidden">
      {/* --- Top Status Bar --- */}
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
          Institution Dashboard — Home
        </p>
      </div>

      {/* --- Header --- */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xl font-bold text-violet-400">
              {inst?.name?.[0] || displayName?.[0] || 'V'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                {inst?.name || displayName || 'Institution Name'}
              </h1>
              <p className="text-sm text-white/40">Institution dashboard</p>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1 border-violet-500/30 text-violet-400 bg-violet-500/5 font-mono text-xs">
          {inst?.rcNumber || 'N/A'}
        </Badge>
      </div>

      {/* --- Wallet Card --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group overflow-hidden rounded-[2rem] bg-linear-to-br from-emerald-600/80 to-teal-700/80 p-8 shadow-[0_20px_50px_rgba(16,185,129,0.2)]"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <WalletIcon size={120} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Wallet balance</p>
            <h2 className="text-5xl font-black text-white tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>
              ₦{wallet?.internalBalance?.toLocaleString() || '0'}
            </h2>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl px-6 h-12 font-bold backdrop-blur-md transition-all active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" /> Fund wallet
          </Button>
        </div>
      </motion.div>

      {/* --- Fund Wallet Modal --- */}
      <FundWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wallet={transferWallet}
        onSuccess={fetchDashboardData}
      />

      {/* --- Stats Row --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
        <StatCard label="Total requests" value={stats?.totalRequests || 0} delay={0.1} />
        <StatCard label="Trusted" value={stats?.trusted || 0} color="text-emerald-400" delay={0.2} />
        <StatCard label="Blocked" value={stats?.blocked || 0} color="text-red-400" delay={0.3} />
      </div>

      {/* --- Primary Action --- */}
      <Button
        onClick={() => setIsNewRequestModalOpen(true)}
        className="w-full h-16 bg-[#06060e] hover:bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-lg group transition-all duration-300"
      >
        <span className="flex items-center gap-3">
          <Send className="h-5 w-5 text-violet-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          New verification request
        </span>
      </Button>

      {/* --- Tabs & List --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-8 border-b border-white/5 pb-1">
          {['recent', 'audit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-sm font-bold uppercase tracking-widest transition-all relative",
                activeTab === tab ? "text-emerald-400" : "text-white/30 hover:text-white/60"
              )}
            >
              {tab === 'recent' ? 'Recent requests' : tab === 'audit' ? 'Audit log' : 'Settings'}
              {activeTab === tab && (
                <motion.div
                  layoutId="active-tab"
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
              {activeTab === 'recent' ? (
                loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-white/20">
                    <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                    <p className="text-xs font-mono">Synchronizing trust layer...</p>
                  </div>
                ) : requests.length > 0 ? (
                  requests.map((req: any, i: number) => (
                    <RequestItem key={req.requestCode} request={req} index={i} />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-white/30 text-sm font-medium">No recent requests found</p>
                  </div>
                )
              ) : activeTab === 'audit' ? (
                auditLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-white/20">
                    <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                    <p className="text-xs font-mono">Retrieving system ledger...</p>
                  </div>
                ) : auditLogs.length > 0 ? (
                  auditLogs.map((log, i) => (
                    <AuditLogItem key={log._id} log={log} index={i} />
                  ))
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-white/30 text-sm font-medium">No activity logs found</p>
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
      <NewVerificationModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
