'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Compass, Home, MapPin, Smartphone, AlertCircle, Anchor } from 'lucide-react';

export default function NotFound() {
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
      {/* Decorative ambient visual background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

      {/* Floating Elements on background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-10 md:left-24 text-blue-500"
        >
          <Anchor size={40} className="stroke-[1.5]" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-10 md:right-24 text-indigo-500"
        >
          <Compass size={44} className="stroke-[1.5]" />
        </motion.div>
      </div>

      <div className="z-10 text-center max-w-lg mx-auto flex flex-col items-center">
        {/* Animated Beacon/Lighthouse Concept */}
        <div className="relative mb-8">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -inset-4 rounded-full bg-blue-500/10 blur-xl"
          />
          <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-center relative z-10 text-blue-600 dark:text-blue-400">
            <Compass size={42} className="stroke-[2] animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        </div>

        {/* 404 Number Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest mb-6 border border-blue-100/50 dark:border-blue-900/30">
          <AlertCircle size={14} />
          Error 404
        </div>

        {/* Dynamic Titles */}
        {lang === 'ka' ? (
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              გვერდი ვერ მოიძებნა
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base leading-relaxed max-w-md mx-auto">
              სამწუხაროდ, თქვენ მიერ მოთხოვნილი გვერდი არ არსებობს, წაშლილია ან გადატანილია ახალ მისამართზე POTI.GE-ზე.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Page Not Found
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base leading-relaxed max-w-md mx-auto">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>
        )}

        {/* Action Buttons Link Grid */}
        <div className="mt-10 sm:flex sm:items-center sm:gap-4 w-full px-4">
          <Link href="/" className="w-full sm:w-1/2 block mb-3 sm:mb-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
            >
              <Home size={16} />
              {lang === 'ka' ? 'მთავარი გვერდი' : 'Back Home'}
            </motion.div>
          </Link>

          <Link href="/map" className="w-full sm:w-1/2 block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <MapPin size={16} className="text-blue-500" />
              {lang === 'ka' ? 'ინტერაქტიული რუკა' : 'Interactive Map'}
            </motion.div>
          </Link>
        </div>

        {/* Extra Utilities */}
        <div className="mt-10 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 w-full flex justify-between items-center text-xs">
          <Link href="/app" className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-bold transition-colors">
            <Smartphone size={14} />
            {lang === 'ka' ? 'PWA აპლიკაციის დაყენება' : 'Install PWA App'}
          </Link>

          <button
            onClick={() => setLang(lang === 'ka' ? 'en' : 'ka')}
            className="font-black tracking-wider text-blue-600 dark:text-blue-400 hover:underline uppercase"
          >
            {lang === 'ka' ? 'English' : 'ქართული'}
          </button>
        </div>
      </div>
    </div>
  );
}
