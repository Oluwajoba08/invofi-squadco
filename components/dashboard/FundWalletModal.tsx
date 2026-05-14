'use client';

import { Copy, Check } from 'lucide-react';
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

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
}

export function FundWalletModal({ isOpen, onClose, wallet }: FundWalletModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (wallet?.accountNumber) {
      navigator.clipboard.writeText(wallet.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#0b0b14] border-white/5 text-white rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-center" style={{ fontFamily: 'Syne, sans-serif' }}>
            Fund your wallet
          </DialogTitle>
          <DialogDescription className="text-white/40 text-center">
            Make a transfer to the account below:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-6">
          {/* Account Details Card */}
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

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <p className="text-[11px] text-amber-200/60 leading-relaxed text-center">
              Funds transferred to this account will be automatically credited to your wallet balance within a few minutes.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
