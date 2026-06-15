'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { LighthouseBackground } from '@/components/LighthouseBackground';
import LoadingScreen from '@/components/LoadingScreen';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar, UserPlus, Info, ArrowRight, ExternalLink, MessageSquare, 
  Tag, Bell, Flame, Award, Briefcase, BookOpen, Clock, Globe, Link as LinkIcon, Sparkles, AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import SEOManager from '@/components/SEOManager';

// Comprehensive Icon Map for customizable icons
const iconMap: Record<string, any> = {
  Briefcase,
  Award,
  Flame,
  BookOpen,
  Calendar,
  UserPlus,
  Info,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Globe,
  Bell,
  Clock,
  Sparkles,
  AlertCircle
};

function ProjectDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';
  const router = useRouter();
  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  const [project, setProject] = useState<any | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [fullPageLoading, setFullPageLoading] = useState(true);

  useEffect(() => {
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 300));
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
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'initiatives', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        } else {
          // If not found in dynamic DB, look up the mocked list to ensure offline fallback
          const defaultMock = [
            {
              id: 'green-poti',
              categoryKa: 'პროექტები',
              categoryEn: 'Projects',
              tag: 'projects',
              icon: 'Briefcase',
              color: 'from-emerald-500 to-teal-600',
              titleKa: 'მწვანე ფოთი 2026',
              titleEn: 'Green Poti 2026',
              descKa: 'ქალაქ ფოთის პარკებისა და სკვერების განახლებისა და გამწვანების მასშტაბური ინიციატივა.',
              descEn: 'A large-scale project for urban greening, restoring local parks, and expanding green spaces in Poti.',
              fullDetailsKa: 'პროექტის ფარგლებში იგეგმება 1500-ზე მეტი ენდემური ხის დარგვა ქალაქის მასშტაბით, ცენტრალური ბულვარის რეკონსტრუქცია, სარწყავი ავტომატიზებული სისტემების დამონტაჟება და ახალი საპარკე ზონების მოწყობა. პროექტში მონაწილეობის მიღება შეუძლია ნებისმიერ მოხალისესა და ორგანიზაციას.',
              fullDetailsEn: 'Under the framework of this project, we plan to plant over 1,500 endemic trees city-wide, reconstruct the central boulevard, install automated watering systems, and design brand-new leisure park zones. Any volunteer, civic group, or local organization is welcome to join the initiative!'
            },
            {
              id: 'municipal-grant',
              categoryKa: 'გრანტები',
              categoryEn: 'Grants',
              tag: 'grants',
              icon: 'Award',
              color: 'from-blue-500 to-indigo-600',
              titleKa: 'მუნიციპალური გრანტი',
              titleEn: 'Municipal Innovation Grant',
              descKa: 'ადგილობრივი სტუდენტებისა და ახალგაზრდა დეველოპერების ტექნოლოგიური იდეების მხარდამჭერი საგრანტო პროგრამა.',
              descEn: 'Support grants program for Poti’s students, young innovators, and digital startup concepts.',
              fullDetailsKa: 'საგრანტო ფონდი ითვალისწინებს 5,000 ლარამდე ფინანსურ მხარდაჭერას იმ პროექტებისთვის, რომლებიც ორიენტირებულია ქალაქის ყოველდღიური სერვისების გაუმჯობესებაზე. გამარჯვებულები მიიღებენ მენტორინგს წამყვანი ტექნოლოგიური სპეციალისტებისგან.',
              fullDetailsEn: 'The grant fund provides up to 5,000 GEL of direct seed funding for software projects aiming to improve daily urban systems and citizen experiences in Poti. Selected winners will also receive mentorship from top-tier tech professionals.'
            },
            {
              id: 'smart-poti',
              categoryKa: 'გამოწვევები',
              categoryEn: 'Challenges',
              tag: 'challenges',
              icon: 'Flame',
              color: 'from-amber-500 to-orange-600',
              titleKa: 'სმარტ ფოთი 2026',
              titleEn: 'Smart Poti Hackathon',
              descKa: 'ქალაქის სერვისების გაუმჯობესებაზე ორიენტირებული 48-საათიანი ტექნოლოგიური შეჯიბრი.',
              descEn: 'A continuous 48-hour challenge event for coding, designing, and engineering smart municipal solutions.',
              fullDetailsKa: 'იდეების კონკურსი და ჰაკათონი, სადაც კოდერები, დიზაინერები და აქტიური მოქალაქეები ქმნიან ციფრულ პროტოტიპებს ფოთის წინაშე არსებული გამოწვევების გადასაჭრელად. საუკეთესო პროტოტიპები მიიღებენ დაფინანსებას და ინტეგრირდებიან poti.ge ეკოსისტემაში.',
              fullDetailsEn: 'An ideas contest and hackathon where software developers, UI designers, and civic minds build digital prototypes answering urban needs. Winning prototypes will receive direct funding and official integration within the poti.ge ecosystem.'
            },
            {
              id: 'poti-docs',
              categoryKa: 'ინფორმაცია',
              categoryEn: 'Information',
              tag: 'info',
              icon: 'BookOpen',
              color: 'from-rose-500 to-red-600',
              titleKa: 'საინფორმაციო ბიულეტენი',
              titleEn: 'Information Bulletin',
              descKa: 'ფოთის კულტურული მემკვიდრეობისა და ეკოტურიზმის პოპულარიზაციის ახალი სამოქმედო გეგმა.',
              descEn: 'Strategic efforts to boost local ecotourism, modernize signage, and highlight historical landmarks.',
              fullDetailsKa: 'ეს არის ღია ინფორმაციული რესურსი, რომელიც აერთიანებს ქალაქის განვითარების კვლევებს, ისტორიულ დოკუმენტებსა და ტურისტულ მეხსიერებას. ბიულეტენი საშუალებას აძლევს ახალგაზრდებსა და მკვლევარებს გაეცნონ ფოთის პორტისა და ქალაქის სრულ საარქივო ისტორიას.',
              fullDetailsEn: 'A completely open info portal bringing together city development plans, historical research, and ecotourist guides. Designed for youth and researchers to discover the rich archival and maritime history of Poti and its famous port.'
            }
          ];
          const matched = defaultMock.find(x => x.id === id);
          if (matched) {
            setProject(matched);
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `initiatives/${id}`);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data());
        setSettingsLoaded(true);
      } else {
        setSettingsLoaded(true);
      }
    }, (err) => {
      setSettingsLoaded(true);
      handleFirestoreError(err, OperationType.GET, 'settings/global');
    });

    fetchProject();
    return () => unsubscribeSettings();
  }, [id]);

  // Resolve Icon
  const projectIconName = project?.icon || 'Briefcase';
  const ProjectIcon = iconMap[projectIconName] || Briefcase;

  // Resolve Custom Button Icon
  const btnIconName = project?.ctaIcon || 'ExternalLink';
  const ButtonIcon = iconMap[btnIconName] || ExternalLink;

  const gradientClass = project?.color || 'from-blue-500 to-indigo-600';

  return (
    <AnimatePresence mode="wait">
      {fullPageLoading ? (
        <LoadingScreen key="loading" />
      ) : !project ? (
        <motion.div 
          key="not-found"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-950 text-center"
        >
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mb-4">
            <Info size={32} />
          </div>
          <h1 className="text-2xl font-black mb-2 tracking-tight">ინფორმაცია ვერ მოიძებნა</h1>
          <p className="text-slate-500 max-w-sm mb-6 text-sm font-semibold">გთხოვთ, შეამოწმოთ URL ბმული ან სცადოთ მოგვიანებით.</p>
          <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-full font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">
            მთავარზე დაბრუნება
          </Link>
        </motion.div>
      ) : (
        <motion.main 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-500 pb-20"
        >
          <SEOManager 
            settings={settings} 
            lang={lang} 
            pageTitle={lang === 'ka' ? project.titleKa : project.titleEn}
            pageDescription={lang === 'ka' ? project.descKa : project.descEn}
            pageImage={project.imageUrl}
          />
          <LighthouseBackground />
          
          <Header
            lang={lang}
            setLang={setLang}
            theme={theme}
            setTheme={setTheme}
            settings={settings}
          />

          <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Back to Home Button */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-8 font-black text-sm transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              {lang === 'ka' ? 'მთავარ გვერდზე დაბრუნება' : 'Back to Home'}
            </Link>

            {/* Editorial Layout Wrapper */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 shadow-2xl shadow-slate-100/30 overflow-hidden">
              {/* Optional Hero Image / Top Gradient Banner */}
              <div className="relative w-full">
                {project.imageUrl ? (
                  <div className="relative w-full aspect-[21/9] md:aspect-[24/9]">
                    <Image 
                      src={project.imageUrl} 
                      alt={project.titleKa} 
                      fill 
                      className="object-cover"
                      priority
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent opacity-80" />
                  </div>
                ) : (
                  <div className={`w-full h-40 bg-gradient-to-br ${gradientClass}`} />
                )}

                {/* Floating Big Icon */}
                <div className="absolute -bottom-8 left-10 p-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/90 shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradientClass} text-white shadow-lg`}>
                    <ProjectIcon size={32} />
                  </div>
                </div>
              </div>

              {/* Detail body */}
              <div className="px-8 md:px-12 pt-16 pb-12">
                {/* Meta details */}
                <div className="flex flex-wrap gap-3 items-center mb-6">
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 font-extrabold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {lang === 'ka' ? (project.categoryKa || 'ინიციატივა') : (project.categoryEn || 'Initiative')}
                  </span>
                  {project.tag && (
                    <span className="px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 font-extrabold text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Tag size={12} />
                      {project.tag}
                    </span>
                  )}
                  {project.createdAt && (
                    <span className="text-slate-400 font-bold text-xs flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(project.createdAt).toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US')}
                    </span>
                  )}
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-6 leading-tight">
                  {lang === 'ka' ? project.titleKa : project.titleEn}
                </h1>

                {/* Introductory Section */}
                <p className="text-slate-600 dark:text-slate-300 font-bold text-md md:text-lg leading-relaxed border-l-4 border-blue-500 pl-5 bg-slate-50 dark:bg-slate-800/30 py-4 pr-3 rounded-r-3xl mb-10 shadow-sm">
                  {lang === 'ka' ? project.descKa : project.descEn}
                </p>

                {/* Full editorial content body (Rich text style) */}
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-semibold text-base md:text-lg leading-loose space-y-6 mb-12">
                  {(lang === 'ka' ? project.fullDetailsKa : project.fullDetailsEn)?.split('\n').map((paragraph: string, idx: number) => {
                    if (!paragraph.trim()) return null;
                    return (
                      <p key={idx} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                {/* Call to Action Button */}
                {project.ctaUrl && (
                  <div className="pt-8 border-t border-slate-100 dark:border-slate-800/80">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="max-w-md"
                    >
                      <a 
                        href={project.ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 px-8 py-5 text-white font-black text-lg md:text-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300"
                        style={{ backgroundColor: settings?.buttonColor || '#2563eb' }}
                      >
                        <ButtonIcon size={24} />
                        {lang === 'ka' 
                          ? (project.ctaTextKa || 'მონაწილეობის მიღება') 
                          : (project.ctaTextEn || 'Participate / Join')}
                      </a>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Footer lang={lang} />
        </motion.main>
      )}
    </AnimatePresence>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProjectDetailContent />
    </Suspense>
  );
}
