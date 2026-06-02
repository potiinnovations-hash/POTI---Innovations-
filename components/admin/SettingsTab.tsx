'use client';

import React from 'react';
import { 
  Plus, Trash2, Save, Image as ImageIcon, Sparkles, Search, Eye, Globe, ShieldCheck, Facebook
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

       {/* Feature Guide Notice */}
       <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-6 space-y-2">
         <div className="flex items-center gap-2">
           <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">ფუნქციების მეგზური / FEATURE GUIDE</span>
           <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
         </div>
         <h4 className="text-sm font-black text-slate-900 tracking-tight">📱 Facebook ჰეშთეგების მართვა (Hashtag Management)</h4>
         <p className="text-xs text-slate-500 font-bold leading-relaxed">
           Facebook-დან სიახლეების ავტომატური სინქრონიზაციისა და ჰეშთეგების მართვა განთავსებულია:
         </p>
         <ul className="list-disc pl-5 text-xs text-slate-500 font-bold space-y-1">
           <li><strong>პარამეტრების გვერდზე (აქ):</strong> ჩამოისქროლეთ ბოლოში, რათა ჩართოთ გლობალური სინქრონიზაცია და მიუთითოთ გლობალური ჰეშთეგი (მაგ. <code className="font-mono bg-blue-50 text-blue-600 px-1 rounded">#potige</code>).</li>
           <li><strong>კატალოგის თაბში:</strong> გახსენით კატალოგის ნებისმიერი ლოკაცია, დააჭირეთ რედაქტირებას და მიუთითეთ საჯარო ფეისბუქის URL და ინდივიდუალური ჰეშთეგი შესაბამისი გვერდისთვის.</li>
           <li><strong>სიახლეების თაბში:</strong> იხილავთ ღილაკს <strong>&quot;Facebook სინქრონიზაცია&quot;</strong> მექანიკური პარსინგის გასაშვებად.</li>
         </ul>
       </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 pb-10">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ფუტერის ტექსტი (KA)</label>
              <textarea 
                className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900 h-24 resize-none"
                placeholder="მაგ: დამზადებულია ქალაქ ფოთში..."
                value={globalSettings.footerTextKa || ''}
                onChange={(e) => setGlobalSettings({ ...globalSettings, footerTextKa: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ფუტერის ტექსტი (EN)</label>
              <textarea 
                className="w-full bg-slate-50 border-none p-5 rounded-2xl font-bold text-slate-900 h-24 resize-none"
                placeholder="e.g., Made in Poti..."
                value={globalSettings.footerTextEn || ''}
                onChange={(e) => setGlobalSettings({ ...globalSettings, footerTextEn: e.target.value })}
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
                         console.error("Logo upload failed", err instanceof Error ? err.message : String(err));
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

          {/* SEO Optimization Section */}
          <div className="space-y-8 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Search size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">ძიებისა და SEO ოპტიმიზაცია</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">მართეთ საიტის ხილვადობა Google-სა და სოციალურ ქსელებში</p>
              </div>
            </div>

            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-8">
              {/* Brower Tab Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Globe size={12} /> საიტის სათაური ბრაუზერში (KA)
                  </label>
                  <input
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold text-slate-900 shadow-sm focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="მაგ: Poti.ge - ფოთის ელექტრონული კატალოგი"
                    value={globalSettings.seoTitleKa || ''}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, seoTitleKa: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Globe size={12} /> Browser Tab Title (EN)
                  </label>
                  <input
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold text-slate-900 shadow-sm focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="e.g., Poti.ge - City Directory & Directory of Services"
                    value={globalSettings.seoTitleEn || ''}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, seoTitleEn: e.target.value })}
                  />
                </div>
              </div>

              {/* Meta Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">საიტის აღწერა Google-სთვის (KA)</label>
                  <textarea
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold text-slate-900 shadow-sm focus:outline-none focus:border-blue-500 text-xs h-24 resize-none"
                    placeholder="მოკლე მეტა აღწერა, რომელიც გამოჩნდება Google-ის ძიების შედეგებში..."
                    value={globalSettings.seoDescriptionKa || ''}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, seoDescriptionKa: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Description for Google (EN)</label>
                  <textarea
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold text-slate-900 shadow-sm focus:outline-none focus:border-blue-500 text-xs h-24 resize-none"
                    placeholder="Short meta description to display in search engine snippet cards..."
                    value={globalSettings.seoDescriptionEn || ''}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, seoDescriptionEn: e.target.value })}
                  />
                </div>
              </div>

              {/* Search Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">მეტა საკვანძო სიტყვები (KA)</label>
                  <input
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold text-slate-900 shadow-sm focus:outline-none focus:border-blue-500 text-xs"
                    placeholder="ფოთი, სერვისები, კატალოგი, ტურიზმი (მძიმეებით გამოყოფილი)"
                    value={globalSettings.seoKeywordsKa || ''}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, seoKeywordsKa: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Keywords (EN)</label>
                  <input
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold text-slate-900 shadow-sm focus:outline-none focus:border-blue-500 text-xs"
                    placeholder="poti, services, catalog, georgia tourism (comma separated)"
                    value={globalSettings.seoKeywordsEn || ''}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, seoKeywordsEn: e.target.value })}
                  />
                </div>
              </div>

              {/* Social Media Share Image (OG Image) */}
              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">საზიარო სურათი სოციალურ ქსელში (Open Graph Image)</label>
                  <span className="text-[9px] font-medium text-slate-400 italic">ეს სურათი გამოჩნდება ფეისბუქზე ან სხვაგან გაზიარებისას (რეკომენდირებულია: 1200x630px)</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group">
                  <div className="relative w-28 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {globalSettings.seoShareImageUrl ? (
                      <Image src={globalSettings.seoShareImageUrl} alt="SEO OpenGraph" fill className="object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="text-slate-300" size={24} />
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
                            setGlobalSettings({ ...globalSettings, seoShareImageUrl: base64 });
                          } catch (err) {
                            console.error("SEO Image upload failed", err);
                          }
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <input
                      className="w-full bg-slate-50 border-none p-3 rounded-lg font-mono text-xs text-slate-600 focus:ring-1 focus:ring-blue-500"
                      value={globalSettings.seoShareImageUrl || ''}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, seoShareImageUrl: e.target.value })}
                      placeholder="ჩასვით საზიარო სურათის ლინკი ან ატვირთეთ..."
                    />
                    {globalSettings.seoShareImageUrl && (
                      <button
                        onClick={() => setGlobalSettings({ ...globalSettings, seoShareImageUrl: '' })}
                        className="text-[11px] font-black text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 inline-flex"
                      >
                        <Trash2 size={12} /> სურათის წაშლა
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Google Search Console Verification Code */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-500" /> Google Site Verification Token (გასაღები)
                </label>
                <input
                  className="w-full bg-white border border-slate-200 p-4 rounded-xl font-mono text-xs text-slate-700 shadow-sm focus:outline-none focus:border-blue-500"
                  placeholder="მაგ: google-site-verification-id-string..."
                  value={globalSettings.googleSearchVerification || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, googleSearchVerification: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 font-bold ml-1">მიუთითეთ Google Search Console-ის ვერიფიკაციის კოდი საიტის დასადასტურებლად.</p>
              </div>
            </div>
          </div>

          {/* Facebook Auto-Sync Configuration Section */}
          <div className="space-y-8 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Facebook size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Facebook-ის პოსტების ავტო-სინქრონიზაცია</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">ავტომატურად გამოაქვეყნეთ სიახლეები facebook გვერდებიდან შესაბამისი ჰეშთეგით</p>
              </div>
            </div>

            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h4 className="text-sm font-black text-slate-800">ფეისბუქის ავტო-სინქრონიზაციის ჩართვა</h4>
                  <p className="text-xs text-slate-400 font-bold mt-1">ჩართეთ ან გამორთეთ საიტზე ფეისბუქიდან სიახლეების ავტომატური სინქრონიზაცია</p>
                </div>
                <div 
                  onClick={() => setGlobalSettings({ ...globalSettings, facebookSyncEnabled: !globalSettings.facebookSyncEnabled })}
                  className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all ${globalSettings.facebookSyncEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${globalSettings.facebookSyncEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">გლობალური ჰეშთეგი (Global Hashtag)</label>
                  <input
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl font-bold text-slate-900 shadow-sm focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="მაგ: #potige"
                    value={globalSettings.facebookSyncHashtag || ''}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, facebookSyncHashtag: e.target.value })}
                  />
                  <p className="text-[10px] text-slate-400 font-bold ml-1">მხოლოდ ამ #ჰეშთეგის მქონე პოსტები გამოქვეყნდება ვებსაიტის სიახლეებში.</p>
                </div>

                <div className="flex flex-col justify-center bg-blue-50/40 border border-blue-100 p-4 rounded-xl text-xs text-blue-900 leading-relaxed">
                  <span className="font-extrabold mb-1">💡 როგორ მუშაობს?</span>
                  როდესაც კატალოგის ელემენტს მითითებული აქვს <strong>Facebook URL</strong>, სისტემა პერიოდულად ამოწმებს გვერდს და ამატებს ახალ პოსტებს სიახლეების განყოფილებაში, რომლებიც შეიცავენ მითითებულ ჰეშთეგს. შეგიძლიათ გამოიყენოთ კატალოგის ინდივიდუალური ჰეშთეგის ოფციებიც.
                </div>
              </div>
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
