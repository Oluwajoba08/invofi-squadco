'use client';
import { motion } from "motion/react"

export const TrustScoreRing = ({ score, size = 'lg' }: { score: number, size?: 'sm' | 'lg' }) => {
  const radius = size === 'lg' ? 80 : 40;
  const stroke = size === 'lg' ? 12 : 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="#1F1F1F"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke="#FFD700"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <span className={`${size === 'lg' ? 'text-5xl' : 'text-2xl'} font-bold text-white`}>{score}</span>
        {size === 'lg' && <p className="text-[10px] uppercase tracking-widest text-muted">Trust Score</p>}
      </div>
    </div>
  );
};