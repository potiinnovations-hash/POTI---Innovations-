'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Info, AlertCircle, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'motion/react';

export interface CatalogItem {
  id: string;
  titleKa: string;
  titleEn: string;
  categoryId?: string;
  imageUrl: string;
  targetUrl: string;
  descriptionKa?: string;
  descriptionEn?: string;
  order?: number;
  isUnderDevelopment?: boolean;
  redirectDirectly?: boolean;
  phone?: string;
  price?: string;
  priceEn?: string;
  location?: string;
  addressKa?: string;
  addressEn?: string;
  workHours?: string;
  gallery?: string[];
  facebookUrl?: string;
  facebookName?: string;
  email?: string;
  showWebsite?: boolean;
  titleColor?: string;
  isCategory?: boolean;
  parentId?: string;
  ctaButton?: {
    textKa: string;
    textEn: string;
    url: string;
    icon: string;
  };
}

interface CatalogProps {
  items: CatalogItem[];
  lang: 'ka' | 'en';
  itemsPerRow?: number;
  settings?: any;
  onCategoryClick?: (id: string) => void;
}

export const Catalog = ({ items, lang, itemsPerRow = 4, settings = {}, onCategoryClick }: CatalogProps) => {
  const [showDevMessage, setShowDevMessage] = React.useState(false);
  const router = useRouter();

  const handleItemClick = (item: CatalogItem) => {
    if (item.isCategory) {
      if (onCategoryClick) {
        onCategoryClick(item.id);
      }
      return;
    }

    if (item.isUnderDevelopment) {
      setShowDevMessage(true);
      return;
    }
    
    if (item.redirectDirectly) {
      window.open(item.targetUrl, '_blank');
    } else {
      router.push(`/item?id=${item.id}`);
    }
  };

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  }[itemsPerRow as 1 | 2 | 3 | 4 | 5] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';

  return (
    <div className="w-full">
      <AnimatePresence>
        {showDevMessage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDevMessage(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="absolute top-0 right-0 p-6">
                <button 
                  onClick={() => setShowDevMessage(false)}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-yellow-400 rounded-[2rem] flex items-center justify-center text-slate-900 shadow-xl shadow-yellow-200 animate-pulse">
                  <AlertCircle size={48} strokeWidth={2.5} />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {lang === 'ka' ? 'მუშავდება' : 'Under Development'}
                  </h3>
                  <p className="text-lg font-bold text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                    {lang === 'ka' 
                      ? 'ეს სერვისი მალე დაემატება, ბოდიშს გიხდით შეფერხებისთვის' 
                      : 'This service will be added soon. We apologize for any inconvenience.'}
                  </p>
                </div>

                <button 
                  onClick={() => setShowDevMessage(false)}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-lg transition-transform active:scale-95 shadow-xl"
                >
                  {lang === 'ka' ? 'გასაგებია' : 'Understand'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={`grid ${gridColsClass} gap-6 md:gap-8`}>
        {items.sort((a, b) => (a.order || 0) - (b.order || 0)).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleItemClick(item)}
            className="group relative cursor-pointer"
          >
            <div className="relative aspect-[4/5] rounded-[2.2rem] overflow-hidden bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-800 shadow-xl transition-all duration-500 overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={lang === 'ka' ? item.titleKa : item.titleEn}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                referrerPolicy="no-referrer"
              />
              
              {/* Development Overlay */}
              {item.isUnderDevelopment && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-md border border-white">
                    {lang === 'ka' ? 'მუშავდება' : 'In Progress'}
                  </div>
                </div>
              )}

              {/* Title Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-5 transition-transform duration-500">
                <h3 
                  className="font-black text-xl md:text-2xl leading-none mb-1 group-hover:mb-2 transition-all"
                  style={{ color: item.titleColor || settings.titleColor || '#f59e0b' }} // Use global titleColor as fallback
                >
                  {lang === 'ka' ? item.titleKa : item.titleEn}
                </h3>
                <p 
                  className="text-xs font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ color: settings.textColor || '#cbd5e1' }} // default to a light color for overlay
                >
                  {lang === 'ka' ? item.descriptionKa : item.descriptionEn}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
