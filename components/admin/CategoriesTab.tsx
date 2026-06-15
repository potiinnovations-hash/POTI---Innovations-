'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Image as ImageIcon, Sparkles, ChevronUp, ChevronDown, FolderTree, Info
} from 'lucide-react';
import Image from 'next/image';

interface CategoriesTabProps {
  categories: any[];
  allCatalogItems: any[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editMode: 'KA' | 'EN';
  setEditMode: (mode: 'KA' | 'EN') => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  translatingId: string | null;
  handleAddCategory: () => void;
  handleDeleteCategory: (id: string, e?: React.MouseEvent) => void;
  handleUpdateCategory: (id: string, data: any) => void;
  handleTranslate: (id: string, text: string, field: string) => void;
  handleImageUpload: (file: File) => Promise<string>;
}

export const CategoriesTab = ({
  categories,
  allCatalogItems,
  editingId,
  setEditingId,
  editMode,
  setEditMode,
  confirmDeleteId,
  setConfirmDeleteId,
  translatingId,
  handleAddCategory,
  handleDeleteCategory,
  handleUpdateCategory,
  handleTranslate,
  handleImageUpload
}: CategoriesTabProps) => {

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const currentCat = categories[index];
    const targetCat = categories[targetIndex];

    const currentOrder = currentCat.order ?? index;
    const targetOrder = targetCat.order ?? targetIndex;

    let newCurrentOrder = targetOrder;
    let newTargetOrder = currentOrder;
    if (newCurrentOrder === newTargetOrder) {
      if (direction === 'up') {
        newCurrentOrder = targetOrder - 1;
      } else {
        newCurrentOrder = targetOrder + 1;
      }
    }

    handleUpdateCategory(currentCat.id, { order: newCurrentOrder });
    handleUpdateCategory(targetCat.id, { order: newTargetOrder });
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">კატეგორიები</h2>
          <p className="text-slate-500 font-bold text-lg">მართეთ ქალაქის კატეგორიები, ქვეკატეგორიები და მათი გარეკანები</p>
        </div>
        <button 
          onClick={handleAddCategory}
          className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 text-sm"
        >
          <Plus size={20} /> ახალი კატეგორია
        </button>
      </header>

      <div className="grid gap-6">
        {categories.map((cat, index) => (
          <motion.div 
            layout
            key={cat.id} 
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
                      handleMoveCategory(index, 'up');
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
                      handleMoveCategory(index, 'down');
                    }}
                    disabled={index === categories.length - 1}
                    className="p-1 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-all cursor-pointer active:scale-90"
                    title="Move Down"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>

                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner border border-slate-100">
                  <Image src={cat.imageUrl || "https://picsum.photos/seed/poti/800/600"} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 truncate">
                    {cat.titleKa}
                  </h3>
                  <div className="text-slate-400 text-sm font-bold truncate flex items-center gap-1.5 mt-1">
                    <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">კატეგორია</span>
                    <span className="text-slate-300">|</span>
                    <span>{cat.parentId ? `ამ მშობელში: ${categories.find(c => c.id === cat.parentId)?.titleKa || 'უცნობი'}` : 'მთავარ გვერდზე'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (editingId === cat.id && editMode === 'KA') {
                      setEditingId(null);
                    } else {
                      setEditingId(cat.id);
                      setEditMode('KA');
                    }
                  }}
                  className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${editingId === cat.id && editMode === 'KA' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  ჩასწორება
                </button>
                <button 
                  onClick={() => {
                    if (editingId === cat.id && editMode === 'EN') {
                      setEditingId(null);
                    } else {
                      setEditingId(cat.id);
                      setEditMode('EN');
                    }
                  }}
                  className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${editingId === cat.id && editMode === 'EN' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  ჩასწორება ENG
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirmDeleteId === cat.id) {
                      handleDeleteCategory(cat.id);
                    } else {
                      setConfirmDeleteId(cat.id);
                    }
                  }}
                  onMouseLeave={() => setConfirmDeleteId(null)}
                  className={`relative z-10 p-4 rounded-2xl transition-all active:scale-95 group cursor-pointer border ${confirmDeleteId === cat.id ? 'bg-red-500 text-white border-red-600 px-6' : 'text-red-500 hover:bg-red-50 border-transparent hover:border-red-100'}`}
                >
                  {confirmDeleteId === cat.id ? (
                    <span className="text-xs font-black uppercase tracking-tight">Confirm?</span>
                  ) : (
                    <Trash2 size={24} className="group-hover:scale-110 transition-transform pointer-events-none" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Edit View */}
            <AnimatePresence>
              {editingId === cat.id && (
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
                            <Image src={cat.imageUrl || "https://picsum.photos/seed/poti/800/600"} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                            <input 
                              type="file" 
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const base64 = await handleImageUpload(file);
                                    handleUpdateCategory(cat.id, { imageUrl: base64 });
                                  } catch (err) {
                                    console.error("Image upload failed:", err);
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
                                value={cat.titleKa || ''}
                                onChange={(e) => handleUpdateCategory(cat.id, { titleKa: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">აღწერა (KA)</label>
                              <textarea 
                                className="w-full bg-white border-none p-4 rounded-2xl text-sm font-medium text-slate-700 h-32 resize-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={cat.descriptionKa || ''}
                                onChange={(e) => handleUpdateCategory(cat.id, { descriptionKa: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">მშობელი კატეგორია (Parent Category)</label>
                            <select 
                              className="w-full bg-white border-none p-4 rounded-2xl font-bold text-slate-900 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 shadow-sm"
                              value={cat.parentId || ''}
                              onChange={(e) => handleUpdateCategory(cat.id, { parentId: e.target.value })}
                            >
                              <option value="">მთავარ გვერდზე (Root Category)</option>
                              {categories.filter(c => c.id !== cat.id).map(parent => (
                                <option key={parent.id} value={parent.id}>{parent.titleKa}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">სურათის URL (ალტერნატივა)</label>
                            <input 
                              className="w-full bg-white border-none p-4 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
                              value={cat.imageUrl || ''}
                              onChange={(e) => handleUpdateCategory(cat.id, { imageUrl: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">დალაგების რიგი (Order)</label>
                            <input 
                              type="number"
                              className="w-full bg-white border-none p-4 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
                              value={cat.order ?? index}
                              onChange={(e) => handleUpdateCategory(cat.id, { order: parseInt(e.target.value) || 0 })}
                            />
                          </div>

                          <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 flex items-start gap-4">
                            <Sparkles className="text-blue-600 mt-1 flex-shrink-0 animate-pulse" size={20} />
                            <div className="space-y-2 flex-1">
                              <h4 className="font-black text-blue-900 text-sm">ავტომატური თარგმანი</h4>
                              <p className="text-xs text-blue-700 font-bold leading-relaxed">დაზოგეთ დრო და თარგმნეთ სათაური და აღწერა ავტომატურად ინგლისურ ენაზე ხელოვნური ინტელექტის დახმარებით.</p>
                              <button 
                                type="button"
                                disabled={translatingId !== null || !cat.titleKa}
                                onClick={() => handleTranslate(cat.id, cat.titleKa, 'titleEn')}
                                className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-blue-200"
                              >
                                {translatingId === cat.id ? 'ითარგმნება...' : 'ავტომატური თარგმანი 🪄'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ENGLISH EDIT MODE */
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <div className="relative aspect-[16/10] rounded-[2rem] bg-slate-100 overflow-hidden shadow-inner border-2 border-white shadow-xl">
                            <Image src={cat.imageUrl || "https://picsum.photos/seed/poti/800/600"} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-mono">TITLE (EN)</label>
                              <input 
                                className="w-full bg-white border-none p-4 rounded-2xl text-lg font-black text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                value={cat.titleEn || ''}
                                onChange={(e) => handleUpdateCategory(cat.id, { titleEn: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-mono">DESCRIPTION (EN)</label>
                              <textarea 
                                className="w-full bg-white border-none p-4 rounded-2xl text-sm font-medium text-slate-700 h-32 resize-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={cat.descriptionEn || ''}
                                onChange={(e) => handleUpdateCategory(cat.id, { descriptionEn: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8 flex flex-col justify-center">
                          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-3">
                            <div className="flex gap-2 text-slate-400">
                              <Info size={18} />
                              <span className="text-[10px] font-black uppercase tracking-wider">რჩევა ინგლისურად სავსებისთვის</span>
                            </div>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed">
                              ინგლისური ვერსია ავტომატურად გამოჩნდება უცხოელი მომხმარებლებისთვის, ვინც საიტს ინგლისურად იყენებს. საუკეთესო გამოცდილებისთვის, შეავსეთ ორივე ველი ან გამოიყენეთ ხელოვნური ინტელექტის თარგმანი ქართული რეჟიმიდან.
                            </p>
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
