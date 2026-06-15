'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Sparkles, ChevronUp, ChevronDown, Award, Briefcase, Flame, BookOpen, Tag, Calendar, Bell
} from 'lucide-react';

const iconOptions = [
  { name: 'Briefcase', label: 'Briefcase' },
  { name: 'Award', label: 'Award' },
  { name: 'Flame', label: 'Flame' },
  { name: 'BookOpen', label: 'BookOpen' },
  { name: 'Calendar', label: 'Calendar' },
  { name: 'Tag', label: 'Tag' },
  { name: 'Bell', label: 'Bell' }
];

interface InitiativeCategoriesTabProps {
  categories: any[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  translatingId: string | null;
  handleAddCategory: () => void;
  handleDeleteCategory: (id: string, e?: React.MouseEvent) => void;
  handleUpdateCategory: (id: string, data: any) => void;
  handleTranslate: (id: string, text: string, field: string, collection: 'initiative_categories') => void;
}

export const InitiativeCategoriesTab = ({
  categories,
  editingId,
  setEditingId,
  confirmDeleteId,
  setConfirmDeleteId,
  translatingId,
  handleAddCategory,
  handleDeleteCategory,
  handleUpdateCategory,
  handleTranslate
}: InitiativeCategoriesTabProps) => {

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const currentItem = categories[index];
    const targetItem = categories[targetIndex];

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

    handleUpdateCategory(currentItem.id, { order: newCurrentOrder });
    handleUpdateCategory(targetItem.id, { order: newTargetOrder });
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">ინიციატივების კატეგორიები</h2>
          <p className="text-slate-500 font-bold text-lg">მართეთ პროექტების, გრანტების, გამოწვევებისა და სხვა აქტივობების კლასიფიკაცია</p>
        </div>
        <button 
          onClick={handleAddCategory}
          className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 text-sm cursor-pointer"
        >
          <Plus size={20} /> ახალი კატეგორია
        </button>
      </header>

      <div className="grid gap-6">
        {categories.map((item, index) => (
          <motion.div 
            layout
            key={item.id} 
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all"
          >
            {/* Collapsed view header */}
            <div className="p-6 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                {/* Arrow Reordering Controls */}
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

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 truncate">{item.titleKa || 'Unnamed Category'}</h3>
                  <div className="text-slate-400 text-xs font-bold truncate flex items-center gap-1.5 mt-1">
                    <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">ქართულად: {item.titleKa}</span>
                    <span className="text-slate-300">|</span>
                    <span>ENG: {item.titleEn || '(No Title)'}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-mono text-slate-500">TAG: {item.tag || 'none'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                  className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${editingId === item.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-blue-50'}`}
                >
                  {editingId === item.id ? 'დახურვა' : 'ჩასწორება'}
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirmDeleteId === item.id) {
                      handleDeleteCategory(item.id);
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

            {/* Editing Expanded Area */}
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
                    {/* Georgian Side */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">კატეგორიის სახელი (KA)</label>
                        <input 
                          className="w-full bg-white border-none p-4 rounded-2xl text-md font-bold text-slate-900 shadow-sm"
                          value={item.titleKa || ''}
                          onChange={(e) => handleUpdateCategory(item.id, { titleKa: e.target.value })}
                          placeholder="მაგ: პროექტები, გრანტები, სიახლე"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">უნიკალური ტეგი / ფილტრი (Tag Slug/Filter Key)</label>
                        <input 
                          className="w-full bg-white border-none p-4 rounded-2xl text-sm font-mono text-slate-800 shadow-sm"
                          value={item.tag || ''}
                          onChange={(e) => handleUpdateCategory(item.id, { tag: e.target.value.toLowerCase().trim() })}
                          placeholder="filters: e.g. projects, grants, challenges, active-campaign"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-mono">ხატულა (Icon)</label>
                        <select 
                          className="w-full bg-white border-none p-4 rounded-2xl font-bold text-slate-900 shadow-sm cursor-pointer"
                          value={item.icon || 'Briefcase'}
                          onChange={(e) => handleUpdateCategory(item.id, { icon: e.target.value })}
                        >
                          {iconOptions.map(opt => (
                            <option key={opt.name} value={opt.name}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* English Side */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CATEGORY NAME (EN)</label>
                          <button 
                            onClick={() => handleTranslate(item.id, item.titleKa, 'titleEn', 'initiative_categories')}
                            disabled={translatingId === item.id || !item.titleKa}
                            className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-40"
                          >
                            <Sparkles size={11} /> AI თარგმნა
                          </button>
                        </div>
                        <input 
                          className="w-full bg-slate-50 border-none p-4 rounded-2xl text-md font-bold text-slate-900 shadow-inner"
                          value={item.titleEn || ''}
                          onChange={(e) => handleUpdateCategory(item.id, { titleEn: e.target.value })}
                          placeholder="e.g. Projects, Grants, Events"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">დალაგების რიგი (Ordering Index)</label>
                        <input 
                          type="number"
                          className="w-full bg-white border-none p-4 rounded-2xl text-sm font-bold text-slate-700 shadow-sm"
                          value={item.order ?? index}
                          onChange={(e) => handleUpdateCategory(item.id, { order: parseInt(e.target.value) || 0 })}
                        />
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
