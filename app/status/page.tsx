'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { 
  Bolt, 
  Droplets, 
  Flame, 
  Construction, 
  Calendar, 
  Users, 
  MapPin, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Lightbulb, 
  LightbulbOff,
  Search,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface Outage {
  taskId: number;
  taskName: string;
  taskNote: string;
  scName: string;
  scEffectedCustomers: string;
  disconnectionArea: string;
  disconnectionDate: string;
  reconnectionDate: string;
  regionName: string;
  taskType: string;
}

type ServiceType = 'power' | 'water' | 'gas' | 'roads';

export default function StatusHubPage() {
  const [activeService, setActiveService] = useState<ServiceType>('power');
  const [outages, setOutages] = useState<Outage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as 'ka' | 'en';
    if (savedLang) setLang(savedLang);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (d) => {
      if (d.exists()) setSettings(d.data());
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/global');
    });

    return () => unsubscribeSettings();
  }, []);

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

  const fetchOutages = useCallback(async (isRetry = false) => {
    if (activeService !== 'power') return;
    setLoading(true);
    try {
      const response = await fetch('/api/power');
      const result = await response.json();

      if (result.error || result.status !== 200) {
        throw new Error(result.error || 'API returned non-200 status');
      }

      const data: Outage[] = result.data || [];
      const potiOutages = data.filter(item => item.scName === 'ფოთი');
      const uniqueOutagesMap = new Map<number, Outage>();
      potiOutages.forEach(item => uniqueOutagesMap.set(item.taskId, item));
      const uniqueOutages = Array.from(uniqueOutagesMap.values());
      
      setOutages(uniqueOutages);
      setError(null);
      setLastChecked(new Date());
      setRetryCount(0);
    } catch (err: any) {
      console.error('Fetch error:', err);
      if (!isRetry && retryCount === 0) {
        setRetryCount(1);
        setError(lang === 'ka' ? '⚠️ API მიუწვდომელია — ცდა 5 წუთში' : '⚠️ API unavailable — retry in 5 min');
        setTimeout(() => fetchOutages(true), 5 * 60 * 1000);
      } else {
        setError(lang === 'ka' ? `⚠️ API მიუწვდომელია ${new Date().toLocaleTimeString()} — ცდა 60 წუთში` : `⚠️ API unavailable at ${new Date().toLocaleTimeString()} — retry in 60 min`);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount, activeService, lang]);

  useEffect(() => {
    if (activeService === 'power') {
      fetchOutages();
      const interval = setInterval(fetchOutages, 60 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      setError(null);
    }
  }, [fetchOutages, activeService]);

  const services = [
    { 
      id: 'power', 
      label: lang === 'ka' ? 'ელექტროენერგია' : 'Electricity', 
      icon: Bolt, 
      color: 'blue', 
      provider: 'Energo-Pro' 
    },
    { 
      id: 'water', 
      label: lang === 'ka' ? 'წყალმომარაგება' : 'Water Supply', 
      icon: Droplets, 
      color: 'cyan', 
      provider: 'GWP / United Water' 
    },
    { 
      id: 'gas', 
      label: lang === 'ka' ? 'ბუნებრივი აირი' : 'Gas Supply', 
      icon: Flame, 
      color: 'orange', 
      provider: 'Socar Gas' 
    },
    { 
      id: 'roads', 
      label: lang === 'ka' ? 'გზები' : 'Roadworks', 
      icon: Construction, 
      color: 'yellow', 
      provider: 'Municipality' 
    },
  ] as const;

  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
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
                  {lang === 'ka' ? 'შეიტყვეთ დაგეგმილი სამუშაოების შესახებ' : 'Stay updated on planned maintenance and outages'}
                </p>
              </div>

              <nav className="flex flex-col gap-2 p-2 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setActiveService(service.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all font-black text-sm uppercase tracking-tight group ${activeService === service.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <service.icon size={20} className={activeService === service.id ? 'text-white' : 'text-blue-500'} />
                      {service.label}
                    </div>
                    <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${activeService === service.id ? 'text-white' : 'text-slate-300'}`} />
                  </button>
                ))}
              </nav>

              <div className="p-6 bg-slate-100 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 mb-3 uppercase font-black text-[10px] tracking-widest">
                  <Info size={14} />
                  {lang === 'ka' ? 'ინფორმაცია' : 'Information'}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  {lang === 'ka' 
                    ? 'მონაცემები ავტომატურად ახლდება ყოველ 60 წუთში შესაბამისი სერვის-პროვაიდერების ბაზებიდან.' 
                    : 'Data is automatically updated every 60 minutes from respective service provider databases.'}
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
                      {services.find(s => s.id === activeService)?.icon && React.createElement(services.find(s => s.id === activeService)!.icon, { size: 24 })}
                      <span className="font-black uppercase tracking-widest text-xs">{services.find(s => s.id === activeService)?.provider}</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">{services.find(s => s.id === activeService)?.label}</h2>
                  </div>

                  {activeService === 'power' && (
                    <button 
                      onClick={() => fetchOutages()}
                      disabled={loading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400"
                    >
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                      {lang === 'ka' ? 'განახლება' : 'Refresh'}
                    </button>
                  )}
                </header>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 font-bold">
                    <AlertTriangle size={20} />
                    {error}
                  </div>
                )}

                {/* Content */}
                <div className="space-y-12">
                  {activeService === 'power' ? (
                    <PowerSection outages={outages} loading={loading} lang={lang} lastChecked={lastChecked} />
                  ) : (
                    <PlaceholderSection service={activeService} lang={lang} />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function PowerSection({ outages, loading, lang, lastChecked }: { outages: Outage[], loading: boolean, lang: 'ka' | 'en', lastChecked: Date | null }) {
  const nowInGeorgia = new Date(new Date().getTime() + (4 * 60 * 60 * 1000));
  const todayStr = nowInGeorgia.toISOString().split('T')[0];
  
  const tomorrowDate = new Date(nowInGeorgia);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const getDayKey = (dateStr: string) => dateStr.split(' ')[0];
  
  const todayOutages = outages.filter(o => getDayKey(o.disconnectionDate) === todayStr);
  const tomorrowOutages = outages.filter(o => getDayKey(o.disconnectionDate) === tomorrowStr);

  const formatDate = (date: Date) => {
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
        <p className="font-black uppercase tracking-widest text-xs">{lang === 'ka' ? 'მონაცემები იტვირთება...' : 'Loading data...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <StatusGroup title={lang === 'ka' ? 'დღეს' : 'Today'} date={formatDate(nowInGeorgia)} items={todayOutages} lang={lang} />
      <StatusGroup title={lang === 'ka' ? 'ხვალ' : 'Tomorrow'} date={formatDate(tomorrowDate)} items={tomorrowOutages} lang={lang} />
      
      {lastChecked && (
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 text-center">
          {lang === 'ka' ? 'ბოლოს განახლდა' : 'Last checked'}: {lang === 'ka' ? lastChecked.toLocaleString('ka-GE') : lastChecked.toLocaleString('en-GB')}
        </p>
      )}
    </div>
  );
}

function StatusGroup({ title, date, items, lang }: { title: string, date: string, items: Outage[], lang: 'ka' | 'en' }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
          <Calendar size={20} className="text-blue-500" />
          {title} <span className="text-slate-400 text-sm font-bold ml-2">({date})</span>
        </h3>
        <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
          {items.length} {lang === 'ka' ? 'გათიშვა' : 'Outages'}
        </span>
      </div>

      <div className="grid gap-4">
        {items.length > 0 ? (
          items.map(outage => <OutageCard key={outage.taskId} outage={outage} lang={lang} />)
        ) : (
          <div className="py-12 px-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">
              {lang === 'ka' ? 'გათიშვა არ იგეგმება' : 'No outages planned'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function OutageCard({ outage, lang }: { outage: Outage, lang: 'ka' | 'en' }) {
  const getTime = (dateStr: string) => dateStr.split(' ')[1] || '00:00';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black text-lg tracking-tighter whitespace-nowrap">
            <div className="flex items-center gap-2">
              <LightbulbOff size={18} className="opacity-40" />
              <span>{getTime(outage.disconnectionDate)}</span>
            </div>
            <span className="opacity-20 font-light">–</span>
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-yellow-500" />
              <span>{getTime(outage.reconnectionDate)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-wider whitespace-nowrap">
            <Users size={14} className="text-blue-500" />
            <span>~{outage.scEffectedCustomers} {lang === 'ka' ? 'აბონენტი' : 'Subscribers'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-blue-500 mt-1 shrink-0" />
          <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-sm">
            {outage.disconnectionArea}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50">
          <p className="text-slate-400 dark:text-slate-500 font-bold text-xs">
            {outage.taskName} {outage.taskNote ? ` — ${outage.taskNote}` : ''}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function PlaceholderSection({ service, lang }: { service: ServiceType, lang: 'ka' | 'en' }) {
  const messages = {
    water: lang === 'ka' ? 'წყალმომარაგების შეზღუდვები არ იგეგმება' : 'No water maintenance planned',
    gas: lang === 'ka' ? 'გაზმომარაგების შეზღუდვები არ იგეგმება' : 'No gas maintenance planned',
    roads: lang === 'ka' ? 'საშემკეთებლო სამუშაოები არ იგეგმება' : 'No roadworks in progress',
    power: ''
  };

  return (
    <div className="py-24 text-center">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-white dark:border-slate-800">
        <AlertTriangle size={32} className="text-slate-300" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
        {lang === 'ka' ? 'ინფორმაცია არ არის' : 'No updates found'}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto">
        {messages[service]}
      </p>
      <div className="mt-8">
        <button className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest text-slate-400">
          {lang === 'ka' ? 'მონაცემების შემოწმება...' : 'Checking for updates...'}
        </button>
      </div>
    </div>
  );
}
