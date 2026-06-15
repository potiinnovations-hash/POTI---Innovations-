'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Image as ImageIcon, MapPin, Calendar, 
  Phone, Facebook, Mail, Globe, Sparkles, ChevronUp, ChevronDown 
} from 'lucide-react';
import Image from 'next/image';
import InteractiveMap from '@/components/InteractiveMap';

interface CatalogTabProps {
  catalogItems: any[];
  categories: any[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editMode: 'KA' | 'EN';
  setEditMode: (mode: 'KA' | 'EN') => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  translatingId: string | null;
  handleAddCatalogItem: (isCategory?: boolean) => void;
  handleDeleteCatalogItem: (id: string, e?: React.MouseEvent) => void;
  handleUpdateCatalogItem: (id: string, data: any) => void;
  handleTranslate: (id: string, text: string, field: any) => void;
  handleImageUpload: (file: File) => Promise<string>;
}

export const CatalogTab = ({
  catalogItems,
  categories,
  editingId,
  setEditingId,
  editMode,
  setEditMode,
  confirmDeleteId,
  setConfirmDeleteId,
  translatingId,
  handleAddCatalogItem,
  handleDeleteCatalogItem,
  handleUpdateCatalogItem,
  handleTranslate,
  handleImageUpload
}: CatalogTabProps) => {

  const handleMoveCatalogItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= catalogItems.length) return;

    const currentItem = catalogItems[index];
    const targetItem = catalogItems[targetIndex];

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

    handleUpdateCatalogItem(currentItem.id, { order: newCurrentOrder });
    handleUpdateCatalogItem(targetItem.id, { order: newTargetOrder });
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">კატალოგი</h2>
          <p className="text-slate-500 font-bold text-lg">მართეთ ქალაქის ლოკაციები და სერვისები</p>
        </div>
        <button 
          onClick={() => handleAddCatalogItem(false)}
          className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95"
        >
          <Plus size={24} /> ახალი ლოკაცია
        </button>
      </header>

      <div className="grid gap-6">
        {catalogItems.map((item, index) => (
          <motion.div 
            layout
            key={item.id} 
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all"
          >
            {/* Collapsed Header */}
            <div className="p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                {/* Arrow Controls */}
                <div className="flex flex-col gap-1 flex-shrink-0 bg-slate-50 p-1 rounded-2xl border border-slate-100/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveCatalogItem(index, 'up');
                    }}
                    disabled={index === 0}
                    className="p-1 rounded-xl hover:bg-slate-205 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-all cursor-pointer active:scale-90"
                    title="Move Up"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveCatalogItem(index, 'down');
                    }}
                    disabled={index === catalogItems.length - 1}
                    className="p-1 rounded-xl hover:bg-slate-205 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-all cursor-pointer active:scale-90"
                    title="Move Down"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>

                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                  <Image src={item.imageUrl} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 truncate">
                    {item.titleKa}
                  </h3>
                  <div className="text-slate-400 text-sm font-bold truncate flex items-center gap-1.5 mt-1">
                    {item.isCategory ? (
                      <span className="text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">კატეგორია</span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">ლოკაცია</span>
                    )}
                    <span className="text-slate-300">|</span>
                    <span>{item.parentId ? `მშობელი: ${catalogItems.find(c => c.id === item.parentId)?.titleKa || 'წაშლილი'}` : 'მთავარ გვერდზე'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (editingId === item.id && editMode === 'KA') {
                      setEditingId(null);
                    } else {
                      setEditingId(item.id);
                      setEditMode('KA');
                    }
                  }}
                  className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${editingId === item.id && editMode === 'KA' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  ჩასწორება
                </button>
                <button 
                  onClick={() => {
                    if (editingId === item.id && editMode === 'EN') {
                      setEditingId(null);
                    } else {
                      setEditingId(item.id);
                      setEditMode('EN');
                    }
                  }}
                  className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${editingId === item.id && editMode === 'EN' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  ჩასწორება ENG
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirmDeleteId === item.id) {
                      handleDeleteCatalogItem(item.id);
                    } else {
                      setConfirmDeleteId(item.id);
                    }
                  }}
                  onMouseLeave={() => setConfirmDeleteId(null)}
                  className={`relative z-10 p-4 rounded-2xl transition-all active:scale-90 group cursor-pointer border ${confirmDeleteId === item.id ? 'bg-red-500 text-white border-red-600 px-6' : 'text-red-500 hover:bg-red-50 border-transparent hover:border-red-100'}`}
                >
                  {confirmDeleteId === item.id ? (
                    <span className="text-xs font-black uppercase tracking-tight">Confirm?</span>
                  ) : (
                    <Trash2 size={24} className="group-hover:scale-110 transition-transform pointer-events-none" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Edit View */}
            <AnimatePresence>
              {editingId === item.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="border-t border-slate-100 bg-slate-50/50"
                >
                  <div className="p-10">
                    {editMode === 'KA' ? (
                      /* GEORGIAN EDIT MODE */
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <div className="relative aspect-[16/10] rounded-[2rem] bg-slate-100 overflow-hidden group shadow-inner border-2 border-white shadow-xl">
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
                                    handleUpdateCatalogItem(item.id, { imageUrl: base64 });
                                  } catch (err) {
                                    console.error("Image upload failed:", err instanceof Error ? err.message : String(err));
                                  }
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                              <ImageIcon className="text-white mb-2" size={32} />
                              <span className="text-white text-xs font-black uppercase tracking-widest">სურათის შეცვლა</span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">სათაური (KA)</label>
                              <input 
                                className="w-full bg-white border-none p-4 rounded-2xl text-lg font-black text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                value={item.titleKa || ''}
                                onChange={(e) => handleUpdateCatalogItem(item.id, { titleKa: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">აღწერა (KA)</label>
                              <textarea 
                                className="w-full bg-white border-none p-4 rounded-2xl text-sm font-medium text-slate-700 h-32 resize-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={item.descriptionKa || ''}
                                onChange={(e) => handleUpdateCatalogItem(item.id, { descriptionKa: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ტიპი (Type)</label>
                              <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCatalogItem(item.id, { isCategory: false })}
                                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${!item.isCategory ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
                                >
                                  ლოკაცია
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCatalogItem(item.id, { isCategory: true })}
                                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${item.isCategory ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
                                >
                                  კატეგორია
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">მშობელი კატეგორია (Parent)</label>
                              <select 
                                className="w-full bg-white dark:bg-slate-950 border-none p-4 rounded-2xl font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={item.parentId || ''}
                                onChange={(e) => handleUpdateCatalogItem(item.id, { parentId: e.target.value })}
                              >
                                <option value="">მთავარ გვერდზე (Root)</option>
                                {categories.filter((c: any) => c.id !== item.id).map((parent: any) => (
                                  <option key={parent.id} value={parent.id}>{parent.titleKa}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ფასი / ტარიფი</label>
                              <input 
                                className="w-full bg-white border-none p-4 rounded-2xl font-bold text-slate-900 shadow-sm animate-fadeIn"
                                value={item.price || ''}
                                onChange={(e) => handleUpdateCatalogItem(item.id, { price: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">სორტირების რიგი</label>
                              <input 
                                type="number"
                                className="w-full bg-white border-none p-4 rounded-2xl font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                                value={item.order ?? 0}
                                onChange={(e) => handleUpdateCatalogItem(item.id, { order: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ლოკაცია რუკაზე (კოორდინატები)</label>
                                <button 
                                  type="button"
                                  className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer" 
                                  onClick={() => {
                                    handleUpdateCatalogItem(item.id, { location: '42.1462,41.6720' });
                                  }}
                                >
                                  ფოთის ცენტრი
                                </button>
                              </div>
                              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                  <MapPin size={20} />
                                </div>
                                <input 
                                  className="flex-1 bg-transparent border-none p-2 font-bold text-slate-700 text-sm"
                                  value={item.location || ''}
                                  onChange={(e) => handleUpdateCatalogItem(item.id, { location: e.target.value })}
                                  placeholder="მაგ: 42.1462, 41.6720"
                                />
                              </div>
                              
                              <div className="mt-2 w-full rounded-[2rem] overflow-hidden border border-slate-150">
                                <InteractiveMap 
                                  items={[]}
                                  lang="ka"
                                  height="220px"
                                  adminMode={true}
                                  initialLat={item.location && item.location.includes(',') ? parseFloat(item.location.split(',')[0]) : 42.1462}
                                  initialLng={item.location && item.location.includes(',') ? parseFloat(item.location.split(',')[1]) : 41.6720}
                                  onCoordinatesSelect={(lat, lng) => {
                                    handleUpdateCatalogItem(item.id, { location: `${lat.toFixed(5)},${lng.toFixed(5)}` });
                                  }}
                                />
                                <p className="text-[10px] text-slate-400 font-bold px-2 py-1 text-center bg-white border-t border-slate-100">
                                  💡 დააკლიკეთ რუკაზე ზუსტი ადგილმდებარეობის ასარჩევად
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">მისამართი (KA)</label>
                              <input 
                                className="w-full bg-white border-none p-4 rounded-2xl shadow-sm font-bold text-slate-700 text-sm"
                                value={item.addressKa || ''}
                                onChange={(e) => handleUpdateCatalogItem(item.id, { addressKa: e.target.value })}
                                placeholder="მაგ: ფალიაშვილის 12"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                  <Calendar size={18} />
                                </div>
                                <input 
                                  className="flex-1 bg-transparent border-none p-2 font-bold text-slate-700 text-sm"
                                  value={item.workHours || ''}
                                  onChange={(e) => handleUpdateCatalogItem(item.id, { workHours: e.target.value })}
                                  placeholder="სამუშაო საათები"
                                />
                              </div>
                              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                  <Phone size={18} />
                                </div>
                                <input 
                                  className="flex-1 bg-transparent border-none p-2 font-bold text-slate-700 text-sm"
                                  value={item.phone || ''}
                                  onChange={(e) => handleUpdateCatalogItem(item.id, { phone: e.target.value })}
                                  placeholder="ტელეფონი"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                  <Facebook size={24} />
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Facebook URL</label>
                                    <input 
                                      className="w-full bg-slate-50 border-none px-3 py-2 rounded-xl font-bold text-slate-700 text-xs"
                                      value={item.facebookUrl || ''}
                                      onChange={(e) => handleUpdateCatalogItem(item.id, { facebookUrl: e.target.value })}
                                      placeholder="https://facebook.com/..."
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">სახელი</label>
                                    <input 
                                      className="w-full bg-slate-50 border-none px-3 py-2 rounded-xl font-bold text-slate-700 text-xs"
                                      value={item.facebookName || ''}
                                      onChange={(e) => handleUpdateCatalogItem(item.id, { facebookName: e.target.value })}
                                      placeholder="Poti Page"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 pt-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">ინდივიდუალური ჰეშთეგი</label>
                                  <input 
                                    className="w-full bg-slate-50 border-none px-3 py-2 rounded-xl font-bold text-slate-700 text-xs"
                                    value={item.facebookPostHashtag || ''}
                                    onChange={(e) => handleUpdateCatalogItem(item.id, { facebookPostHashtag: e.target.value })}
                                    placeholder="მაგ: #potige"
                                  />
                                </div>
                                <div className="flex items-center text-[10px] text-slate-400 font-bold bg-slate-50/50 px-3 rounded-xl">
                                  💡 თუ ცარიელია, გამოიყენებს პარამეტრების გლობალურ ჰეშთეგს.
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm">
                              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                                <Mail size={20} />
                              </div>
                              <input 
                                className="flex-1 bg-transparent border-none p-2 font-bold text-slate-700 text-sm"
                                value={item.email || ''}
                                onChange={(e) => handleUpdateCatalogItem(item.id, { email: e.target.value })}
                                placeholder="Email"
                              />
                            </div>

                            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm">
                              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                                <Globe size={20} />
                              </div>
                              <input 
                                className="flex-1 bg-transparent border-none p-2 font-bold text-slate-700 text-sm"
                                value={item.targetUrl || ''}
                                onChange={(e) => handleUpdateCatalogItem(item.id, { targetUrl: e.target.value })}
                                placeholder="ვებსაიტის ლინკი"
                              />
                            </div>

                            <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">მუშავდება?</span>
                                <div 
                                  onClick={() => handleUpdateCatalogItem(item.id, { isUnderDevelopment: !item.isUnderDevelopment })}
                                  className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${item.isUnderDevelopment ? 'bg-blue-600' : 'bg-slate-200'}`}
                                >
                                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${item.isUnderDevelopment ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ვებსაიტი?</span>
                                <div 
                                  onClick={() => handleUpdateCatalogItem(item.id, { showWebsite: !item.showWebsite })}
                                  className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${item.showWebsite ? 'bg-blue-600' : 'bg-slate-200'}`}
                                >
                                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${item.showWebsite ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ENGLISH EDIT MODE */
                      <div className="space-y-12 max-w-3xl mx-auto">
                        <div className="bg-blue-50 p-8 rounded-[2.5rem] flex items-center justify-between shadow-inner">
                          <div>
                            <h4 className="text-2xl font-black text-blue-900 mb-1">თარგმანი</h4>
                            <p className="text-blue-600/60 font-bold">გამოიყენეთ AI ავტომატური თარგმანისთვის</p>
                          </div>
                          <div className="flex gap-4">
                             <button 
                              onClick={() => {
                                handleTranslate(item.id, item.titleKa, 'titleEn');
                                handleTranslate(item.id, item.descriptionKa, 'descriptionEn');
                                if (item.addressKa) handleTranslate(item.id, item.addressKa, 'addressEn');
                                if (item.price) handleTranslate(item.id, item.price, 'priceEn');
                              }}
                              disabled={translatingId === item.id}
                              className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                            >
                              <Sparkles size={20} /> AI თარგმნა (ყველა)
                            </button>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div className="space-y-3">
                            <div className="flex justify-between items-end px-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">სათაური (EN)</label>
                              <span className="text-[10px] text-slate-300 font-bold italic">Original: {item.titleKa}</span>
                            </div>
                            <input 
                              className="w-full bg-white border-none p-5 rounded-2xl text-xl font-black text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-sm"
                              value={item.titleEn || ''}
                              onChange={(e) => handleUpdateCatalogItem(item.id, { titleEn: e.target.value })}
                              placeholder="Title in English"
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-end px-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">მისამართი (EN)</label>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-300 font-bold italic">Original: {item.addressKa}</span>
                                <span className="text-[10px] font-black text-blue-600 hover:underline cursor-pointer" onClick={() => handleTranslate(item.id, item.addressKa, 'addressEn')}>AI Translate</span>
                              </div>
                            </div>
                            <input 
                              className="w-full bg-white border-none p-5 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
                              value={item.addressEn || ''}
                              onChange={(e) => handleUpdateCatalogItem(item.id, { addressEn: e.target.value })}
                              placeholder="Address in English"
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-end px-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">პრაისი / ტარიფი (EN)</label>
                              <div className="flex items-center gap-2">
                               <span className="text-[10px] text-slate-300 font-bold italic">Original: {item.price}</span>
                               <span className="text-[10px] font-black text-blue-600 hover:underline cursor-pointer" onClick={() => handleTranslate(item.id, item.price, 'priceEn')}>AI Translate</span>
                              </div>
                            </div>
                            <input 
                              className="w-full bg-white border-none p-5 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
                              value={item.priceEn || ''}
                              onChange={(e) => handleUpdateCatalogItem(item.id, { priceEn: e.target.value })}
                              placeholder="Price/Rates in English"
                            />
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-end px-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">აღწერა (EN)</label>
                              <span className="text-[10px] font-black text-blue-600 hover:underline cursor-pointer" onClick={() => handleTranslate(item.id, item.descriptionKa, 'descriptionEn')}>AI Translate</span>
                            </div>
                            <textarea 
                              className="w-full bg-white border-none p-6 rounded-3xl text-slate-700 font-medium h-48 resize-none focus:ring-2 focus:ring-blue-500 shadow-sm leading-relaxed"
                              value={item.descriptionEn || ''}
                              onChange={(e) => handleUpdateCatalogItem(item.id, { descriptionEn: e.target.value })}
                              placeholder="Full description in English..."
                            />
                          </div>
                        </div>
                      </div>
                    )}
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
