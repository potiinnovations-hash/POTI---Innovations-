'use client';

import React from 'react';
import { 
  Plus, Trash2, Globe, ChevronUp, ChevronDown 
} from 'lucide-react';

interface CategoriesTabProps {
  categories: any[];
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  iconMap: Record<string, any>;
  handleAddCategory: () => void;
  handleDeleteCategory: (id: string, e?: React.MouseEvent) => void;
  handleUpdateCategory: (id: string, data: any) => void;
}

export const CategoriesTab = ({
  categories,
  confirmDeleteId,
  setConfirmDeleteId,
  iconMap,
  handleAddCategory,
  handleDeleteCategory,
  handleUpdateCategory
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
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">კატეგორიები</h2>
          <p className="text-slate-500 font-bold text-lg">მართეთ კატალოგის კატეგორიები და იკონები</p>
        </div>
        <button 
          onClick={handleAddCategory}
          className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200"
        >
          <Plus size={24} /> ახალი კატეგორია
        </button>
      </header>

      <div className="grid gap-6">
        {categories.map((cat, index) => (
          <div key={cat.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600">
              {iconMap[cat.icon] ? React.createElement(iconMap[cat.icon], { size: 32 }) : <Globe size={32} />}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">დასახელება (KA)</label>
                <input 
                  className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-900"
                  value={cat.titleKa || ''}
                  onChange={(e) => handleUpdateCategory(cat.id, { titleKa: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">დასახელება (EN)</label>
                <input 
                  className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-900"
                  value={cat.titleEn || ''}
                  onChange={(e) => handleUpdateCategory(cat.id, { titleEn: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">იკონა (Lucide Name)</label>
                <select 
                  className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-900 appearance-none cursor-pointer"
                  value={cat.icon || ''}
                  onChange={(e) => handleUpdateCategory(cat.id, { icon: e.target.value })}
                >
                  {Object.keys(iconMap).map(iconName => (
                    <option key={iconName} value={iconName}>{iconName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveCategory(index, 'up')}
                  disabled={index === 0}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-150 disabled:opacity-30 disabled:hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all border border-slate-100 cursor-pointer active:scale-90"
                  title="Move Up"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveCategory(index, 'down')}
                  disabled={index === categories.length - 1}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-150 disabled:opacity-30 disabled:hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all border border-slate-100 cursor-pointer active:scale-90"
                  title="Move Down"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className="text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase block">რიგი</span>
                <input 
                  type="number"
                  className="w-14 bg-slate-50 border-none p-2 rounded-xl font-bold text-center text-xs"
                  value={cat.order ?? 0}
                  onChange={(e) => handleUpdateCategory(cat.id, { order: parseInt(e.target.value) || 0 })}
                />
              </div>
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
                 className={`w-16 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-95 group border ${confirmDeleteId === cat.id ? 'bg-red-500 text-white border-red-600' : 'text-red-500 hover:bg-red-50 border-transparent'}`}
               >
                 {confirmDeleteId === cat.id ? (
                   <span className="text-[10px] font-black uppercase">OK?</span>
                 ) : (
                   <Trash2 size={20} />
                 )}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
