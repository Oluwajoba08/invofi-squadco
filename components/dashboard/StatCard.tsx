'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  delay?: number;
}

export function StatCard({ label, value, color = "text-white", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col gap-1 px-2"
    >
      <span className={cn("text-3xl font-bold tracking-tight", color)} style={{ fontFamily: 'Syne, sans-serif' }}>
        {value}
      </span>
      <span className="text-[11px] font-medium text-white/30 uppercase tracking-widest">
        {label}
      </span>
    </motion.div>
  );
}
