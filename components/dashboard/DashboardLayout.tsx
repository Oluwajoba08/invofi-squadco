'use client';

import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';
import { DashboardProvider } from './DashboardContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardProvider>
      <div className="flex h-screen bg-[#06060e] text-white w-full max-w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-[#020205] overflow-y-auto overflow-x-hidden relative">
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-150 h-150 bg-violet-700/10 blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-150 h-150 bg-indigo-700/5 blur-[150px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </DashboardProvider>
  );
}
