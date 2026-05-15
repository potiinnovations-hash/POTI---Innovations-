'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Image as ImageIcon, MapPin, Calendar, 
  Phone, Facebook, Mail, Globe, Sparkles 
} from 'lucide-react';
import Image from 'next/image';

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
  handleAddCatalogItem: () => void;
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
  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">კატალოგი</h2>
          <p className="text-slate-500 font-bold text-lg">მართეთ ქალაქის ლოკაციები და სერვისები</p>
        </div>
        <button 
          onClick={handleAddCatalogItem}
          className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95"
        >
          <Plus size={24} /> ახალი ლოკაცია
        </button>
      </header>

      <div className="grid gap-6">
        {catalogItems.map((item) => (
          <motion.div 
            layout
            key={item.id} 
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all"
          >
            {/* Collapsed Header */}
            <div className="p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                  <Image src={item.imageUrl} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 truncate">
                    {item.titleKa}
                  </h3>
                  <p className="text-slate-400 text-sm font-bold truncate">
                    {categories.find(c => c.id === item.categoryId)?.titleKa || 'კატეგორიის გარეშე'}
                  </p>
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
                                  const base64 = await handleImageUpload(file);
                                  handleUpdateCatalogItem(item.id, { imageUrl: base64 });
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
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">კატეგორია</label>
                              <select 
                                className="w-full bg-white border-none p-4 rounded-2xl font-bold text-slate-900 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={item.categoryId || ''}
                                onChange={(e) => handleUpdateCatalogItem(item.id, { categoryId: e.target.value })}
                              >
                                <option value="">აირჩიეთ კატეგორია</option>
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.titleKa}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ფასი / ტარიფი</label>
                              <input 
                                className="w-full bg-white border-none p-4 rounded-2xl font-bold text-slate-900 shadow-sm"
                                value={item.price || ''}
                                onChange={(e) => handleUpdateCatalogItem(item.id, { price: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                <MapPin size={20} />
                              </div>
                              <input 
                                className="flex-1 bg-transparent border-none p-2 font-bold text-slate-700 text-sm"
                                value={item.location || ''}
                                onChange={(e) => handleUpdateCatalogItem(item.id, { location: e.target.value })}
                                placeholder="რუკის ლინკი"
                              />
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

                            <div className="flex items-center gap-4 bg-white p-3 rounded-3xl shadow-sm">
                              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl mb-1 flex items-center justify-center">
                                <Facebook size={24} />
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Facebook URL</label>
                                  <input 
                                    className="w-full bg-slate-50 border-none px-3 py-2 rounded-xl font-bold text-slate-700 text-xs"
                                    value={item.facebookUrl || ''}
                                    onChange={(e) => handleUpdateCatalogItem(item.id, { facebookUrl: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">სახელი</label>
                                  <input 
                                    className="w-full bg-slate-50 border-none px-3 py-2 rounded-xl font-bold text-slate-700 text-xs"
                                    value={item.facebookName || ''}
                                    onChange={(e) => handleUpdateCatalogItem(item.id, { facebookName: e.target.value })}
                                  />
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
