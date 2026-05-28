'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';

interface NotificationBannerProps {
  notifications: any[];
  lang: 'ka' | 'en';
}

export const NotificationBanner = ({ notifications, lang }: NotificationBannerProps) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const activeNotif = notifications.find(n => n.active);

  if (!activeNotif || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-24 left-0 right-0 z-[40] px-4 pointer-events-none"
      >
        <div className="container mx-auto max-w-2xl bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto border-2 border-white/20 backdrop-blur-md">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Bell size={20} className="animate-bounce" />
          </div>
          <div className="flex-1 pr-4">
            <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-0.5">
              {lang === 'ka' ? 'შეტყობინება' : 'Notification'}
            </p>
            <p className="font-bold text-sm leading-tight">
              {lang === 'ka' ? activeNotif.messageKa : activeNotif.messageEn}
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
