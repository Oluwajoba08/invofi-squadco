'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VerificationRequest } from '@/services/types';
import Link from 'next/link';

interface RequestItemProps {
  request: VerificationRequest;
  index: number;
}

export function RequestItem({ request, index }: RequestItemProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'trusted':
        return { label: 'Trusted', className: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' };
      case 'pending':
        return { label: 'Pending', className: 'border-white/10 text-white/40 bg-white/5' };
      case 'submitted':
      case 'review':
        return { label: 'Review', className: 'border-amber-500/30 text-amber-400 bg-amber-500/10' };
      case 'blocked':
        return { label: 'Blocked', className: 'border-red-500/30 text-red-400 bg-red-500/10' };
      default:
        return { label: status, className: 'border-white/10 text-white/40 bg-white/5' };
    }
  };

  const config = getStatusConfig(request.status);
  // Support both old and new data structures
  const vendorName = (request as any).vendorName || (request as any).vendorEmail || 'Unknown Entity';
  const requestCode = (request as any).requestCode || (request as any).requestId || 'N/A';

  return (
    <Link href={`/institution-dashboard/requests/${requestCode}`}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 + index * 0.05 }}
        className="group flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 transition-all duration-300 cursor-pointer active:scale-[0.99]"
      >
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors">
            {vendorName}
          </h4>
          <div className="flex items-center gap-2 text-[11px] text-white/30">
            <span>{requestCode}</span>
            <span>•</span>
            <span className="font-mono text-white/50">₦{request.paymentAmount.toLocaleString()}</span>
          </div>
        </div>

        <Badge variant="outline" className={cn("px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase", config.className)}>
          {config.label}
          {(request as any).trustScore !== undefined && ` • ${(request as any).trustScore}`}
        </Badge>
      </motion.div>
    </Link>
  );
}
