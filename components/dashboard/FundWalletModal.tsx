'use client';

import { Copy, Check, Loader2, CreditCard } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wallet } from '@/services/types';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  onSuccess?: () => void;
}

export function FundWalletModal({ isOpen, onClose, wallet, onSuccess }: FundWalletModalProps) {
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const copyToClipboard = () => {
    if (wallet?.accountNumber) {
      navigator.clipboard.writeText(wallet.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulate = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!wallet?.accountNumber) {
        toast.error('Virtual account number not found');
        return;
    }

    try {
      setIsSimulating(true);
      await ApiService.wallet.simulateFunding({
        accountNumber: wallet.accountNumber,
        amount: Number(amount)
      });
      toast.success('Simulation successful! Funds will be credited shortly.');
      setAmount('');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0b0b14] border-white/5 text-white rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight text-center" style={{ fontFamily: 'Syne, sans-serif' }}>
            Simulate Wallet Funding
          </DialogTitle>
          <DialogDescription className="text-white/40 text-center">
            Test mode: Enter an amount to simulate a bank transfer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Funding Amount (₦)</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                  placeholder="e.g. 50000"
                />
              </div>
            </div>

            <Button
              onClick={handleSimulate}
              disabled={isSimulating || !amount}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-600/20"
            >
              {isSimulating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Simulate Transfer'}
            </Button>
          </div>

          {/* Original flow commented out for test mode
          <div className="bg-white/3 border border-white/5 rounded-3xl p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Bank Name</p>
              <p className="text-lg font-semibold text-white">GTBank</p>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Account Number</p>
              <div className="flex items-center justify-between group">
                <p className="text-3xl font-bold tracking-tighter text-emerald-400" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {wallet?.accountNumber || '1234567890'}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Account Name</p>
              <p className="text-sm font-medium text-white/60">VP-{wallet?.firstName}</p>
            </div>
          </div>
          */}

          <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4">
            <p className="text-[11px] text-violet-200/60 leading-relaxed text-center">
              Testing Environment: Use this tool to instantly credit your virtual account for development purposes.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white font-bold rounded-xl transition-all"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
