'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  ShieldCheck,
  Wallet,
  Settings,
  LogOut,
  LayoutDashboard,
  Search,
  Bell
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userId, displayName, userType, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = userType === 'individual' 
    ? [
        { label: 'Home', icon: Home, href: '/individual-dashboard' },
        { label: 'Wallet', icon: Wallet, href: '/individual-dashboard/wallet' },
        { label: 'Settings', icon: Settings, href: '/individual-dashboard/settings' },
      ]
    : [
        { label: 'Home', icon: Home, href: '/institution-dashboard' },
        { label: 'Requests', icon: ShieldCheck, href: '/institution-dashboard/requests' },
        { label: 'Wallet', icon: Wallet, href: '/institution-dashboard/wallet' },
        { label: 'Settings', icon: Settings, href: '/institution-dashboard/settings' },
      ];

  return (
    <aside className="w-64 h-screen border-r border-white/5 bg-[#06060e] flex flex-col shrink-0 sticky top-0">
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>V</span>
        </div>
        <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>vproof</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <p className="px-4 mb-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                isActive
                  ? "text-white bg-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
                  : "text-white/40 hover:text-white hover:bg-white/3"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-5 bg-violet-500 rounded-full"
                />
              )}
              <item.icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-violet-400" : "group-hover:text-violet-400"
              )} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-full bg-linear-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            {displayName?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName || 'User'}</p>
            <p className="text-[10px] text-white/30 truncate capitalize">{userType || 'Administrator'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-white/40 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
