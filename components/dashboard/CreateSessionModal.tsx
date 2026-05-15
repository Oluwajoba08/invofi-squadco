'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Mail,
  Phone,
  DollarSign,
  FileText,
  CheckCircle2,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initiatorProfileId: string;
  onSuccess: () => void;
}

export function CreateSessionModal({ isOpen, onClose, initiatorProfileId, onSuccess }: CreateSessionModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientPhone: '',
    amount: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipientEmail && !formData.recipientPhone) {
      toast.error('Please provide either an email or phone number for the recipient');
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.sessions.create({
        initiatorProfileId,
        recipientEmail: formData.recipientEmail || undefined,
        recipientPhone: formData.recipientPhone || undefined,
        amount: Number(formData.amount),
        description: formData.description
      });

      if (response.success) {
        setSuccess(true);
        toast.success('Payment session initiated!');
        setTimeout(() => {
          onSuccess();
          onClose();

          setSuccess(false);
          setFormData({ recipientEmail: '', recipientPhone: '', amount: '', description: '' });
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to initiate session');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#06060e]/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                New Payment Session
              </h2>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Secure Escrow Transfer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 block">
                        Recipient Identification
                      </label>
                      <span className="text-[9px] text-violet-400/60 font-medium uppercase tracking-tighter">Choose one only</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="relative">
                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${formData.recipientEmail ? 'text-violet-400' : 'text-white/20'}`} />
                        <Input
                          placeholder="Email address"
                          value={formData.recipientEmail}
                          disabled={!!formData.recipientPhone}
                          onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                          className={`bg-white/5 border-white/10 rounded-xl pl-12 h-12 text-white placeholder:text-white/20 focus:border-violet-500/50 transition-opacity ${formData.recipientPhone ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                        />
                      </div>
                      <div className="relative">
                        <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${formData.recipientPhone ? 'text-violet-400' : 'text-white/20'}`} />
                        <Input
                          placeholder="Phone number"
                          value={formData.recipientPhone}
                          disabled={!!formData.recipientEmail}
                          onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                          className={`bg-white/5 border-white/10 rounded-xl pl-12 h-12 text-white placeholder:text-white/20 focus:border-violet-500/50 transition-opacity ${formData.recipientEmail ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 mb-2 block">
                      Transaction Details
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                      <Input
                        type="number"
                        placeholder="Amount (₦)"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="bg-white/5 border-white/10 rounded-xl pl-12 h-12 text-white placeholder:text-white/20 focus:border-violet-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 h-4 w-4 text-white/20" />
                      <textarea
                        placeholder="Description (e.g. Logo Design Payment)"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 p-4 h-24 text-sm text-white placeholder:text-white/20 focus:border-violet-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg group shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      Initiate Payment
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center gap-6"
              >
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Session Active</h3>
                  <p className="text-sm text-white/40 max-w-xs mx-auto">We&apos;ve sent an invitation to the recipient. The funds will be held securely in escrow.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
