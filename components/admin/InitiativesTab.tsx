'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Image as ImageIcon, Sparkles, ChevronUp, ChevronDown, 
  ExternalLink, Briefcase, Award, Flame, BookOpen, Calendar, Tag, 
  AlertCircle, Info, Sparkles as SparklesIcon, Clock, HelpCircle, UserPlus, 
  MessageSquare, Globe
} from 'lucide-react';
import Image from 'next/image';

const iconOptions = [
  { name: 'Briefcase', label: 'Briefcase' },
  { name: 'Award', label: 'Award' },
  { name: 'Flame', label: 'Flame' },
  { name: 'BookOpen', label: 'BookOpen' },
  { name: 'Calendar', label: 'Calendar' },
  { name: 'Tag', label: 'Tag' },
  { name: 'AlertCircle', label: 'Alert' },
  { name: 'Info', label: 'Info' },
  { name: 'Sparkles', label: 'Sparkles' },
  { name: 'Clock', label: 'Clock' },
  { name: 'HelpCircle', label: 'Help' },
  { name: 'UserPlus', label: 'User' },
  { name: 'MessageSquare', label: 'Chat' },
  { name: 'Globe', label: 'Globe' }
];

const colorOptions = [
  { value: 'from-emerald-500 to-teal-600', label: 'Emerald Teal' },
  { value: 'from-blue-500 to-indigo-600', label: 'Royal Blue' },
  { value: 'from-amber-500 to-orange-600', label: 'Sunset Amber' },
  { value: 'from-rose-500 to-red-600', label: 'Crimson Rose' },
  { value: 'from-purple-500 to-pink-600', label: 'Purple Dream' },
  { value: 'from-sky-400 to-blue-600', label: 'Sky Breeze' },
  { value: 'from-slate-700 to-slate-900', label: 'Dark Charcoal' }
];

interface InitiativesTabProps {
  initiatives: any[];
  categories: any[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  translatingId: string | null;
  handleAddInitiative: () => void;
  handleDeleteInitiative: (id: string, e?: React.MouseEvent) => void;
  handleUpdateInitiative: (id: string, data: any) => void;
  handleTranslate: (id: string, text: string, field: string, collection: 'initiatives') => void;
  handleImageUpload: (file: File) => Promise<string>;
}

export const InitiativesTab = ({
  initiatives,
  categories,
  editingId,
  setEditingId,
  confirmDeleteId,
  setConfirmDeleteId,
  translatingId,
  handleAddInitiative,
  handleDeleteInitiative,
  handleUpdateInitiative,
  handleTranslate,
  handleImageUpload
}: InitiativesTabProps) => {

  const handleMoveInitiative = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= initiatives.length) return;

    const currentItem = initiatives[index];
    const targetItem = initiatives[targetIndex];

    const currentOrder = currentItem.order ?? index;
    const targetOrder = targetItem.order ?? targetIndex;

    let newCurrentOrder = targetOrder;
    let newTargetOrder = currentOrder;
    if (newCurrentOrder === newTargetOrder) {
      if (direction === 'up') {
        newCurrentOrder = targetOrder - 1;
      } else {
        newCurrentOrder = targetOrder + 1;
      }
    }

    handleUpdateInitiative(currentItem.id, { order: newCurrentOrder });
    handleUpdateInitiative(targetItem.id, { order: newTargetOrder });
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">პროექტები და აქტივობები</h2>
          <p className="text-slate-500 font-bold text-lg">მართეთ ქალაქში მიმდინარე ინოვაციები, გამოწვევები, გრანტები და პროგრამები</p>
        </div>
        <button 
          onClick={handleAddInitiative}
          className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 text-sm cursor-pointer"
        >
          <Plus size={20} /> ახალი პოსტი
        </button>
      </header>

      <div className="grid gap-6">
        {initiatives.map((item, index) => {
          // Find Category name
          let catName = 'ზოგადი / სხვა';
          if (item.categoryId) {
            const matchedCategory = categories.find(c => c.id === item.categoryId);
            if (matchedCategory) {
              catName = matchedCategory.titleKa;
            }
          } else if (item.tag) {
            catName = item.tag === 'projects' ? 'პროექტები' : item.tag === 'grants' ? 'გრანტები' : item.tag === 'challenges' ? 'გამოწვევები' : 'ინფორმაცია';
          }

          const hasGradient = item.color || 'from-emerald-500 to-teal-600';

          return (
            <motion.div 
              layout
              key={item.id} 
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all"
            >
              {/* Card Header (Collapsed) */}
              <div className="p-6 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  {/* Order Selector Arrows */}
                  <div className="flex flex-col gap-1 flex-shrink-0 bg-slate-50 p-1 rounded-2xl border border-slate-100/80">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveInitiative(index, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-all cursor-pointer active:scale-90"
                      title="Move Up"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveInitiative(index, 'down');
                      }}
                      disabled={index === initiatives.length - 1}
                      className="p-1 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-all cursor-pointer active:scale-90"
                      title="Move Down"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className={`relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner border border-slate-100/60`}>
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className={`absolute inset-0 bg-gradient-to-br ${hasGradient}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 truncate">{item.titleKa || 'Untitled Initiative'}</h3>
                    <div className="text-slate-400 text-xs font-bold truncate flex items-center gap-1.5 mt-1">
                      <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">{catName}</span>
                      <span className="text-slate-300">|</span>
                      <span>{item.titleEn || '(No English Title)'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                    className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${editingId === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' : 'bg-slate-100 text-slate-600 hover:bg-blue-50'}`}
                  >
                    {editingId === item.id ? 'დახურვა' : 'ჩასწორება'}
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirmDeleteId === item.id) {
                        handleDeleteInitiative(item.id);
                      } else {
                        setConfirmDeleteId(item.id);
                      }
                    }}
                    onMouseLeave={() => setConfirmDeleteId(null)}
                    className={`relative z-10 p-4 rounded-2xl transition-all active:scale-95 group cursor-pointer border ${confirmDeleteId === item.id ? 'bg-red-500 text-white border-red-600 px-6' : 'text-red-500 hover:bg-red-50 border-transparent hover:border-red-100'}`}
                  >
                    {confirmDeleteId === item.id ? (
                      <span className="text-xs font-black uppercase tracking-tight">ნამდვილად?</span>
                    ) : (
                      <Trash2 size={24} className="group-hover:scale-110 transition-transform pointer-events-none" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Detail (Expanded for editing) */}
              <AnimatePresence>
                {editingId === item.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-10"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Left Column: Media & Georgian Content */}
                      <div className="space-y-6">
                        {/* Image Uploader */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">გარეკანი / სურათი</label>
                          <div className="relative aspect-video rounded-3xl bg-slate-200 overflow-hidden group shadow-md border-2 border-white shadow-slate-100">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className={`absolute inset-0 bg-gradient-to-br ${hasGradient} flex items-center justify-center p-4 text-center text-white`}>
                                <div className="space-y-2">
                                  <ImageIcon className="mx-auto text-white/80" size={36} />
                                  <span className="text-xs font-black uppercase tracking-wider block">სურათის ატვირთვა</span>
                                </div>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const base64 = await handleImageUpload(file);
                                    handleUpdateInitiative(item.id, { imageUrl: base64 });
                                  } catch (err) {
                                    console.error("Initiative image upload failed:", err);
                                  }
                                }
                              }}
                            />
                            {item.imageUrl && (
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <ImageIcon className="text-white mb-2" size={32} />
                                <span className="text-white text-xs font-black uppercase tracking-widest">შეცვლა</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title (KA) */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">სათაური (KA)</label>
                          <input 
                            className="w-full bg-white border-none p-4 rounded-2xl text-lg font-black text-slate-900 shadow-sm"
                            value={item.titleKa || ''}
                            onChange={(e) => handleUpdateInitiative(item.id, { titleKa: e.target.value })}
                            placeholder="მაგ: მწვანე ფოთი 2026"
                          />
                        </div>

                        {/* Short Description (KA) */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">მოკლე აღწერა (KA)</label>
                          <textarea 
                            className="w-full bg-white border-none p-4 rounded-2xl text-sm font-semibold text-slate-700 h-24 resize-none shadow-sm"
                            value={item.descKa || ''}
                            onChange={(e) => handleUpdateInitiative(item.id, { descKa: e.target.value })}
                            placeholder="მოკლე შეჯამება, რომელიც გამოჩნდება მთავარ გვერდზე"
                          />
                        </div>

                        {/* Full Description (KA) */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">სრული ინფორმაცია (KA)</label>
                          <textarea 
                            className="w-full bg-white border-none p-4 rounded-2xl text-sm font-medium text-slate-700 h-48 resize-none shadow-sm"
                            value={item.fullDetailsKa || ''}
                            onChange={(e) => handleUpdateInitiative(item.id, { fullDetailsKa: e.target.value })}
                            placeholder="ვრცელი ტექსტი, რომელიც გამოჩნდება დეტალურ გვერდზე"
                          />
                        </div>
                      </div>

                      {/* Right Column: Style Options, CTA & English Content */}
                      <div className="space-y-6">
                        {/* Styling controls (Gradients & Icons) */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Gradient Choice */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ვიზუალური გრადიენტი</label>
                            <select 
                              className="w-full bg-slate-50 border-none p-3.5 rounded-xl font-bold text-slate-900 shadow-inner cursor-pointer"
                              value={item.color || 'from-emerald-500 to-teal-600'}
                              onChange={(e) => handleUpdateInitiative(item.id, { color: e.target.value })}
                            >
                              {colorOptions.map(col => (
                                <option key={col.value} value={col.value}>{col.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Icon picker */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ლოგოს ხატულა (Icon)</label>
                            <select 
                              className="w-full bg-slate-50 border-none p-3.5 rounded-xl font-bold text-slate-900 shadow-inner cursor-pointer"
                              value={item.icon || 'Briefcase'}
                              onChange={(e) => handleUpdateInitiative(item.id, { icon: e.target.value })}
                            >
                              {iconOptions.map(opt => (
                                <option key={opt.name} value={opt.name}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Category list */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">კატეგორიასთან კავშირი</label>
                          <select 
                            className="w-full bg-white border-none p-4 rounded-2xl font-bold text-slate-900 shadow-sm appearance-none cursor-pointer"
                            value={item.categoryId || ''}
                            onChange={(e) => handleUpdateInitiative(item.id, { categoryId: e.target.value })}
                          >
                            <option value="">ზოგადი / კატეგორიის გარეშე</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.titleKa}</option>
                            ))}
                          </select>
                        </div>

                        {/* Custom CTA options */}
                        <div className="bg-slate-100/40 p-6 rounded-[2rem] border border-slate-100 shadow-inner space-y-4">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">საქმიანობის ღილაკი (CTA Button Options)</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">ღილაკის ტექსტი (KA)</label>
                              <input 
                                className="w-full bg-white border-none p-3 rounded-xl font-bold text-slate-800 text-xs shadow-sm"
                                value={item.ctaTextKa || ''}
                                onChange={(e) => handleUpdateInitiative(item.id, { ctaTextKa: e.target.value })}
                                placeholder="მაგ: მონაწილეობის მიღება"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">TITLE (EN)</label>
                                <button 
                                  onClick={() => handleTranslate(item.id, item.ctaTextKa, 'ctaTextEn', 'initiatives')}
                                  disabled={translatingId === item.id}
                                  className="text-[9px] font-black text-blue-600 hover:underline disabled:opacity-40"
                                >
                                  AI თარგმნა
                                </button>
                              </div>
                              <input 
                                className="w-full bg-white border-none p-3 rounded-xl font-bold text-slate-800 text-xs shadow-sm"
                                value={item.ctaTextEn || ''}
                                onChange={(e) => handleUpdateInitiative(item.id, { ctaTextEn: e.target.value })}
                                placeholder="Sign Up / Join"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">ღილაკის ბმული (CTA LinkURL)</label>
                              <input 
                                className="w-full bg-white border-none p-3 rounded-xl font-bold text-slate-800 text-xs shadow-sm"
                                value={item.ctaUrl || ''}
                                onChange={(e) => handleUpdateInitiative(item.id, { ctaUrl: e.target.value })}
                                placeholder="https://forms.gle/..."
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">ღილაკის ხატულა (CTA Icon)</label>
                              <select 
                                className="w-full bg-white border-none p-3 rounded-xl font-bold text-slate-850 text-xs shadow-sm cursor-pointer"
                                value={item.ctaIcon || 'ExternalLink'}
                                onChange={(e) => handleUpdateInitiative(item.id, { ctaIcon: e.target.value })}
                              >
                                <option value="ExternalLink">ყველა / External Link</option>
                                <option value="UserPlus">რეგისტრაცია / User Plus</option>
                                <option value="Calendar">კალენდარი / Calendar</option>
                                <option value="Globe">ვებსაიტი / Globe</option>
                                <option value="Info">ინფო / Info</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* English translation section */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">ინგლისური ვერსია (English Version)</h4>
                            <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">ENG</span>
                          </div>

                          {/* Title (EN) */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">TITLE (EN)</label>
                              <button 
                                onClick={() => handleTranslate(item.id, item.titleKa, 'titleEn', 'initiatives')}
                                disabled={translatingId === item.id || !item.titleKa}
                                className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-40"
                              >
                                <Sparkles size={11} /> AI თარგმნა
                              </button>
                            </div>
                            <input 
                              className="w-full bg-slate-50 border-none p-3 rounded-xl font-bold text-slate-800 text-sm shadow-inner"
                              value={item.titleEn || ''}
                              onChange={(e) => handleUpdateInitiative(item.id, { titleEn: e.target.value })}
                              placeholder="English Title"
                            />
                          </div>

                          {/* Short Desc (EN) */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">SHORT DESC (EN)</label>
                              <button 
                                onClick={() => handleTranslate(item.id, item.descKa, 'descEn', 'initiatives')}
                                disabled={translatingId === item.id || !item.descKa}
                                className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-40"
                              >
                                <Sparkles size={11} /> AI თარგმნა
                              </button>
                            </div>
                            <textarea 
                              className="w-full bg-slate-50 border-none p-3 rounded-xl font-semibold text-slate-700 text-xs h-20 resize-none shadow-inner"
                              value={item.descEn || ''}
                              onChange={(e) => handleUpdateInitiative(item.id, { descEn: e.target.value })}
                              placeholder="English summary details..."
                            />
                          </div>

                          {/* Full Content (EN) */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">FULL DETAILS (EN)</label>
                              <button 
                                onClick={() => handleTranslate(item.id, item.fullDetailsKa, 'fullDetailsEn', 'initiatives')}
                                disabled={translatingId === item.id || !item.fullDetailsKa}
                                className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-40"
                              >
                                <Sparkles size={11} /> AI თარგმნა
                              </button>
                            </div>
                            <textarea 
                              className="w-full bg-slate-50 border-none p-3 rounded-xl font-medium text-slate-700 text-xs h-32 resize-none shadow-inner"
                              value={item.fullDetailsEn || ''}
                              onChange={(e) => handleUpdateInitiative(item.id, { fullDetailsEn: e.target.value })}
                              placeholder="English campaign details..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
