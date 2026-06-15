'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, AlignLeft, ExternalLink, ArrowRight
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string; // ISO string or date
  end: string;
  allDay?: boolean;
  link?: string;
}

interface ActivityCalendarProps {
  lang: 'ka' | 'en';
  showTitle?: boolean;
}

export default function ActivityCalendar({ lang, showTitle = true }: ActivityCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to public calendar events
  useEffect(() => {
    const unsubscribeEvents = onSnapshot(
      doc(db, 'settings', 'events'),
      (snapshot) => {
        if (snapshot.exists() && snapshot.data().list) {
          const fetchedEvents = snapshot.data().list;
          setEvents(fetchedEvents);

          if (fetchedEvents.length > 0) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const upcoming = fetchedEvents
              .filter((e: any) => e?.start)
              .map((e: any) => ({ ...e, parsedDate: new Date(e.start) }))
              .filter((e: any) => !isNaN(e.parsedDate.getTime()))
              .filter((e: any) => e.parsedDate >= now)
              .sort((a: any, b: any) => a.parsedDate.getTime() - b.parsedDate.getTime());

            if (upcoming.length > 0) {
              setSelectedEvent(upcoming[0]);
              setSelectedDate(new Date(upcoming[0].start));
              setCurrentDate(new Date(upcoming[0].start));
            } else {
              const sorted = [...fetchedEvents]
                .filter((e: any) => e?.start)
                .map((e: any) => ({ ...e, parsedDate: new Date(e.start) }))
                .filter((e: any) => !isNaN(e.parsedDate.getTime()))
                .sort((a: any, b: any) => a.parsedDate.getTime() - b.parsedDate.getTime());
              if (sorted.length > 0) {
                setSelectedEvent(sorted[0]);
                setSelectedDate(new Date(sorted[0].start));
                setCurrentDate(new Date(sorted[0].start));
              }
            }
          }
        }
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.GET, 'settings/events');
      }
    );

    return () => unsubscribeEvents();
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    // Map so that Monday is 0 and Sunday is 6
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getSafeDate = (d: any): Date => {
    if (!d) return new Date();
    const parsed = d instanceof Date ? d : new Date(d);
    return (!isNaN(parsed.getTime())) ? parsed : new Date();
  };

  const getEventsForDay = (day: Date) => {
    if (!day || isNaN(day.getTime())) return [];
    return events.filter(e => {
      if (!e?.start) return false;

      if (typeof e.start === 'string' && e.start.length === 10) {
        const [y, m, d] = e.start.split('-').map(Number);
        return y === day.getFullYear() && (m - 1) === day.getMonth() && d === day.getDate();
      }

      const eStart = new Date(e.start);
      if (isNaN(eStart.getTime())) return false;
      return eStart.getFullYear() === day.getFullYear() &&
             eStart.getMonth() === day.getMonth() &&
             eStart.getDate() === day.getDate();
    });
  };

  const getNextPlannedEvent = () => {
    if (!events || events.length === 0) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sortedEvents = [...events]
      .filter(e => e?.start)
      .map(e => ({ ...e, parsedDate: new Date(e.start) }))
      .filter(e => !isNaN(e.parsedDate.getTime()))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    const upcoming = sortedEvents.filter(e => e.parsedDate >= now);
    if (upcoming.length > 0) {
      return upcoming[0];
    }
    return sortedEvents[0] || null;
  };

  const nextPlanned = getNextPlannedEvent();
  const activeDate = getSafeDate(selectedDate || (nextPlanned ? nextPlanned.parsedDate : null));
  const activeEvents = getEventsForDay(activeDate);

  const monthNamesKa = [
    'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
    'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNamesKa = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'];
  const weekdayNamesEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthLabel = lang === 'ka' ? monthNamesKa[month] : monthNamesEn[month];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const calendarDays: { dayNum: number | null; dateObj: Date | null }[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ dayNum: null, dateObj: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      dayNum: d,
      dateObj: new Date(year, month, d)
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="relative py-16 px-4 container mx-auto border-t border-blue-50 dark:border-slate-900/60" id="calendar-section">
      {showTitle && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-blue-950 dark:text-white tracking-tight">
              {lang === 'ka' ? 'აქტივობების კალენდარი' : 'Activity Calendar'}
            </h2>
          </div>
          <div className="flex gap-3">
            <Link
              href="/cal"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black text-sm rounded-2xl border border-blue-100/60 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {lang === 'ka' ? 'კალენდარზე გადასვლა' : 'Go to Full Calendar'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar main panel */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-blue-950 dark:text-white uppercase tracking-tight">
              {monthLabel} {year}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
            {(lang === 'ka' ? weekdayNamesKa : weekdayNamesEn).map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          {/* Calendar Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, index) => {
              const isSelected = selectedDate && cell.dateObj && (
                selectedDate.toDateString() === cell.dateObj.toDateString()
              );
              
              const dayEvents = cell.dateObj ? getEventsForDay(cell.dateObj) : [];
              const hasEvents = dayEvents.length > 0;
              const isToday = cell.dateObj && cell.dateObj.toDateString() === new Date().toDateString();

              const cellClasses = !cell.dayNum
                ? 'bg-slate-50/20 dark:bg-slate-900/20 border-transparent pointer-events-none'
                : isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 z-10 pointer-events-auto cursor-pointer font-black scale-[1.02]'
                  : isToday
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-extrabold pointer-events-auto cursor-pointer border-2'
                    : hasEvents
                      ? 'bg-blue-50/10 dark:bg-blue-950/10 border-blue-500 dark:border-blue-400 border-2 text-blue-950 dark:text-blue-200 font-bold shadow-sm pointer-events-auto cursor-pointer'
                      : 'bg-white dark:bg-slate-900 border-slate-100/60 dark:border-slate-800/60 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300 pointer-events-auto cursor-pointer';

              return (
                <div
                  key={index}
                  className={`aspect-square relative rounded-xl flex flex-col items-center justify-center border transition-all ${cellClasses}`}
                  onClick={() => {
                    if (cell.dateObj) {
                      setSelectedDate(cell.dateObj);
                      if (hasEvents) {
                        setSelectedEvent(dayEvents[0]);
                      } else {
                        setSelectedEvent(null);
                      }
                    }
                  }}
                >
                  {cell.dayNum && (
                    <>
                      <span className="text-sm font-black">{cell.dayNum}</span>
                      {hasEvents && (
                        <span className={`absolute bottom-2 w-2 h-2 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-blue-500 animate-pulse'
                        }`} />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Sidebar detail */}
        <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-fit">
          <div>
            <h3 className="text-lg font-black text-blue-950 dark:text-white uppercase tracking-tight pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              {lang === 'ka' ? 'დეტალები' : 'Day Schedule'}
            </h3>

            <div className="text-xs font-black text-blue-800 dark:text-blue-300 pb-3 mb-4 border-b border-dashed border-slate-100 dark:border-slate-800 flex flex-col gap-0.5">
              <span className="uppercase text-[9px] text-slate-400 tracking-wider">
                {lang === 'ka' ? 'არჩეული თარიღი' : 'Selected Date'}
              </span>
              <span className="font-extrabold text-sm text-slate-700 dark:text-slate-200">
                {lang === 'ka' ? (() => {
                  const weekdaysKa = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
                  const monthsKa = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];
                  return `${weekdaysKa[activeDate.getDay()]}, ${activeDate.getDate()} ${monthsKa[activeDate.getMonth()]} ${activeDate.getFullYear()}`;
                })() : activeDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {activeEvents.length > 0 ? (
                <motion.div
                  key={activeDate.toDateString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 overflow-y-auto max-h-[420px] pr-1"
                >
                  {activeEvents.map((ev) => (
                    <div key={ev.id} className="space-y-3 pb-5 border-b border-slate-100 dark:border-slate-800/80 last:border-none last:pb-0">
                      <div>
                        <span className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] uppercase rounded-full mb-1">
                          {ev.allDay 
                            ? (lang === 'ka' ? 'მთელი დღე' : 'All Day') 
                            : `${(() => {
                                const parsed = new Date(ev.start);
                                return !isNaN(parsed.getTime()) ? parsed.toLocaleTimeString(lang === 'ka' ? 'ka-GE' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '';
                              })()}`}
                        </span>
                        <h4 className="text-base font-black text-blue-950 dark:text-white leading-snug">
                          {ev.title}
                        </h4>
                      </div>

                      {ev.location && (
                        <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin size={14} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                          <span>{ev.location}</span>
                        </div>
                      )}

                      {ev.description && (
                        <div className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100/80 dark:border-slate-800">
                          <AlignLeft size={14} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                          <p className="whitespace-pre-line leading-relaxed">{ev.description}</p>
                        </div>
                      )}

                      {ev.link && (
                        <a 
                          href={ev.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full p-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 rounded-2xl font-black text-xs transition-colors"
                        >
                          <ExternalLink size={14} />
                          {lang === 'ka' ? 'სრული ინფორმაცია იხილეთ აქ' : 'View Full Details Here'}
                        </a>
                      )}
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="no-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2"
                >
                  <div className="w-12 h-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center mx-auto">
                    <Clock size={20} />
                  </div>
                  <p className="text-xs font-bold leading-normal">
                    {lang === 'ka' 
                      ? 'ამ დღეს ღონისძიებები დაგეგმილი არ არის' 
                      : 'No events scheduled for this day'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
