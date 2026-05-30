'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { doc, getDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { Header } from '@/components/Header';
import { LighthouseBackground } from '@/components/LighthouseBackground';
import LoadingScreen from '@/components/LoadingScreen';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Mail, 
  Facebook, 
  Globe, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  UserPlus,
  Info,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Navigation,
  Tag,
  Bell,
  Heart, Coffee, ShoppingBag, Store, Hotel, Home as HomeIcon, Key, Compass, Clapperboard, Camera, Tv, Activity, ShieldCheck, AlertCircle, Tent, Sailboat, Train, Sunset, Trees, Sparkle, Flame, Zap, Briefcase, Laptop, Smartphone, Wrench, Droplet, GlassWater, Wine, Beer, Pizza, ChefHat, Cake, IceCream, Soup, Cookie, Scissors, Bike, Dumbbell, Trophy, Bus, Car, Plane, Ship, GraduationCap, Book, Waves, Anchor, Fish, Building2, Landmark, Utensils, HeartPulse, Stethoscope, Ticket, Music
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CatalogItem } from '@/components/Catalog';
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
  Navigation,
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
  Bike,
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

function ItemDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [fullPageLoading, setFullPageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedNews, setRelatedNews] = useState<any[]>([]);

  useEffect(() => {
    // Initial loading delay to ensure smooth transition
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 200));
    
    // When settings load and item data is fetched, we still wait for minimum delay
    if (settingsLoaded && !loading) {
      minLoadTime.then(() => {
        setFullPageLoading(false);
      });
    }
  }, [settingsLoaded, loading]);

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
    const fetchItem = async () => {
      try {
        const itemDoc = await getDoc(doc(db, 'catalog', id));
        if (itemDoc.exists()) {
          setItem({ id: itemDoc.id, ...itemDoc.data() } as CatalogItem);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `catalog/${id}`);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
        setSettingsLoaded(true);
      } else {
        setSettingsLoaded(true);
      }
    }, (err) => {
      setSettingsLoaded(true);
      handleFirestoreError(err, OperationType.GET, 'settings/global');
    });

    const qNews = query(
      collection(db, 'news'), 
      where('relatedItemId', '==', id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeNews = onSnapshot(qNews, (snap) => {
      setRelatedNews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    fetchItem();
    return () => {
      unsubscribeSettings();
      unsubscribeNews();
    };
  }, [id]);

  const galleryImages = item ? [item.imageUrl, ...(item.gallery || [])].filter(Boolean).slice(0, 5) : [];

  const CTAIcon = item?.ctaButton?.icon && iconMap[item.ctaButton.icon] 
    ? iconMap[item.ctaButton.icon] 
    : Info;

  return (
    <AnimatePresence mode="wait">
      {fullPageLoading ? (
        <LoadingScreen key="loading" />
      ) : !item ? (
        <motion.div 
          key="not-found"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-950"
        >
          <h1 className="text-2xl font-bold mb-4">ელემენტი ვერ მოიძებნა</h1>
          <Link href="/" className="text-blue-600 hover:underline">მთავარ გვერდზე დაბრუნება</Link>
        </motion.div>
      ) : (
        <motion.main 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500"
        >
          <SEOManager 
            settings={settings} 
            lang={lang} 
            pageTitle={lang === 'ka' ? item.titleKa : item.titleEn}
            pageDescription={lang === 'ka' ? item.descriptionKa : item.descriptionEn}
            pageImage={item.imageUrl}
          />
          <LighthouseBackground />
          
          <Header
            lang={lang}
            setLang={setLang}
            theme={theme}
            setTheme={setTheme}
            settings={settings}
          />

          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              {lang === 'ka' ? 'უკან დაბრუნება' : 'Back to Home'}
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side: Images */}
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-slate-100"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full"
                    >
                      <Image 
                        src={galleryImages[currentImageIndex]} 
                        alt={item.titleKa} 
                        fill 
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {galleryImages.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={() => setCurrentImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </motion.div>

                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${currentImageIndex === idx ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'}`}
                      >
                        <Image src={img} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Info */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                    <h1 
                      className="text-4xl md:text-5xl font-black mb-4"
                      style={{ color: item.titleColor || settings.titleColor || '#f59e0b' }}
                    >
                      {lang === 'ka' ? item.titleKa : item.titleEn}
                    </h1>
                  <p 
                    className="text-lg leading-relaxed font-medium"
                    style={{ color: settings.textColor || '#64748b' }}
                  >
                    {lang === 'ka' ? item.descriptionKa : item.descriptionEn}
                  </p>
                </motion.div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {item.phone && (
                    <a 
                      href={`tel:${item.phone}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-slate-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        <Phone size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ka' ? 'ტელეფონი' : 'Phone'}</div>
                        <div className="font-bold">{item.phone}</div>
                      </div>
                    </a>
                  )}
                  {(item.price || item.priceEn) && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-slate-900/50">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Tag size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ka' ? 'ფასი / ტარიფი' : 'Price / Rates'}</div>
                        <div className="font-bold">{(lang === 'ka' ? item.price : item.priceEn) || item.price}</div>
                      </div>
                    </div>
                  )}
                  {item.email && (
                    <a 
                      href={`mailto:${item.email}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-slate-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        <Mail size={20} />
                      </div>
                      <div className="truncate">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Email</div>
                        <div className="font-bold truncate">{item.email}</div>
                      </div>
                    </a>
                  )}
                  {item.location && (
                    <Link 
                      href={`/map?id=${item.id}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-slate-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        <MapPin size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ka' ? 'მდებარეობა' : 'Location'}</div>
                        <div className="font-bold truncate">
                          {(lang === 'ka' ? item.addressKa : item.addressEn) || (lang === 'ka' ? 'ნახვა რუკაზე' : 'View on Map')}
                        </div>
                      </div>
                      <div className="p-2 bg-blue-600 text-white rounded-lg flex-shrink-0">
                        <Navigation size={16} />
                      </div>
                    </Link>
                  )}
                  {item.workHours && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-slate-900/50">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ka' ? 'სამუშაო საათები' : 'Work Hours'}</div>
                        <div className="font-bold">{item.workHours}</div>
                      </div>
                    </div>
                  )}
                  {item.targetUrl && item.showWebsite && (
                    <a 
                      href={item.targetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-slate-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        <Globe size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'ka' ? 'ვებსაიტი' : 'Website'}</div>
                        <div className="font-bold">{lang === 'ka' ? 'გადასვლა' : 'Visit'}</div>
                      </div>
                    </a>
                  )}
                  {item.facebookUrl && (
                    <a 
                      href={item.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-slate-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-[#1877F2] group-hover:text-white">
                        <Facebook size={20} />
                      </div>
                      <div className="truncate">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Facebook</div>
                        <div className="font-bold truncate">{item.facebookName || (lang === 'ka' ? 'გვერდი' : 'Page')}</div>
                      </div>
                    </a>
                  )}
                </div>

                {/* Custom CTA Button */}
                {item.ctaButton?.url && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <a 
                      href={item.ctaButton.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-white font-black text-xl shadow-xl transition-all"
                      style={{ backgroundColor: settings?.buttonColor || '#2563eb' }}
                    >
                      <CTAIcon size={28} />
                      {lang === 'ka' ? item.ctaButton.textKa : item.ctaButton.textEn}
                    </a>
                  </motion.div>
                )}

                {/* Related News Section */}
                {relatedNews.length > 0 && (
                  <div className="pt-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                        <Bell size={16} />
                        {lang === 'ka' ? 'ბოლო სიახლეები' : 'Recent News'}
                      </div>
                      {relatedNews.length > 2 && (
                        <Link 
                          href={`/news?related=${id}`}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          {lang === 'ka' ? 'ყველას ნახვა' : 'See All'}
                        </Link>
                      )}
                    </div>
                    <div className="space-y-4">
                      {relatedNews.slice(0, 2).map((newsItem) => (
                        <div 
                          key={newsItem.id}
                          className="flex gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                        >
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                            <Image src={newsItem.imageUrl} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-sm mb-1 truncate">
                               {lang === 'ka' ? newsItem.titleKa : newsItem.titleEn}
                             </h4>
                             <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                               {lang === 'ka' ? newsItem.contentKa : newsItem.contentEn}
                             </p>
                             {newsItem.sourceUrl && (
                               <a 
                                href={newsItem.sourceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase"
                               >
                                 {lang === 'ka' ? 'სრულად' : 'Read Full'} <ExternalLink size={10} />
                               </a>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}

export default function ItemDetailPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ItemDetailContent />
    </Suspense>
  );
}
