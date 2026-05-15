'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CreditCard,
  User,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VerifyTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationId?: string;
}

export function VerifyTransferModal({ isOpen, onClose, verificationId }: VerifyTransferModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState<'upload' | 'details' | 'result'>('upload');

  const [amount, setAmount] = useState('');
  const [senderName, setSenderName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File too large. Max 5MB.');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setStep(verificationId ? 'upload' : 'details');
    }
  };

  const handleVerify = async () => {
    if (!file) return;

    setLoading(true);
    try {
      let response;
      if (verificationId) {
        response = await ApiService.payments.verifyPayment({
          verificationId,
          document: file
        });
      } else {
        if (!amount || isNaN(Number(amount))) {
          toast.error('Please enter a valid amount');
          setLoading(false);
          return;
        }
        response = await ApiService.payments.analyseScreenshot({
          amount: Number(amount),
          document: file,
          senderName: senderName || undefined
        });
      }

      if (response.success) {
        setResult(response.data.result);
        setStep('result');
        toast.success('Analysis complete!');
      } else {
        toast.error(response.message || 'Verification failed');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error communicating with AI verification engine');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setStep('upload');
    setAmount('');
    setSenderName('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl bg-[#0b0b14] border-white/5 text-white rounded-[2.5rem] overflow-hidden p-0">
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-violet-600 via-emerald-500 to-indigo-600" />

        <div className="p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Verify Transfer
                </DialogTitle>
                <DialogDescription className="text-white/40 mt-1">
                  AI-powered payment screenshot analysis
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-10 w-10 rounded-full hover:bg-white/5 text-white/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute -inset-1 bg-linear-to-r from-violet-600/20 to-indigo-600/20 rounded-[2rem] blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
                  <div className="relative aspect-video rounded-[2rem] border-2 border-dashed border-white/5 bg-white/2 group-hover:bg-white/4 group-hover:border-violet-500/30 transition-all flex flex-col items-center justify-center gap-4 text-center p-8">
                    {previewUrl ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-contain rounded-xl"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <>
                        <div className="h-16 w-16 rounded-3xl bg-violet-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="h-8 w-8 text-violet-500" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">Drop transfer screenshot</p>
                          <p className="text-sm text-white/40">Support JPG, PNG (Max 5MB)</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />

                {previewUrl && (
                  <Button
                    onClick={() => verificationId ? handleVerify() : setStep('details')}
                    className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all"
                  >
                    {verificationId ? 'Verify Screenshot' : 'Continue'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Claimed Amount (₦)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white focus:outline-none focus:border-violet-500/50 transition-all font-mono"
                        placeholder="e.g. 50000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Sender Name (Optional)</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white focus:outline-none focus:border-violet-500/50 transition-all"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('upload')}
                    className="flex-1 h-14 bg-white/5 border-white/10 rounded-2xl font-bold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerify}
                    disabled={loading || !amount}
                    className="flex-2 h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Start Verification'}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'result' && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className={cn(
                  "p-6 rounded-[2rem] border relative overflow-hidden",
                  result.verdict === 'likely_genuine' ? "bg-emerald-500/5 border-emerald-500/20" :
                    result.verdict === 'suspicious' ? "bg-amber-500/5 border-amber-500/20" :
                      "bg-red-500/5 border-red-500/20"
                )}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center",
                      result.verdict === 'likely_genuine' ? "bg-emerald-500/20 text-emerald-500" :
                        result.verdict === 'suspicious' ? "bg-amber-500/20 text-amber-500" :
                          "bg-red-500/20 text-red-500"
                    )}>
                      {result.verdict === 'likely_genuine' ? <ShieldCheck className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold capitalize">{result.verdict.replace('_', ' ')}</h3>
                      <p className="text-sm text-white/60">Authenticity Score: {result.authenticityScore}%</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Detected Bank</p>
                    <p className="text-sm font-bold">{result.bank}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Extracted Amount</p>
                    <p className="text-sm font-bold text-emerald-400">₦{result.extractedAmount?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">AI Reasoning</h4>
                  <div className="p-5 rounded-2xl bg-white/2 border border-white/5 text-sm text-white/70 leading-relaxed">
                    {result.reasoning}
                  </div>
                </div>

                {result.flags && result.flags.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Anomalies Detected</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.flags.map((flag: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={reset}
                  className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all"
                >
                  Verify Another
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
