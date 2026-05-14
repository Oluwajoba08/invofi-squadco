'use client';

import { motion } from 'framer-motion';
import { Activity, ShieldCheck, ShieldAlert, Wallet, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditLog } from '@/services/types';
import { format } from 'date-fns';

interface AuditLogItemProps {
  log: AuditLog;
  index: number;
}

const getActionConfig = (action: string) => {
  switch (action) {
    case 'VERIFICATION_SUCCESS':
    case 'TRUSTED':
      return { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    case 'VERIFICATION_FAILED':
    case 'BLOCKED':
      return { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' };
    case 'WALLET_FUNDED':
    case 'PAYMENT_RELEASED':
      return { icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-500/10' };
    case 'USER_LOGIN':
    case 'USER_REGISTERED':
      return { icon: User, color: 'text-violet-400', bg: 'bg-violet-500/10' };
    default:
      return { icon: Activity, color: 'text-white/40', bg: 'bg-white/5' };
  }
};

export function AuditLogItem({ log, index }: AuditLogItemProps) {
  const config = getActionConfig(log.action);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 transition-all duration-300"
    >
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", config.bg)}>
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-white truncate group-hover:text-violet-400 transition-colors">
            {log.action.replace(/_/g, ' ')}
          </h4>
          <span className="text-[10px] font-mono text-white/20 shrink-0">
            {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
          </span>
        </div>
        <p className="text-[11px] text-white/40 truncate mt-0.5">
          Activity recorded
        </p>
      </div>
    </motion.div>
  );
}
