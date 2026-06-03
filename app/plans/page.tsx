'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import SEOManager from '@/components/SEOManager';
import { motion } from 'motion/react';
import Link from 'next/link';
import { 
  Bus, Waves, Wrench, Fish, Gamepad2, Compass, ShoppingBag, Users, Info, 
  ArrowRight, Sparkles, Globe, Lightbulb, Rocket, Network, Lock, Delete
} from 'lucide-react';

interface FutureApp {
  domain: string;
  icon: any;
  titleKa: string;
  titleEn: string;
  descKa: string;
  descEn: string;
  color: string;
  tagKa: string;
  tagEn: string;
}

export default function PlansPage() {
  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [fullPageLoading, setFullPageLoading] = useState(true);

  // PIN Protection State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

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
    // Inject custom fonts from settings if they exist
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
    
    const savedUnlock = sessionStorage.getItem('plans_unlocked') === 'true';
    if (savedUnlock) {
      setIsUnlocked(true);
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

    return () => {
      unsubscribeSettings();
    };
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

  const handlePinInput = useCallback((val: string) => {
    if (pinError) setPinError(false);
    if (pinInput.length >= 4) return;
    const newVal = pinInput + val;
    setPinInput(newVal);
    
    if (newVal === '2026') {
      sessionStorage.setItem('plans_unlocked', 'true');
      setTimeout(() => {
        setIsUnlocked(true);
      }, 200);
    } else if (newVal.length === 4) {
      setTimeout(() => {
        setIsShaking(true);
        setPinError(true);
        setTimeout(() => {
          setIsShaking(false);
          setPinInput('');
        }, 500);
      }, 150);
    }
  }, [pinInput, pinError]);

  const handleBackspace = useCallback(() => {
    setPinInput(prev => prev.slice(0, -1));
    if (pinError) setPinError(false);
  }, [pinError]);

  // Handle physical keyboard input
  useEffect(() => {
    if (isUnlocked || fullPageLoading) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinInput(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinInput, isUnlocked, fullPageLoading, pinError, handlePinInput, handleBackspace]);

  const futureApps: FutureApp[] = [
    {
      domain: 'bus.poti.ge',
      icon: Bus,
      titleKa: 'ავტობუსები ლაივში',
      titleEn: 'Live Bus Tracker',
      descKa: 'ავტობუსების ნავიგაცია რეალურ დროში და მარშრუტები ქალაქ ფოთში.',
      descEn: 'Live GPS navigation, routing, and schedules for Poti city buses in real-time.',
      color: 'from-emerald-500 to-teal-600',
      tagKa: 'ტრანსპორტი',
      tagEn: 'Transit',
    },
    {
      domain: 'pull.poti.ge',
      icon: Waves,
      titleKa: 'ონლაინ ჯავშნები',
      titleEn: 'Online Sport Booking',
      descKa: 'სპორტ კომპლექსებისა და საცურაო აუზების ონლაინ ჯავშნის ფუნქცია.',
      descEn: 'Instant digital booking for local swim lanes, fitness complexes, and sports events.',
      color: 'from-blue-500 to-indigo-600',
      tagKa: 'აქტივობა',
      tagEn: 'Sports',
    },
    {
      domain: 'fix.poti.ge',
      icon: Wrench,
      titleKa: 'პრობლემების რეაგირება',
      titleEn: 'Fix Poti Portal',
      descKa: 'ქალაქში არსებული ინფრასტრუქტურული პრობლემების დაფიქსირების და მათზე რეაგირების სისტემა.',
      descEn: 'Community report utility for municipal failures, public damages, and swift response updates.',
      color: 'from-amber-500 to-orange-600',
      tagKa: 'ინფრასტრუქტურა',
      tagEn: 'Municipal',
    },
    {
      domain: 'fishing.poti.ge',
      icon: Fish,
      titleKa: 'თევზაობის რუკა',
      titleEn: 'Poti Fishing Club',
      descKa: 'თევზაობის ფედერაციის საიმიჯო პორტალი და თევზაობის აქტიური წერტილების ინტერაქტიული რუკა.',
      descEn: 'The Fishing Federation brand portal paired with an interactive map of prime angling hotspots.',
      color: 'from-cyan-500 to-blue-600',
      tagKa: 'რეკრეაცია',
      tagEn: 'Hobby',
    },
    {
      domain: 'games.poti.ge',
      icon: Gamepad2,
      titleKa: 'ქალაქის თამაშები',
      titleEn: 'Poti City Quests',
      descKa: 'ონლაინ და რეალურ ცხოვრებაში (IRL) ქალაქის სათავგადასავლო თამაშებისა და ქვიზების სისტემა.',
      descEn: 'Engaging real-world urban exploration gaming engines, digital quests, and historical trivia.',
      color: 'from-purple-500 to-pink-600',
      tagKa: 'გართობა',
      tagEn: 'Gaming',
    },
    {
      domain: 'visit.poti.ge',
      icon: Compass,
      titleKa: 'ციფრული გიდი',
      titleEn: 'Explore Poti',
      descKa: 'ტურისტული ადგილების დაგეგმარების, ტურის დაჯავშნისა და ლოკაციების ციფრული გიდი.',
      descEn: 'Curated sightseeing blueprints, booking channels, and smart location companions for travelers.',
      color: 'from-rose-500 to-red-600',
      tagKa: 'ტურიზმი',
      tagEn: 'Travel',
    },
    {
      domain: 'shop.poti.ge',
      icon: ShoppingBag,
      titleKa: 'ადგილობრივი მაღაზია',
      titleEn: 'Handmade Marketplace',
      descKa: 'ონლაინ მაღაზია, ქალაქში არსებული უნიკალური ხელნაკეთი ნივთების რეალიზაციისთვის.',
      descEn: 'Local marketplace dedicated to promoting and selling exquisite handmade goods from Poti.',
      color: 'from-violet-500 to-purple-600',
      tagKa: 'ბაზარი',
      tagEn: 'Shop',
    },
    {
      domain: 'people.poti.ge',
      icon: Users,
      titleKa: 'მოქალაქეთა ფორუმი',
      titleEn: 'Citizen Forum',
      descKa: 'ქალაქში მცხოვრები საერთო ინტერესების მქონე ადამიანების ფორუმი ღია ჯგუფების ფორმატით.',
      descEn: 'Interactive social discussion forums and public communities categorized by resident interests.',
      color: 'from-teal-500 to-emerald-600',
      tagKa: 'საზოგადოება',
      tagEn: 'Community',
    },
    {
      domain: 'info.poti.ge',
      icon: Info,
      titleKa: 'თანამშრომელთა პორტალი',
      titleEn: 'Internal Service Portal',
      descKa: 'სწრაფი ინფორმაციის მიწოდების სისტემა სახელმწიფო სტრუქტურების, საგანმანათლებლო ან/და სერვისების თანამშრომლებისათვის.',
      descEn: 'Secure operational dashboard and bulletin pipeline for education staff and local civil officers.',
      color: 'from-sky-500 to-blue-600',
      tagKa: 'კავშირი',
      tagEn: 'Utilities',
    },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <SEOManager 
        settings={settings} 
        lang={lang} 
        pageTitle={lang === 'ka' ? 'ციფრული ეკოსისტემა' : 'Digital Ecosystem'} 
        pageDescription={lang === 'ka' ? 'ფოთის ერთიანი ციფრული განვითარების გეგმები და მომავალი აპლიკაციები.' : 'Future apps and digital development master plan of Poti.'}
      />
      
      <Header 
        lang={lang} 
        setLang={setLang} 
        theme={theme} 
        setTheme={setTheme} 
        settings={settings}
      />

      <main className="container mx-auto px-4 py-16 md:py-24">
        {!isUnlocked ? (
          <div className="flex items-center justify-center min-h-[50vh] py-8">
            <motion.div
              animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.03)]"
            >
              {/* Lock Icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                <Lock size={28} className={pinInput.length > 0 ? "animate-pulse" : ""} />
              </div>

              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
                {lang === 'ka' ? 'დაცული განყოფილება' : 'Protected Area'}
              </h2>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-8">
                {lang === 'ka' ? 'სამომავლო გეგმების სანახავად შეიყვანეთ PIN კოდი (2026)' : 'Enter PIN code to view future software plans (2026)'}
              </p>

              {/* Dots indicating input progress */}
              <div className="flex justify-center gap-4 mb-10">
                {[0, 1, 2, 3].map((index) => {
                  const filled = pinInput.length > index;
                  return (
                    <motion.div
                      key={index}
                      initial={{ scale: 1 }}
                      animate={filled ? { scale: [1, 1.3, 1], backgroundColor: '#2563eb' } : { scale: 1 }}
                      className={`w-4 h-4 rounded-full border-2 ${
                        pinError 
                          ? 'border-red-500 bg-red-500' 
                          : filled 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-slate-300 dark:border-slate-700 bg-transparent'
                      } transition-colors duration-200`}
                    />
                  );
                })}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePinInput(num.toString())}
                    className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-blue-900/50 font-black text-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  >
                    {num}
                  </motion.button>
                ))}
                
                {/* Clear Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPinInput('')}
                  className="w-16 h-16 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                >
                  {lang === 'ka' ? 'გასუფთ.' : 'CLEAR'}
                </motion.button>

                {/* 0 Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePinInput('0')}
                  className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-800/80 hover:border-blue-200 dark:hover:border-blue-900/50 font-black text-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                >
                  0
                </motion.button>

                {/* Backspace Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackspace}
                  className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center shadow-sm cursor-pointer"
                >
                  <Delete size={20} />
                </motion.button>
              </div>
              
              <Link href="/">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors uppercase tracking-wider cursor-pointer">
                  {lang === 'ka' ? '← უკან დაბრუნება' : '← Return Home'}
                </span>
              </Link>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-extrabold text-[11px] md:text-xs uppercase tracking-wider mb-6"
              >
                <Sparkles size={14} className="animate-pulse" />
                <span>{lang === 'ka' ? 'პორტალის ხედვა' : 'Portal Vision'}</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-6xl font-black tracking-tight text-slate-800 dark:text-slate-100"
              >
                {lang === 'ka' ? 'ფოთის ერთიანი' : 'Poti Unified'} <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-blue-300 dark:to-indigo-400">
                  {lang === 'ka' ? 'ციფრული ეკოსისტემა' : 'Digital Ecosystem'}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-slate-500 dark:text-slate-400 text-base md:text-xl font-bold mt-6 leading-relaxed max-w-2xl mx-auto"
              >
                {lang === 'ka' ? (
                  <>
                    <span className="text-blue-600 dark:text-blue-400">Poti.ge</span> წარმოადგენს ქალაქის მთავარ პორტალს, რომელიც გააერთიანებს მუნიციპალური სერვისების ფართო ეკოსისტემას. გაეცანით ჩვენს სამომავლო გეგმებსა და შვილობილ პროექტებს.
                  </>
                ) : (
                  <>
                    <span className="text-blue-600 dark:text-blue-400">Poti.ge</span> serves as the gateway portal coordinating a cohesive municipal platform. Explore our future maps, smart integrations, and sister ecosystems.
                  </>
                )}
              </motion.p>
            </div>

            {/* Dynamic Bento Style Grid for Future Plans */}
            <div className="max-w-6xl mx-auto">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08
                    }
                  }
                }}
              >
                {futureApps.map((app: FutureApp, index: number) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 25 },
                      show: { opacity: 1, y: 0 }
                    }}
                    className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_12px_40px_rgba(37,99,235,0.08)] hover:border-slate-200 dark:hover:border-slate-700/80 transition-all duration-300 ease-out"
                  >
                    {/* Decorative background aura on hover */}
                    <span className={`absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gradient-to-br ${app.color} opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 blur-2xl`} />

                    <div>
                      <div className="flex items-center justify-between gap-4 mb-6">
                        {/* Icon container */}
                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${app.color} text-white shadow-lg`}>
                          <app.icon size={22} />
                        </div>

                        {/* Subcategory Pill */}
                        <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 font-extrabold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {lang === 'ka' ? app.tagKa : app.tagEn}
                        </span>
                      </div>

                      {/* Title & Domain */}
                      <div className="space-y-1 mb-3">
                        <h3 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                          {lang === 'ka' ? app.titleKa : app.titleEn}
                        </h3>
                        <code className="inline-block text-xs font-black text-blue-600 dark:text-blue-400 font-mono select-all">
                          {app.domain}
                        </code>
                      </div>

                      {/* Description */}
                      <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold leading-relaxed mb-6">
                        {lang === 'ka' ? app.descKa : app.descEn}
                      </p>
                    </div>

                    {/* Status Indicator */}
                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                        <span>{lang === 'ka' ? 'დაგეგმილი' : 'Planned'}</span>
                      </span>
                      
                      <span className="opacity-0 group-hover:opacity-100 group-hover:transform group-hover:translate-x-1 duration-300">
                        <ArrowRight size={16} className="text-blue-500" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Footer Mission Statement block */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto mt-24 md:mt-32 p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20 border border-blue-500/10 dark:border-slate-800 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
              
              <Network className="mx-auto text-blue-600 dark:text-blue-400 mb-6 animate-pulse" size={40} />
              
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">
                {lang === 'ka' ? 'ინოვაცია მუნიციპალურ სერვისებში' : 'Municipal Services Reimagined'}
              </h2>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-bold leading-relaxed max-w-2xl mx-auto">
                {lang === 'ka' ? (
                  'ფოთის ერთიანი ციფრული ეკოსისტემა მიზნად ისახავს ქალაქის ყოველდღიური სერვისების გამარტივებას, კომუნიკაციების გაუმჯობესებას და დეცენტრალიზებული, უსაფრთხო და მოქნილი პლატფორმების შექმნას.'
                ) : (
                  'The Poti unified ecosystem aims to modernize municipal systems, amplify citizen voices, and provide smooth decentralized platforms supporting local administration, educational pipelines, and safety services.'
                )}
              </p>

              <div className="mt-8 flex justify-center">
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs md:text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    {lang === 'ka' ? 'მთავარ პორტალზე დაბრუნება' : 'Back to Major Portal'}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </main>

      <Footer lang={lang} />
    </div>
  );
}
