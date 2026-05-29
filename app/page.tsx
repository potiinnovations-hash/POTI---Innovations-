'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { Header } from '@/components/Header';
import { Catalog, CatalogItem } from '@/components/Catalog';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import { LighthouseBackground } from '@/components/LighthouseBackground';
import { NotificationBanner } from '@/components/NotificationBanner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Save, LogOut, ArrowLeft, Image as ImageIcon, Bell, Settings, 
  Sparkles, Calendar, UserPlus, MapPin, Phone, Globe, ExternalLink, Mail, Facebook, MessageSquare, Info, ArrowRight,
  Dumbbell, Trophy, Bus, Car, Plane, Ship, GraduationCap, Book, Waves, Anchor, Fish, Building2, Landmark, Utensils, HeartPulse, Stethoscope, Ticket, Music,
  Search
} from 'lucide-react';
import SEOManager from '@/components/SEOManager';

const iconMap: Record<string, any> = {
  Calendar,
  UserPlus,
  Info,
  ArrowRight,
  ExternalLink,
  Phone,
  MapPin,
  Mail,
  Facebook,
  Globe,
  MessageSquare,
  ArrowLeft,
  Dumbbell,
  Trophy,
  Bus,
  Car,
  Plane,
  Ship,
  GraduationCap,
  Book,
  Waves,
  Anchor,
  Fish,
  Building2,
  Landmark,
  Utensils,
  HeartPulse,
  Stethoscope,
  Ticket,
  Music
};

export default function Home() {
  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [fullPageLoading, setFullPageLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Initial loading delay to ensure smooth transition
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 200));
    
    // When settings load, we still wait for fonts to potentially initialize
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
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    const savedLang = localStorage.getItem('lang') as 'ka' | 'en';
    if (savedLang) {
      setLang(savedLang);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('lang', lang);
  }, [lang, isInitialized]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearch = urlParams.get('search');
      let initialSearch = '';
      if (urlSearch) {
        initialSearch = urlSearch;
        localStorage.setItem('portal_search', urlSearch);
        // Clean URL parameter in a non-disruptive way
        const newUrl = window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      } else {
        initialSearch = localStorage.getItem('portal_search') || '';
      }
      setSearchTerm(initialSearch);

      const handleSearchChange = (e: any) => {
        setSearchTerm(e.detail || '');
      };

      window.addEventListener('portal_search_changed' as any, handleSearchChange);
      return () => {
        window.removeEventListener('portal_search_changed' as any, handleSearchChange);
      };
    }
  }, [isInitialized]);

  useEffect(() => {
    const qCatalog = query(collection(db, 'catalog'), orderBy('order', 'asc'));
    const unsubscribeCatalog = onSnapshot(
      qCatalog, 
      (snapshot) => {
        setCatalogItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CatalogItem)));
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'catalog');
      }
    );

    const unsubscribeSettings = onSnapshot(
      doc(db, 'settings', 'global'), 
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data());
          setSettingsLoaded(true);
        } else {
          setSettingsLoaded(true);
        }
      },
      (error) => {
        setLoading(false);
        setSettingsLoaded(true);
        handleFirestoreError(error, OperationType.GET, 'settings/global');
      }
    );

    const unsubscribeNotifs = onSnapshot(
      collection(db, 'notifications'), 
      (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      }
    );

    const unsubscribeCategories = onSnapshot(
      query(collection(db, 'categories'), orderBy('order', 'asc')),
      (snapshot) => {
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      }
    );

    return () => {
      unsubscribeCatalog();
      unsubscribeSettings();
      unsubscribeNotifs();
      unsubscribeCategories();
    };
  }, []);

  useEffect(() => {
    const scrollEl = document.getElementById('category-scroll');
    if (!scrollEl) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollEl;
      const total = scrollWidth - clientWidth;
      if (total <= 1) { // 1px threshold for stability
        setScrollProgress(0);
        return;
      }
      setScrollProgress(scrollLeft / total);
    };

    scrollEl.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [categories, loading]);

  const handleCategoryClick = (catId: string | null, index: number) => {
    setSelectedCategoryId(catId);
    const scrollEl = document.getElementById('category-scroll');
    if (scrollEl) {
      const buttonEl = scrollEl.children[index] as HTMLElement;
      if (buttonEl) {
        const scrollHalfWidth = scrollEl.clientWidth / 2;
        const buttonHalfWidth = buttonEl.clientWidth / 2;
        const targetScrollLeft = buttonEl.offsetLeft - scrollHalfWidth + buttonHalfWidth;
        scrollEl.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
      }
    }
  };

  const filteredItems = catalogItems.filter(item => {
    const title = lang === 'ka' ? item.titleKa : item.titleEn;
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryId ? item.categoryId === selectedCategoryId : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence mode="wait">
      {fullPageLoading ? (
        <LoadingScreen key="loading" />
      ) : (
        <motion.main 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500"
        >
          <SEOManager settings={settings} lang={lang} />
          <LighthouseBackground />
          
          <Header 
            lang={lang} 
            setLang={setLang} 
            theme={theme} 
            setTheme={setTheme} 
            settings={settings}
          />

          <NotificationBanner notifications={notifications} lang={lang} />

          {/* Hero Section */}
          <section className="relative pt-12 pb-20 px-4 overflow-hidden">
            <div className="container mx-auto text-center relative z-10">
              <div className="max-w-4xl mx-auto min-h-[180px]">
                {!settingsLoaded ? (
                  <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="h-16 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-16 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-6 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-lg mt-8" />
                  </div>
                ) : (
                  <>
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl md:text-5xl lg:text-6xl font-black text-blue-950 dark:text-white leading-[1] mb-4 tracking-tighter"
                    >
                      {lang === 'ka' ? (
                        settings?.headerTextKa ? (
                          <span>{settings.headerTextKa}</span>
                        ) : (
                          <>აღმოაჩინე <br/><span className="text-primary">შენი ქალაქი</span></>
                        )
                      ) : (
                        settings?.headerTextEn ? (
                          <span>{settings.headerTextEn}</span>
                        ) : (
                          <>DISCOVER <br/><span className="text-primary">YOUR CITY</span></>
                        )
                      )}
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="font-bold text-lg md:text-xl mb-6"
                      style={{ color: settings?.textColor || '#64748b' }}
                    >
                      {lang === 'ka' ? (
                        settings?.headerDescKa || 'ყველაფერი რაც გჭირდება ერთ სივრცეში'
                      ) : (
                        settings?.headerDescEn || 'Everything you need in one simplified space'
                      )}
                    </motion.p>


                  </>
                )}
              </div>

              {/* Categories Row */}
              <div className="relative group max-w-5xl mx-auto mt-2">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 overflow-x-auto pb-4 px-4 md:px-12 no-scrollbar touch-pan-x relative"
                  id="category-scroll"
                >
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryClick(null, 0)}
                    className={`flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm transition-all border-2 ${!selectedCategoryId ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-primary/50'}`}
                  >
                    <Globe size={18} />
                    {lang === 'ka' ? 'ყველა' : 'All'}
                  </motion.button>
                  {categories.map((cat, idx) => (
                    <motion.button 
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryClick(cat.id, idx + 1)}
                      className={`flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm transition-all border-2 ${selectedCategoryId === cat.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-primary/50'}`}
                    >
                      {iconMap[cat.icon] ? React.createElement(iconMap[cat.icon], { size: 18 }) : <Globe size={18} />}
                      {lang === 'ka' ? cat.titleKa : cat.titleEn}
                    </motion.button>
                  ))}
                </motion.div>

                {/* Pagination Pins */}
                <div className="flex justify-center flex-wrap gap-1.5 mt-6 px-4">
                  {[{ id: null, titleKa: 'ყველა', titleEn: 'All' }, ...categories].map((cat, i) => {
                    const active = cat.id === selectedCategoryId;
                    return (
                      <button 
                        key={cat.id || 'all'}
                        onClick={() => handleCategoryClick(cat.id, i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${active ? 'w-6 bg-primary' : 'w-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
                        title={lang === 'ka' ? cat.titleKa : cat.titleEn}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Catalog Section */}
          <section className="container mx-auto px-4 pb-24">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <Catalog items={filteredItems} lang={lang} itemsPerRow={4} settings={settings} />
            )}
          </section>

          <Footer lang={lang} />
        </motion.main>
      )}
    </AnimatePresence>
  );
}
