'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Camera, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Button } from '@/components/ui/button';

interface FaceCaptureProps {
  onCapture: (base64Image: string) => void;
  onCancel: () => void;
}

type LivenessStep = 'positioning' | 'blink' | 'success';

export function FaceCapture({ onCapture, onCancel }: FaceCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [step, setStep] = useState<LivenessStep>('positioning');
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [feedback, setFeedback] = useState('Initializing biometric engine...');
  const [progress, setProgress] = useState(0);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    async function initMediaPipe() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1
        });
        setFaceLandmarker(landmarker);
        setIsModelLoading(false);
        setFeedback('Position your face in the circle');
      } catch (err) {
        console.error("MediaPipe initialization failed:", err);
        setError("Failed to load biometric engine");
        setIsModelLoading(false);
      }
    }
    initMediaPipe();
  }, []);

  const calculateEAR = (landmarks: any[]) => {
    // EAR formula: (dist(p2, p6) + dist(p3, p5)) / (2 * dist(p1, p4))
    const dist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    
    // Indices for right eye
    const p1 = landmarks[362], p2 = landmarks[385], p3 = landmarks[387], p4 = landmarks[263], p5 = landmarks[373], p6 = landmarks[380];
    const ear = (dist(p2, p6) + dist(p3, p5)) / (2 * dist(p1, p4));
    return ear;
  };

  const handleCapture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setTimeout(() => onCapture(imageSrc), 1000);
      }
    }
  }, [onCapture]);

  const processFrame = useCallback(() => {
    if (!faceLandmarker || !webcamRef.current || step === 'success') return;

    const video = webcamRef.current.video;
    if (video && video.readyState === 4) {
      const startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(video, startTimeMs);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const ear = calculateEAR(landmarks);

        // Simple positioning check (is nose near center?)
        const nose = landmarks[4];
        const isCentered = nose.x > 0.4 && nose.x < 0.6 && nose.y > 0.3 && nose.y < 0.6;

        if (step === 'positioning') {
          if (isCentered) {
            setProgress(p => Math.min(p + 5, 100));
            if (progress >= 100) {
              setStep('blink');
              setFeedback('Perfect. Now blink once.');
              setProgress(0);
            }
          } else {
            setProgress(p => Math.max(p - 2, 0));
            setFeedback('Align your face to the guide');
          }
        } else if (step === 'blink') {
          // Blink threshold: typical EAR < 0.2
          if (ear < 0.22) {
            setBlinkDetected(true);
          } else if (blinkDetected && ear > 0.25) {
            // Blink finished
            setStep('success');
            setFeedback('Biometrics verified');
            handleCapture();
          }
        }
      } else {
        // Only set feedback if we are not in success state
        if ((step as string) !== 'success') {
          setFeedback('No face detected');
          setProgress(0);
        }
      }
    }
  }, [faceLandmarker, step, progress, blinkDetected, handleCapture]);

  useEffect(() => {
    let animationFrameId: number;
    
    const loop = () => {
      processFrame();
      animationFrameId = requestAnimationFrame(loop);
    };

    if (!isModelLoading && faceLandmarker && step !== 'success') {
      animationFrameId = requestAnimationFrame(loop);
    }
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isModelLoading, faceLandmarker, processFrame, step]);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="relative w-full max-w-sm aspect-square rounded-[3rem] overflow-hidden border-4 border-white/10 bg-black shadow-2xl">
        {/* Webcam feed */}
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/webp"
          videoConstraints={{ facingMode: "user", width: 640, height: 640 }}
          className="w-full h-full object-cover grayscale brightness-110 contrast-125"
        />

        {/* SVG Mask Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="face-mask">
              <rect width="100%" height="100%" fill="white" />
              <circle cx="50%" cy="45%" r="130" fill="black" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(6, 6, 14, 0.85)" mask="url(#face-mask)" />
          
          {/* Progress Ring */}
          <circle 
            cx="50%" cy="45%" r="130" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            strokeOpacity="0.1"
          />
          <motion.circle 
            cx="50%" cy="45%" r="130" 
            fill="none" 
            stroke={step === 'success' ? '#10b981' : '#8b5cf6'} 
            strokeWidth="6" 
            strokeLinecap="round"
            strokeDasharray="816"
            strokeDashoffset={816 - (816 * (step === 'success' ? 100 : progress)) / 100}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </svg>

        {/* Feedback Overlay */}
        <div className="absolute bottom-10 left-0 right-0 px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={feedback}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-5 py-2"
            >
              {isModelLoading ? (
                <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
              ) : step === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <Shield className="h-4 w-4 text-violet-400" />
              )}
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {feedback}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Loading/Error state */}
        <AnimatePresence>
          {isModelLoading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#06060e] flex flex-col items-center justify-center gap-4"
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-violet-500" />
              </div>
              <p className="text-sm font-medium text-white/40 animate-pulse">Initializing Biometrics...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#06060e]/90 flex flex-col items-center justify-center p-8 text-center gap-4"
            >
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div>
                <h3 className="text-white font-bold mb-1">Hardware Error</h3>
                <p className="text-sm text-white/40">{error}</p>
              </div>
              <Button onClick={onCancel} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">
                Go back
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-4 rounded-2xl border transition-all duration-500 ${step !== 'positioning' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center gap-2 mb-1">
              {step !== 'positioning' ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <div className="h-3 w-3 rounded-full bg-violet-500 animate-pulse" />}
              <p className="text-[10px] font-bold text-white/40 uppercase">Alignment</p>
            </div>
            <p className="text-xs font-semibold text-white">Position Face</p>
          </div>
          <div className={`p-4 rounded-2xl border transition-all duration-500 ${step === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center gap-2 mb-1">
              {step === 'success' ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <RefreshCw className={`h-3 w-3 text-white/20 ${step === 'blink' ? 'animate-spin' : ''}`} />}
              <p className="text-[10px] font-bold text-white/40 uppercase">Liveness</p>
            </div>
            <p className="text-xs font-semibold text-white">Blink Check</p>
          </div>
        </div>
      </div>
    </div>
  );
}
