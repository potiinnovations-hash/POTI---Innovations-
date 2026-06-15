'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { 
  Search, MapPin, Compass, Navigation, ArrowLeft, Phone, Globe, Layers, Check, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import InteractiveMap from '@/components/InteractiveMap';
import { LighthouseBackground } from '@/components/LighthouseBackground';
import SEOManager from '@/components/SEOManager';

function InteractiveMapContent() {
  const searchParams = useSearchParams();
  const itemIdParam = searchParams.get('id');

  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(itemIdParam);

  const categories = catalogItems.filter(item => item.isCategory);

  // Initialize theme/lang from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      const savedLang = localStorage.getItem('lang') as 'ka' | 'en' | null;
      if (savedLang) {
        setLang(savedLang);
      }
      setIsInitialized(true);
    }
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

  // Set selected item if query param is set
  useEffect(() => {
    if (itemIdParam) {
      setFocusedItemId(itemIdParam);
    }
  }, [itemIdParam]);

  // Fetch from Firebase real-time
  useEffect(() => {
    const qCatalog = query(collection(db, 'catalog'), orderBy('order', 'asc'));
    const unsubscribeCatalog = onSnapshot(qCatalog, (snap) => {
      setCatalogItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'catalog');
    });

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (d) => {
      if (d.exists()) setSettings(d.data());
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/global');
    });

    return () => {
      unsubscribeCatalog();
      unsubscribeSettings();
    };
  }, []);

  // Filter items that have valid coordinates and are locations (not categories)
  const itemsWithCoordinates = catalogItems.filter(
    (item) => !item.isCategory && item.location && typeof item.location === 'string' && item.location.includes(',')
  );

  // Apply Search & Category filters
  const filteredItems = itemsWithCoordinates.filter((item) => {
    const title = lang === 'ka' ? item.titleKa : item.titleEn;
    const desc = lang === 'ka' ? item.descriptionKa : item.descriptionEn;
    const matchesSearch = 
      title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      desc?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.parentId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold">იტვირთება რუკა...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 flex flex-col relative overflow-hidden"
    >
      <SEOManager 
        settings={settings} 
        lang={lang} 
        pageTitle={lang === 'ka' ? 'ინტერაქტიული რუკა' : 'Interactive Map'}
        pageDescription={lang === 'ka' ? 'გამოიკვლიეთ ფოთის ღირსშესანიშნაობები, მუნიციპალური სერვისები და ლოკაციები რუკაზე.' : 'Explore Poti tourist spots, municipal services, and essential landmarks.'}
      />
      
      <LighthouseBackground />
      
      <Header 
        lang={lang} 
        setLang={setLang} 
        theme={theme} 
        setTheme={setTheme} 
        settings={settings} 
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-8 md:py-12 z-10 flex flex-col">
        {/* Intro */}
        <div className="mb-10 text-center md:text-left">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-500 transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" /> 
            {lang === 'ka' ? 'მთავარ გვერდზე' : 'Back to Home'}
          </Link>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
            {lang === 'ka' ? 'ინტერაქტიული რუკა' : 'Explore Poti Map'}
          </h1>
        </div>

        {/* Dynamic Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 min-h-[600px]">
          {/* Side panel (33% width on desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-6 bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50">
            {/* Category Filter Pills */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                {lang === 'ka' ? 'კატეგორიები' : 'Filter Categories'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${!selectedCategory ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  {lang === 'ka' ? 'ყველა' : 'All'}
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    {lang === 'ka' ? cat.titleKa : cat.titleEn}
                  </button>
                ))}
              </div>
            </div>

            {/* List Results */}
            <div className="flex-1 overflow-y-auto max-h-[400px] lg:max-h-[500px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 space-y-4 pr-1">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => {
                  const isFocused = focusedItemId === item.id;
                  return (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: isFocused ? 1 : 1.01 }}
                      onClick={() => setFocusedItemId(item.id)}
                      className={`group p-4 rounded-3xl border cursor-pointer transition-all flex gap-4 ${isFocused ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900 shadow-xl' : 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white hover:border-blue-500 dark:hover:border-blue-500 shadow-sm'}`}
                    >
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                        <Image 
                          src={item.imageUrl} 
                          alt="" 
                          fill 
                          className="object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-black text-sm md:text-base leading-snug truncate">
                          {lang === 'ka' ? item.titleKa : item.titleEn}
                        </h3>
                        <p className={`text-xs mt-1 font-bold ${isFocused ? 'text-slate-300 dark:text-slate-500' : 'text-slate-400'} flex items-center gap-1`}>
                          <MapPin size={12} />
                          <span className="truncate">{lang === 'ka' ? (item.addressKa || 'ფოთი') : (item.addressEn || 'Poti')}</span>
                        </p>
                      </div>

                      <div className="flex items-center">
                        <div className={`p-2 rounded-xl ${isFocused ? 'bg-white/10 dark:bg-slate-900/10 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'} transition-colors`}>
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredItems.length === 0 && (
                  <div className="text-center py-12 px-4 bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <p className="text-slate-400 font-bold mb-2">
                      {lang === 'ka' ? 'ლოკაციები არ მოიძებნა' : 'No locations found'}
                    </p>
                    <button 
                      onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                      className="text-xs font-black text-blue-500 hover:underline"
                    >
                      {lang === 'ka' ? 'ფილტრების გასუფთავება' : 'Clear filters'}
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Interactive Map view (66% width) */}
          <div className="lg:col-span-8 flex flex-col h-[500px] lg:h-[650px]">
            <InteractiveMap 
              items={filteredItems}
              lang={lang}
              height="100%"
              selectedItemId={focusedItemId}
            />
          </div>
        </div>
      </main>

      <Footer lang={lang} />
    </motion.div>
  );
}

export default function InteractiveMapPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold">იტვირთება რუკა...</p>
        </div>
      </div>
    }>
      <InteractiveMapContent />
    </Suspense>
  );
}
