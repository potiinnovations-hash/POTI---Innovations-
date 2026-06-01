'use client';

import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Monitor, Download, ChevronRight, Share, Plus, Menu, Info, Star } from 'lucide-react';
import SEOManager from '@/components/SEOManager';

export default function AppPage() {
  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [fullPageLoading, setFullPageLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android'>('android');

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
    // Detect if device is already running in standalone mode (installed PWA)
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsInstalled(!!isStandalone);
    };
    checkInstalled();

    // Auto-detect user platform to pre-select correct instructions
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setActivePlatform('ios');
    } else {
      setActivePlatform('android');
    }
  }, []);

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
    // Listen for the custom prompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
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
        setSettingsLoaded(true);
        handleFirestoreError(error, OperationType.GET, 'settings/global');
      }
    );
    return () => unsubscribeSettings();
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      if (isInstalled) {
        alert(lang === 'ka' ? 'აპლიკაცია უკვე დაინსტალირებულია თქვენს მოწყობილობაზე!' : 'App is already installed on your device!');
      } else {
        alert(
          lang === 'ka' 
            ? 'თქვენი ბრაუზერი ავტომატურ ინსტალაციას პირდაპირ არ უჭერს მხარს. გთხოვთ მიჰყვეთ ქვემოთ მოცემულ ინსტრუქციას.' 
            : 'Your browser does not support direct installation. Please follow the instructions below.'
        );
      }
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <>
      <SEOManager settings={settings} lang={lang} />
      
      <AnimatePresence mode="wait">
        {fullPageLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <div key="content" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
            {/* Header */}
            <Header 
              lang={lang} 
              setLang={setLang} 
              theme={theme} 
              setTheme={setTheme} 
              settings={settings} 
            />

            {/* Main Container */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col">
              
              {/* Cover Banner */}
              <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  დააინსტალირე <br className="sm:hidden" />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">POTI.GE მობილურზე</span>
                </h1>
              </div>

              {/* Install Hero Button Area */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/40 dark:shadow-none mb-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl -ml-12 -mb-12" />

                <div className="relative z-10 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                    <Smartphone size={32} />
                  </div>

                  <div>
                    <h3 className="font-black text-lg text-slate-800 dark:text-white">
                      {isInstalled ? 'აპლიკაცია უკვე დაყენებულია' : 'სწრაფი ინსტალაცია ბრაუზერიდან'}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-1">
                      {isInstalled 
                        ? 'აპი წარმატებით ეშვება დამოუკიდებელ რეჟიმში!' 
                        : 'თავსებადია Google Chrome, Safari, Samsung Internet და Edge ბრაუზერებთან'}
                    </p>
                  </div>

                  <div className="pt-2 max-w-sm mx-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleInstallClick}
                      className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg ${
                        isInstalled 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-none'
                      }`}
                    >
                      <Download size={18} />
                      {isInstalled ? 'დაინსტალირებულია' : 'აპლიკაციის დაინსტალირება'}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Manual Instructions Tab Box */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight">
                    დეტალური ინსტრუქცია მოწყობილობისთვის
                  </h2>
                  
                  {/* Tabs */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setActivePlatform('android')}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${
                        activePlatform === 'android' 
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Android
                    </button>
                    <button
                      onClick={() => setActivePlatform('ios')}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${
                        activePlatform === 'ios' 
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      iPhone / iOS
                    </button>
                  </div>
                </div>

                {/* Tab content inside custom smooth transitions */}
                <div className="grid grid-cols-1 gap-4">
                  {activePlatform === 'android' ? (
                    <div className="space-y-4">
                      {/* Step 1 */}
                      <div className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-sm">
                          1
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-800 dark:text-white text-sm md:text-base">ბრაუზერში გახსნა</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
                            გახსენით მობილური ბრაუზერი <strong className="text-slate-800 dark:text-slate-200">Google Chrome</strong> (ან Edge / Samsung Internet) და გადადით საიტზე <strong className="text-blue-600">poti.ge</strong>
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-sm">
                          2
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-800 dark:text-white text-sm md:text-base">მენიუს გახსნა</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
                            თქვენი ბრაუზერის მარჯვენა ზედა კუთხეში დააჭირეთ <strong className="text-slate-800 dark:text-slate-200">სამ წერტილს ( ⋮ )</strong> მენიუს გამოსაჩენად.
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-sm">
                          3
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-800 dark:text-white text-sm md:text-base">ინსტალაციის არჩევა</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
                            ჩამონათვალში მოძებნეთ და დააჭირეთ ღილაკს <strong className="text-slate-800 dark:text-slate-200">&quot;Install app&quot;</strong> (აპლიკაციის დაინსტალირება) ან <strong className="text-slate-800 dark:text-slate-200">&quot;Add to Home screen&quot;</strong> (ეკრანზე დამატება).
                          </p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-sm">
                          4
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-800 dark:text-white text-sm md:text-base">მზაობა</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
                            დაადასტურეთ დამატება. ფოთის ციფრული მენიუს ლოგო გამოჩნდება თქვენს მობილურ ეკრანზე სხვა აპლიკაციების გვერდით.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Step 1 */}
                      <div className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-sm">
                          1
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-800 dark:text-white text-sm md:text-base">გახსნა Safari ბრაუზერში</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
                            აუცილებლად გამოიყენეთ სტანდარტული <strong className="text-slate-800 dark:text-slate-200">Safari</strong> ბრაუზერი თქვენს iPhone-ში და გადადით <strong className="text-blue-600">poti.ge</strong>-ზე.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-sm">
                          2
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-800 dark:text-white text-sm md:text-base">დააჭირეთ &quot;გაზიარება&quot; (Share) ღილაკს</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed flex items-center gap-1.5 flex-wrap">
                            ეკრანის ქვედა პანელზე დააჭირეთ გაზიარების ნიშანს 
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs">
                              <Share size={12} className="inline" /> Share
                            </span> 
                            (ისარი მაღლა, კვადრატიდან).
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-sm">
                          3
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-800 dark:text-white text-sm md:text-base">მთავარ ეკრანზე დამატება</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed flex items-center gap-1.5 flex-wrap">
                            გახსნილ მენიუში ჩამოდით ქვემოთ და აირჩიეთ ოფცია 
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs">
                              <Plus size={12} className="inline" /> Add to Home Screen
                            </span> 
                            (მთავარ ეკრანზე დამატება).
                          </p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-sm">
                          4
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-800 dark:text-white text-sm md:text-base">ინსტალაციის დასრულება</h4>
                          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
                            ზედა მარჯვენა კუთხეში დააჭირეთ <strong className="text-slate-800 dark:text-slate-200">&quot;Add&quot;</strong> (დამატება) ღილაკს. აპლიკაცია გამოჩნდება თქვენს საწყის ეკრანზე.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informative bottom banner */}
              <div className="mt-12 p-6 rounded-[24px] bg-slate-100 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/60 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <Info size={20} />
                </div>
                <div className="space-y-1">
                  <h5 className="font-black text-xs md:text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">რატომ PWA აპლიკაცია?</h5>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                    პროგრესული ვებ აპლიკაცია (PWA) არის თანამედროვე ტექნოლოგია, რომელიც საშუალებას გაძლევთ გქონდეთ სრულფასოვანი მობილური აპლიკაცია App Store-ისა და Google Play-ს გარეშე. იგი მოიხმარს 100-ჯერ ნაკლებ მეხსიერებას, მუშაობს მყისიერად და ავტომატურად განახლდება ყოველ ჯერზე, როდესაც ჩვენ ვამატებთ ახალ ფუნქციას.
                  </p>
                </div>
              </div>

            </main>

            {/* Footer */}
            <Footer lang={lang} />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
