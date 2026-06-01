'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Smartphone, Bell, BellOff, Info, CheckCircle2 } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';

interface FooterProps {
  lang?: 'ka' | 'en';
}

export default function Footer({ lang = 'ka' }: FooterProps) {
  const [isKiosk, setIsKiosk] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [startTime] = useState(() => {
    // Look back 1 hour to find unread news
    return Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'global'),
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data());
        }
      },
      (error) => {
        console.error('Error loading settings in footer:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Handle PWA Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check Notification Status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const isMuted = localStorage.getItem('notificationsMuted') === 'true';
      setNotificationsEnabled(Notification.permission === 'granted' && !isMuted);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Listen for NEW news items for notifications
  useEffect(() => {
    if (!notificationsEnabled) return;

    // Listen for news added after page load
    const q = query(
      collection(db, 'news'),
      where('createdAt', '>', startTime),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const news = change.doc.data();
          const notifiedKey = `notified_${change.doc.id}`;
          
          if (!localStorage.getItem(notifiedKey) && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Poti.ge - სიახლე', {
              body: lang === 'ka' ? news.titleKa : news.titleEn,
              icon: '/icon.png',
              tag: change.doc.id
            });
            localStorage.setItem(notifiedKey, 'true');
          }
        }
      });
    });

    return () => unsubscribe();
  }, [notificationsEnabled, startTime, lang]);

  const toggleKioskMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsKiosk(true);
      triggerToast(lang === 'ka' ? 'კიოსკის რეჟიმი გააქტიურებულია' : 'Kiosk mode enabled', 'success');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsKiosk(false);
      triggerToast(lang === 'ka' ? 'კიოსკის რეჟიმი გამორთულია' : 'Kiosk mode disabled', 'info');
    }
  };

  const installApp = async () => {
    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isIOS && !isStandalone) {
      triggerToast(lang === 'ka' ? 'დააჭირეთ "Share" ღილაკს და შემდეგ "Add to Home Screen"' : 'Tap "Share" then "Add to Home Screen"', 'info');
      return;
    }

    if (!installPrompt) {
      triggerToast(lang === 'ka' ? 'აპლიკაცია უკვე დაინსტალირებულია' : 'App is already installed', 'info');
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      triggerToast(lang === 'ka' ? 'წარმატებით დაინსტალირდა' : 'Successfully installed', 'success');
    }
  };

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      triggerToast(lang === 'ka' ? 'ბრაუზერი არ უჭერს მხარს' : 'Not supported by browser', 'info');
      return;
    }

    if (Notification.permission === 'granted') {
      const currentlyMuted = localStorage.getItem('notificationsMuted') === 'true';
      if (!currentlyMuted) {
        // Disable them
        localStorage.setItem('notificationsMuted', 'true');
        setNotificationsEnabled(false);
        triggerToast(lang === 'ka' ? 'შეტყობინებები გამორთულია' : 'Notifications disabled', 'info');
      } else {
        // Enable them
        localStorage.setItem('notificationsMuted', 'false');
        setNotificationsEnabled(true);
        triggerToast(lang === 'ka' ? 'შეტყობინებები ჩართულია' : 'Notifications enabled', 'success');
      }
    } else if (Notification.permission === 'denied') {
      triggerToast(lang === 'ka' ? 'შეტყობინებები დაბლოკილია ბრაუზერში' : 'Notifications blocked in browser', 'info');
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('notificationsMuted', 'false');
        setNotificationsEnabled(true);
        triggerToast(lang === 'ka' ? 'შეტყობინებები გააქტიურდა' : 'Notifications enabled', 'success');
        new Notification('Poti.ge', {
          body: lang === 'ka' ? 'თქვენ გამოიწერეთ სიახლეები' : 'You subscribed to news',
          icon: '/icon.png'
        });
      } else {
        triggerToast(lang === 'ka' ? 'წვდომა უარყოფილია' : 'Permission denied', 'info');
      }
    }
  };

  const triggerToast = (message: string, type: 'success' | 'info') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          {/* Main Footer Text */}
          <div className="max-w-2xl">
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed">
              {lang === 'ka' ? (
                settings?.footerTextKa || 'დამზადებულია ქალაქ ფოთში, მდგრადი განვითარებისა და ინოვაციების სამსახურის ეგიდით.'
              ) : (
                settings?.footerTextEn || 'Made in the City of Poti, under the auspices of the Sustainable Development & Innovations Service.'
              )}
            </p>
          </div>

          {/* Action Buttons - Compact Row */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Kiosk Mode Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleKioskMode}
              title={lang === 'ka' ? 'კიოსკის რეჟიმი' : 'Kiosk Mode'}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all ${isKiosk ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none font-bold' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100'}`}
            >
              <Monitor size={18} />
              <span className="text-xs font-black uppercase tracking-tight">
                {lang === 'ka' ? 'კიოსკი' : 'Kiosk'}
              </span>
            </motion.button>

            {/* App Mode Button Link */}
            <Link 
              href="/app"
              title={lang === 'ka' ? 'აპლიკაციის რეჟიმი' : 'App Mode'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Smartphone size={18} />
              <span className="text-xs font-black uppercase tracking-tight">
                {lang === 'ka' ? 'აპლიკაცია' : 'App'}
              </span>
            </Link>

            {/* Notifications Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleNotifications}
              title={lang === 'ka' ? 'შეტყობინებები' : 'Notifications'}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all ${notificationsEnabled ? 'bg-orange-50 border-orange-200 text-orange-600 font-bold' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100'}`}
            >
              {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
              <span className="text-xs font-black uppercase tracking-tight">
                {lang === 'ka' ? 'შეტყობინებები' : 'Notifications'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 min-w-[320px] border border-white/10"
          >
            {showToast.type === 'success' ? <CheckCircle2 className="text-green-400" /> : <Info className="text-blue-400" />}
            <span className="font-bold text-sm">{showToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
