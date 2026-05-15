'use client';

import React from 'react';
import { 
  Plus, Trash2, Save, Image as ImageIcon, Sparkles 
} from 'lucide-react';
import Image from 'next/image';

interface SettingsTabProps {
  globalSettings: any;
  setGlobalSettings: (settings: any) => void;
  availableFonts: string[];
  handleImageUpload: (file: File) => Promise<string>;
  handleFontUpload: (file: File) => Promise<string>;
  handleSaveSettings: () => void;
}

export const SettingsTab = ({
  globalSettings,
  setGlobalSettings,
  availableFonts,
  handleImageUpload,
  handleFontUpload,
  handleSaveSettings
}: SettingsTabProps) => {
  return (
    <div className="space-y-12">
       <header>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">პარამეტრები</h2>
          <p className="text-slate-500 font-bold text-lg">საიტის გლობალური კონფიგურაცია</p>
       </header>

       <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 pb-10">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">მთავარი სათაური (KA)</label>
              <textarea 
                className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900 h-24 resize-none"
                placeholder="მაგ: აღმოაჩინე შენი ქალაქი"
                value={globalSettings.headerTextKa || ''}
                onChange={(e) => setGlobalSettings({ ...globalSettings, headerTextKa: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">მთავარი სათაური (EN)</label>
              <textarea 
                className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900 h-24 resize-none"
                placeholder="e.g., Discover Your City"
                value={globalSettings.headerTextEn || ''}
                onChange={(e) => setGlobalSettings({ ...globalSettings, headerTextEn: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 pb-10">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ქვესათაური / აღწერა (KA)</label>
              <textarea 
                className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900 h-24 resize-none"
                placeholder="მაგ: ყველაფერი რაც გჭირდება ერთ სივრცეში"
                value={globalSettings.headerDescKa || ''}
                onChange={(e) => setGlobalSettings({ ...globalSettings, headerDescKa: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ქვესათაური / აღწერა (EN)</label>
              <textarea 
                className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900 h-24 resize-none"
                placeholder="e.g., Everything you need in one place"
                value={globalSettings.headerDescEn || ''}
                onChange={(e) => setGlobalSettings({ ...globalSettings, headerDescEn: e.target.value })}
              />
            </div>
          </div>

         <div className="space-y-4">
           <div className="flex justify-between items-end px-2">
             <label className="text-xs font-black text-slate-400 uppercase tracking-widest">საიტის ლოგო</label>
             <span className="text-[10px] font-bold text-slate-400 italic">რეკომენდირებულია PNG გამჭვირვალე ფონით</span>
           </div>
           <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner group">
             <div className="relative w-32 h-32 rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm flex-shrink-0 group-hover:border-blue-300 transition-colors">
                {globalSettings.logoUrl ? (
                  <div className="relative w-full h-full p-4">
                    <Image src={globalSettings.logoUrl} alt="" fill className="object-contain" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                     <ImageIcon size={32} />
                     <span className="text-[8px] font-black uppercase mt-1">NO LOGO</span>
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
                         setGlobalSettings({ ...globalSettings, logoUrl: base64 });
                       } catch (err) {
                         console.error("Logo upload failed", err);
                       }
                       e.target.value = '';
                     }
                   }}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                   <Plus className="text-white mb-1" size={24} />
                   <span className="text-white text-[8px] font-black uppercase tracking-widest">ატვირთვა</span>
                </div>
             </div>

             <div className="flex-1 space-y-4 w-full">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ლოგოს URL</label>
                 <input 
                   className="w-full bg-white border-none p-4 rounded-2xl font-mono text-xs text-slate-900 shadow-sm"
                   value={globalSettings.logoUrl || ''}
                   onChange={(e) => setGlobalSettings({ ...globalSettings, logoUrl: e.target.value })}
                   placeholder="ან სხვა ავთენტური ლინკი..."
                 />
               </div>
               {globalSettings.logoUrl && (
                 <button 
                   onClick={() => setGlobalSettings({ ...globalSettings, logoUrl: '' })}
                   className="text-xs font-black text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 ml-1"
                 >
                   <Trash2 size={14} /> ლოგოს წაშლა
                 </button>
               )}
             </div>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">სათაურის ფერი</label>
              <div className="flex flex-col gap-3">
                <input 
                  type="color"
                  className="w-full h-16 rounded-2xl cursor-pointer border-none p-1 bg-slate-100"
                  value={globalSettings.titleColor || '#f59e0b'}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, titleColor: e.target.value })}
                />
                <input 
                  className="w-full bg-slate-50 border-none p-3 rounded-xl font-mono text-center text-xs"
                  value={globalSettings.titleColor || '#f59e0b'}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, titleColor: e.target.value })}
                />
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ტექსტის ფერი</label>
              <div className="flex flex-col gap-3">
                <input 
                  type="color"
                  className="w-full h-16 rounded-2xl cursor-pointer border-none p-1 bg-slate-100"
                  value={globalSettings.textColor || '#64748b'}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, textColor: e.target.value })}
                />
                <input 
                  className="w-full bg-slate-50 border-none p-3 rounded-xl font-mono text-center text-xs"
                  value={globalSettings.textColor || '#64748b'}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, textColor: e.target.value })}
                />
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ღილაკების ფერი</label>
              <div className="flex flex-col gap-3">
                <input 
                  type="color"
                  className="w-full h-16 rounded-2xl cursor-pointer border-none p-1 bg-slate-100"
                  value={globalSettings.buttonColor || '#2563eb'}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, buttonColor: e.target.value })}
                />
                <input 
                  className="w-full bg-slate-50 border-none p-3 rounded-xl font-mono text-center text-xs"
                  value={globalSettings.buttonColor || '#2563eb'}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, buttonColor: e.target.value })}
                />
              </div>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
           <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ძირითადი ფონტი</label>
              <select 
                className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                value={globalSettings.primaryFont || ''}
                onChange={(e) => setGlobalSettings({ ...globalSettings, primaryFont: e.target.value })}
              >
                <option value="">აირჩიეთ ფონტი</option>
                {availableFonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              <div className="px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ან ჩაწერეთ სახელი</label>
                <input 
                  className="w-full bg-slate-50 border-none p-3 mt-1 rounded-xl text-xs font-bold text-slate-900"
                  placeholder="სხვა ფონტი..."
                  value={globalSettings.primaryFont || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, primaryFont: e.target.value })}
                />
              </div>
           </div>
           <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">მეორადი ფონტი</label>
              <select 
                className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                value={globalSettings.secondaryFont || ''}
                onChange={(e) => setGlobalSettings({ ...globalSettings, secondaryFont: e.target.value })}
              >
                <option value="">აირჩიეთ ფონტი</option>
                {availableFonts.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              <div className="px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ან ჩაწერეთ სახელი</label>
                <input 
                  className="w-full bg-slate-50 border-none p-3 mt-1 rounded-xl text-xs font-bold text-slate-900"
                  placeholder="სხვა ფონტი..."
                  value={globalSettings.secondaryFont || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, secondaryFont: e.target.value })}
                />
              </div>
           </div>
         </div>

         <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center px-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ატვირთული ფონტები</label>
              <span className="text-[10px] font-bold text-slate-400 italic">მაქს 2MB ფონტზე</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(globalSettings.customFonts || []).map((font: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group border border-transparent hover:border-slate-200 transition-all">
                  <div>
                    <p className="text-sm font-black text-slate-700" style={{ fontFamily: font.name }}>{font.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ატვირთულია</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newFonts = [...globalSettings.customFonts];
                      newFonts.splice(idx, 1);
                      setGlobalSettings({ ...globalSettings, customFonts: newFonts });
                    }}
                    className="p-2 bg-white text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="relative group p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 transition-all text-center">
              <Sparkles className="mx-auto text-blue-500 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-500">ატვირთეთ ფონტი .ttf, .woff, .woff2 ფორმატში</p>
              <input 
                type="file" 
                accept=".ttf,.woff,.woff2"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
                    const base64 = await handleFontUpload(file);
                    const currentFonts = globalSettings.customFonts || [];
                    setGlobalSettings({ 
                      ...globalSettings, 
                      customFonts: [...currentFonts, { name: fontName, data: base64 }] 
                    });
                    e.target.value = ''; // Reset input
                  }
                }}
              />
            </div>
         </div>

         <button 
           onClick={handleSaveSettings}
           className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100"
         >
           <Save size={24} /> ცვლილებების შენახვა
         </button>
       </div>
    </div>
  );
};
