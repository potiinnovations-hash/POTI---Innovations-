'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Globe, LogIn, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';

interface HeaderProps {
  lang: 'ka' | 'en';
  setLang: (lang: 'ka' | 'en') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  settings: any;
}

export const Header = ({ lang, setLang, theme, setTheme, settings }: HeaderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const logoUrl = settings?.logoUrl;
  const primaryColor = settings?.primaryColor || '#2563eb'; // Default blue-600

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const headerTitle = lang === 'ka' 
    ? (settings?.headerTitleKa || settings?.siteTitleKa || 'მდგრადი განვითარებისა და ინოვაციების სამსახური')
    : (settings?.headerTitleEn || settings?.siteTitleEn || 'Service of Sustainable Development and Innovation');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-blue-100 dark:border-slate-800">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          {logoUrl ? (
            <div className="relative h-10 md:h-12 w-24 md:w-32">
              <Image 
                src={logoUrl} 
                alt="Logo" 
                fill 
                className="object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div 
              className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl"
              style={{ backgroundColor: primaryColor }}
            >
              {headerTitle.charAt(0)}
            </div>
          )}
          <span className="block font-bold text-blue-900 dark:text-blue-100 text-[10px] md:text-sm leading-tight max-w-[140px] sm:max-w-[180px] md:max-w-[280px]">
            {headerTitle}
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Selector */}
          <button
            onClick={() => setLang(lang === 'ka' ? 'en' : 'ka')}
            className="w-10 h-10 rounded-full bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform flex items-center justify-center text-[10px] font-black shadow-sm border border-blue-200 dark:border-slate-600"
            title={lang === 'ka' ? 'Switch to English' : 'გადართვა ქართულზე'}
          >
            {lang === 'ka' ? 'EN' : 'GE'}
          </button>

          {/* Theme Switch */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-slate-700 text-yellow-600 dark:text-yellow-400 hover:scale-110 transition-transform flex items-center justify-center"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Admin Link */}
          {user ? (
            <Link
              href="/admin"
              className="w-10 h-10 rounded-full bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform flex items-center justify-center"
            >
              <Settings size={20} />
            </Link>
          ) : (
            <button
              onClick={handleLogin}
              className="w-10 h-10 rounded-full bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform flex items-center justify-center"
            >
              <LogIn size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
