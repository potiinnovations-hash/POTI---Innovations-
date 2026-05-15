'use client';

import React from 'react';
import { 
  Plus, Trash2 
} from 'lucide-react';

interface NotificationsTabProps {
  notifications: any[];
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  handleAddNotification: () => void;
  handleDeleteNotification: (id: string, e?: React.MouseEvent) => void;
  handleUpdateNotification: (id: string, data: any) => void;
}

export const NotificationsTab = ({
  notifications,
  confirmDeleteId,
  setConfirmDeleteId,
  handleAddNotification,
  handleDeleteNotification,
  handleUpdateNotification
}: NotificationsTabProps) => {
  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">შეტყობინებები</h2>
          <p className="text-slate-500 font-bold text-lg">მართეთ მთავარი ბანერის შეტყობინებები</p>
        </div>
        <button 
          onClick={handleAddNotification}
          className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200"
        >
          <Plus size={24} /> დამატება
        </button>
      </header>

      <div className="grid gap-6">
        {notifications.map(notif => (
          <div key={notif.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-8">
            <div 
              onClick={() => handleUpdateNotification(notif.id, { active: !notif.active })}
              className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all flex-shrink-0 ${notif.active ? 'bg-green-500' : 'bg-slate-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${notif.active ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <input 
                className="bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-900"
                value={notif.messageKa || ''}
                onChange={(e) => handleUpdateNotification(notif.id, { messageKa: e.target.value })}
                placeholder="ქართულად"
              />
              <input 
                className="bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-900"
                value={notif.messageEn || ''}
                onChange={(e) => handleUpdateNotification(notif.id, { messageEn: e.target.value })}
                placeholder="English"
              />
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirmDeleteId === notif.id) {
                  handleDeleteNotification(notif.id);
                } else {
                  setConfirmDeleteId(notif.id);
                }
              }}
              onMouseLeave={() => setConfirmDeleteId(null)}
              className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all active:scale-95 group border ${confirmDeleteId === notif.id ? 'bg-red-500 text-white border-red-600' : 'text-red-500 hover:bg-red-50 border-transparent'}`}
            >
              {confirmDeleteId === notif.id ? (
                <span className="text-[10px] font-black uppercase tracking-tight">Confirm?</span>
              ) : (
                <Trash2 size={24} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
