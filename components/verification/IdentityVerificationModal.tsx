'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  Shield,
  FileText,
  Camera,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaceCapture } from './FaceCapture';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

interface IdentityVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'intro' | 'document' | 'biometric' | 'processing' | 'success';

export function IdentityVerificationModal({ isOpen, onClose, onSuccess }: IdentityVerificationModalProps) {
  const { userId } = useAuthStore()
  const [step, setStep] = useState<Step>('intro');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFaceCapture = (image: string) => {
    setFaceImage(image);
    setStep('processing');
    submitVerification(image);
  };

  const submitVerification = async (capturedImage: string) => {
    if (!selectedFile) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('document', selectedFile);

      const res = await fetch(capturedImage);
      const blob = await res.blob();
      formData.append('selfie', blob, 'selfie.jpg');

      const response = await ApiService.individuals.verify(formData, userId!);

      if (response.success || response) {
        setStep('success');
        toast.success('Identity verification submitted successfully');
      }
    } catch (error: any) {
      console.error('Verification failed:', error);
      toast.error(error?.message || 'Verification failed. Please try again.');
      setStep('biometric');
    } finally {
      setIsSubmitting(false);
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
        className="absolute inset-0 bg-[#06060e]/90 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                Identity Verification
              </h2>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Secure Biometric Sync</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/3 border border-white/5">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Document Submission</p>
                      <p className="text-xs text-white/40 leading-relaxed">Upload a valid government-issued ID (NIN, Passport, or DL).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/3 border border-white/5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <Camera className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Live Biometric Capture</p>
                      <p className="text-xs text-white/40 leading-relaxed">AI-guided facial recognition to verify you are a real person.</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setStep('document')}
                  className="w-full h-14 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold text-lg group"
                >
                  Start Verification
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}

            {step === 'document' && (
              <motion.div
                key="document"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div
                  className={`relative group border-2 border-dashed rounded-[2rem] p-12 transition-all duration-300 flex flex-col items-center justify-center text-center gap-4 ${selectedFile ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 hover:border-violet-500/30 hover:bg-white/2'
                    }`}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />

                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mx-auto group-hover:text-violet-400 transition-colors">
                        <UploadCloud className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Click or drag to upload ID</p>
                        <p className="text-xs text-white/30 mt-1 leading-relaxed">NIN Slip, International Passport, or <br />Driver&apos;s License (PDF or JPEG)</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setStep('intro')} variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 hover:bg-white/5 text-white/60">
                    Back
                  </Button>
                  <Button
                    disabled={!selectedFile}
                    onClick={() => setStep('biometric')}
                    className="flex-2 h-14 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold group"
                  >
                    Continue to Biometrics
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'biometric' && (
              <motion.div
                key="biometric"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FaceCapture
                  onCapture={handleFaceCapture}
                  onCancel={() => setStep('document')}
                />
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center gap-6"
              >
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-violet-500 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Securing Identity</h3>
                  <p className="text-sm text-white/40 max-w-xs mx-auto">Syncing your biometrics with the trust layer. This usually takes a few seconds.</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center gap-6"
              >
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Verification Pending</h3>
                  <p className="text-sm text-white/40 max-w-xs mx-auto">Your identity documents and biometrics have been submitted for review. Your vScore™ will update shortly.</p>
                </div>
                <Button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold mt-4"
                >
                  Return to Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
