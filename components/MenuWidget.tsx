'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Compass, Calendar, Settings, Newspaper, Shield, 
  Monitor, Smartphone, Bell, BellOff, X, Languages, Sun, Moon,
  CheckCircle2, Info, Sparkles
} from 'lucide-react';

interface MenuWidgetProps {
  // Optional, can be used if we want to force-pass or default
  initialLang?: 'ka' | 'en';
}

export default function MenuWidget({ initialLang = 'ka' }: MenuWidgetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<'ka' | 'en'>(initialLang);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isKiosk, setIsKiosk] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync state on mount and when menu opens
  const syncState = () => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('lang') as 'ka' | 'en' | null;
      if (savedLang) setLang(savedLang);

      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        const hasDarkClass = document.documentElement.classList.contains('dark');
        setTheme(hasDarkClass ? 'dark' : 'light');
      }

      const savedSearch = localStorage.getItem('portal_search') || '';
      setSearchTerm(savedSearch);

      // Check Notification status
      if ('Notification' in window) {
        const isMuted = localStorage.getItem('notificationsMuted') === 'true';
        setNotificationsEnabled(Notification.permission === 'granted' && !isMuted);
      }

      // Check current kiosk state (fullscreen)
      setIsKiosk(!!document.fullscreenElement);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    localStorage.setItem('portal_search', val);
    window.dispatchEvent(new CustomEvent('portal_search_changed', { detail: val }));
    if (pathname !== '/' && val) {
      router.push(`/?search=${encodeURIComponent(val)}`);
    }
  };

  useEffect(() => {
    syncState();

    // Trigger Facebook background auto-sync check quietly on mount
    fetch('/api/facebook-sync/check-auto')
      .then(res => {
        if (!res.ok) {
          // Silent fallback for non-OK response statuses
          return;
        }
        res.json().catch(() => ({}));
      })
      .catch(() => {
        // Quietly absorb background fetch connection rejections/offline errors
      });

    // Listen to fullscreen changes to update UI dynamically
    const handleFullscreenChange = () => {
      setIsKiosk(!!document.fullscreenElement);
    };

    // Store install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleOpenToggle = () => {
    if (!isOpen) {
      // Re-sync language/theme from localStorage right before opening to avoid being out of sync
      syncState();
    }
    setIsOpen(!isOpen);
  };

  const triggerToast = (message: string, type: 'success' | 'info') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  // Toggle Language
  const toggleLanguage = () => {
    const nextLang = lang === 'ka' ? 'en' : 'ka';
    setLang(nextLang);
    localStorage.setItem('lang', nextLang);
    // Dispatch storage event to alert other components if they are listening
    window.dispatchEvent(new Event('storage'));
    
    // Smooth transition message
    triggerToast(
      nextLang === 'ka' ? 'ენა შეიცვალა: ქართული' : 'Language changed to: English',
      'success'
    );
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('storage'));
    triggerToast(
      lang === 'ka' 
        ? (nextTheme === 'dark' ? 'ბნელი თემა გააქტიურდა' : 'ნათელი თემა გააქტიურდა')
        : (nextTheme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'),
      'success'
    );
  };

  // Toggle Kiosk Mode (Fullscreen)
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

  // Install PWA App Mode
  const installApp = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isIOS && !isStandalone) {
      triggerToast(
        lang === 'ka' 
          ? 'დააჭირეთ "Share" ღილაკს და შემდეგ "Add to Home Screen"' 
          : 'Tap "Share" then "Add to Home Screen"', 
        'info'
      );
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

  // Toggle Push Notifications Status
  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      triggerToast(lang === 'ka' ? 'ბრაუზერი არ უჭერს მხარს' : 'Not supported by browser', 'info');
      return;
    }

    if (Notification.permission === 'granted') {
      const currentlyMuted = localStorage.getItem('notificationsMuted') === 'true';
      if (!currentlyMuted) {
        localStorage.setItem('notificationsMuted', 'true');
        setNotificationsEnabled(false);
        triggerToast(lang === 'ka' ? 'შეტყობინებები გამორთულია' : 'Notifications disabled', 'info');
      } else {
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

  const navItems = [
    {
      href: '/',
      icon: Home,
      titleKa: 'მთავარი გვერდი',
      titleEn: 'Home Page',
      descKa: 'დაბრუნდით მთავარ პორტალზე',
      descEn: 'Return to major city portal',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      href: '/map',
      icon: Compass,
      titleKa: 'ინტერაქტიული რუკა',
      titleEn: 'Interactive Map',
      descKa: 'ქალაქის სერვისები და ლოკაციები',
      descEn: 'Discover city sights and options',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      href: '/cal',
      icon: Calendar,
      titleKa: 'ღონისძიებების კალენდარი',
      titleEn: 'Events Calendar',
      descKa: 'დაგეგმილი კულტურული აქტივობები',
      descEn: 'Upcoming city events and schedule',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      href: '/status',
      icon: Settings,
      titleKa: 'სერვისების სტატუსი',
      titleEn: 'Services Status',
      descKa: 'ელ-ენერგია, წყალი და გაზის შეფერხებები',
      descEn: 'Outages, utility status and feeds',
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
    {
      href: '/news',
      icon: Newspaper,
      titleKa: 'ადგილობრივი სიახლეები',
      titleEn: 'Local News',
      descKa: 'ქალაქ ფოთის სიახლეების ლენტა',
      descEn: 'Stay updated with local feeds',
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
    {
      href: '/plans',
      icon: Sparkles,
      titleKa: 'ციფრული ეკოსისტემა',
      titleEn: 'Digital Ecosystem',
      descKa: 'მომავალი აპლიკაციები და განვითარების გეგმები',
      descEn: 'Future civic apps & ecosystem roadmap',
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      href: '/admin',
      icon: Shield,
      titleKa: 'მართვის პანელი',
      titleEn: 'Management Panel',
      descKa: 'ავტორიზაცია და ადმინისტრირება',
      descEn: 'Admin dashboard login and settings',
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
        <motion.button
          id="global-menu-widget-trigger"
          onClick={handleOpenToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 dark:bg-blue-500 text-white font-black text-xs md:text-sm uppercase tracking-wider shadow-[0_8px_30px_rgb(37,99,235,0.4)] md:shadow-[0_8px_30px_rgb(37,99,235,0.3)] transition-all cursor-pointer border border-white/10"
        >
          <Compass size={18} className={`animate-pulse ${isOpen ? 'rotate-180 transition-transform duration-500' : ''}`} />
          <span>{lang === 'ka' ? 'მენიუ' : 'Menu'}</span>
        </motion.button>
      </div>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative max-w-4xl w-full bg-white dark:bg-slate-900 md:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden"
            >
              {/* Top Banner / Controls */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-5 flex-shrink-0">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    {lang === 'ka' ? 'სწრაფი ნავიგაცია' : 'Quick Navigation'}
                  </h2>
                </div>

                {/* Close Button & Inline Settings */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleLanguage}
                    className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors flex items-center gap-1.5 font-bold text-xs border border-slate-100 dark:border-slate-800"
                    title={lang === 'ka' ? 'ენა' : 'Language'}
                  >
                    <Languages size={16} />
                    <span>{lang === 'ka' ? 'EN' : 'KA'}</span>
                  </button>

                  <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors border border-slate-100 dark:border-slate-800"
                    title={lang === 'ka' ? 'თემა' : 'Theme'}
                  >
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Bento Content Grid */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                
                {/* 1. Primary Page Navigation */}
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">
                    {lang === 'ka' ? 'გვერდები და სერვისები' : 'Pages & Primary Views'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {navItems.map((item, idx) => (
                      <Link 
                        key={idx}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="group relative flex flex-col p-4 rounded-2xl bg-slate-50/50 hover:bg-blue-50/40 dark:bg-slate-900/60 dark:hover:bg-blue-950/20 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-blue-900/40 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${item.color} flex items-center justify-center`}>
                            <item.icon size={18} />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {lang === 'ka' ? item.titleKa : item.titleEn}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                          {lang === 'ka' ? item.descKa : item.descEn}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 2. Interactive App Elements & Platform Capabilities */}
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">
                    {lang === 'ka' ? 'ხელსაწყოები და აპლიკაციის რეჟიმები' : 'Modes & Smart Utility Features'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Kiosk Mode Button */}
                    <div 
                      onClick={toggleKioskMode}
                      className={`cursor-pointer flex flex-col p-4 rounded-2xl border transition-all duration-300 ${
                        isKiosk 
                          ? 'bg-blue-600/10 border-blue-600/40 hover:bg-blue-600/15' 
                          : 'bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-900/60 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 justify-between">
                        <div className={`p-2.5 rounded-xl ${isKiosk ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'} flex items-center justify-center`}>
                          <Monitor size={18} />
                        </div>
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                          isKiosk ? 'bg-green-500/10 text-green-500' : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400'
                        }`}>
                          {isKiosk ? (lang === 'ka' ? 'ჩართული' : 'Active') : (lang === 'ka' ? 'გამორთული' : 'Inactive')}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-3">
                        {lang === 'ka' ? 'კიოსკის რეჟიმი' : 'Kiosk Mode'}
                      </span>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {lang === 'ka' ? 'სრული ეკრანით გაშვება' : 'Launch standalone full-screen'}
                      </p>
                    </div>

                    {/* Install App Link */}
                    <Link 
                      href="/app"
                      onClick={() => setIsOpen(false)}
                      className="cursor-pointer flex flex-col p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-900/60 dark:hover:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 justify-between">
                        <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                          <Smartphone size={18} />
                        </div>
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-400">
                          {installPrompt ? (lang === 'ka' ? 'მზადაა' : 'Ready') : (lang === 'ka' ? 'დაცულია' : 'Loaded')}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-3">
                        {lang === 'ka' ? 'აპლიკაციის რეჟიმი' : 'App Mode'}
                      </span>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {lang === 'ka' ? 'დაინსტალირეთ სამუშაო მაგიდაზე' : 'Install city dashboard as PWA'}
                      </p>
                    </Link>

                    {/* Notifications Button */}
                    <div 
                      onClick={toggleNotifications}
                      className={`cursor-pointer flex flex-col p-4 rounded-2xl border transition-all duration-300 ${
                        notificationsEnabled 
                          ? 'bg-rose-600/10 border-rose-600/40 hover:bg-rose-600/15' 
                          : 'bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-900/60 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 justify-between">
                        <div className={`p-2.5 rounded-xl ${notificationsEnabled ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'} flex items-center justify-center`}>
                          {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                        </div>
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                          notificationsEnabled ? 'bg-green-500/10 text-green-500' : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400'
                        }`}>
                          {notificationsEnabled ? (lang === 'ka' ? 'აქტიური' : 'Enabled') : (lang === 'ka' ? 'გამორთული' : 'Muted')}
                        </span>
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-3">
                        {lang === 'ka' ? 'შეტყობინებები' : 'Notifications'}
                      </span>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {lang === 'ka' ? 'გამოიწერეთ სიახლეები' : 'Receive instant local alerts'}
                      </p>
                    </div>

                  </div>
                </div>

              </div>
              
              {/* Informative Footer Badge */}
              <div className="flex-shrink-0 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-end">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition-all"
                >
                  {lang === 'ka' ? 'დახურვა' : 'Close Dashboard'}
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Notifications Block / Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 z-50 bg-slate-900 border border-slate-800/80 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-sm"
          >
            {showToast.type === 'success' ? <CheckCircle2 className="text-green-400 flex-shrink-0" size={18} /> : <Info className="text-blue-400 flex-shrink-0" size={18} />}
            <span className="font-bold text-xs leading-relaxed">{showToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
