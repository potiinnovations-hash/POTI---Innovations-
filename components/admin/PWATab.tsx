'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Save, Info, Smartphone, CheckCircle2, AlertTriangle, Wifi, WifiOff, Bell, Send, Trash2, ShieldCheck, RefreshCw, Layers
} from 'lucide-react';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface PWASettings {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  icon192: string;
  icon512: string;
}

export const PWATab = () => {
  const [settings, setSettings] = useState<PWASettings>({
    name: 'Poti.ge',
    shortName: 'Poti.ge',
    description: 'City Directory for Poti',
    themeColor: '#1e40af',
    backgroundColor: '#ffffff',
    icon192: '/fav.png',
    icon512: '/fav.png'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Diagnostics states
  const [swRegistered, setSwRegistered] = useState<boolean | 'loading'>('loading');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [manifestAvailable, setManifestAvailable] = useState<boolean>(false);

  // Test Notification fields
  const [testTitle, setTestTitle] = useState('მუნიციპალური განახლება');
  const [testBody, setTestBody] = useState('ახალი შეფერხებები და მუნიციპალური ახალი ამბები ხელმისაწვდომია.');
  const [testUrl, setTestUrl] = useState('/');

  useEffect(() => {
    // 1. Fetch current settings from database
    const fetchPWASettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'pwa'));
        if (snap.exists()) {
          setSettings({
            name: snap.data().name || 'Poti.ge',
            shortName: snap.data().shortName || 'Poti.ge',
            description: snap.data().description || 'City Directory for Poti',
            themeColor: snap.data().themeColor || '#1e40af',
            backgroundColor: snap.data().backgroundColor || '#ffffff',
            icon192: snap.data().icon192 || '/fav.png',
            icon512: snap.data().icon512 || '/fav.png'
          });
        }
      } catch (err) {
        console.error("Failed to load PWA settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPWASettings();

    // 2. Perform live environment diagnostics
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      setNotificationPermission(Notification.permission);
      
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Check Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          setSwRegistered(registrations.length > 0);
        }).catch(() => {
          setSwRegistered(false);
        });
      } else {
        setSwRegistered(false);
      }

      // Check for presence of manifest
      const manifestLink = document.querySelector('link[rel="manifest"]');
      setManifestAvailable(!!manifestLink);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await setDoc(doc(db, 'settings', 'pwa'), settings);
      setSuccessMsg('PWA პარამეტრები წარმატებით შეინახა! ცვლილებები აისახება ლოკალურად განახლების შემდეგ.');
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err) {
      setErrorMsg('პარამეტრების შენახვა ვერ მოხერხდა: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined') return;
    try {
      const resp = await Notification.requestPermission();
      setNotificationPermission(resp);
    } catch (err) {
      console.error("Permission request failed:", err);
    }
  };

  const triggerTestNotification = async () => {
    if (typeof window === 'undefined') return;
    
    if (Notification.permission !== 'granted') {
      await handleRequestPermission();
    }

    if (Notification.permission === 'granted') {
      // 1. Try sending via service worker registration (preferred for standalone & locked screens)
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          if (registrations.length > 0) {
            registrations[0].showNotification(testTitle, {
              body: testBody,
              icon: settings.icon192 || '/fav.png',
              badge: '/fav.png',
              tag: 'pwa-test-notification',
              data: { url: testUrl }
            });
            return;
          }
        } catch (err) {
          console.warn("Service worker notification failed, falling back to window.Notification:", err);
        }
      }

      // 2. Fallback to classic window notification
      try {
        new Notification(testTitle, {
          body: testBody,
          icon: settings.icon192 || '/fav.png'
        });
      } catch (err) {
        console.error("Window Notification trigger failed:", err);
      }
    } else {
      alert("გთხოვთ ჩართოთ შეტყობინებები ბრაუზერის ბოქლომის ღილაკიდან.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <RefreshCw size={40} className="animate-spin text-blue-500" />
        <p className="font-black uppercase tracking-widest text-xs">PWA პარამეტრები იტვირთება...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 font-sans">
      <header>
        <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">PWA კონფიგურაცია</h2>
        <p className="text-slate-500 font-bold text-lg">მართეთ საიტის აპლიკაციის (Progressive Web App) პარამეტრები, ოფლაინ ფუნქციები და სისტემური ნოტიფიკაციები</p>
      </header>

      {/* Grid containing Settings Form & Real-time Diagnosis Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Manifest Form Configuration */}
        <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[3rem] border border-slate-150 shadow-sm space-y-10">
          
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">ინსტალაციის მანიფესტი</h3>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-wider">მობილურსა და დესკტოპზე დამატების პარამეტრები</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">აპლიკაციის სახელი (Name)</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="მაგ: Poti.ge - ფოთი"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">მოკლე დასახელება (Short Name)</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                value={settings.shortName}
                onChange={(e) => setSettings({ ...settings, shortName: e.target.value })}
                placeholder="ეს სახელი გამოჩნდება ეკრანზე"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">აპლიკაციის აღწერა (Description)</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:outline-none transition-all h-24 placeholder:text-slate-300"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="ფოთის ოფიციალური დირექტორია და მუნიციპალური სერვისები"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">თემის ფერი (Theme Color)</label>
              <div className="flex gap-4">
                <input 
                  type="color"
                  className="w-16 h-14 rounded-2xl cursor-pointer border-none bg-slate-100 p-1"
                  value={settings.themeColor}
                  onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                />
                <input 
                  type="text"
                  className="flex-1 bg-slate-50 border-none px-4 rounded-xl font-mono text-center text-xs focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
                  value={settings.themeColor}
                  onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ფონის ფერი (Background Color)</label>
              <div className="flex gap-4">
                <input 
                  type="color"
                  className="w-16 h-14 rounded-2xl cursor-pointer border-none bg-slate-100 p-1"
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                />
                <input 
                  type="text"
                  className="flex-1 bg-slate-50 border-none px-4 rounded-xl font-mono text-center text-xs focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">მცირე იკონი (192x192 px)</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border-none p-4 rounded-2xl font-mono text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
                value={settings.icon192}
                onChange={(e) => setSettings({ ...settings, icon192: e.target.value })}
                placeholder="მაგ: /fav.png"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">დიდი იკონი (512x512 px / Maskable)</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border-none p-4 rounded-2xl font-mono text-xs text-slate-700 focus:ring-1 focus:ring-blue-500"
                value={settings.icon512}
                onChange={(e) => setSettings({ ...settings, icon512: e.target.value })}
                placeholder="მაგ: /fav.png"
              />
            </div>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-2xl flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-bold rounded-2xl flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-100 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />}
            ცვლილებების შენახვა
          </button>
        </div>

        {/* Right 1 Column: Diagnostics & Notification Sandbox */}
        <div className="space-y-8">
          
          {/* Diagnostic status block */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-150 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight pb-4 border-b border-slate-100">
              Live დიაგნოსტიკა
            </h3>

            <div className="space-y-4">
              {/* Online indicator */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ინტერნეტი</span>
                {isOnline ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg border border-emerald-100">
                    <Wifi size={14} /> ON-LINE
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-black rounded-lg border border-red-100">
                    <WifiOff size={14} /> OFF-LINE
                  </span>
                )}
              </div>

              {/* Service worker status */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Service Worker</span>
                {swRegistered === 'loading' ? (
                  <span className="text-xs font-bold text-slate-400 animate-pulse">შემოწმება...</span>
                ) : swRegistered ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg border border-emerald-100">
                    <CheckCircle2 size={13} /> გაშვებულია
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-black rounded-lg border border-amber-100">
                    <AlertTriangle size={13} /> შეფერხებულია
                  </span>
                )}
              </div>

              {/* Manifest Status */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">მანიფესტი</span>
                {manifestAvailable ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-lg border border-emerald-100">
                    <CheckCircle2 size={13} /> აქტიურია
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-black rounded-lg border border-amber-100">
                    <AlertTriangle size={13} /> მიუწვდომელი
                  </span>
                )}
              </div>

              {/* Notification permission */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">შეტყობინებებზე ნება</span>
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${
                  notificationPermission === 'granted' 
                    ? 'bg-emerald-50 text-emerald-750 border-emerald-100' 
                    : notificationPermission === 'denied' 
                    ? 'bg-red-50 text-red-700 border-red-100' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {notificationPermission === 'granted' 
                    ? 'დაშვებულია' 
                    : notificationPermission === 'denied' 
                    ? 'დაბლოკილია' 
                    : 'მოთხოვნილი არავა'}
                </span>
              </div>
            </div>

            {notificationPermission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="w-full py-4 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell size={16} /> ნებართვის გააქტიურება
              </button>
            )}
          </div>

          {/* Test Push notification sandbox */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-150 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight pb-4 border-b border-slate-100">
              შეტყობინებების ტესტირება
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">შეტყობინების სათაური</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border-none p-3.5 rounded-xl font-bold text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ტექსტი / დეტალები</label>
                <textarea 
                  rows={2}
                  className="w-full bg-slate-50 border-none p-3.5 rounded-xl font-bold text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none resize-none"
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">მიზნობრივი ლინკი (URL)</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border-none p-3.5 rounded-xl font-mono text-[11px] text-slate-700 focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={triggerTestNotification}
              className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-50"
            >
              <Send size={15} /> ტესტური ნოტიფიკაცია
            </button>
            <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed">
              დააჭირეთ სისტემური შეტყობინების შესამოწმებლად. შეტყობინება გაეგზავნება თქვენს მიმდინარე მოწყობილობას.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
