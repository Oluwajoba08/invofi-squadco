'use client';

import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';
import { DashboardProvider } from './DashboardContext';
import { useState, useEffect } from 'react';
import { MobileHeader } from './MobileHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) return (
    <div className="flex h-screen bg-[#020205] items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <DashboardProvider>
      <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-[#06060e] text-white w-full max-w-full overflow-x-hidden md:overflow-hidden">
        {/* Shows top bar with hamburger menu on mobile */}
        <MobileHeader />
        <Sidebar />
        <main className="flex-1 bg-[#020205] overflow-y-auto overflow-x-hidden relative min-h-[calc(100vh-69px)] md:h-full">
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
