'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Wallet } from '@/services/types';

interface DashboardContextType {
  wallet: Wallet | null;
  loading: boolean;
  refreshWallet: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { userId, userType } = useAuthStore();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    if (!userId || !userType || userType === 'undefined' as any) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    try {
      const walletData = await ApiService.wallet.getByOwner(userId, userType);
      const wallet = walletData.data

      setWallet(wallet);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return (
    <DashboardContext.Provider value={{ wallet, loading, refreshWallet: fetchWallet }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
