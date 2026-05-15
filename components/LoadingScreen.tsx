'use client';

import React from 'react';
import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-slate-950 overflow-hidden"
    >
      <div className="relative flex flex-col items-center justify-center w-full max-w-md px-6 text-center">
        {/* Waves Animation Container */}
        <div className="relative w-full h-32 flex items-center justify-center overflow-hidden mb-4">
          <svg
            viewBox="0 0 120 28"
            className="w-full h-full max-w-[280px] transform scale-125"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <motion.path
              animate={{
                d: [
                  "M0 20 Q30 15 60 20 T120 20 V28 H0 Z",
                  "M0 20 Q30 25 60 20 T120 20 V28 H0 Z",
                  "M0 20 Q30 15 60 20 T120 20 V28 H0 Z"
                ],
                x: [-120, 0]
              }}
              transition={{
                d: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 4, repeat: Infinity, ease: "linear" }
              }}
              fill="url(#waveGradient)"
              opacity="0.3"
            />
            <motion.path
              animate={{
                d: [
                  "M0 22 Q30 27 60 22 T120 22 V28 H0 Z",
                  "M0 22 Q30 17 60 22 T120 22 V28 H0 Z",
                  "M0 22 Q30 27 60 22 T120 22 V28 H0 Z"
                ],
                x: [0, -120]
              }}
              transition={{
                d: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 5, repeat: Infinity, ease: "linear" }
              }}
              fill="url(#waveGradient)"
              opacity="0.5"
            />
            <motion.path
              animate={{
                d: [
                  "M0 24 Q30 19 60 24 T120 24 V28 H0 Z",
                  "M0 24 Q30 29 60 24 T120 24 V28 H0 Z",
                  "M0 24 Q30 19 60 24 T120 24 V28 H0 Z"
                ],
                x: [-60, 60]
              }}
              transition={{
                d: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 3, repeat: Infinity, ease: "linear" }
              }}
              fill="url(#waveGradient)"
            />
          </svg>
        </div>

        {/* Subtle Text in Georgian */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-black tracking-tight text-blue-900 dark:text-blue-100"
        >
          ტალღები იტვირთება
        </motion.p>
        
        {/* Loader Progress Bar (Subtle) */}
        <div className="w-48 h-1 bg-blue-50 dark:bg-slate-900 rounded-full mt-6 overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1/2 h-full bg-blue-600 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
