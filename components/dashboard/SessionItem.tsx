'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface SessionItemProps {
  session: {
    _id: string;
    sessionCode: string;
    otherParty?: string;
    purpose?: string;
    amount: number;
    status: string;
    createdAt: string;
  };
  index: number;
}

export function SessionItem({ session, index }: SessionItemProps) {
  const router = useRouter();
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'complete':
        return { label: 'Complete', className: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' };
      case 'awaiting':
      case 'awaiting them':
        return { label: 'Awaiting them', className: 'border-white/10 text-white/40 bg-white/5' };
      case 'incoming':
        return { label: 'Incoming', className: 'border-blue-500/30 text-blue-400 bg-blue-500/10' };
      case 'pending':
        return { label: 'Pending', className: 'border-amber-500/30 text-amber-400 bg-amber-500/10' };
      default:
        return { label: status, className: 'border-white/10 text-white/40 bg-white/5' };
    }
  };

  const config = getStatusConfig(session.status);
  const partnerDisplay = session.otherParty || 'Unknown Sender';
  const purposeDisplay = session.purpose ? ` · ${session.purpose}` : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.05 }}
      onClick={() => router.push(`/dashboard/sessions/${session.sessionCode}`)}
      className="group flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 cursor-pointer transition-all duration-300 active:scale-[0.99]"
    >
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors">
          {partnerDisplay}{purposeDisplay}
        </h4>
        <div className="flex items-center gap-2 text-[11px] text-white/30">
          <span>{session.sessionCode}</span>
          <span>•</span>
          <span className="font-mono text-white/50">₦{session.amount?.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {session.status === 'incoming' ? (
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-4 h-8 text-[10px] font-bold">
            Join session
          </Button>
        ) : (
          <Badge variant="outline" className={cn("px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase", config.className)}>
            {config.label}
          </Badge>
        )}
      </div>
    </motion.div>
  );
}
