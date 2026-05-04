'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Plus, Trash2, Save, LogOut, ArrowLeft, Image as ImageIcon, Link as LinkIcon, Bell, Settings, Languages, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'motion/react';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ 
    logoUrl: '', 
    headerTitleKa: '', 
    headerTitleEn: '', 
    pageTitleKa: '', 
    pageTitleEn: '', 
    siteDescriptionKa: '', 
    siteDescriptionEn: '', 
    primaryColor: '#2563eb', 
    accentColor: '#1d4ed8', 
    footerTextKa: '', 
    footerTextEn: '',
    footerLinks: [],
    itemsPerRow: 5
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'catalog' | 'notification' | 'user' } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleAddFooterLink = () => {
    const newLinks = [...(settings.footerLinks || []), { labelKa: '', labelEn: '', url: '' }];
    setSettings({ ...settings, footerLinks: newLinks });
  };

  const handleUpdateFooterLink = (idx: number, data: any) => {
    const newLinks = [...settings.footerLinks];
    newLinks[idx] = { ...newLinks[idx], ...data };
    setSettings({ ...settings, footerLinks: newLinks });
  };

  const handleDeleteFooterLink = (idx: number) => {
    const newLinks = settings.footerLinks.filter((_: any, i: number) => i !== idx);
    setSettings({ ...settings, footerLinks: newLinks });
  };
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'settings' | 'notifications' | 'users'>('catalog');
  const [expandedEnItems, setExpandedEnItems] = useState<Set<string>>(new Set());
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const toggleEnFields = (id: string) => {
    const newSet = new Set(expandedEnItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedEnItems(newSet);
  };

  const handleTranslateItem = async (id: string, titleKa: string, descKa: string) => {
    if (!titleKa && !descKa) return;
    setTranslatingId(id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const prompt = `Translate the following Georgian text to English. 
      Return ONLY a JSON object with "title" and "description" keys.
      Title: ${titleKa}
      Description: ${descKa}`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });

      const translation = JSON.parse(result.text || '{}');
      
      if (translation.title || translation.description) {
        await handleUpdateCatalogItem(id, {
          titleEn: translation.title || '',
          descriptionEn: translation.description || ''
        });
        // Auto-expand if translated
        const newSet = new Set(expandedEnItems);
        newSet.add(id);
        setExpandedEnItems(newSet);
      }
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setTranslatingId(null);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check if user is admin in Firestore or hardcoded list
        const hardcodedAdmins = ["giorgiswork@gmail.com", "giorgiezb@gmail.com", "potiinnovations@gmail.com"];
        if (hardcodedAdmins.includes(u.email || '')) {
          setIsAdminUser(true);
          setLoading(false);
        } else {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdminUser(true);
          } else {
            setIsAdminUser(false);
          }
          setLoading(false);
        }
      } else {
        setIsAdminUser(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user && isAdminUser) {
      const q = query(collection(db, 'catalog'), orderBy('order', 'asc'));
      const unsubscribeCatalog = onSnapshot(q, (snapshot) => {
        setCatalogItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'catalog');
      });

      const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
        if (doc.exists()) setSettings(doc.data());
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/global');
      });

      const unsubscribeNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      });

      const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      });

      return () => {
        unsubscribeCatalog();
        unsubscribeSettings();
        unsubscribeNotifications();
        unsubscribeUsers();
      };
    }
  }, [user, isAdminUser]);

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      setSaveStatus('error');
      handleFirestoreError(e, OperationType.WRITE, 'settings/global');
    }
  };

  const handleAddCatalogItem = async () => {
    const newItem = {
      titleKa: 'ახალი ელემენტი',
      titleEn: 'New Item',
      imageUrl: 'https://picsum.photos/seed/catalog/800/600',
      targetUrl: 'https://google.com',
      descriptionKa: 'აღწერა',
      descriptionEn: 'Description',
      order: catalogItems.length,
      isUnderDevelopment: false
    };
    try {
      await addDoc(collection(db, 'catalog'), newItem);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'catalog');
    }
  };

  const handleUpdateCatalogItem = async (id: string, data: any) => {
    try {
      await updateDoc(doc(db, 'catalog', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `catalog/${id}`);
    }
  };

  const handleDeleteCatalogItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'catalog', id));
      setDeleteConfirm(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `catalog/${id}`);
    }
  };

  const handleAddNotification = async () => {
    const newNotif = {
      messageKa: 'ახალი შეტყობინება',
      messageEn: 'New Notification',
      active: false,
      createdAt: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, 'notifications'), newNotif);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'notifications');
    }
  };

  const handleUpdateNotification = async (id: string, data: any) => {
    try {
      await updateDoc(doc(db, 'notifications', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setDeleteConfirm(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `notifications/${id}`);
    }
  };

  const handleMoveCatalogItem = async (id: string, direction: 'up' | 'down') => {
    const index = catalogItems.findIndex(item => item.id === id);
    if (direction === 'up' && index > 0) {
      const prevItem = catalogItems[index - 1];
      const currentItem = catalogItems[index];
      await updateDoc(doc(db, 'catalog', id), { order: prevItem.order });
      await updateDoc(doc(db, 'catalog', prevItem.id), { order: currentItem.order });
    } else if (direction === 'down' && index < catalogItems.length - 1) {
      const nextItem = catalogItems[index + 1];
      const currentItem = catalogItems[index];
      await updateDoc(doc(db, 'catalog', id), { order: nextItem.order });
      await updateDoc(doc(db, 'catalog', nextItem.id), { order: currentItem.order });
    }
  };

  const handleUpdateUserRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setDeleteConfirm(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}`);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-900">იტვირთება...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">ადმინ პანელი</h1>
          <p className="text-slate-600 mb-8">გთხოვთ გაიაროთ ავტორიზაცია კატალოგის სამართავად.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            მთავარ გვერდზე დაბრუნება
          </button>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border-t-4 border-red-600">
          <h1 className="text-2xl font-bold text-red-900 mb-4">წვდომა უარყოფილია</h1>
          <p className="text-slate-600 mb-6">
            თქვენი როლია: <span className="font-bold text-red-600">მომხმარებელი</span>. 
            კატალოგის სამართავად საჭიროა ადმინისტრატორის მიერ თქვენი როლის 
            <span className="font-bold text-red-600"> ადმინად </span> 
            შეცვლა.
          </p>
          <div className="bg-red-50 p-4 rounded-xl mb-8">
            <p className="text-xs text-red-700 font-medium">თქვენი იმეილი: {user.email}</p>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors"
            >
              მთავარ გვერდზე დაბრუნება
            </button>
            <button
              onClick={() => auth.signOut()}
              className="w-full text-red-600 font-bold hover:underline"
            >
              გამოსვლა
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-bold text-xl text-blue-900">ადმინ პანელი</h1>
          </div>
          <button
            onClick={() => auth.signOut()}
            className="flex items-center gap-2 text-red-600 font-bold text-sm hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={18} /> გამოსვლა
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shrink-0 ${activeTab === 'catalog' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            <ImageIcon size={18} /> კატალოგი
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shrink-0 ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            <Settings size={18} /> პარამეტრები
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shrink-0 ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            <Bell size={18} /> შეტყობინებები
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shrink-0 ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            <Plus size={18} /> მომხმარებლები
          </button>
        </div>

        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">კატალოგის ელემენტები</h2>
              <button
                onClick={handleAddCatalogItem}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors"
              >
                <Plus size={18} /> დამატება
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {catalogItems.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                    <Image 
                      src={item.imageUrl} 
                      alt="Preview" 
                      fill 
                      className="object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    {item.isUnderDevelopment && (
                      <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                        <span className="bg-yellow-400 text-blue-950 text-[10px] font-bold px-2 py-0.5 rounded">მუშავდება</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">სათაური (KA)</label>
                        <button
                          onClick={() => handleTranslateItem(item.id, item.titleKa, item.descriptionKa)}
                          disabled={translatingId === item.id}
                          className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold disabled:opacity-50"
                          title="ინგლისურად თარგმნა"
                        >
                          {translatingId === item.id ? (
                            <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />
                          ) : (
                            <Sparkles size={12} />
                          )}
                          თარგმნა
                        </button>
                      </div>
                      <input
                        className="w-full border p-2 rounded-lg"
                        placeholder="სათაური (KA)"
                        value={item.titleKa}
                        onChange={(e) => handleUpdateCatalogItem(item.id, { titleKa: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">სურათის ლინკი</label>
                      <input
                        className="w-full border p-2 rounded-lg"
                        placeholder="სურათის ლინკი"
                        value={item.imageUrl}
                        onChange={(e) => handleUpdateCatalogItem(item.id, { imageUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">გადასასვლელი ლინკი</label>
                      <input
                        className="w-full border p-2 rounded-lg"
                        placeholder="გადასასვლელი ლინკი"
                        value={item.targetUrl}
                        onChange={(e) => handleUpdateCatalogItem(item.id, { targetUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">აღწერა (KA)</label>
                      <textarea
                        className="w-full border p-2 rounded-lg"
                        placeholder="აღწერა (KA)"
                        value={item.descriptionKa}
                        onChange={(e) => handleUpdateCatalogItem(item.id, { descriptionKa: e.target.value })}
                      />
                    </div>

                    {/* English Fields Toggle */}
                    <div className="md:col-span-2">
                      <button
                        onClick={() => toggleEnFields(item.id)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors py-2"
                      >
                        <Languages size={14} />
                        ინგლისური ვერსია (EN)
                        {expandedEnItems.has(item.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      
                      {expandedEnItems.has(item.id) && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="grid grid-cols-1 gap-4 pt-2 border-t border-dashed"
                        >
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">სათაური (EN)</label>
                            <input
                              className="w-full border p-2 rounded-lg bg-blue-50/30"
                              placeholder="სათაური (EN)"
                              value={item.titleEn}
                              onChange={(e) => handleUpdateCatalogItem(item.id, { titleEn: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">აღწერა (EN)</label>
                            <textarea
                              className="w-full border p-2 rounded-lg bg-blue-50/30"
                              placeholder="აღწერა (EN)"
                              value={item.descriptionEn}
                              onChange={(e) => handleUpdateCatalogItem(item.id, { descriptionEn: e.target.value })}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`dev-${item.id}`}
                        checked={item.isUnderDevelopment || false}
                        onChange={(e) => handleUpdateCatalogItem(item.id, { isUnderDevelopment: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`dev-${item.id}`} className="text-sm font-bold text-slate-600 cursor-pointer">
                        მუშავდება
                      </label>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2 justify-center">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveCatalogItem(item.id, 'up')}
                        disabled={catalogItems.indexOf(item) === 0}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveCatalogItem(item.id, 'down')}
                        disabled={catalogItems.indexOf(item) === catalogItems.length - 1}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      onClick={() => setDeleteConfirm({ id: item.id, type: 'catalog' })}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border space-y-8">
            <h2 className="text-2xl font-bold text-blue-900">გლობალური პარამეტრები</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Branding */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 border-b pb-2">ბრენდინგი და იდენტობა</h3>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">ლოგოს ლინკი</label>
                  <input
                    className="w-full border p-3 rounded-xl"
                    value={settings.logoUrl || ''}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">ჰედერის სათაური (KA)</label>
                    <input
                      className="w-full border p-3 rounded-xl"
                      value={settings.headerTitleKa || ''}
                      onChange={(e) => setSettings({ ...settings, headerTitleKa: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">ჰედერის სათაური (EN)</label>
                    <input
                      className="w-full border p-3 rounded-xl"
                      value={settings.headerTitleEn || ''}
                      onChange={(e) => setSettings({ ...settings, headerTitleEn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">გვერდის სათაური (KA)</label>
                    <input
                      className="w-full border p-3 rounded-xl"
                      value={settings.pageTitleKa || ''}
                      onChange={(e) => setSettings({ ...settings, pageTitleKa: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">გვერდის სათაური (EN)</label>
                    <input
                      className="w-full border p-3 rounded-xl"
                      value={settings.pageTitleEn || ''}
                      onChange={(e) => setSettings({ ...settings, pageTitleEn: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">საიტის აღწერა (KA)</label>
                  <textarea
                    className="w-full border p-3 rounded-xl"
                    rows={3}
                    value={settings.siteDescriptionKa || ''}
                    onChange={(e) => setSettings({ ...settings, siteDescriptionKa: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">საიტის აღწერა (EN)</label>
                  <textarea
                    className="w-full border p-3 rounded-xl"
                    rows={3}
                    value={settings.siteDescriptionEn || ''}
                    onChange={(e) => setSettings({ ...settings, siteDescriptionEn: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">ელემენტების რაოდენობა რიგში</label>
                  <select
                    className="w-full border p-3 rounded-xl"
                    value={settings.itemsPerRow || 5}
                    onChange={(e) => setSettings({ ...settings, itemsPerRow: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Colors & Footer */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 border-b pb-2">ფერები და ფუტერი</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">ძირითადი ფერი</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="h-10 w-10 rounded cursor-pointer"
                        value={settings.primaryColor || '#2563eb'}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      />
                      <input
                        className="flex-grow border px-2 rounded-lg text-xs"
                        value={settings.primaryColor || '#2563eb'}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">აქცენტის ფერი</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="h-10 w-10 rounded cursor-pointer"
                        value={settings.accentColor || '#1d4ed8'}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      />
                      <input
                        className="flex-grow border px-2 rounded-lg text-xs"
                        value={settings.accentColor || '#1d4ed8'}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">ფუტერის ტექსტი (KA)</label>
                  <input
                    className="w-full border p-3 rounded-xl"
                    value={settings.footerTextKa || ''}
                    onChange={(e) => setSettings({ ...settings, footerTextKa: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">ფუტერის ტექსტი (EN)</label>
                  <input
                    className="w-full border p-3 rounded-xl"
                    value={settings.footerTextEn || ''}
                    onChange={(e) => setSettings({ ...settings, footerTextEn: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-slate-600">ფუტერის ლინკები</label>
                    <button 
                      onClick={handleAddFooterLink}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                    >
                      + დამატება
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-xl bg-slate-50">
                    {(settings.footerLinks || []).map((link: any, idx: number) => (
                      <div key={idx} className="bg-white p-2 rounded border flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            className="flex-grow border p-1 rounded text-xs"
                            placeholder="ლეიბლი (KA)"
                            value={link.labelKa}
                            onChange={(e) => handleUpdateFooterLink(idx, { labelKa: e.target.value })}
                          />
                          <input
                            className="flex-grow border p-1 rounded text-xs"
                            placeholder="ლეიბლი (EN)"
                            value={link.labelEn}
                            onChange={(e) => handleUpdateFooterLink(idx, { labelEn: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            className="flex-grow border p-1 rounded text-xs"
                            placeholder="ლინკი (URL)"
                            value={link.url}
                            onChange={(e) => handleUpdateFooterLink(idx, { url: e.target.value })}
                          />
                          <button 
                            onClick={() => handleDeleteFooterLink(idx)}
                            className="text-red-500 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saveStatus === 'saving'}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                saveStatus === 'success' ? 'bg-green-600 text-white' : 
                saveStatus === 'error' ? 'bg-red-600 text-white' :
                'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saveStatus === 'saving' ? 'ინახება...' : 
               saveStatus === 'success' ? 'შენახულია!' :
               saveStatus === 'error' ? 'შეცდომა!' :
               <><Save size={20} /> პარამეტრების შენახვა</>}
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">შეტყობინებები</h2>
              <button
                onClick={handleAddNotification}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors"
              >
                <Plus size={18} /> დამატება
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {notifications.map((notif) => (
                <div key={notif.id} className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-6">
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="border p-2 rounded-lg"
                      placeholder="შეტყობინება (KA)"
                      value={notif.messageKa}
                      onChange={(e) => handleUpdateNotification(notif.id, { messageKa: e.target.value })}
                    />
                    <input
                      className="border p-2 rounded-lg"
                      placeholder="შეტყობინება (EN)"
                      value={notif.messageEn}
                      onChange={(e) => handleUpdateNotification(notif.id, { messageEn: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notif.active}
                        onChange={(e) => {
                          if (e.target.checked) {
                            notifications.forEach(n => {
                              if (n.id !== notif.id && n.active) {
                                handleUpdateNotification(n.id, { active: false });
                              }
                            });
                          }
                          handleUpdateNotification(notif.id, { active: e.target.checked });
                        }}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-600">აქტიური</span>
                    </label>
                    <button
                      onClick={() => setDeleteConfirm({ id: notif.id, type: 'notification' })}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">მომხმარებლების მართვა</h2>
              <p className="text-sm text-slate-500">ადმინისტრატორის უფლებების მინიჭება.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-4 font-bold text-slate-600">მომხმარებელი</th>
                      <th className="p-4 font-bold text-slate-600">იმეილი</th>
                      <th className="p-4 font-bold text-slate-600">როლი</th>
                      <th className="p-4 font-bold text-slate-600 text-right">მოქმედებები</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium">{u.displayName || 'სახელი არ არის მითითებული'}</td>
                        <td className="p-4 text-slate-600">{u.email}</td>
                        <td className="p-4">
                          <select
                            className="border rounded p-1 text-sm bg-white"
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value as 'admin' | 'user')}
                          >
                            <option value="user">მომხმარებელი</option>
                            <option value="admin">ადმინი</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setDeleteConfirm({ id: u.id, type: 'user' })}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                          მომხმარებლები არ მოიძებნა.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2">როგორ დავამატოთ ახალი ადმინი:</h3>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>სთხოვეთ მომხმარებელს ერთხელ მაინც გაიაროს ავტორიზაცია საიტზე.</li>
                <li>ის გამოჩნდება ამ სიაში პირველივე შესვლის შემდეგ.</li>
                <li>შეუცვალეთ როლი &quot;ადმინი&quot;-ზე ზემოთ მოცემული სიიდან.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border-t-4 border-red-600">
            <h4 className="text-xl font-bold text-slate-900 mb-4">დარწმუნებული ხართ?</h4>
            <p className="text-slate-600 mb-8">
              ამ მოქმედების გაუქმება შეუძლებელია.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                გაუქმება
              </button>
              <button
                onClick={() => {
                  const { id, type } = deleteConfirm;
                  if (type === 'catalog') handleDeleteCatalogItem(id);
                  if (type === 'notification') handleDeleteNotification(id);
                  if (type === 'user') handleDeleteUser(id);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                წაშლა
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
