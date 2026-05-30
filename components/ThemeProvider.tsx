'use client';

import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (d) => {
      if (d.exists()) {
        const data = d.data();
        setSettings(data);
        
        // Apply colors
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--primary-color', data.primaryColor);
        }
        if (data.secondaryColor) {
          document.documentElement.style.setProperty('--secondary-color', data.secondaryColor);
        }

        // Apply fonts
        if (data.primaryFont) {
          document.documentElement.style.setProperty('--font-primary', data.primaryFont);
        }
        if (data.secondaryFont) {
          document.documentElement.style.setProperty('--font-secondary', data.secondaryFont);
        }

        // Handle custom fonts upload
        const customFonts = data.customFonts || [];
        if (customFonts.length > 0 || data.customFontBase64) {
          const styleId = 'custom-fonts-style';
          let styleEl = document.getElementById(styleId);
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
          }
          
          let fontFaceRules = '';
          
          // Legacy support
          if (data.customFontBase64) {
            fontFaceRules += `
              @font-face {
                font-family: 'CustomUploadedFont';
                src: url(${data.customFontBase64});
                font-display: swap;
              }
            `;
          }

          customFonts.forEach((font: { name: string, data: string }) => {
            fontFaceRules += `
              @font-face {
                font-family: '${font.name}';
                src: url(${font.data});
                font-display: swap;
              }
            `;
          });
          
          styleEl.textContent = fontFaceRules;
        }
      }
    });

    const pwaUnsubscribe = onSnapshot(doc(db, 'settings', 'pwa'), (d) => {
      if (d.exists()) {
        const data = d.data();
        try {
          const myManifest = {
            name: data.name || "Poti.ge",
            short_name: data.shortName || "Poti.ge",
            description: data.description || "City Directory for Poti",
            start_url: "/",
            display: "standalone",
            orientation: "portrait",
            background_color: data.backgroundColor || "#ffffff",
            theme_color: data.themeColor || "#1e40af",
            icons: [
              {
                src: data.icon192 || "/fav.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any"
              },
              {
                src: data.icon512 || "/fav.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable"
              }
            ]
          };
          const manifestString = JSON.stringify(myManifest);
          const blob = new Blob([manifestString], { type: 'application/json' });
          const manifestUrl = URL.createObjectURL(blob);
          
          let manifestEl = document.querySelector('link[rel="manifest"]');
          if (!manifestEl) {
            manifestEl = document.createElement('link');
            manifestEl.setAttribute('rel', 'manifest');
            document.head.appendChild(manifestEl);
          }
          manifestEl.setAttribute('href', manifestUrl);
        } catch (err) {
          console.error("Failed to construct dynamic PWA manifest:", err);
        }
      }
    });

    return () => {
      unsubscribe();
      pwaUnsubscribe();
    };
  }, []);

  return <>{children}</>;
}
