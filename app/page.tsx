'use client';

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, getDocFromServer, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Header } from '@/components/Header';
import { Catalog, CatalogItem } from '@/components/Catalog';
import { Footer } from '@/components/Footer';
import { NotificationBanner } from '@/components/NotificationBanner';
import { LighthouseBackground } from '@/components/LighthouseBackground';
import { motion } from 'motion/react';

export default function Home() {
  const [lang, setLang] = useState<'ka' | 'en'>('ka');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            displayName: user.displayName,
            role: 'user' // Default role
          });
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Theme handling
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    // Fetch Catalog
    const q = query(collection(db, 'catalog'), orderBy('order', 'asc'));
    const unsubscribeCatalog = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CatalogItem));
      setCatalogItems(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'catalog');
    });

    // Fetch Settings
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
    });

    // Fetch Notifications
    const unsubscribeNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => {
      unsubscribeCatalog();
      unsubscribeSettings();
      unsubscribeNotifications();
    };
  }, []);

  const activeNotification = notifications.find(n => n.active);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <LighthouseBackground />
      
      {activeNotification && (
        <NotificationBanner
          messageKa={activeNotification.messageKa}
          messageEn={activeNotification.messageEn}
          lang={lang}
          active={activeNotification.active}
        />
      )}

      <Header
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        settings={settings}
      />

      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 
            className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-sm max-w-4xl mx-auto"
            style={{ color: settings?.primaryColor || undefined }}
          >
            {lang === 'ka' 
              ? (settings?.pageTitleKa || settings?.siteTitleKa || 'მდგრადი განვითარებისა და ინოვაციების სამსახური') 
              : (settings?.pageTitleEn || settings?.siteTitleEn || 'Service of Sustainable Development and Innovation')}
          </h1>
          <p 
            className="text-lg max-w-2xl mx-auto font-medium"
            style={{ color: settings?.accentColor || undefined }}
          >
            {lang === 'ka' 
              ? (settings?.siteDescriptionKa || 'ინოვაციური გადაწყვეტილებები მდგრადი მომავლისთვის. გაეცანით ჩვენს კატალოგს.') 
              : (settings?.siteDescriptionEn || 'Innovative solutions for a sustainable future. Explore our catalog.')}
          </p>
        </motion.div>

        {catalogItems.length > 0 ? (
          <Catalog items={catalogItems} lang={lang} itemsPerRow={settings?.itemsPerRow} />
        ) : (
          <div className="text-center py-20 bg-blue-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-blue-200 dark:border-slate-800">
             <p className="text-blue-400">
               {lang === 'ka' ? 'კატალოგი ცარიელია' : 'Catalog is empty'}
             </p>
          </div>
        )}
      </div>

      <Footer
        settings={settings}
        lang={lang}
      />
    </main>
  );
}
