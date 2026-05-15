'use client';

import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Optional, for clean screen-reader accessibility

export function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#06060e] border-b border-white/5 w-full sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-violet-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>V</span>
        </div>
        <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>vproof</span>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 text-white/70 hover:text-white transition-colors" aria-label="Open Menu">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-[#06060e] border-r border-white/5">
          {/* Accessible title for screen readers */}
          <VisuallyHidden>
            <SheetTitle>Navigation Sidebar</SheetTitle>
          </VisuallyHidden>
          
          {/* Reusing your exact Sidebar element inside the drawer */}
          <Sidebar isMobileDrawer />
        </SheetContent>
      </Sheet>
    </header>
  );
}