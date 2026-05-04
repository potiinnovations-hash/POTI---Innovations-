'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';

interface NotificationBannerProps {
  messageKa: string;
  messageEn: string;
  lang: 'ka' | 'en';
  active: boolean;
}

export const NotificationBanner = ({ messageKa, messageEn, lang, active }: NotificationBannerProps) => {
  const [visible, setVisible] = React.useState(active);

  if (!visible || !active) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-yellow-400 text-blue-900 overflow-hidden"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell size={18} className="animate-bounce" />
            <p className="text-sm font-bold tracking-wide">
              {lang === 'ka' ? messageKa : messageEn}
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="p-1 hover:bg-blue-900/10 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
