'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet as WalletIcon, 
  ArrowLeft, 
  Plus, 
  ArrowUpRight, 
  Copy, 
  Check, 
  CreditCard, 
  Building2, 
  User, 
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Wallet } from '@/services/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FundWalletModal } from '@/components/dashboard/FundWalletModal';

export default function InstitutionWalletPage() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchWalletData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await ApiService.wallet.getByOwner(userId, 'institution');
      if (response.success) {
        setWallet(response.data);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center gap-4 text-white/20">
        <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
        <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Synchronizing Financial Layer...</p>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center gap-6 p-4">
        <div className="h-20 w-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center">
          <WalletIcon className="h-10 w-10 text-white/20" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">No Wallet Found</h2>
          <p className="text-sm text-white/40 max-w-xs mx-auto leading-relaxed">
            Your institution wallet hasn&apos;t been initialized yet. Please contact support if you believe this is an error.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard')}
          variant="outline" 
          className="rounded-2xl border-white/10 text-white hover:bg-white/5"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white p-4 md:p-8 space-y-10 w-full overflow-x-hidden max-w-7xl mx-auto">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-2 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Institutional Treasury</h1>
          <p className="text-white/40 text-sm">Manage your escrow balances and transaction history</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsFundModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-2xl px-6 h-14 font-bold shadow-lg shadow-violet-600/20 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Funds
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Main Wallet Card --- */}
        <div className="lg:col-span-2 space-y-8">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group overflow-hidden rounded-[2.5rem] bg-linear-to-br from-emerald-600 to-teal-700 p-10 shadow-[0_30px_60px_rgba(16,185,129,0.25)]"
          >
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <WalletIcon size={180} />
            </div>

            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-white/60" />
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Verified Escrow Balance</p>
                  </div>
                  <h2 className="text-6xl font-black text-white tracking-tighter tabular-nums" style={{ fontFamily: 'Syne, sans-serif' }}>
                    ₦{wallet.balance?.toLocaleString() || '0.00'}
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-white/20 border-white/30 text-white px-3 py-1.5 rounded-xl backdrop-blur-md">
                    {wallet.status?.toUpperCase() || 'ACTIVE'}
                  </Badge>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                    ID: {wallet.customerId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-black/10 backdrop-blur-md border border-white/10 space-y-3 group/item relative">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Funding Account Number</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-mono font-bold text-white tracking-wider">{wallet.accountNumber || 'Pending...'}</p>
                    <button 
                      onClick={() => handleCopy(wallet.accountNumber, 'acc')}
                      className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      {copied === 'acc' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-black/10 backdrop-blur-md border border-white/10 space-y-3">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Assigned Bank Code</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-mono font-bold text-white tracking-wider">{wallet.bankCode || '058'}</p>
                    <Building2 className="h-5 w-5 text-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* --- Recent Activity --- */}
          <section className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white/40" />
                </div>
                <h3 className="text-lg font-bold">Recent Fundings</h3>
              </div>
              <button className="text-[10px] font-bold text-violet-400 uppercase tracking-widest hover:text-violet-300 transition-colors">
                View All Activity
              </button>
            </div>

            <div className="space-y-4">
              {wallet.recentFundings && wallet.recentFundings.length > 0 ? (
                wallet.recentFundings.map((tx: any, i: number) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/1 hover:bg-white/2 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Wallet Inward Funding</p>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest mt-0.5">
                          {tx.createdAt ? format(new Date(tx.createdAt), 'MMM dd, yyyy • HH:mm') : 'Recently'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">+₦{tx.amount?.toLocaleString()}</p>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest mt-0.5">{tx.status || 'Successful'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] space-y-3">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                    <TrendingUp className="h-6 w-6 text-white/10" />
                  </div>
                  <p className="text-sm text-white/20">No recent funding transactions recorded.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* --- Side Info Column --- */}
        <div className="space-y-8">
          {/* Settlement Details */}
          <section className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Settlement Configuration</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Settlement Account</p>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5">
                  <span className="text-sm font-mono text-white/80">{wallet.settlementAccountNumber || 'N/A'}</span>
                  <button onClick={() => handleCopy(wallet.settlementAccountNumber, 'settle')}>
                    {copied === 'settle' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-white/20" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Treasury Holder</p>
                <div className="flex items-center gap-3 p-1">
                  <div className="h-10 w-10 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
                    <User className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">
                      {wallet.firstName} {wallet.lastName}
                    </p>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest mt-0.5">Primary Administrator</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="p-5 rounded-2xl bg-linear-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-violet-400" />
                    <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Security Protocol</p>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Funds in this wallet are held in segregated trust accounts and are strictly for vendor disbursements.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Platform Stats */}
          <section className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">System Metadata</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Created At</span>
                <span className="text-xs font-medium text-white/80">{wallet.createdAt ? format(new Date(wallet.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Last Updated</span>
                <span className="text-xs font-medium text-white/80">{wallet.updatedAt ? format(new Date(wallet.updatedAt), 'MMM dd, yyyy') : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Squad Status</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] h-5">Verified</Badge>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* --- Modals --- */}
      <FundWalletModal 
        isOpen={isFundModalOpen} 
        onClose={() => setIsFundModalOpen(false)} 
        wallet={wallet}
      />
    </div>
  );
}
