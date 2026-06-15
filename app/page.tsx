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
import { ProjectsActivities } from '@/components/ProjectsActivities';
import ActivityCalendar from '@/components/ActivityCalendar';
import NewsSection from '@/components/NewsSection';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Save, LogOut, ArrowLeft, Image as ImageIcon, Bell, Settings, 
  Sparkles, Calendar, UserPlus, MapPin, Phone, Globe, ExternalLink, Mail, Facebook, MessageSquare, Info, ArrowRight,
  Dumbbell, Trophy, Bus, Car, Plane, Ship, GraduationCap, Book, Waves, Anchor, Fish, Building2, Landmark, Utensils, HeartPulse, Stethoscope, Ticket, Music,
  Search,
  Heart, Coffee, ShoppingBag, Store, Hotel, Home as HomeIcon, Key, Compass, Clapperboard, Camera, Tv, Activity, ShieldCheck, AlertCircle, Tent, Sailboat, Train, Sunset, Trees, Sparkle, Flame, Zap, Briefcase, Laptop, Smartphone, Wrench, Droplet, GlassWater, Wine, Beer, Pizza, ChefHat, Cake, IceCream, Soup, Cookie, Scissors, Bike
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
  Music,
  Heart,
  Coffee,
  ShoppingBag,
  Store,
  Hotel,
  Home: HomeIcon,
  Key,
  Compass,
  Clapperboard,
  Camera,
  Tv,
  Activity,
  ShieldCheck,
  AlertCircle,
  Tent,
  Sailboat,
  Train,
  Sunset,
  Trees,
  Sparkle,
  Flame,
  Zap,
  Briefcase,
  Laptop,
  Smartphone,
  Wrench,
  Droplet,
  GlassWater,
  Wine,
  Beer,
  Pizza,
  ChefHat,
  Cake,
  IceCream,
  Soup,
  Cookie,
  Scissors,
  Bike
};

export default function Home() {
  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [fullPageLoading, setFullPageLoading] = useState(true);

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

    return () => {
      unsubscribeCatalog();
      unsubscribeSettings();
      unsubscribeNotifs();
    };
  }, []);

  const getBreadcrumbs = () => {
    const list: any[] = [];
    let currentId = activeParentId;
    while (currentId) {
      const item = catalogItems.find(i => i.id === currentId);
      if (item) {
        list.unshift(item);
        currentId = item.parentId || null;
      } else {
        break;
      }
    }
    return list;
  };

  const filteredItems = catalogItems.filter(item => {
    const title = lang === 'ka' ? item.titleKa : item.titleEn;
    const desc = lang === 'ka' ? item.descriptionKa : item.descriptionEn;
    const matchesSearch = searchTerm 
      ? title.toLowerCase().includes(searchTerm.toLowerCase()) || (desc && desc.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    if (searchTerm) {
      return matchesSearch && !item.isCategory;
    }

    const itemParentId = item.parentId || null;
    if (activeParentId === null) {
      return !!item.isCategory && (itemParentId === null || itemParentId === '');
    }
    return itemParentId === activeParentId;
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
              <div className="max-w-4xl mx-auto min-h-[90px]">
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
                      className="font-bold text-lg md:text-xl mb-3"
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

            </div>
          </section>

          {/* Catalog Section */}
          <section className="container mx-auto px-4 pb-24">
            {/* Breadcrumbs / Back Navigation */}
            {activeParentId && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-900/60 transition-colors max-w-5xl mx-auto">
                <div className="flex items-center gap-2 flex-wrap text-sm font-bold text-slate-500 dark:text-slate-400">
                  <button 
                    onClick={() => setActiveParentId(null)}
                    className="hover:text-primary transition-colors hover:underline"
                  >
                    {lang === 'ka' ? 'მთავარი' : 'Home'}
                  </button>
                  {getBreadcrumbs().map((b, idx, arr) => (
                    <React.Fragment key={b.id}>
                      <span className="text-slate-300 dark:text-slate-700">/</span>
                      <button
                        onClick={() => setActiveParentId(b.id)}
                        className={`transition-colors hover:underline ${idx === arr.length - 1 ? 'text-slate-900 dark:text-white font-black' : 'hover:text-primary'}`}
                        disabled={idx === arr.length - 1}
                      >
                        {lang === 'ka' ? b.titleKa : b.titleEn}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const currentParent = catalogItems.find(i => i.id === activeParentId);
                    setActiveParentId(currentParent?.parentId || null);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-95 transition-all shadow-sm"
                >
                  <ArrowLeft size={16} />
                  {lang === 'ka' ? 'უკან' : 'Back'}
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <Catalog 
                items={filteredItems} 
                lang={lang} 
                itemsPerRow={4} 
                settings={settings} 
                onCategoryClick={(id) => setActiveParentId(id)} 
              />
            )}
          </section>

          {/* Projects and Activities Section - Only on main homepage */}
          {!activeParentId && !loading && (
            <>
              <ProjectsActivities lang={lang} />
              <ActivityCalendar lang={lang} />
              <NewsSection lang={lang} />
            </>
          )}

          <Footer lang={lang} />
        </motion.main>
      )}
    </AnimatePresence>
  );
}
