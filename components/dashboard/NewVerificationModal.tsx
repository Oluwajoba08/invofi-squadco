'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mail, Phone, Hash, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiService } from '@/services/api';
import { AuthRequest } from '@/services/types';
import { useAuthStore } from '@/store/useAuthStore';

interface NewVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewVerificationModal({ isOpen, onClose, onSuccess }: NewVerificationModalProps) {
  const { userId } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    vendorEmail: '',
    vendorPhone: '',
    paymentAmount: '',
    paymentDescription: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!formData.vendorEmail && !formData.vendorPhone) {
      setError('Please provide either an email or phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: AuthRequest.CreateVerificationReq = {
        institutionId: userId,
        vendorEmail: formData.vendorEmail || undefined,
        vendorPhone: formData.vendorPhone || undefined,
        paymentAmount: Number(formData.paymentAmount),
        paymentDescription: formData.paymentDescription,
      };

      const response = await ApiService.verifications.createRequest(payload);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          vendorEmail: '',
          vendorPhone: '',
          paymentAmount: '',
          paymentDescription: '',
        });
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to create verification request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            {/* --- Header --- */}
            <div className="relative h-32 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-violet-600/20 to-emerald-600/20" />
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size:[20px_20px]" />

              <div className="relative z-10 text-center">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">New Verification</h3>
                <p className="text-white/40 text-sm">Secure vendor trust in seconds</p>
              </div>

              <button
                onClick={onClose}
                className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white/40 hover:text-white transition-all border border-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* --- Form Body --- */}
            <div className="p-8">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-white">Request Sent!</h4>
                    <p className="text-white/40 text-sm">The vendor has been notified to proceed.</p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Vendor Email</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-violet-400 transition-colors" />
                        <Input
                          placeholder="email@example.com"
                          value={formData.vendorEmail}
                          onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
                          className="bg-white/5 border-white/10 rounded-2xl pl-11 h-12 text-white placeholder:text-white/10 focus:ring-violet-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Vendor Phone</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-violet-400 transition-colors" />
                        <Input
                          placeholder="08012345678"
                          value={formData.vendorPhone}
                          onChange={(e) => setFormData({ ...formData, vendorPhone: e.target.value })}
                          className="bg-white/5 border-white/10 rounded-2xl pl-11 h-12 text-white placeholder:text-white/10 focus:ring-violet-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Payment Amount (₦)</label>
                    <div className="relative group">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-violet-400 transition-colors" />
                      <Input
                        type="number"
                        placeholder="100000"
                        required
                        value={formData.paymentAmount}
                        onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-2xl pl-11 h-12 text-white placeholder:text-white/10 focus:ring-violet-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Payment Description</label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-4 h-4 w-4 text-white/20 group-focus-within:text-violet-400 transition-colors" />
                      <textarea
                        placeholder="What is this payment for?"
                        required
                        value={formData.paymentDescription}
                        onChange={(e) => setFormData({ ...formData, paymentDescription: e.target.value })}
                        className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 text-white placeholder:text-white/10 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none transition-all resize-none text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    disabled={loading}
                    className="w-full h-14 bg-linear-to-r from-violet-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-violet-600/20 group transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Initialize Request
                        <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
