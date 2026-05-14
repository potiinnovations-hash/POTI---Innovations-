'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/firebase';
import { 
  Plus, Trash2, Save, LogOut, ArrowLeft, Image as ImageIcon, Bell, Settings, 
  Sparkles, Calendar, UserPlus, MapPin, Phone, Globe, ExternalLink, Mail, Facebook, MessageSquare, Info, ArrowRight,
  Palette,
  Dumbbell, Trophy, Bus, Car, Plane, Ship, GraduationCap, Book, Waves, Anchor, Fish, Building2, Landmark, Utensils, HeartPulse, Stethoscope, Ticket, Music
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from 'motion/react';

const iconMap: Record<string, any> = {
  Calendar,
  UserPlus,
  Info,
  ArrowRight,
  ExternalLink,
  Phone,
  MapPin,
  Mail,
  Facebook,
  Globe,
  MessageSquare,
  ArrowLeft,
  Dumbbell,
  Trophy,
  Bus,
  Car,
  Plane,
  Ship,
  GraduationCap,
  Book,
  Waves,
  Anchor,
  Fish,
  Building2,
  Landmark,
  Utensils,
  HeartPulse,
  Stethoscope,
  Ticket,
  Music
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'settings' | 'notifications' | 'categories' | 'news'>('catalog');
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'KA' | 'EN'>('KA');
  const [news, setNews] = useState<any[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Local effect to preview fonts in admin immediately
  useEffect(() => {
    if (globalSettings.customFonts) {
      const styleId = 'admin-local-fonts';
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      let content = '';
      globalSettings.customFonts.forEach((f: any) => {
        content += `@font-face { font-family: '${f.name}'; src: url(${f.data}); font-display: swap; }\n`;
      });
      styleEl.textContent = content;
    }
  }, [globalSettings.customFonts]);

  const standardFonts = [
    'Inter', 
    'Space Grotesk',
    'Outfit',
    'Playfair Display',
    'JetBrains Mono',
    'Fira Code',
    'ui-sans-serif', 
    'system-ui', 
    'sans-serif', 
    'serif',
    'monospace'
  ];

  const availableFonts = Array.from(new Set([
    ...standardFonts, 
    ...(globalSettings.customFonts || []).map((f: any) => f.name),
    globalSettings.customFontBase64 ? 'CustomUploadedFont' : null
  ].filter(Boolean)));

  const checkAdminStatus = async (u: User) => {
    try {
      // Check hardcoded email for initial setup
      if (u.email === 'potiinnovations@gmail.com') {
        setIsAdmin(true);
        return;
      }

      // Check admins collection
      const adminDoc = await getDoc(doc(db, 'admins', u.uid));
      setIsAdmin(adminDoc.exists());
    } catch (e) {
      console.error('Error checking admin status:', e);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        console.log('Admin Page: User Logged In:', u.email, u.uid);
        await checkAdminStatus(u);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error('Login error:', e);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    const qCatalog = query(collection(db, 'catalog'), orderBy('order', 'asc'));
    const unsubscribeCatalog = onSnapshot(qCatalog, (snap) => {
      setCatalogItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'catalog');
    });

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (d) => {
      if (d.exists()) setGlobalSettings(d.data());
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.GET, 'settings/global');
    });

    const unsubscribeNotifs = onSnapshot(collection(db, 'notifications'), (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'notifications');
    });

    const unsubscribeCategories = onSnapshot(query(collection(db, 'categories'), orderBy('order', 'asc')), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'categories');
    });

    const unsubscribeNews = onSnapshot(query(collection(db, 'news'), orderBy('createdAt', 'desc')), (snap) => {
      setNews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'news');
    });

    return () => {
      unsubscribeCatalog();
      unsubscribeSettings();
      unsubscribeNotifs();
      unsubscribeCategories();
      unsubscribeNews();
    };
  }, [isAdmin]);

  const handleImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 1024 * 1024) {
        alert('File is too large (max 1MB)');
        return reject('Large file');
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFontUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Allow up to 2MB for fonts
      if (file.size > 2 * 1024 * 1024) {
        alert('Font file is too large (max 2MB)');
        return reject('Large file');
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateCatalogItem = async (id: string, data: any) => {
    try {
      await updateDoc(doc(db, 'catalog', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `catalog/${id}`);
    }
  };

  const handleAddCatalogItem = async () => {
    const newItem = {
      titleKa: 'ახალი ლოკაცია',
      titleEn: 'New Location',
      categoryId: categories[0]?.id || '',
      imageUrl: 'https://picsum.photos/seed/poti/800/600',
      targetUrl: '',
      descriptionKa: 'აღწერა...',
      descriptionEn: 'Description...',
      order: catalogItems.length,
      category: 'სერვისი',
      price: '',
      location: 'ფოთი, საქართველო',
      addressKa: '',
      addressEn: '',
      workHours: '09:00 - 18:00',
      phone: '',
      email: '',
      facebookUrl: '',
      facebookName: '',
      showWebsite: true,
      titleColor: '#f59e0b',
      gallery: [],
      isUnderDevelopment: false,
    };
    try {
      await addDoc(collection(db, 'catalog'), newItem);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'catalog');
    }
  };

  const handleDeleteCatalogItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;

    try {
      await deleteDoc(doc(db, 'catalog', id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error('Delete error catalog:', err);
      handleFirestoreError(err, OperationType.DELETE, `catalog/${id}`);
    }
  };

  const handleAddNews = async () => {
    const newNews = {
      titleKa: 'ახალი სიახლე',
      titleEn: 'New Update',
      contentKa: 'შინაარსი...',
      contentEn: 'Content...',
      imageUrl: 'https://picsum.photos/seed/news/800/600',
      sourceUrl: '',
      relatedItemId: '',
      createdAt: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, 'news'), newNews);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'news');
    }
  };

  const handleUpdateNews = async (id: string, data: any) => {
    try {
      await updateDoc(doc(db, 'news', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `news/${id}`);
    }
  };

  const handleDeleteNews = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!id) return;
    
    try {
      console.log('Sending delete request to Firestore for news:', id);
      await deleteDoc(doc(db, 'news', id));
      
      if (editingId === id) setEditingId(null);
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error('Detailed firestore delete error:', err);
      handleFirestoreError(err, OperationType.DELETE, `news/${id}`);
    }
  };

  const handleDeleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `notifications/${id}`);
    }
  };

  const handleDeleteCategory = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  const handleTranslate = async (id: string, textKa: string, field: 'descriptionEn' | 'titleEn' | 'priceEn' | 'addressEn' | 'contentEn', collectionName: 'catalog' | 'news' = 'catalog') => {
    if (!textKa || !process.env.NEXT_PUBLIC_GEMINI_API_KEY) return;
    setTranslatingId(id);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Translate the following Georgian text to English. Return ONLY the translated text: "${textKa}"`;
      const result = await model.generateContent(prompt);
      const translated = result.response.text().trim();
      
      if (collectionName === 'news') {
        await handleUpdateNews(id, { [field]: translated });
      } else {
        await handleUpdateCatalogItem(id, { [field]: translated });
      }
    } catch (e) {
      console.error('Translation failed:', e);
    } finally {
      setTranslatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">იტვირთება...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Settings size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">ადმინ პანელი</h1>
          <p className="text-slate-500 mb-10 font-medium">გაიარეთ ავტორიზაცია მართვისთვის</p>
          <button 
            onClick={handleLogin}
            className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98]"
          >
            Google-ით შესვლა
          </button>
          <Link href="/" className="inline-flex items-center gap-2 mt-10 text-slate-400 hover:text-blue-600 font-bold transition-colors">
            <ArrowLeft size={18} /> მთავარზე დაბრუნება
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-8 fixed inset-y-0 shadow-sm z-50">
        <Link href="/" className="flex items-center gap-1 mb-16 group">
          {globalSettings.logoUrl ? (
            <div className="relative h-10 w-32">
              <Image 
                src={globalSettings.logoUrl} 
                alt="Logo" 
                fill 
                className="object-contain object-left transition-transform group-hover:scale-105" 
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <span className="text-2xl font-black text-blue-900 tracking-tighter transition-transform group-hover:scale-105">
              POTI<span className="text-blue-500">.ADMIN</span>
            </span>
          )}
        </Link>

        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'catalog' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ImageIcon size={22} /> კატალოგი
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell size={22} /> შეტყობინებები
          </button>
          <button 
            onClick={() => setActiveTab('news')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'news' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell size={22} /> სიახლეები
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Plus size={22} /> კატეგორიები
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Settings size={22} /> პარამეტრები
          </button>
        </nav>

        <button 
          onClick={() => auth.signOut()}
          className="flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-50 rounded-3xl font-black transition-all mt-auto"
        >
          <LogOut size={22} /> გასვლა
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-12 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'catalog' && (
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
          )}

          {activeTab === 'news' && (
            <div className="space-y-12">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">სიახლეები</h2>
                  <p className="text-slate-500 font-bold text-lg">მართეთ ქალაქის სიახლეები და განახლებები</p>
                </div>
                <button 
                  onClick={handleAddNews}
                  className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200"
                >
                  <Plus size={24} /> ახალი სიახლე
                </button>
              </header>

              <div className="grid gap-6">
                {news.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="p-6 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                          <Image src={item.imageUrl} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-slate-900 truncate">{item.titleKa}</h3>
                          <p className="text-slate-400 text-sm font-bold truncate">
                            {item.relatedItemId ? (catalogItems.find(c => c.id === item.relatedItemId)?.titleKa || 'Related Item') : 'ზოგადი სიახლე'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                          className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${editingId === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50'}`}
                        >
                          {editingId === item.id ? 'დახურვა' : 'ჩასწორება'}
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirmDeleteId === item.id) {
                              handleDeleteNews(item.id);
                            } else {
                              setConfirmDeleteId(item.id);
                            }
                          }}
                          onMouseLeave={() => setConfirmDeleteId(null)}
                          className={`relative z-10 p-4 rounded-2xl transition-all active:scale-90 group cursor-pointer border ${confirmDeleteId === item.id ? 'bg-red-500 text-white border-red-600 px-6' : 'text-red-500 hover:bg-red-50 border-transparent hover:border-red-100'}`}
                        >
                          {confirmDeleteId === item.id ? (
                            <span className="text-xs font-black uppercase tracking-tight">წაშლა?</span>
                          ) : (
                            <Trash2 size={24} className="group-hover:scale-110 transition-transform pointer-events-none" />
                          )}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {editingId === item.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-100 bg-slate-50/50 p-10"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-6">
                              <div className="relative aspect-video rounded-3xl bg-slate-200 overflow-hidden group">
                                <Image src={item.imageUrl} alt="" fill className="object-cover" referrerPolicy="no-referrer" />
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const base64 = await handleImageUpload(file);
                                      handleUpdateNews(item.id, { imageUrl: base64 });
                                    }
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                  <ImageIcon className="text-white mb-2" size={32} />
                                  <span className="text-white text-xs font-black uppercase tracking-widest">შეცვლა</span>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">სათაური (KA)</label>
                                  <input 
                                    className="w-full bg-white border-none p-4 rounded-2xl text-lg font-black text-slate-900 shadow-sm"
                                    value={item.titleKa || ''}
                                    onChange={(e) => handleUpdateNews(item.id, { titleKa: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">შინაარსი (KA)</label>
                                  <textarea 
                                    className="w-full bg-white border-none p-4 rounded-2xl text-sm font-medium text-slate-700 h-40 resize-none shadow-sm"
                                    value={item.contentKa || ''}
                                    onChange={(e) => handleUpdateNews(item.id, { contentKa: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-6">
                              <div className="space-y-4 bg-white p-6 rounded-[2rem] shadow-sm">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">სათაური (EN)</label>
                                    <button 
                                      onClick={() => handleTranslate(item.id, item.titleKa, 'titleEn', 'news')}
                                      disabled={translatingId === item.id}
                                      className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                                    >
                                      <Sparkles size={12} /> AI თარგმნა
                                    </button>
                                  </div>
                                  <input 
                                    className="w-full bg-slate-50 border-none p-3 rounded-xl font-bold text-slate-900 shadow-inner"
                                    value={item.titleEn || ''}
                                    onChange={(e) => handleUpdateNews(item.id, { titleEn: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">შინაარსი (EN)</label>
                                    <button 
                                      onClick={() => handleTranslate(item.id, item.contentKa, 'contentEn', 'news')}
                                      disabled={translatingId === item.id}
                                      className="text-[10px] font-black text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                                    >
                                      <Sparkles size={12} /> AI თარგმნა
                                    </button>
                                  </div>
                                  <textarea 
                                    className="w-full bg-slate-50 border-none p-3 rounded-xl font-medium text-slate-700 h-32 resize-none shadow-sm"
                                    value={item.contentEn || ''}
                                    onChange={(e) => handleUpdateNews(item.id, { contentEn: e.target.value })}
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">დაკავშირებული ლოკაცია</label>
                                  <select 
                                    className="w-full bg-white border-none p-4 rounded-2xl font-bold text-slate-900 shadow-sm appearance-none cursor-pointer"
                                    value={item.relatedItemId || ''}
                                    onChange={(e) => handleUpdateNews(item.id, { relatedItemId: e.target.value })}
                                  >
                                    <option value="">ზოგადი სხვა</option>
                                    {catalogItems.map(c => (
                                      <option key={c.id} value={c.id}>{c.titleKa}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">წყაროს ლინკი (URL)</label>
                                  <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                      <ExternalLink size={18} />
                                    </div>
                                    <input 
                                      className="flex-1 bg-transparent border-none p-2 font-bold text-slate-700 text-sm"
                                      value={item.sourceUrl || ''}
                                      onChange={(e) => handleUpdateNews(item.id, { sourceUrl: e.target.value })}
                                      placeholder="https://..."
                                    />
                                  </div>
                                </div>
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
          )}

          {activeTab === 'notifications' && (
             <div className="space-y-12">
               <header className="flex justify-between items-end">
                  <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">შეტყობინებები</h2>
                    <p className="text-slate-500 font-bold text-lg">მართეთ მთავარი ბანერის შეტყობინებები</p>
                  </div>
                  <button 
                    onClick={async () => {
                      await addDoc(collection(db, 'notifications'), { messageKa: 'სიახლე...', messageEn: 'News...', active: true, createdAt: new Date() });
                    }}
                    className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200"
                  >
                    <Plus size={24} /> დამატება
                  </button>
               </header>

               <div className="grid gap-6">
                 {notifications.map(notif => (
                   <div key={notif.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-8">
                     <div 
                        onClick={() => updateDoc(doc(db, 'notifications', notif.id), { active: !notif.active })}
                        className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all flex-shrink-0 ${notif.active ? 'bg-green-500' : 'bg-slate-200'}`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${notif.active ? 'translate-x-6' : 'translate-x-0'}`} />
                     </div>
                     <div className="flex-1 grid grid-cols-2 gap-4">
                       <input 
                         className="bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-900"
                         value={notif.messageKa || ''}
                         onChange={(e) => updateDoc(doc(db, 'notifications', notif.id), { messageKa: e.target.value })}
                         placeholder="ქართულად"
                       />
                       <input 
                         className="bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-900"
                         value={notif.messageEn || ''}
                         onChange={(e) => updateDoc(doc(db, 'notifications', notif.id), { messageEn: e.target.value })}
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
          )}

          {activeTab === 'categories' && (
            <div className="space-y-12">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-2">კატეგორიები</h2>
                  <p className="text-slate-500 font-bold text-lg">მართეთ კატალოგის კატეგორიები და იკონები</p>
                </div>
                <button 
                  onClick={async () => {
                    await addDoc(collection(db, 'categories'), { titleKa: 'ახალი კატეგორია', titleEn: 'New Category', icon: 'Globe', order: categories.length });
                  }}
                  className="flex items-center gap-3 px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200"
                >
                  <Plus size={24} /> ახალი კატეგორია
                </button>
              </header>

              <div className="grid gap-6">
                {categories.map(cat => (
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
                          onChange={(e) => updateDoc(doc(db, 'categories', cat.id), { titleKa: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">დასახელება (EN)</label>
                        <input 
                          className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-900"
                          value={cat.titleEn || ''}
                          onChange={(e) => updateDoc(doc(db, 'categories', cat.id), { titleEn: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">იკონა (Lucide Name)</label>
                        <select 
                          className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold text-slate-900 appearance-none cursor-pointer"
                          value={cat.icon || ''}
                          onChange={(e) => updateDoc(doc(db, 'categories', cat.id), { icon: e.target.value })}
                        >
                          {Object.keys(iconMap).map(iconName => (
                            <option key={iconName} value={iconName}>{iconName}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <input 
                        type="number"
                        className="w-16 bg-slate-50 border-none p-3 rounded-xl font-bold text-center"
                        value={cat.order || 0}
                        onChange={(e) => updateDoc(doc(db, 'categories', cat.id), { order: parseInt(e.target.value) || 0 })}
                      />
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
                         className={`w-16 h-14 flex items-center justify-center rounded-2xl transition-all active:scale-95 group border ${confirmDeleteId === cat.id ? 'bg-red-500 text-white border-red-600' : 'text-red-500 hover:bg-red-50 border-transparent'}`}
                       >
                         {confirmDeleteId === cat.id ? (
                           <span className="text-[10px] font-black uppercase">OK?</span>
                         ) : (
                           <Trash2 size={24} />
                         )}
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
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
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ლოგო (URL)</label>
                   <div className="flex gap-6">
                     <input 
                       className="flex-1 bg-slate-50 border-none p-5 rounded-2xl font-mono text-sm text-slate-900"
                       value={globalSettings.logoUrl || ''}
                       onChange={(e) => setGlobalSettings({ ...globalSettings, logoUrl: e.target.value })}
                     />
                     <div className="relative w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                       {globalSettings.logoUrl && <Image src={globalSettings.logoUrl} alt="" fill className="object-contain p-2" referrerPolicy="no-referrer" />}
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
                   onClick={async () => {
                     await setDoc(doc(db, 'settings', 'global'), globalSettings);
                     alert('შენახულია!');
                   }}
                   className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100"
                 >
                   <Save size={24} /> ცვლილებების შენახვა
                 </button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
