'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { Briefcase, Award, Flame, BookOpen, ArrowRight, Calendar, Tag, AlertCircle, Info, Sparkles, Clock, HelpCircle } from 'lucide-react';
import Link from 'next/link';

// Comprehensive Icon Map for customizable icons
const iconMap: Record<string, any> = {
  Briefcase,
  Award,
  Flame,
  BookOpen,
  Calendar,
  Tag,
  AlertCircle,
  Info,
  Sparkles,
  Clock,
  HelpCircle
};

interface DynamicActivityItem {
  id: string;
  categoryKa?: string;
  categoryEn?: string;
  categoryId?: string;
  tag: 'projects' | 'grants' | 'challenges' | 'info' | string;
  icon: string;
  color: string;
  titleKa: string;
  titleEn: string;
  descKa: string;
  descEn: string;
  fullDetailsKa: string;
  fullDetailsEn: string;
  createdAt?: string;
  imageUrl?: string;
}

interface ProjectsActivitiesProps {
  lang: 'ka' | 'en';
}

export const ProjectsActivities = ({ lang }: ProjectsActivitiesProps) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [items, setItems] = useState<DynamicActivityItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback items to show if DB is completely empty (ensuring zero breakages)
  const defaultMockItems: DynamicActivityItem[] = [
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
      fullDetailsKa: 'პროექტის ფარგლებში იგეგმება 1500-ზე მეტი ენდემური ხის დარგვა ქალაქის მასშტაბით, ცენტრალური ბულვარის რეკონსტრუქცია, სარწყავი ავტომატიზებული სისტემების დამონტაჟება და ახალი საპარკე ზონების მოწყობა.',
      fullDetailsEn: 'Under the framework of this project, we plan to plant over 1,500 endemic trees city-wide, reconstruct the central boulevard, install automated watering systems, and design brand-new leisure park zones.'
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
      fullDetailsKa: 'საგრანტო ფონდი ითვალისწინებს 5,000 ლარამდე ფინანსურ მხარდაჭერას იმ პროექტებისთვის, რომლებიც ორიენტირებულია ქალაქის ყოველდღიური სერვისების გაუმჯობესებაზე.',
      fullDetailsEn: 'The grant fund provides up to 5,000 GEL of direct seed funding for software projects aiming to improve daily urban systems and citizen experiences in Poti.'
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
      fullDetailsKa: 'იდეების კონკურსი და ჰაკათონი, სადაც კოდერები, დიზაინერები და აქტიური მოქალაქეები ქმნიან ციფრულ პროტოტიპებს ფოთის წინაშე არსებული გამოწვევების გადასაჭრელად.',
      fullDetailsEn: 'An ideas contest and hackathon where software developers, UI designers, and civic minds build digital prototypes answering urban needs.'
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
      fullDetailsKa: 'ეს არის ღია ინფორმაციული რესურსი, რომელიც აერთიანებს ქალაქის განვითარების კვლევებს, ისტორიულ დოკუმენტებსა და ტურისტულ მეხსიერებას.',
      fullDetailsEn: 'A completely open info portal bringing together city development plans, historical research, and ecotourist guides.'
    }
  ];

  useEffect(() => {
    // 1. Listen to Categories from Firestore
    const qCategories = query(collection(db, 'initiative_categories'), orderBy('order', 'asc'));
    const unsubscribeCats = onSnapshot(qCategories, (snap) => {
      const dbCats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(dbCats);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'initiative_categories');
    });

    // 2. Listen to Initiatives from Firestore
    const qInitiatives = query(collection(db, 'initiatives'), orderBy('order', 'asc'));
    const unsubscribeInits = onSnapshot(qInitiatives, (snap) => {
      const dbInits = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DynamicActivityItem[];
      setItems(dbInits);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'initiatives');
      setLoading(false);
    });

    return () => {
      unsubscribeCats();
      unsubscribeInits();
    };
  }, []);

  // Compute final lists
  const currentItems = items.length > 0 ? items : defaultMockItems;

  const defaultMockCategories = [
    { key: 'all', ka: 'ყველა', en: 'All' },
    { key: 'projects', ka: 'პროექტები', en: 'Projects' },
    { key: 'grants', ka: 'გრანტები', en: 'Grants' },
    { key: 'challenges', ka: 'გამოწვევები', en: 'Challenges' },
    { key: 'info', ka: 'ინფორმაცია', en: 'Information' }
  ];

  // If we have custom categories in DB, map them nicely
  const tabFilters = categories.length > 0 
    ? [{ id: 'all', tag: 'all', titleKa: 'ყველა', titleEn: 'All' }, ...categories].map(cat => ({
        key: cat.tag || cat.id,
        ka: cat.titleKa,
        en: cat.titleEn
      }))
    : defaultMockCategories;

  // Render items based on active tab filtering
  const filteredItems = activeTab === 'all'
    ? currentItems
    : currentItems.filter(item => {
        // Tag match, slug match or Category ID match
        return item.tag === activeTab || item.categoryId === activeTab;
      });

  return (
    <section className="relative py-16 px-4 container mx-auto border-t border-blue-50 dark:border-slate-900/60" id="projects-section">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            {lang === 'ka' ? 'პროექტები და აქტივობები' : 'Projects & Activities'}
          </h2>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2">
          {tabFilters.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm transition-all shadow-sm cursor-pointer border ${
                  isActive 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-100 dark:border-slate-800'
                }`}
              >
                {lang === 'ka' ? tab.ka : tab.en}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((app) => {
            const IconComponent = iconMap[app.icon] || Briefcase;
            const gradientColor = app.color || 'from-emerald-500 to-teal-600';
            
            // Resolve Category Name
            let categoryName = lang === 'ka' ? 'პროექტი' : 'Project';
            if (app.categoryKa && lang === 'ka') categoryName = app.categoryKa;
            else if (app.categoryEn && lang === 'en') categoryName = app.categoryEn;
            else if (app.categoryId) {
              const matchedCat = categories.find(c => c.id === app.categoryId);
              if (matchedCat) {
                categoryName = lang === 'ka' ? matchedCat.titleKa : matchedCat.titleEn;
              }
            } else if (app.tag) {
              const matchedTag = defaultMockCategories.find(c => c.key === app.tag);
              if (matchedTag) {
                categoryName = lang === 'ka' ? matchedTag.ka : matchedTag.en;
              }
            }

            return (
              <motion.div
                layout
                key={app.id}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_45px_rgba(37,99,235,0.08)] hover:border-slate-200 dark:hover:border-slate-700/80 transition-all duration-300"
              >
                {/* Decorative aura */}
                <span className={`absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gradient-to-br ${gradientColor} opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 blur-2xl`} />

                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    {/* Icon container */}
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradientColor} text-white shadow-lg`}>
                      <IconComponent size={22} />
                    </div>

                    {/* Category Pill */}
                    <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 font-extrabold text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {categoryName}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 mb-2 leading-snug">
                    {lang === 'ka' ? app.titleKa : app.titleEn}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed mb-6 line-clamp-3">
                    {lang === 'ka' ? app.descKa : app.descEn}
                  </p>
                </div>

                {/* Direct Link Navigation Section */}
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                  <Link
                    href={`/projects?id=${app.id}`}
                    className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5 group-hover:text-blue-700 dark:group-hover:text-blue-300 hover:underline transition-colors"
                  >
                    <span>{lang === 'ka' ? 'სრულად' : 'Read more'}</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 duration-300" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};
