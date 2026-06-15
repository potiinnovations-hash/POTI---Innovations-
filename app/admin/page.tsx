'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/firebase';
import { 
  Plus, Trash2, Save, LogOut, ArrowLeft, Image as ImageIcon, Bell, Settings, FolderTree,
  Sparkles, Calendar, UserPlus, MapPin, Phone, Globe, ExternalLink, Mail, Facebook, MessageSquare, Info, ArrowRight,
  Palette,
  Dumbbell, Trophy, Bus, Car, Plane, Ship, GraduationCap, Book, Waves, Anchor, Fish, Building2, Landmark, Utensils, HeartPulse, Stethoscope, Ticket, Music,
  Heart, Coffee, ShoppingBag, Store, Hotel, Home as HomeIcon, Key, Compass, Clapperboard, Camera, Tv, Activity, ShieldCheck, AlertCircle, Tent, Sailboat, Train, Sunset, Trees, Sparkle, Flame, Zap, Briefcase, Laptop, Smartphone, Wrench, Droplet, GlassWater, Wine, Beer, Pizza, ChefHat, Cake, IceCream, Soup, Cookie, Scissors, Bike
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

import { CatalogTab } from '@/components/admin/CatalogTab';
import { NewsTab } from '@/components/admin/NewsTab';
import { NotificationsTab } from '@/components/admin/NotificationsTab';
import { CategoriesTab } from '@/components/admin/CategoriesTab';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { CalendarTab } from '@/components/admin/CalendarTab';
import { ServicesTab } from '@/components/admin/ServicesTab';
import { PWATab } from '@/components/admin/PWATab';
import { InitiativesTab } from '@/components/admin/InitiativesTab';
import { InitiativeCategoriesTab } from '@/components/admin/InitiativeCategoriesTab';

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
  Music,
  Heart,
  Coffee,
  ShoppingBag,
  Store,
  Hotel,
  Home: HomeIcon,
  Key,
  Compass,
  Clapperboard,
  Camera,
  Tv,
  Activity,
  ShieldCheck,
  AlertCircle,
  Tent,
  Sailboat,
  Train,
  Sunset,
  Trees,
  Sparkle,
  Flame,
  Zap,
  Briefcase,
  Laptop,
  Smartphone,
  Wrench,
  Droplet,
  GlassWater,
  Wine,
  Beer,
  Pizza,
  ChefHat,
  Cake,
  IceCream,
  Soup,
  Cookie,
  Scissors,
  Bike
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab ] = useState<'catalog' | 'categories' | 'settings' | 'notifications' | 'news' | 'calendar' | 'services' | 'pwa' | 'initiatives' | 'initiative_categories'>('catalog');
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'KA' | 'EN'>('KA');
  const [news, setNews] = useState<any[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [outages, setOutages] = useState<any[]>([]);
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [initiativeCategories, setInitiativeCategories] = useState<any[]>([]);

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
      console.error('Error checking admin status:', e instanceof Error ? e.message : String(e));
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
      console.error('Login error:', e instanceof Error ? e.message : String(e));
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

    const unsubscribeNews = onSnapshot(query(collection(db, 'news'), orderBy('createdAt', 'desc')), (snap) => {
      setNews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'news');
    });

    const unsubscribeEvents = onSnapshot(doc(db, 'settings', 'events'), (snap) => {
      if (snap.exists() && snap.data().list) {
        setEvents(snap.data().list);
      }
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.GET, 'settings/events');
    });

    const unsubscribeOutages = onSnapshot(query(collection(db, 'outages'), orderBy('createdAt', 'desc')), (snap) => {
      setOutages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'outages');
    });

    const unsubscribeInitiatives = onSnapshot(query(collection(db, 'initiatives'), orderBy('order', 'asc')), (snap) => {
      setInitiatives(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'initiatives');
    });

    const unsubscribeInitCats = onSnapshot(query(collection(db, 'initiative_categories'), orderBy('order', 'asc')), (snap) => {
      setInitiativeCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'initiative_categories');
    });

    return () => {
      unsubscribeCatalog();
      unsubscribeSettings();
      unsubscribeNotifs();
      unsubscribeNews();
      unsubscribeEvents();
      unsubscribeOutages();
      unsubscribeInitiatives();
      unsubscribeInitCats();
    };
  }, [isAdmin]);

  const handleImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Input limit can be higher now since we compress it
      if (file.size > 5 * 1024 * 1024) {
        alert('ფაილი ძალიან დიდია (მაქს 5MB)');
        return reject('Large file');
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas context failed');
          
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG with 0.7 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          // Verify final size
          const sizeInBytes = Math.round((compressedBase64.length * 3) / 4);
          if (sizeInBytes > 600 * 1024) { // Still too large? Max 600KB
             // Try even aggressive compression
             const aggressive = canvas.toDataURL('image/jpeg', 0.5);
             resolve(aggressive);
          } else {
            resolve(compressedBase64);
          }
        };
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  };

  const handleFontUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Allow up to 2MB for fonts
      if (file.size > 2 * 1024 * 1024) {
        alert('Font file is too large (max 2MB)');
        return reject(new Error('Large file'));
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Font reading failed'));
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

  const handleAddCatalogItem = async (isCategory: boolean = false) => {
    const newItem = {
      titleKa: isCategory ? 'ახალი კატეგორია' : 'ახალი ლოკაცია',
      titleEn: isCategory ? 'New Category' : 'New Location',
      isCategory: isCategory,
      parentId: '',
      imageUrl: 'https://picsum.photos/seed/poti/800/600',
      targetUrl: '',
      descriptionKa: isCategory ? 'კატეგორიის აღწერა...' : 'აღწერა...',
      descriptionEn: isCategory ? 'Category description...' : 'Description...',
      order: catalogItems.length,
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
      console.error('Delete error catalog:', err instanceof Error ? err.message : String(err));
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
      console.error('Detailed firestore delete error:', err instanceof Error ? err.message : String(err));
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

  const handleAddInitiative = async () => {
    const newItem = {
      titleKa: 'ახალი პროექტი / აქტივობა',
      titleEn: 'New Project / Activity',
      descKa: 'მოკლე აღწერა...',
      descEn: 'Short description...',
      fullDetailsKa: 'სრული აღწერა ქართულად...',
      fullDetailsEn: 'Full details description in English...',
      tag: 'projects',
      categoryId: '',
      icon: 'Briefcase',
      color: 'from-emerald-500 to-teal-600',
      imageUrl: '',
      ctaTextKa: 'განვრცობა',
      ctaTextEn: 'Read More',
      ctaUrl: '',
      ctaIcon: 'ExternalLink',
      order: initiatives.length,
      createdAt: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, 'initiatives'), newItem);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'initiatives');
    }
  };

  const handleUpdateInitiative = async (id: string, data: any) => {
    try {
      await updateDoc(doc(db, 'initiatives', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `initiatives/${id}`);
    }
  };

  const handleDeleteInitiative = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'initiatives', id));
      if (editingId === id) setEditingId(null);
      setConfirmDeleteId(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `initiatives/${id}`);
    }
  };

  const handleAddInitiativeCategory = async () => {
    const newItem = {
      titleKa: 'ახალი კატეგორია',
      titleEn: 'New Category',
      tag: 'projects',
      icon: 'Briefcase',
      order: initiativeCategories.length
    };
    try {
      await addDoc(collection(db, 'initiative_categories'), newItem);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'initiative_categories');
    }
  };

  const handleUpdateInitiativeCategory = async (id: string, data: any) => {
    try {
      await updateDoc(doc(db, 'initiative_categories', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `initiative_categories/${id}`);
    }
  };

  const handleDeleteInitiativeCategory = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'initiative_categories', id));
      if (editingId === id) setEditingId(null);
      setConfirmDeleteId(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `initiative_categories/${id}`);
    }
  };

  const handleTranslate = async (id: string, textKa: string, field: string, collectionName: 'catalog' | 'news' | 'outages' | 'initiatives' | 'initiative_categories' = 'catalog') => {
    if (!textKa) return;
    setTranslatingId(id);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textKa,
          sourceLang: 'Georgian',
          targetLang: 'English'
        })
      });

      if (!res.ok) {
        throw new Error(`API returned HTTP status ${res.status}`);
      }

      const data = await res.json();
      const translated = (data.translatedText || '').trim();

      if (!translated) {
        throw new Error("Translation came back empty");
      }
      
      if (collectionName === 'news') {
        await handleUpdateNews(id, { [field]: translated });
      } else if (collectionName === 'outages') {
        await handleUpdateOutage(id, { [field]: translated });
      } else if (collectionName === 'initiatives') {
        await handleUpdateInitiative(id, { [field]: translated });
      } else if (collectionName === 'initiative_categories') {
        await handleUpdateInitiativeCategory(id, { [field]: translated });
      } else {
        await handleUpdateCatalogItem(id, { [field]: translated });
      }
    } catch (e) {
      console.error('Translation failed:', e instanceof Error ? e.message : String(e));
    } finally {
      setTranslatingId(null);
    }
  };

  const handleAddOutage = async () => {
    const formatTime = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    const now = new Date();
    const reconnect = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours later

    const newOutage = {
      service: 'power',
      disconnectionAreaKa: 'ჭავჭავაძის ქუჩა (მაგალითი)',
      disconnectionAreaEn: 'Chavchavadze St (Example)',
      reasonKa: 'ქსელზე დაგეგმილი პროფილაქტიკური სამუშაოები',
      reasonEn: 'Planned preventive maintenance works on the grid',
      disconnectionDate: formatTime(now),
      reconnectionDate: formatTime(reconnect),
      affectedSubscribers: '~450',
      createdAt: now.toISOString()
    };
    try {
      await addDoc(collection(db, 'outages'), newOutage);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'outages');
    }
  };

  const handleUpdateOutage = async (id: string, data: any) => {
    try {
      await updateDoc(doc(db, 'outages', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `outages/${id}`);
    }
  };

  const handleDeleteOutage = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'outages', id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `outages/${id}`);
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
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'catalog' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ImageIcon size={22} /> კატალოგი
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FolderTree size={22} /> კატეგორიები
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell size={22} /> შეტყობინებები
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('news')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'news' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell size={22} /> სიახლეები
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('initiatives')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'initiatives' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Briefcase size={22} /> პროექტები
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('initiative_categories')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'initiative_categories' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FolderTree size={22} /> პროექტების კატეგორიები
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Calendar size={22} /> კალენდარი
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'services' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Wrench size={22} /> სერვისები
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Settings size={22} /> პარამეტრები
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('pwa')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl font-black transition-all ${activeTab === 'pwa' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Smartphone size={22} /> PWA მენიუ
          </motion.button>
        </nav>

        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => auth.signOut()}
          className="flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-50 rounded-3xl font-black transition-all mt-auto"
        >
          <LogOut size={22} /> გასვლა
        </motion.button>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-12 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'catalog' && (
            <CatalogTab 
              catalogItems={catalogItems.filter((item: any) => !item.isCategory)}
              categories={catalogItems.filter((item: any) => item.isCategory)}
              editingId={editingId}
              setEditingId={setEditingId}
              editMode={editMode}
              setEditMode={setEditMode}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              translatingId={translatingId}
              handleAddCatalogItem={handleAddCatalogItem}
              handleDeleteCatalogItem={handleDeleteCatalogItem}
              handleUpdateCatalogItem={handleUpdateCatalogItem}
              handleTranslate={(id, text, field) => handleTranslate(id, text, field, 'catalog')}
              handleImageUpload={handleImageUpload}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab 
              categories={catalogItems.filter((item: any) => item.isCategory)}
              allCatalogItems={catalogItems}
              editingId={editingId}
              setEditingId={setEditingId}
              editMode={editMode}
              setEditMode={setEditMode}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              translatingId={translatingId}
              handleAddCategory={() => handleAddCatalogItem(true)}
              handleDeleteCategory={handleDeleteCatalogItem}
              handleUpdateCategory={handleUpdateCatalogItem}
              handleTranslate={(id, text, field) => handleTranslate(id, text, field, 'catalog')}
              handleImageUpload={handleImageUpload}
            />
          )}

          {activeTab === 'news' && (
            <NewsTab 
              news={news}
              catalogItems={catalogItems}
              editingId={editingId}
              setEditingId={setEditingId}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              translatingId={translatingId}
              handleAddNews={handleAddNews}
              handleDeleteNews={handleDeleteNews}
              handleUpdateNews={handleUpdateNews}
              handleTranslate={(id, text, field) => handleTranslate(id, text, field, 'news')}
              handleImageUpload={handleImageUpload}
            />
          )}

          {activeTab === 'initiatives' && (
            <InitiativesTab 
              initiatives={initiatives}
              categories={initiativeCategories}
              editingId={editingId}
              setEditingId={setEditingId}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              translatingId={translatingId}
              handleAddInitiative={handleAddInitiative}
              handleDeleteInitiative={handleDeleteInitiative}
              handleUpdateInitiative={handleUpdateInitiative}
              handleTranslate={(id, text, field) => handleTranslate(id, text, field, 'initiatives')}
              handleImageUpload={handleImageUpload}
            />
          )}

          {activeTab === 'initiative_categories' && (
            <InitiativeCategoriesTab 
              categories={initiativeCategories}
              editingId={editingId}
              setEditingId={setEditingId}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              translatingId={translatingId}
              handleAddCategory={handleAddInitiativeCategory}
              handleDeleteCategory={handleDeleteInitiativeCategory}
              handleUpdateCategory={handleUpdateInitiativeCategory}
              handleTranslate={(id, text, field) => handleTranslate(id, text, field, 'initiative_categories')}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab 
              notifications={notifications}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              handleAddNotification={async () => {
                try {
                  await addDoc(collection(db, 'notifications'), { messageKa: 'სიახლე...', messageEn: 'News...', active: true, createdAt: new Date() });
                } catch (e) {
                  handleFirestoreError(e, OperationType.CREATE, 'notifications');
                }
              }}
              handleDeleteNotification={handleDeleteNotification}
              handleUpdateNotification={async (id, data) => {
                try {
                  await updateDoc(doc(db, 'notifications', id), data);
                } catch (e) {
                  handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`);
                }
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              globalSettings={globalSettings}
              setGlobalSettings={setGlobalSettings}
              availableFonts={availableFonts}
              handleImageUpload={handleImageUpload}
              handleFontUpload={handleFontUpload}
              handleSaveSettings={async () => {
                try {
                  const savePromise = setDoc(doc(db, 'settings', 'global'), globalSettings);
                  const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('მონაცემთა ბაზასთან კავშირის დრო ამოიწურა. გთხოვთ შეამოწმოთ ინტერნეტი და ადმინისტრატორის უფლებები.')), 25000)
                  );
                  await Promise.race([savePromise, timeoutPromise]);
                  alert('ცვლილებები წარმატებით შეინახა!');
                } catch (e: any) {
                  alert(`შენახვა ვერ მოხერხდა: ${e.message || 'უცნობი შეცდომა'}`);
                }
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarTab 
              events={events}
              setEvents={setEvents}
            />
          )}

          {activeTab === 'services' && (
            <ServicesTab 
              outages={outages}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              handleAddOutage={handleAddOutage}
              handleDeleteOutage={handleDeleteOutage}
              handleUpdateOutage={handleUpdateOutage}
              handleTranslate={(id, text, field) => handleTranslate(id, text, field, 'outages')}
              translatingId={translatingId}
            />
          )}

          {activeTab === 'pwa' && (
            <PWATab />
          )}
        </div>
      </main>
    </div>
  );
}
