'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

export interface CatalogItem {
  id: string;
  titleKa: string;
  titleEn: string;
  imageUrl: string;
  targetUrl: string;
  descriptionKa?: string;
  descriptionEn?: string;
  order?: number;
  isUnderDevelopment?: boolean;
}

interface CatalogProps {
  items: CatalogItem[];
  lang: 'ka' | 'en';
  itemsPerRow?: number;
}

export const Catalog = ({ items, lang, itemsPerRow = 5 }: CatalogProps) => {
  const [showDevMessage, setShowDevMessage] = React.useState(false);

  const handleItemClick = (item: CatalogItem) => {
    if (item.isUnderDevelopment) {
      setShowDevMessage(true);
      return;
    }
    window.open(item.targetUrl, '_blank');
  };

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }[itemsPerRow as 1|2|3|4|5|6] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';

  return (
    <>
      <div className={`grid ${gridColsClass} gap-6`}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group relative h-[400px] rounded-2xl overflow-hidden shadow-xl cursor-pointer bg-blue-900"
            onClick={() => handleItemClick(item)}
          >
            {/* Banner Image */}
            <Image
              src={item.imageUrl}
              alt={lang === 'ka' ? item.titleKa : item.titleEn}
              fill
              className="object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500"
              referrerPolicy="no-referrer"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Under Development Badge */}
            {item.isUnderDevelopment && (
              <div className="absolute top-4 right-4 z-10">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-yellow-400 text-blue-950 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
                >
                  <span className="w-2 h-2 bg-blue-950 rounded-full animate-pulse" />
                  {lang === 'ka' ? 'მუშავდება' : 'Under Development'}
                </motion.div>
              </div>
            )}

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end transform transition-transform duration-500">
              <motion.h3
                className="text-2xl font-bold text-yellow-400 mb-2 drop-shadow-lg"
                layoutId={`title-${item.id}`}
              >
                {lang === 'ka' ? item.titleKa : item.titleEn}
              </motion.h3>

              <div className="overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-500 ease-in-out">
                <p className="text-white/90 text-sm mb-4 line-clamp-3">
                  {lang === 'ka' ? item.descriptionKa : item.descriptionEn}
                </p>
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm uppercase tracking-wider">
                  {lang === 'ka' ? 'გახსნა' : 'Open'} <ExternalLink size={14} />
                </div>
              </div>
            </div>

            {/* Highlight Border */}
            <div className="absolute inset-0 border-4 border-transparent group-hover:border-yellow-400/50 rounded-2xl transition-colors duration-500" />
          </motion.div>
        ))}
      </div>

      {/* Development Message Modal */}
      {showDevMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border-t-4 border-yellow-400"
          >
            <h4 className="text-xl font-bold text-blue-950 mb-4">
              {lang === 'ka' ? 'ინფორმაცია' : 'Information'}
            </h4>
            <p className="text-gray-700 leading-relaxed mb-6">
              {lang === 'ka' 
                ? 'ეს ფუნქცია დროებით მიუწვდომელია, ქალაქ ფოთის მდგრადი განვითარებისა და ინოვაციების სამსახურის ციფრული დეპარტამენდი მუშაობს, რომ ეს ფუნქცია მალე გააქტიურდეს. ბოდიშს გიხდით შეფერხებისთვის.'
                : 'This feature is temporarily unavailable. The Digital Department of the Poti Sustainable Development and Innovation Service is working to activate this feature soon. We apologize for the delay.'
              }
            </p>
            <button
              onClick={() => setShowDevMessage(false)}
              className="w-full bg-blue-950 text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors"
            >
              {lang === 'ka' ? 'გასაგებია' : 'Understood'}
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};
