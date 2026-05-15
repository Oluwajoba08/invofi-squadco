'use client';

import { useState, useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Download,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ApiService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { NewVerificationModal } from '@/components/dashboard/NewVerificationModal';

export default function RequestsPage() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  useEffect(() => {
    async function fetchRequests() {
      if (!userId) return;
      try {
        setLoading(true);
        const response = await ApiService.verifications.getAll();
        const data = response.data?.requests || response.data || response;

        setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [userId]);

  const fetchRequests = async () => {
    if (!userId) return;
    try {
      const response = await ApiService.verifications.getAll();
      const data = response.data?.requests || response.data || response;
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.requestCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.vendorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.guestDetails?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    trusted: requests.filter(r => r.verdict === 'trusted').length,
    pending: requests.filter(r => r.status === 'pending').length,
    blocked: requests.filter(r => r.verdict === 'blocked').length,
  };

  const getStatusBadge = (status: string, verdict?: string) => {
    if (verdict === 'trusted') return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Trusted</Badge>;
    if (verdict === 'blocked') return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Blocked</Badge>;
    if (status === 'pending') return <Badge className="bg-white/5 text-white/40 border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Pending</Badge>;
    return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{status}</Badge>;
  };

  return (
    <div className="p-4 md:p-8 space-y-8 w-full">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-2 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Verification Ledger</h1>
          <p className="text-white/40 text-sm">Manage and track all vendor verification requests</p>
        </div>

        <div className="flex items-center gap-3">
          {/* <Button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl px-6 h-12 font-bold transition-all">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button> */}
          <Button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-violet-600/20 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      <NewVerificationModal
        isOpen={isNewRequestModalOpen} 
        onClose={() => setIsNewRequestModalOpen(false)} 
        onSuccess={() => {
          setIsNewRequestModalOpen(false);
          fetchRequests();
        }}
      />

      {/* --- Stats Row --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: stats.total, icon: ArrowUpRight, color: 'text-white' },
          { label: 'High Trust', value: stats.trusted, icon: ShieldCheck, color: 'text-emerald-400' },
          { label: 'Pending AI', value: stats.pending, icon: Clock, color: 'text-amber-400' },
          { label: 'Security Blocks', value: stats.blocked, icon: ShieldAlert, color: 'text-red-400' },
        ].map((stat, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="h-12 w-12" />
            </div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h2 className={cn("text-3xl font-bold tabular-nums", stat.color)} style={{ fontFamily: 'Syne, sans-serif' }}>{stat.value}</h2>
          </m.div>
        ))}
      </div>

      {/* --- Filters & Table --- */}
      <div className="bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col min-h-[600px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/1">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-violet-400 transition-colors" />
            <Input
              placeholder="Search by code, email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/10 rounded-2xl pl-11 h-12 text-white placeholder:text-white/10 focus:ring-violet-500/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'pending', 'review', 'trusted', 'blocked'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  statusFilter === tab ? "bg-white/10 text-white border border-white/10" : "text-white/20 hover:text-white/40"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-white/20 py-40">
              <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
              <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Synchronizing Trust Ledger...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-white/20 py-40">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                <Search className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">No matching requests found</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-left bg-white/1">
                  <th className="p-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Request Code</th>
                  <th className="p-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Vendor</th>
                  <th className="p-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Amount</th>
                  <th className="p-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Trust Score</th>
                  <th className="p-6 text-[10px] font-bold text-white/20 uppercase tracking-widest">Status</th>
                  <th className="p-6 text-[10px] font-bold text-white/20 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRequests.map((req, i) => (
                  <m.tr
                    key={req.requestCode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/2 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/dashboard/requests/${req.requestCode}`)}
                  >
                    <td className="p-6">
                      <span className="text-sm font-mono text-white/80 group-hover:text-violet-400 transition-colors font-bold">{req.requestCode}</span>
                      <p className="text-[10px] text-white/20 mt-1">{format(new Date(req.createdAt), 'MMM dd, yyyy')}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
                          {req.vendorName?.[0] || req.vendorEmail?.[0] || 'V'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{req.vendorName || req.guestDetails?.fullName || 'N/A'}</p>
                          <p className="text-[10px] text-white/20">{req.vendorEmail || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-bold tabular-nums">₦{req.paymentAmount?.toLocaleString()}</span>
                    </td>
                    <td className="p-6">
                      {req.trustScore !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                req.trustScore > 70 ? "bg-emerald-400" : req.trustScore > 40 ? "bg-amber-400" : "bg-red-400"
                              )}
                              style={{ width: `${req.trustScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold tabular-nums text-white/60">{req.trustScore}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-white/20 italic">Calculating...</span>
                      )}
                    </td>
                    <td className="p-6">
                      {getStatusBadge(req.status, req.verdict)}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {req.verdict === 'trusted' && (
                          <Button
                            className="h-8 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-widest rounded-lg"
                            onClick={() => console.log('Release payment', req.requestCode)}
                          >
                            Release
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-white/20 hover:text-white"
                          onClick={() => router.push(`/dashboard/requests/${req.requestCode}`)}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </m.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/1">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            Showing {filteredRequests.length} of {requests.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 w-9 p-0 bg-white/5 border-white/10 rounded-xl text-white/40" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-9 w-9 p-0 bg-white/5 border-white/10 rounded-xl text-white" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
