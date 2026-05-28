'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Save, Plus, Trash2, Edit, CalendarDays, Link as LinkIcon, Search, Info, CheckCircle, AlertCircle, X
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  allDay?: boolean;
  link?: string;
}

interface CalendarTabProps {
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
}

export const CalendarTab = ({ events, setEvents }: CalendarTabProps) => {
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states for adding/editing
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [link, setLink] = useState('');

  // Reset form helper
  const resetForm = () => {
    setIsEditing(null);
    setTitle('');
    setDescription('');
    setStartDate('');
    setLink('');
  };

  // Helper to force a timeout on hanging Firestore writes
  const writeWithTimeout = (docRef: any, data: any, timeoutMs = 25000) => {
    const writePromise = setDoc(docRef, data);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('მონაცემთა ბაზასთან კავშირი გაწყდა ან დრო ამოიწურა. გთხოვთ შეამოწმოთ ინტერნეტი და ადმინისტრატორის უფლებები.')), 
        timeoutMs
      )
    );
    return Promise.race([writePromise, timeoutPromise]);
  };

  // Save changes to Firestore
  const handleSaveChanges = async (updatedEventsList?: CalendarEvent[]) => {
    setSaveLoading(true);
    const listToSave = updatedEventsList || events;
    try {
      await writeWithTimeout(doc(db, 'settings', 'events'), {
        list: listToSave,
        lastSynced: new Date().toISOString()
      }, 25000);
      alert('ცვლილებები წარმატებით შეინახა ბაზაში!');
    } catch (err: any) {
      console.error('Error saving events list:', err instanceof Error ? err.message : String(err));
      alert(`ცვლილებების შენახვა ვერ მოხერხდა: ${err.message || 'უცნობი შეცდომა'}`);
    } finally {
      setSaveLoading(false);
    }
  };

  // Create or Update Event locally and save immediately
  const handleAddOrUpdateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !title.trim()) {
      alert('გთხოვთ შეავსოთ თარიღი და სათაური');
      return;
    }

    const eventData: CalendarEvent = {
      id: isEditing || Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      description: description.trim(),
      start: startDate,
      end: startDate,
      allDay: true,
      link: link.trim()
    };

    let updatedList: CalendarEvent[];
    if (isEditing) {
      updatedList = events.map(ev => ev.id === isEditing ? eventData : ev);
    } else {
      updatedList = [eventData, ...events];
    }

    setEvents(updatedList);
    resetForm();
    handleSaveChanges(updatedList);
  };

  // Delete event and save immediately
  const handleDeleteEvent = (id: string) => {
    if (!window.confirm('ნამდვილად გსურთ ამ ღონისძიების წაშლა?')) return;
    const updatedList = events.filter(ev => ev.id !== id);
    setEvents(updatedList);
    handleSaveChanges(updatedList);
  };

  // Fill form for editing
  const handleStartEdit = (ev: CalendarEvent) => {
    setIsEditing(ev.id);
    setTitle(ev.title);
    setDescription(ev.description || '');
    setStartDate(ev.start);
    setLink(ev.link || '');
    
    // Scroll smoothly to form
    const element = document.getElementById('event-editor-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getEventDateString = (startStr: string) => {
    if (!startStr) return '';
    try {
      const d = new Date(startStr);
      return d.toLocaleDateString('ka-GE', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return startStr;
    }
  };

  // Filtered list based on search
  const filteredEvents = events.filter(
    (ev) =>
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.start.includes(searchQuery)
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">კალენდარი</h2>
          <p className="text-slate-500 font-bold text-lg">ღონისძიებების დაგეგმვა და მექანიკური მართვა</p>
        </div>
        <button
          onClick={() => handleSaveChanges()}
          disabled={saveLoading}
          className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-black rounded-3xl transition-all shadow-xl shadow-green-100 self-start md:self-auto"
        >
          <Save size={18} />
          {saveLoading ? 'ინახება...' : 'მონაცემების სინქრონიზაცია'}
        </button>
      </header>

      {/* Editor Form for additions or updates */}
      <div id="event-editor-form" className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {isEditing ? 'ღონისძიების რედაქტირება' : 'ახალი ღონისძიების დამატება'}
            </h3>
            <p className="text-slate-500 font-medium text-xs">
              შეავსეთ მარტივი ველები კალენდარში გამოსაჩენად
            </p>
          </div>
        </div>

        <form onSubmit={handleAddOrUpdateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
              როდის (თარიღი)
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
              სათაური
            </label>
            <input
              type="text"
              required
              placeholder="მაგ: ფოთის საზღვაო ფესტივალი"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
              მცირე აღწერა
            </label>
            <textarea
              placeholder="დაწერეთ მოკლე დეტალები ღონისძიების შესახებ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400 resize-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">
              ლინკი (დეტალური ინფორმაციისთვის)
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="url"
                placeholder="https://example.com/details"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-sm rounded-xl transition-all"
              >
                <X size={16} />
                გაუქმება
              </button>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-md active:scale-[0.98]"
            >
              {isEditing ? <CheckCircle size={18} /> : <Plus size={18} />}
              {isEditing ? 'ცვლილების დასრულება' : 'დამატება და შენახვა'}
            </button>
          </div>
        </form>
      </div>

      {/* Events List Box */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h3 className="text-2xl font-black text-slate-900">დაგეგმილი დღეები ({filteredEvents.length})</h3>
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="მოძებნე დღე..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-slate-50 text-slate-400 border border-dashed border-slate-200 space-y-1">
            <Info className="mx-auto text-slate-300" size={32} />
            <p className="font-bold">ღონისძიებები არ მოიძებნა</p>
            <p className="text-xs">შექმენით ახალი ღონისძიება ზემოთ მოცემული ფორმით</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-100 rounded-3xl">
            <div className="divide-y divide-slate-100">
              {filteredEvents.map((ev) => (
                <div key={ev.id} className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-6 items-start justify-between">
                  <div className="space-y-2 max-w-xl flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 font-extrabold text-[10px] uppercase rounded-full">
                        {getEventDateString(ev.start)}
                      </span>
                      {ev.link && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <LinkIcon size={10} /> ლინკით
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-black text-slate-900 leading-snug">{ev.title}</h4>
                    {ev.description && (
                      <p className="text-xs text-slate-500 font-medium whitespace-pre-line leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                    {ev.link && (
                      <div className="pt-1">
                        <a 
                          href={ev.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
                        >
                          {ev.link}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleStartEdit(ev)}
                      className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-all"
                      title="რედაქტირება"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all"
                      title="წაშლა"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
