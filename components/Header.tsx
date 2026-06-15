'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Moon, Sun, Languages, Menu, X, LogOut, Bell, Settings, Calendar, Compass, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface HeaderProps {
  lang: 'ka' | 'en';
  setLang: (lang: 'ka' | 'en') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  settings: any;
}

export const Header = ({ lang, setLang, theme, setTheme, settings }: HeaderProps) => {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const logoUrl = settings?.logoUrl;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, u => setUser(u));
    
    // News count logic
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsubscribeNews = onSnapshot(q, (snap) => {
      const lastSeenStr = localStorage.getItem('lastSeenNews');
      const lastSeen = lastSeenStr ? new Date(lastSeenStr).getTime() : 0;
      
      const unread = snap.docs.filter(doc => {
        const createdAt = new Date(doc.data().createdAt).getTime();
        return createdAt > lastSeen;
      }).length;
      
      setUnreadCount(unread);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'news');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNews();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-blue-100 dark:border-slate-800">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <div className="relative h-9 md:h-11 w-24 md:w-32">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain object-left" 
              referrerPolicy="no-referrer"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-1">
            <Link 
              href="/map"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <Compass size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {lang === 'ka' ? 'რუკა' : 'Map'}
              </span>
            </Link>

            <Link 
              href="/cal"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <Calendar size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {lang === 'ka' ? 'კალენდარი' : 'Calendar'}
              </span>
            </Link>

            <Link 
              href="/status"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <Settings size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {lang === 'ka' ? 'სერვისები' : 'Services'}
              </span>
            </Link>

            <Link 
              href="/news"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="relative">
                <Bell size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900 animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {lang === 'ka' ? 'სიახლეები' : 'News'}
              </span>
            </Link>

            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              {theme === 'light' ? (
                <Moon size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
              ) : (
                <Sun size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
              )}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {lang === 'ka' ? 'დღე/ღამე' : 'Day/Night'}
              </span>
            </button>
          </div>
          
          <button 
            onClick={() => setLang(lang === 'ka' ? 'en' : 'ka')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-slate-700 hover:border-blue-500 transition-all font-bold text-xs uppercase"
          >
            <Languages size={14} />
            {lang === 'ka' ? 'EN' : 'KA'}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              {!isHome && (
                <Link 
                  href="/admin" 
                  className="px-5 py-2 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg"
                >
                  {lang === 'ka' ? 'პანელი' : 'Panel'}
                </Link>
              )}
              <button 
                onClick={() => auth.signOut()}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title={lang === 'ka' ? 'გასვლა' : 'Logout'}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            !isHome ? (
              <Link 
                href="/admin" 
                className="px-5 py-2 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg"
              >
                {lang === 'ka' ? 'ავტორიზაცია' : 'Login'}
              </Link>
            ) : null
          )}
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-blue-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/map"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <Compass size={18} className="text-blue-500" /> {lang === 'ka' ? 'რუკა' : 'Interactive Map'}
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/cal"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <Calendar size={18} className="text-blue-500" /> {lang === 'ka' ? 'კალენდარი' : 'Calendar'}
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/status"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <Settings size={18} className="text-blue-500" /> {lang === 'ka' ? 'სერვისები' : 'Services'}
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/news"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold mb-1"
                >
                  <div className="flex items-center gap-3"><Bell size={18} className="text-blue-500" /> {lang === 'ka' ? 'სიახლეები' : 'News'}</div>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">{unreadCount}</span>
                  )}
                </Link>
              </motion.div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => { setLang(lang === 'ka' ? 'en' : 'ka'); setIsMenuOpen(false); }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <div className="flex items-center gap-3"><Languages size={18} /> {lang === 'ka' ? 'ენა' : 'Language'}</div>
                <span className="text-blue-600">{lang === 'ka' ? 'ENGLISH' : 'ქართული'}</span>
              </motion.button>
              
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => { setTheme(theme === 'light' ? 'dark' : 'light'); setIsMenuOpen(false); }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold"
              >
                <div className="flex items-center gap-3">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} {lang === 'ka' ? 'თემა' : 'Theme'}</div>
                <span className="text-blue-600 uppercase">{theme}</span>
              </motion.button>

              {!isHome && (
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Link 
                    href="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-center shadow-lg"
                  >
                    {lang === 'ka' ? 'ადმინ პანელი' : 'Admin Panel'}
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
