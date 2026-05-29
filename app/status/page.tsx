'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import { 
  Droplets, 
  Flame, 
  Construction, 
  Calendar, 
  Users, 
  MapPin, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  Lightbulb, 
  ChevronRight,
  Info,
  Activity,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import SEOManager from '@/components/SEOManager';

interface FirestoreOutage {
  id: string;
  service: 'power' | 'water' | 'gas' | 'roads';
  disconnectionAreaKa: string;
  disconnectionAreaEn: string;
  reasonKa: string;
  reasonEn: string;
  disconnectionDate: string;
  reconnectionDate: string;
  affectedSubscribers: string;
  createdAt: string;
}

type ServiceType = 'power' | 'water' | 'gas' | 'roads';

export default function StatusHubPage() {
  const [activeService, setActiveService] = useState<ServiceType>('power');
  const [dbOutages, setDbOutages] = useState<FirestoreOutage[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [fullPageLoading, setFullPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  const [settings, setSettings] = useState<any>({});

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
    if (savedLang) {
      setLang(savedLang);
    }
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    setIsInitialized(true);

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

    return () => unsubscribeSettings();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('lang', lang);
  }, [lang, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, isInitialized]);

  // Real-time listener for the outages collection
  useEffect(() => {
    setLoading(true);
    const qOutages = query(collection(db, 'outages'), orderBy('createdAt', 'desc'));
    const unsubscribeOutages = onSnapshot(qOutages, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreOutage));
      setDbOutages(list);
      setLoading(false);
      setLastChecked(new Date());
      setError(null);
    }, (err) => {
      setLoading(false);
      setError(lang === 'ka' ? '⚠️ ბაზიდან მონაცემების წაკითხვა ვერ მოხერხდა' : '⚠️ Unable to fetch data from database');
      handleFirestoreError(err, OperationType.LIST, 'outages');
    });

    return () => unsubscribeOutages();
  }, [lang]);

  const services = [
    { 
      id: 'power', 
      label: lang === 'ka' ? 'ელექტროენერგია' : 'Electricity', 
      icon: Lightbulb, 
      color: 'blue', 
      provider: lang === 'ka' ? 'ენერგო-პრო ჯორჯია' : 'Energo-Pro Georgia' 
    },
    { 
      id: 'water', 
      label: lang === 'ka' ? 'წყალმომარაგება' : 'Water Supply', 
      icon: Droplets, 
      color: 'cyan', 
      provider: lang === 'ka' ? 'საქართველოს გაერთიანებული წყალმომარაგება' : 'United Water Supply' 
    },
    { 
      id: 'gas', 
      label: lang === 'ka' ? 'ბუნებრივი აირი' : 'Gas Supply', 
      icon: Flame, 
      color: 'orange', 
      provider: lang === 'ka' ? 'სოკარ ჯორჯია გაზი' : 'Socar Georgia Gas' 
    },
    { 
      id: 'roads', 
      label: lang === 'ka' ? 'გზები' : 'Roadworks / Roads', 
      icon: Construction, 
      color: 'yellow', 
      provider: lang === 'ka' ? 'ფოთის მუნიციპალიტეტი' : 'Poti Municipality' 
    },
  ] as const;

  // Filter outages by selected service
  const currentServiceOutages = dbOutages.filter(o => o.service === activeService);

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
          <SEOManager settings={settings} lang={lang} pageTitle={lang === 'ka' ? 'მუნიციპალური სერვისები' : 'Municipal Services'} />
          <Header 
            lang={lang} 
            setLang={setLang} 
            theme={theme} 
            setTheme={setTheme} 
            settings={settings} 
          />

          <main className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Sidebar / Categories */}
              <aside className="lg:w-80 shrink-0">
                <div className="sticky top-24 space-y-6">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                      {lang === 'ka' ? 'მუნიციპალური' : 'Municipal'} <span className="text-blue-600">{lang === 'ka' ? 'სერვისები' : 'Services'}</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-sm">
                      {lang === 'ka' ? 'ავარიული და გეგმიური შეფერხებები' : 'Active and scheduled outages'}
                    </p>
                  </div>

                  <nav className="flex flex-col gap-2 p-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    {services.map((service) => (
                      <motion.button
                        key={service.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveService(service.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all font-black text-sm uppercase tracking-tight group cursor-pointer ${activeService === service.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <div className="flex items-center gap-3">
                          <service.icon size={20} className={activeService === service.id ? 'text-white' : 'text-blue-500'} />
                          {service.label}
                        </div>
                        <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeService === service.id ? 'text-white' : 'text-slate-300'}`} />
                      </motion.button>
                    ))}
                  </nav>

                  <div className="p-6 bg-slate-100 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400 mb-3 uppercase font-black text-[10px] tracking-widest">
                      <span className="flex items-center gap-2"><Info size={14} />{lang === 'ka' ? 'ინფორმაცია' : 'Information'}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                      {lang === 'ka' 
                        ? 'მოცემული შეფერხებები და საინფორმაციო ბიულეტენები ოპერატიულად იმართება ადმინისტრაციის მიერ.' 
                        : 'Outages and maintenance bulletins are managed directly and in real-time by the operations admin.'}
                    </p>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Section Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-blue-500">
                          {React.createElement(services.find(s => s.id === activeService)!.icon, { size: 24 })}
                          <span className="font-black uppercase tracking-widest text-xs">{services.find(s => s.id === activeService)?.provider}</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">{services.find(s => s.id === activeService)?.label}</h2>
                      </div>
                    </header>

                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                    {error && (
                      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 font-bold">
                        <AlertTriangle size={20} />
                        {error}
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="space-y-12">
                      <OutageSection 
                        outages={currentServiceOutages} 
                        loading={loading} 
                        lang={lang} 
                        lastChecked={lastChecked} 
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </main>
          <Footer lang={lang} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OutageSection({ 
  outages, 
  loading, 
  lang, 
  lastChecked 
}: { 
  outages: FirestoreOutage[], 
  loading: boolean, 
  lang: 'ka' | 'en', 
  lastChecked: Date | null 
}) {
  const georgiaTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Tbilisi" });
  const nowInGeorgia = new Date(georgiaTime);
  const todayStr = nowInGeorgia.toISOString().split('T')[0];
  
  const tomorrowDate = new Date(nowInGeorgia);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const getDayKey = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.trim().split(' ')[0] || dateStr.split('T')[0];
  };

  const todayOutages = outages.filter(o => getDayKey(o.disconnectionDate) === todayStr);
  const tomorrowOutages = outages.filter(o => getDayKey(o.disconnectionDate) === tomorrowStr);
  const otherOutages = outages.filter(o => {
    const dk = getDayKey(o.disconnectionDate);
    return dk !== todayStr && dk !== tomorrowStr;
  });

  const formatDateLabel = (date: Date) => {
    if (lang === 'en') {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    const months = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];
    return `${date.getDate()} ${months[date.getMonth()]} - ${date.getFullYear()}`;
  };

  if (loading && outages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <RefreshCw size={40} className="animate-spin" />
        <p className="font-black uppercase tracking-widest text-xs">
          {lang === 'ka' ? 'მონაცემები იტვირთება...' : 'Loading delay...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Today */}
      <StatusGroup 
        title={lang === 'ka' ? 'დღეს' : 'Today'} 
        date={formatDateLabel(nowInGeorgia)} 
        items={todayOutages} 
        lang={lang} 
      />

      {/* Tomorrow */}
      <StatusGroup 
        title={lang === 'ka' ? 'ხვალ' : 'Tomorrow'} 
        date={formatDateLabel(tomorrowDate)} 
        items={tomorrowOutages} 
        lang={lang} 
      />

      {/* Other / Upcoming / Archive */}
      {otherOutages.length > 0 && (
        <StatusGroup 
          title={lang === 'ka' ? 'სხვა შეფერხებები' : 'Other Bulletins'} 
          date={lang === 'ka' ? 'დამატებითი' : 'Schedule Archive'} 
          items={otherOutages} 
          lang={lang} 
        />
      )}
      
      {lastChecked && (
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 text-center">
          {lang === 'ka' ? 'ბოლოს განახლდა' : 'Last synchronized'}: {lang === 'ka' ? lastChecked.toLocaleString('ka-GE') : lastChecked.toLocaleString('en-GB')}
        </p>
      )}
    </div>
  );
}

function StatusGroup({ 
  title, 
  date, 
  items, 
  lang 
}: { 
  title: string; 
  date: string; 
  items: FirestoreOutage[]; 
  lang: 'ka' | 'en'; 
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
          <Calendar size={20} className="text-blue-500" />
          {title} <span className="text-slate-400 dark:text-slate-500 text-sm font-bold ml-2">({date})</span>
        </h3>
        <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
          {items.length} {lang === 'ka' ? 'აქტივობა' : 'Activities'}
        </span>
      </div>

      <div className="grid gap-6">
        {items.length > 0 ? (
          items.map(outage => <OutageCard key={outage.id} outage={outage} lang={lang} />)
        ) : (
          <div className="py-12 px-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-emerald-500/60" />
            </div>
            <p className="text-slate-400 font-bold text-sm">
              {lang === 'ka' ? 'შეზღუდვები/სამუშაოები არ ფიქსირდება' : 'No outages or work scheduled'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function OutageCard({ 
  outage, 
  lang 
}: { 
  outage: FirestoreOutage; 
  lang: 'ka' | 'en'; 
}) {
  // Extract time parts or display raw
  const formatTimeRange = (start: string, end: string) => {
    try {
      const getT = (s: string) => s.includes(' ') ? s.split(' ')[1] : s;
      return { start: getT(start), end: getT(end) };
    } catch {
      return { start, end };
    }
  };

  const times = formatTimeRange(outage.disconnectionDate, outage.reconnectionDate);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-150 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-slate-700 transition-all group"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-black text-xs tracking-tight whitespace-nowrap border border-blue-100/50 dark:border-blue-900/30">
            <div className="flex items-center gap-1.5">
              <span className="opacity-60">{lang === 'ka' ? 'დაწყება:' : 'Start:'}</span>
              <span>{times.start}</span>
            </div>
            <span className="opacity-20 font-light">|</span>
            <div className="flex items-center gap-1.5">
              <span className="opacity-65 text-emerald-600 dark:text-emerald-400">{lang === 'ka' ? 'აღდგენა:' : 'End:'}</span>
              <span className="text-emerald-600 dark:text-emerald-400">{times.end}</span>
            </div>
          </div>
          
          {outage.affectedSubscribers && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs whitespace-nowrap">
              <Users size={14} className="text-blue-500" />
              <span>{outage.affectedSubscribers} {lang === 'ka' ? 'აბონენტი' : 'Subscribers'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs uppercase tracking-wider font-black text-slate-400 dark:text-slate-500 mb-1">
              {lang === 'ka' ? 'არეალი / ლოკაცია' : 'Affected Area'}
            </h4>
            <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed text-sm">
              {lang === 'ka' ? outage.disconnectionAreaKa : outage.disconnectionAreaEn}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50 dark:border-slate-850">
          <div className="flex items-start gap-3">
            <Activity size={16} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                {lang === 'ka' ? 'მიზეზი / დეტალები' : 'Details'}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-xs mt-0.5">
                {lang === 'ka' ? outage.reasonKa : outage.reasonEn}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
