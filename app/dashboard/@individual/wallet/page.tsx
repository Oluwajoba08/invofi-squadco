'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  CheckCircle2,
  History,
  Info,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/components/dashboard/DashboardContext';
import { FundWalletModal } from '@/components/dashboard/FundWalletModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function WalletPage() {
  const { wallet, loading, refreshWallet } = useDashboard();
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const transactions = wallet?.recentFundings || [];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
          Financials — Wallet
        </p>
        <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
          My Wallet
        </h1>
      </div>

      {/* Main Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group overflow-hidden rounded-[2.5rem] bg-linear-to-br from-emerald-600 to-teal-700 p-10 shadow-[0_20px_50px_rgba(16,185,129,0.2)]"
      >
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
          <WalletIcon size={160} />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Available Balance</p>
              <div className="h-1 w-1 rounded-full bg-white/40" />
              <p className="text-[10px] text-white/40 font-mono uppercase">Secure Escrow</p>
            </div>
            <h2 className="text-6xl font-black text-white tracking-tighter" style={{ fontFamily: 'Syne, sans-serif' }}>
              ₦{wallet?.balance?.toLocaleString() || '0.00'}
            </h2>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setIsFundModalOpen(true)}
              className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl px-8 h-14 font-bold transition-all active:scale-95 shadow-xl shadow-black/10"
            >
              <Plus className="mr-2 h-5 w-5" /> Fund Wallet
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-2xl px-8 h-14 font-bold backdrop-blur-md transition-all active:scale-95"
            >
              <ArrowUpRight className="mr-2 h-5 w-5" /> Withdraw
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Settlement Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Settlement Account</h3>
          </div>

          <div className="p-8 rounded-[2rem] bg-white/2 border border-white/5 space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-1">
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Bank Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">Moniepoint MFB</p>
                  <Banknote className="h-4 w-4 text-emerald-500/50" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-1 group">
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-white font-mono tracking-wider">{wallet?.settlementAccountNumber || '———'}</p>
                  <button
                    onClick={() => copyToClipboard(wallet?.settlementAccountNumber || '', 'Account number')}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10">
              <Info className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-white/40 leading-relaxed">
                This is your dedicated settlement account. Funds sent here will be automatically credited to your Invofi wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Right: History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Recent Fundings</h3>
            <button className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((tx: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      tx.type === 'funding' ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      {tx.type === 'funding' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Wallet Funding</p>
                      <p className="text-[10px] text-white/30">{new Date(tx.fundedAt).toLocaleDateString()} · {new Date(tx.fundedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-black",
                      "text-emerald-400"
                    )}>
                      ₦{tx.amount?.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Completed</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                  <History className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white/40">No transactions yet</p>
                  <p className="text-xs text-white/20">Your financial activity will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <FundWalletModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        wallet={wallet}
        onSuccess={refreshWallet}
      />
    </div>
  );
}
