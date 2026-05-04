'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto mb-8 grayscale hover:grayscale-0 transition-all duration-500">
          <Image
            src="https://i.ibb.co/NdQ3Hrnj/logo.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
            referrerPolicy="no-referrer"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="text-6xl md:text-8xl font-black text-slate-200 dark:text-slate-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none">
            404
          </h1>
          
          <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 max-w-lg mx-auto leading-relaxed">
            ეს გვერდი მიუწვდომელია ან წაშლილია, გთხოვთ დაბრუნდეთ მთავარ გვერდზე
          </p>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
            The page you are looking for is unavailable or has been deleted.
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link 
          href="/"
          className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <Home size={20} />
          მთავარ გვერდზე გადასვლა
        </Link>
      </motion.div>
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
