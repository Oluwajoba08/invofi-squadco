'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Shield, Clock } from 'lucide-react';

interface VerificationItemProps {
  verification: {
    _id: string;
    trustScore: number;
    verdict: string;
    createdAt: string;
  };
  index: number;
}

export function VerificationItem({ verification, index }: VerificationItemProps) {
  const getVerdictConfig = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'trusted':
      case 'verified':
      case 'approved':
        return { label: 'Trusted', className: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' };
      case 'review':
        return { label: 'In Review', className: 'border-amber-500/30 text-amber-400 bg-amber-500/10' };
      case 'blocked':
      case 'rejected':
        return { label: 'Blocked', className: 'border-red-500/30 text-red-400 bg-red-500/10' };
      default:
        return { label: verdict, className: 'border-white/10 text-white/40 bg-white/5' };
    }
  };

  const config = getVerdictConfig(verification.verdict);
  const dateDisplay = new Date(verification.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.05 }}
      className="group flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 transition-all duration-300 active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-violet-400">
          <Shield className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-semibold text-white">Identity Verification Scan</h4>
          <div className="flex items-center gap-2 text-[11px] text-white/30">
            <Clock className="h-3 w-3" />
            <span>{dateDisplay}</span>
            <span>•</span>
            <span className="font-mono text-white/50">{verification._id.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right mr-2">
          <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Trust Score</p>
          <p className="text-lg font-black text-white">{verification.trustScore}</p>
        </div>
        <Badge variant="outline" className={cn("px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase", config.className)}>
          {config.label}
        </Badge>
      </div>
    </motion.div>
  );
}
