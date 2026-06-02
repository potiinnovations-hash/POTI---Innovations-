'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Bell, X, CheckSquare, Download, Check, AlertCircle } from 'lucide-react';

export default function PWAPromptWidget() {
  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('default');

  useEffect(() => {
    // 1. Sync active language from localStorage on mount and register storage listener
    const syncLang = () => {
      const savedLang = localStorage.getItem('lang') as 'ka' | 'en' | null;
      if (savedLang) {
        setLang(savedLang);
      }
    };
    syncLang();
    window.addEventListener('storage', syncLang);

    // 2. Check if already installed / running in standalone mode
    const checkStatus = () => {
      if (typeof window !== 'undefined') {
        const standaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone;
        setIsStandalone(!!standaloneMode);
        
        if ('Notification' in window) {
          setPermissionState(Notification.permission);
        }
      }
    };
    checkStatus();

    // 3. Keep listening for beforeinstallprompt event
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      // Save the event so it can be called later
      setDeferredPrompt(e);
      
      const promptDismissed = localStorage.getItem('pwa_prompt_dismissed');
      // Show install prompt if not dismissed and not in standalone mode
      if (!promptDismissed) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. Determine if we should show the notifications prompt
    // Show notification prompt if permission is 'default' and notifications are not muted / prompt not dismissed
    const checkNotificationPromptNeeded = () => {
      if ('Notification' in window) {
        const isPermissionDefault = Notification.permission === 'default';
        const promptDismissed = localStorage.getItem('pwa_prompt_dismissed');
        if (isPermissionDefault && !promptDismissed) {
          setShowNotificationPrompt(true);
        }
      }
    };
    checkNotificationPromptNeeded();

    // 5. Delay showing the widget to the user (e.g., 4 seconds after landing) to look natural and elegant
    const timer = setTimeout(() => {
      const promptDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!promptDismissed) {
        setIsVisible(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener('storage', syncLang);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  // Sync state helpers
  const refreshPermissionState = () => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
      if (Notification.permission === 'granted') {
        setShowNotificationPrompt(false);
      }
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // iOS / manual flow fallback message
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert(
          lang === 'ka'
            ? 'iPhone-ზე ინსტალაციისთვის: დააჭირეთ ბრაუზერის "Share" (გაზიარება) ღილაკს და აირჩიეთ "Add to Home Screen" (ეკრანზე დამატება).'
            : 'To install on iOS: Tap browser "Share" button then select "Add to Home Screen".'
        );
      } else {
        alert(
          lang === 'ka'
            ? 'დაინსტალირებისთვის გთხოვთ გამოიყენოთ Google Chrome თქვენს მოწყობილობაზე, ან დააჭირეთ სწრაფი მენიუს "აპლიკაციის რეჟიმი" გვერდს.'
            : 'Please use Google Chrome to install, or navigate to "App Mode" page in the navigation menu.'
        );
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setIsStandalone(true);
      
      // Auto close widget if notifications are also handled/not needed
      if (!showNotificationPrompt) {
        setIsVisible(false);
      }
    }
  };

  const handleNotificationClick = async () => {
    if (!('Notification' in window)) {
      alert(
        lang === 'ka'
          ? 'სამწუხაროდ, თქვენს მიმდინარე ბრაუზერს არ აქვს სისტემური შეტყობინებების მხარდაჭერა.'
          : 'Sorry, your current browser does not support system push notifications.'
      );
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission === 'granted') {
        setShowNotificationPrompt(false);
        // Show success alert
        new Notification('Poti.ge', {
          body: lang === 'ka' ? 'შეტყობინებები წარმატებით გააქტიურდა!' : 'Notifications enabled successfully!',
          icon: '/logo.png',
        });

        // Close widget if install is also not available/active
        if (!showInstallPrompt || isStandalone) {
          setIsVisible(false);
        }
      } else {
        alert(
          lang === 'ka'
            ? 'შეტყობინებები უარყოფილია. მათი ჩართვა შეგიძლიათ ბრაუზერის მისამართების ზოლში ბოქლომის ღილაკზე დაჭერით.'
            : 'Permission denied. You can enable them later by clicking the padlock icon in your browser address bar.'
        );
        setShowNotificationPrompt(false);
      }
    } catch (err) {
      console.error("Error setting up notifications:", err);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    // Set 1-day expiration in session / localStorage time
    localStorage.setItem('pwa_prompt_dismissed_time', Date.now().toString());
    setIsVisible(false);
  };

  // If there's nothing to prompt (already installed and permissions accepted) or dismissed, do not render
  const hasActions = (showInstallPrompt && !isStandalone) || (showNotificationPrompt && permissionState === 'default');
  if (!isVisible || !hasActions) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="fixed bottom-6 left-6 z-40 max-w-sm w-[92vw] sm:w-[350px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-5 space-y-4 flex flex-col pointer-events-auto"
      >
        {/* Header Ribbon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {lang === 'ka' ? 'გახადე Poti.ge უფრო სწრაფი' : 'Smart Native Access'}
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={lang === 'ka' ? 'დახურვა' : 'Close'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Text Area */}
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
            {lang === 'ka' ? 'დაამატე აპლიკაცია & ჩართე სიგნალები' : 'Install App & Enable News Alerts'}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
            {lang === 'ka' 
              ? 'დააინსტალირეთ Poti.ge თქვენს ეკრანზე ოფლაინ წვდომისთვის და მიიღეთ მყისიერი მუნიციპალური განახლებები.'
              : 'Add Poti.ge to your desktop or mobile screen for swift offline access and receive direct utility alerts.'}
          </p>
        </div>

        {/* Dynamic Interactive Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          {showInstallPrompt && !isStandalone && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Smartphone size={15} />
                {lang === 'ka' ? 'აპლიკაციის დაინსტალირება' : 'Install App'}
              </span>
              <Download size={13} className="opacity-60" />
            </button>
          )}

          {showNotificationPrompt && permissionState === 'default' && (
            <button
              onClick={handleNotificationClick}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-100 dark:border-slate-800 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Bell size={15} className="text-orange-500 animate-bounce" />
                {lang === 'ka' ? 'შეტყობინებების ჩართვა' : 'Enable Notifications'}
              </span>
              <Check size={13} className="opacity-60" />
            </button>
          )}
        </div>

        {/* Small security assurance line */}
        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold text-center uppercase tracking-widest pt-0.5">
          {lang === 'ka' 
            ? '🛡️ დაცულია ბრაუზერის უსაფრთხოების სტანდარტით' 
            : '🛡️ Secured by Sandbox Security Standards'}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
