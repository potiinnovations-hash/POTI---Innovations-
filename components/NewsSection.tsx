'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import Image from 'next/image';
import { ExternalLink, Calendar, ArrowRight, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  titleKa: string;
  titleEn: string;
  contentKa: string;
  contentEn: string;
  imageUrl: string;
  createdAt: string;
  sourceUrl?: string;
  relatedItemId?: string;
}

interface NewsSectionProps {
  lang: 'ka' | 'en';
}

export default function NewsSection({ lang }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(3));
    const unsubscribeNews = onSnapshot(
      q,
      (snap) => {
        const newsData = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as NewsItem[];
        setNews(newsData);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, 'news');
      }
    );

    return () => unsubscribeNews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (news.length === 0) return null;

  return (
    <section className="relative py-16 px-4 container mx-auto border-t border-blue-50 dark:border-slate-900/60" id="news-section">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-blue-950 dark:text-white tracking-tight">
            {lang === 'ka' ? 'ბოლო სიახლეები' : 'Latest News'}
          </h2>
        </div>
        <div className="flex gap-3">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black text-sm rounded-2xl border border-blue-100/60 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {lang === 'ka' ? 'ყველა სიახლე' : 'All News'}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            key={item.id}
            whileTap={{ scale: 0.995 }}
            onClick={() => {
              if (item.sourceUrl) window.open(item.sourceUrl, '_blank');
            }}
            className={`group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-blue-50 dark:border-slate-800 flex flex-col justify-between ${item.sourceUrl ? 'cursor-pointer' : ''}`}
          >
            <div>
              <div className="relative aspect-video overflow-hidden">
                <Image 
                  src={item.imageUrl} 
                  alt={lang === 'ka' ? item.titleKa : item.titleEn} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <Calendar size={12} />
                    {new Date(item.createdAt).toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US')}
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h2 className="text-xl md:text-2xl font-black mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {lang === 'ka' ? item.titleKa : item.titleEn}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-3 leading-relaxed">
                  {lang === 'ka' ? item.contentKa : item.contentEn}
                </p>
              </div>
            </div>
            
            <div className="px-8 pb-8">
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                {item.sourceUrl ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(item.sourceUrl, '_blank');
                    }}
                    className="flex items-center gap-2 text-sm font-black text-blue-600 dark:text-blue-400 hover:gap-3 transition-all bg-transparent border-none p-0 cursor-pointer"
                  >
                    {lang === 'ka' ? 'სრულად ნახვა' : 'Read Full'}
                    <ExternalLink size={16} />
                  </button>
                ) : (
                  <div className="text-sm font-black text-slate-300 dark:text-slate-700">
                    {lang === 'ka' ? 'დეტალები არ არის' : 'No details'}
                  </div>
                )}
                {item.relatedItemId && (
                  <Link 
                    href={`/item?id=${item.relatedItemId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <ArrowRight size={20} />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
