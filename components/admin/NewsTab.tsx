'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Image as ImageIcon, Sparkles, ExternalLink, Facebook, RefreshCw
} from 'lucide-react';
import Image from 'next/image';

interface NewsTabProps {
  news: any[];
  catalogItems: any[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  translatingId: string | null;
  handleAddNews: () => void;
  handleDeleteNews: (id: string, e?: React.MouseEvent) => void;
  handleUpdateNews: (id: string, data: any) => void;
  handleTranslate: (id: string, text: string, field: any, collection: 'news') => void;
  handleImageUpload: (file: File) => Promise<string>;
}

export const NewsTab = ({
  news,
  catalogItems,
  editingId,
  setEditingId,
  confirmDeleteId,
  setConfirmDeleteId,
  translatingId,
  handleAddNews,
  handleDeleteNews,
  handleUpdateNews,
  handleTranslate,
  handleImageUpload
}: NewsTabProps) => {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<{ success: boolean; text: string } | null>(null);

  const handleFacebookSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const response = await fetch('/api/facebook-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual: true })
      });
      const data = await response.json();
      if (data.success) {
        setSyncStatus({ 
          success: true, 
          text: `წარმატებით დასრულდა! სინქრონიზირდა ${data.syncedCount || 0} ახალი პოსტი.` 
        });
      } else {
        setSyncStatus({ 
          success: false, 
          text: `შეცდომა სინქრონიზაციისას: ${data.error || 'უცნობი ხარვეზი'}` 
        });
      }
    } catch (err: any) {
      setSyncStatus({ 
        success: false, 
        text: `ქსელის შეცდომა: ${err.message || 'ვერ მოხერხდა კავშირი'}` 
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 8000);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">სიახლეები</h2>
          <p className="text-slate-500 font-bold text-lg">მართეთ ქალაქის სიახლეები და განახლებები</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {syncStatus && (
            <div className={`px-4 py-3 rounded-2xl text-xs font-black shadow-sm ${syncStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
              {syncStatus.text}
            </div>
          )}
          <button
            onClick={handleFacebookSync}
            disabled={isSyncing}
            className={`flex items-center gap-3 px-6 py-5 rounded-[2rem] font-black transition-all text-sm border shadow-sm ${isSyncing ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-100 hover:bg-slate-50'}`}
          >
            <Facebook size={18} className={isSyncing ? 'animate-pulse text-slate-400' : 'text-blue-600'} />
            {isSyncing ? 'სინქრონიზაცია...' : 'Facebook სინქრონიზაცია'}
            {isSyncing && <RefreshCw size={14} className="animate-spin ml-1" />}
          </button>
          <button 
            onClick={handleAddNews}
            className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 text-sm"
          >
            <Plus size={20} /> ახალი სიახლე
          </button>
        </div>
      </header>

      <div className="grid gap-6">
        {news.map((item) => (
          <motion.div 
            layout
            key={item.id} 
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all"
          >
            <div className="p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                  <Image src={item.imageUrl} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 truncate">{item.titleKa}</h3>
                  <p className="text-slate-400 text-sm font-bold truncate">
                    {item.relatedItemId ? (catalogItems.find(c => c.id === item.relatedItemId)?.titleKa || 'Related Item') : 'ზოგადი სიახლე'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                  className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${editingId === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50'}`}
                >
                  {editingId === item.id ? 'დახურვა' : 'ჩასწორება'}
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirmDeleteId === item.id) {
                      handleDeleteNews(item.id);
                    } else {
                      setConfirmDeleteId(item.id);
                    }
                  }}
                  onMouseLeave={() => setConfirmDeleteId(null)}
                  className={`relative z-10 p-4 rounded-2xl transition-all active:scale-90 group cursor-pointer border ${confirmDeleteId === item.id ? 'bg-red-500 text-white border-red-600 px-6' : 'text-red-500 hover:bg-red-50 border-transparent hover:border-red-100'}`}
                >
                  {confirmDeleteId === item.id ? (
                    <span className="text-xs font-black uppercase tracking-tight">წაშლა?</span>
                  ) : (
                    <Trash2 size={24} className="group-hover:scale-110 transition-transform pointer-events-none" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {editingId === item.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100 bg-slate-50/50 p-10"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="relative aspect-video rounded-3xl bg-slate-200 overflow-hidden group">
                        <Image src={item.imageUrl} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const base64 = await handleImageUpload(file);
                                handleUpdateNews(item.id, { imageUrl: base64 });
                              } catch (err) {
                                console.error("News image upload failed:", err instanceof Error ? err.message : String(err));
                              }
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <ImageIcon className="text-white mb-2" size={32} />
                          <span className="text-white text-xs font-black uppercase tracking-widest">შეცვლა</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">სათაური (KA)</label>
                          <input 
                            className="w-full bg-white border-none p-4 rounded-2xl text-lg font-black text-slate-900 shadow-sm"
                            value={item.titleKa || ''}
                            onChange={(e) => handleUpdateNews(item.id, { titleKa: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">შინაარსი (KA)</label>
                          <textarea 
                            className="w-full bg-white border-none p-4 rounded-2xl text-sm font-medium text-slate-700 h-40 resize-none shadow-sm"
                            value={item.contentKa || ''}
                            onChange={(e) => handleUpdateNews(item.id, { contentKa: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-4 bg-white p-6 rounded-[2rem] shadow-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">სათაური (EN)</label>
                            <button 
                              onClick={() => handleTranslate(item.id, item.titleKa, 'titleEn', 'news')}
                              disabled={translatingId === item.id}
                              className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                            >
                              <Sparkles size={12} /> AI თარგმნა
                            </button>
                          </div>
                          <input 
                            className="w-full bg-slate-50 border-none p-3 rounded-xl font-bold text-slate-900 shadow-inner"
                            value={item.titleEn || ''}
                            onChange={(e) => handleUpdateNews(item.id, { titleEn: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">შინაარსი (EN)</label>
                            <button 
                              onClick={() => handleTranslate(item.id, item.contentKa, 'contentEn', 'news')}
                              disabled={translatingId === item.id}
                              className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                            >
                              <Sparkles size={12} /> AI თარგმნა
                            </button>
                          </div>
                          <textarea 
                            className="w-full bg-slate-50 border-none p-3 rounded-xl font-medium text-slate-700 h-32 resize-none shadow-sm"
                            value={item.contentEn || ''}
                            onChange={(e) => handleUpdateNews(item.id, { contentEn: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">დაკავშირებული ლოკაცია</label>
                          <select 
                            className="w-full bg-white border-none p-4 rounded-2xl font-bold text-slate-900 shadow-sm appearance-none cursor-pointer"
                            value={item.relatedItemId || ''}
                            onChange={(e) => handleUpdateNews(item.id, { relatedItemId: e.target.value })}
                          >
                            <option value="">ზოგადი სხვა</option>
                            {catalogItems.map(c => (
                              <option key={c.id} value={c.id}>{c.titleKa}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">წყაროს ლინკი (URL)</label>
                          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                              <ExternalLink size={18} />
                            </div>
                            <input 
                              className="flex-1 bg-transparent border-none p-2 font-bold text-slate-700 text-sm"
                              value={item.sourceUrl || ''}
                              onChange={(e) => handleUpdateNews(item.id, { sourceUrl: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        {/* Calendar Integration section */}
                        <div className="bg-slate-100/50 p-5 rounded-[2rem] border border-slate-200/50 space-y-4">
                          <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2">
                            <Sparkles size={14} className="text-blue-500" />
                            კალენდართან ინტეგრაცია
                          </h4>
                          
                          <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">კალენდარზე გამოჩენა</span>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={item.showOnCalendar || false}
                                onChange={(e) => handleUpdateNews(item.id, { showOnCalendar: e.target.checked })}
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <AnimatePresence initial={false}>
                            {(item.showOnCalendar) && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 overflow-hidden pt-2"
                              >
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ღონისძიების თარიღი</label>
                                  <input 
                                    type="date"
                                    required
                                    className="w-full bg-white border-none p-3.5 rounded-xl font-bold text-slate-900 shadow-sm text-sm"
                                    value={item.calendarDate || ''}
                                    onChange={(e) => handleUpdateNews(item.id, { calendarDate: e.target.value })}
                                  />
                                </div>

                                <div className="flex items-center justify-between px-1 pt-1">
                                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">კალენდრის გვერდზე გადამისამართება</span>
                                  <label className="relative inline-flex items-center cursor-pointer select-none">
                                    <input 
                                      type="checkbox" 
                                      className="sr-only peer"
                                      checked={item.linkToCalendarPage || false}
                                      onChange={(e) => handleUpdateNews(item.id, { linkToCalendarPage: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
