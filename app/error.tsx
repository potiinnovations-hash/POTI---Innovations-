'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { AlertCircle, RefreshCw, Home, Compass, Radio } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as 'ka' | 'en';
    if (savedLang) setLang(savedLang);

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-6 relative overflow-hidden transition-colors duration-300">
      {/* Absolute decorative glow effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

      <div className="z-10 text-center max-w-lg mx-auto flex flex-col items-center">
        {/* Animated Error Indicator */}
        <div className="relative mb-8">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -inset-4 rounded-full bg-red-500/10 blur-xl"
          />
          <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-center relative z-10 text-red-500 dark:text-red-400">
            <Radio size={42} className="stroke-[2] animate-pulse" />
          </div>
          
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        </div>

        {/* Diagnostic System Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-widest mb-6 border border-red-100/50 dark:border-red-900/30">
          <AlertCircle size={14} />
          {lang === 'ka' ? 'სისტემური ხარვეზი' : 'System Exception'}
        </div>

        {/* Bilingual Titles & Context Info */}
        {lang === 'ka' ? (
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              რაღაც შეცდომა მოხდა
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base leading-relaxed max-w-sm mx-auto">
              უკაცრავად, გვერდის ჩატვირთვის დროს დაფიქსირდა ტექნიკური შეცდომა. გთხოვთ სცადოთ განახლება ან დაუბრუნდეთ მთავარ გვერდს.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Something went wrong!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base leading-relaxed max-w-sm mx-auto">
              An unexpected error occurred while loading this page. Please try refreshing or return to our homepage.
            </p>
          </div>
        )}

        {/* Render hidden error digest securely for debugging without breaking space design */}
        {error?.digest && (
          <div className="mt-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-[10px] font-mono text-slate-400 dark:text-slate-500 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
            Digest: {error.digest}
          </div>
        )}

        {/* Action Controls Side by Side */}
        <div className="mt-10 sm:flex sm:items-center sm:gap-4 w-full px-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => reset()}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-blue-200 dark:shadow-none mb-3 sm:mb-0 cursor-pointer"
          >
            <RefreshCw size={16} />
            {lang === 'ka' ? 'ცადეთ თავიდან' : 'Reload Segment'}
          </motion.button>

          <Link href="/" className="w-full sm:w-1/2 block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              <Home size={16} />
              {lang === 'ka' ? 'მთავარი გვერდი' : 'Back Home'}
            </motion.div>
          </Link>
        </div>

        {/* Extra Bottom Row */}
        <div className="mt-10 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 w-full flex justify-between items-center text-xs">
          <Link href="/status" className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-bold transition-colors">
            <Compass size={14} />
            {lang === 'ka' ? 'სისტემის სტატუსი' : 'System Status'}
          </Link>

          <button
            onClick={() => setLang(lang === 'ka' ? 'en' : 'ka')}
            className="font-black tracking-wider text-blue-600 dark:text-blue-400 hover:underline uppercase cursor-pointer"
          >
            {lang === 'ka' ? 'English' : 'ქართული'}
          </button>
        </div>
      </div>
    </div>
  );
}
