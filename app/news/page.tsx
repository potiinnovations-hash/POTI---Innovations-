'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { collection, query, orderBy, onSnapshot, where, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ExternalLink, Calendar, ArrowRight, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

function NewsContent() {
  const [news, setNews] = useState<any[]>([]);
  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [settings, setSettings] = useState<any>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [fullPageLoading, setFullPageLoading] = useState(true);
  const searchParams = useSearchParams();
  const relatedId = searchParams.get('related');

  useEffect(() => {
    // Initial loading delay
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 200));
    
    if (settingsLoaded) {
      minLoadTime.then(() => {
        setFullPageLoading(false);
      });
    }
  }, [settingsLoaded]);

  useEffect(() => {
    // Inject custom fonts from settings
    if (settings?.customFonts) {
      const styleId = 'global-dynamic-fonts';
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      let content = '';
      settings.customFonts.forEach((f: any) => {
        content += `@font-face { font-family: '${f.name}'; src: url(${f.data}); font-display: swap; }\n`;
      });
      styleEl.textContent = content;
    }
    
    if (settings?.fontFamily) {
      document.body.style.fontFamily = settings.fontFamily;
    }
  }, [settings]);

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as 'ka' | 'en';
    if (savedLang) setLang(savedLang);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (d) => {
      if (d.exists()) {
        setSettings(d.data());
        setSettingsLoaded(true);
      } else {
        setSettingsLoaded(true);
      }
    }, (err) => {
      setSettingsLoaded(true);
      handleFirestoreError(err, OperationType.GET, 'settings/global');
    });

    let q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    if (relatedId) {
      q = query(collection(db, 'news'), where('relatedItemId', '==', relatedId), orderBy('createdAt', 'desc'));
    }

    const unsubscribeNews = onSnapshot(q, (snap) => {
      const newsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNews(newsData);
      
      // Update last seen
      if (newsData.length > 0) {
        localStorage.setItem('lastSeenNews', new Date().toISOString());
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'news');
    });

    return () => {
      unsubscribeSettings();
      unsubscribeNews();
    };
  }, [relatedId]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AnimatePresence mode="wait">
      {fullPageLoading ? (
        <LoadingScreen key="loading" />
      ) : (
        <motion.div 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`min-h-screen font-sans ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}
        >
          <Header 
            lang={lang} 
            setLang={setLang} 
            theme={theme} 
            setTheme={setTheme} 
            settings={settings}
          />

          <main className="container mx-auto px-4 py-12 md:py-20">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-sm uppercase tracking-widest mb-12">
              <Bell size={18} />
              {lang === 'ka' ? 'სიახლეები და სტატიები' : 'News & Articles'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.id}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => {
                    if (item.sourceUrl) window.open(item.sourceUrl, '_blank');
                  }}
                  className={`group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-blue-50 dark:border-slate-800 ${item.sourceUrl ? 'cursor-pointer' : ''}`}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image 
                      src={item.imageUrl} 
                      alt={lang === 'ka' ? item.titleKa : item.titleEn} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <Calendar size={12} />
                        {new Date(item.createdAt).toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US')}
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <h2 className="text-2xl font-black mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {lang === 'ka' ? item.titleKa : item.titleEn}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-3 mb-8 leading-relaxed">
                      {lang === 'ka' ? item.contentKa : item.contentEn}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                      {item.sourceUrl ? (
                        <a 
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-black text-blue-600 dark:text-blue-400 hover:gap-3 transition-all"
                        >
                          {lang === 'ka' ? 'სრულად ნახვა' : 'Read Full'}
                          <ExternalLink size={16} />
                        </a>
                      ) : (
                         <div className="text-sm font-black text-slate-300">
                           {lang === 'ka' ? 'დეტალები არ არის' : 'No details'}
                         </div>
                      )}
                      {item.relatedItemId && (
                        <Link 
                          href={`/item/${item.relatedItemId}`}
                          className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <ArrowRight size={20} />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {news.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    {lang === 'ka' ? 'სიახლეები ჯერ არ არის' : 'No news found'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {lang === 'ka' ? 'დაბრუნდით მოგვიანებით განახლებებისთვის' : 'Check back later for updates'}
                  </p>
                </div>
              )}
            </div>
          </main>
          <Footer lang={lang} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsContent />
    </Suspense>
  );
}
