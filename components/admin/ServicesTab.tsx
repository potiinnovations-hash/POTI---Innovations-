'use client';

import React from 'react';
import { 
  Plus, Trash2, Sparkles, Calendar, Clock, MapPin, Users, Info, Lightbulb, Droplets, Flame, Construction, HelpCircle
} from 'lucide-react';

interface Outage {
  id: string;
  service: 'power' | 'water' | 'gas' | 'roads';
  disconnectionAreaKa: string;
  disconnectionAreaEn: string;
  reasonKa: string;
  reasonEn: string;
  disconnectionDate: string;
  reconnectionDate: string;
  affectedSubscribers: string;
  createdAt: string;
}

interface ServicesTabProps {
  outages: Outage[];
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  handleAddOutage: () => void;
  handleDeleteOutage: (id: string, e?: React.MouseEvent) => void;
  handleUpdateOutage: (id: string, data: Partial<Outage>) => void;
  handleTranslate: (id: string, textKa: string, field: 'disconnectionAreaEn' | 'reasonEn') => void;
  translatingId: string | null;
}

const serviceDetails = {
  power: { label: 'ელექტროენერგია', labelEn: 'Electricity', icon: Lightbulb, color: 'text-blue-500 bg-blue-50 border-blue-100' },
  water: { label: 'წყალმომარაგება', labelEn: 'Water Supply', icon: Droplets, color: 'text-cyan-500 bg-cyan-50 border-cyan-100' },
  gas: { label: 'ბუნებრივი აირი', labelEn: 'Gas Supply', icon: Flame, color: 'text-orange-500 bg-orange-50 border-orange-100' },
  roads: { label: 'საგზაო სამუშაოები', labelEn: 'Roadworks', icon: Construction, color: 'text-yellow-600 bg-yellow-50 border-yellow-100' }
};

export const ServicesTab = ({
  outages = [],
  confirmDeleteId,
  setConfirmDeleteId,
  handleAddOutage,
  handleDeleteOutage,
  handleUpdateOutage,
  handleTranslate,
  translatingId
}: ServicesTabProps) => {

  const sortedOutages = [...outages].sort((a, b) => {
    // Sort by disconnectionDate descending
    return new Date(b.disconnectionDate || b.createdAt).getTime() - new Date(a.disconnectionDate || a.createdAt).getTime();
  });

  return (
    <div className="space-y-12 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">მუნიციპალური სერვისები</h2>
          <p className="text-slate-500 font-bold text-lg">მართეთ კომუნალური ავარიული/დაგეგმილი გათიშვები და საგზაო სამუშაოები</p>
        </div>
        <button 
          onClick={handleAddOutage}
          className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 cursor-pointer self-stretch md:self-auto justify-center"
        >
          <Plus size={24} /> გათიშვის დამატება
        </button>
      </header>

      {sortedOutages.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 p-8 shadow-sm">
          <Info size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold text-lg mb-1">სერვისების შეფერხებები არ არის დარეგისტრირებული</p>
          <p className="text-slate-400 text-sm max-w-md mx-auto">დააჭირეთ „გათიშვის დამატება“ ღილაკს ახალი ინფორმაციის შესაყვანად.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {sortedOutages.map((outage) => {
            const details = serviceDetails[outage.service] || { label: outage.service, labelEn: outage.service, icon: HelpCircle, color: 'text-slate-500 bg-slate-50 border-slate-200' };
            const IconComponent = details.icon;

            return (
              <div 
                key={outage.id} 
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-150 relative transition-all hover:shadow-md"
              >
                {/* Header & Service selection */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className={`p-4 rounded-2.5xl border flex items-center justify-center ${details.color}`}>
                      <IconComponent size={24} />
                    </div>
                    <div>
                      {/* Service selector */}
                      <select
                        value={outage.service}
                        onChange={(e) => handleUpdateOutage(outage.id, { service: e.target.value as any })}
                        className="bg-slate-100 hover:bg-slate-200 border-none px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-slate-800 focus:outline-none transition-colors cursor-pointer"
                      >
                        <option value="power">🔌 ელექტროენერგია (Power)</option>
                        <option value="water">💧 წყალმომარაგება (Water)</option>
                        <option value="gas">🔥 ბუნებრივი აირი (Gas)</option>
                        <option value="roads">🚧 საგზაო სამუშაოები (Roads)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3 self-stretch lg:self-auto justify-between lg:justify-end">
                    <span className="text-[10px] uppercase font-black text-slate-400">
                      შექმნილია: {outage.createdAt ? new Date(outage.createdAt).toLocaleDateString('ka-GE') : 'ახლახან'}
                    </span>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirmDeleteId === outage.id) {
                          handleDeleteOutage(outage.id);
                        } else {
                          setConfirmDeleteId(outage.id);
                        }
                      }}
                      onMouseLeave={() => setConfirmDeleteId(null)}
                      className={`h-11 px-5 flex items-center justify-center rounded-xl transition-all active:scale-95 group border cursor-pointer ${confirmDeleteId === outage.id ? 'bg-red-500 text-white border-red-600' : 'text-red-500 hover:bg-red-50 border-slate-100'}`}
                    >
                      {confirmDeleteId === outage.id ? (
                        <span className="text-[10px] font-black uppercase tracking-tight">ნამდვილად წავშალო?</span>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column - Core Info */}
                  <div className="space-y-6">
                    {/* Disconnection Area */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
                        <span>🚧 გათიშვის ლოკაცია / ქუჩები (ქართულად)</span>
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 text-sm focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                        value={outage.disconnectionAreaKa || ''}
                        onChange={(e) => handleUpdateOutage(outage.id, { disconnectionAreaKa: e.target.value })}
                        placeholder="მაგ: ჭავჭავაძის, კოსტავას და რუსთაველის ქუჩები..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
                        <span>🌍 Street Names / Affected Area (English)</span>
                        <button
                          type="button"
                          onClick={() => handleTranslate(outage.id, outage.disconnectionAreaKa, 'disconnectionAreaEn')}
                          disabled={translatingId === outage.id || !outage.disconnectionAreaKa}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-100 font-bold text-[9px] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
                        >
                          <Sparkles size={10} />
                          {translatingId === outage.id ? 'თარგმნა...' : 'ავტო-თარგმნა'}
                        </button>
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 text-sm focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                        value={outage.disconnectionAreaEn || ''}
                        onChange={(e) => handleUpdateOutage(outage.id, { disconnectionAreaEn: e.target.value })}
                        placeholder="e.g. Chavchavadze, Kostava and Rustaveli streets..."
                      />
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        💡 გათიშვის მიზეზი / დეტალები (ქართულად)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 text-sm focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                        value={outage.reasonKa || ''}
                        onChange={(e) => handleUpdateOutage(outage.id, { reasonKa: e.target.value })}
                        placeholder="მაგ: ქსელის გეგმიური რეაბილიტაცია..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between">
                        <span>🌍 Reason / Maintenance Details (English)</span>
                        <button
                          type="button"
                          onClick={() => handleTranslate(outage.id, outage.reasonKa, 'reasonEn')}
                          disabled={translatingId === outage.id || !outage.reasonKa}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-100 font-bold text-[9px] uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
                        >
                          <Sparkles size={10} />
                          {translatingId === outage.id ? 'თარგმნა...' : 'ავტო-თარგმნა'}
                        </button>
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 text-sm focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                        value={outage.reasonEn || ''}
                        onChange={(e) => handleUpdateOutage(outage.id, { reasonEn: e.target.value })}
                        placeholder="e.g. Scheduled grid rehabilitation and repair..."
                      />
                    </div>
                  </div>

                  {/* Right Column - Timings & Impact */}
                  <div className="space-y-6">
                    {/* Disconnection Date */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                        <Clock size={12} className="text-slate-400" />
                        გათიშვის თარიღი და დრო (Disconnection Start)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 text-sm focus:bg-white focus:outline-none transition-all"
                        value={outage.disconnectionDate || ''}
                        onChange={(e) => handleUpdateOutage(outage.id, { disconnectionDate: e.target.value })}
                        placeholder="e.g. 2026-05-30 09:00"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1 font-bold">გამოიყენეთ ფორმატი: წწწწ-თთ-დდ სს:წწ (მაგ: 2026-05-30 09:00)</span>
                    </div>

                    {/* Reconnection Date */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                        <Clock size={12} className="text-slate-400" />
                        აღდგენის თარიღი და დრო (Reconnection End)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 text-sm focus:bg-white focus:outline-none transition-all"
                        value={outage.reconnectionDate || ''}
                        onChange={(e) => handleUpdateOutage(outage.id, { reconnectionDate: e.target.value })}
                        placeholder="e.g. 2026-05-30 18:00"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1 font-bold">ფორმატი: წწწწ-თთ-დდ სს:წწ (მაგ: 2026-05-30 18:00)</span>
                    </div>

                    {/* Affected Subscribers */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                        <Users size={12} className="text-slate-400" />
                        აბონენტების რაოდენობა (Impacted Subscribers)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 text-sm focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                        value={outage.affectedSubscribers || ''}
                        onChange={(e) => handleUpdateOutage(outage.id, { affectedSubscribers: e.target.value })}
                        placeholder="მაგ: ~450"
                      />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
