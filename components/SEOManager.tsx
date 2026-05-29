'use client';

import { useEffect } from 'react';

interface SEOProps {
  settings: any;
  lang: 'ka' | 'en';
  pageTitle?: string;
  pageDescription?: string;
  pageImage?: string;
  pageKeywords?: string;
}

export default function SEOManager({
  settings = {},
  lang,
  pageTitle,
  pageDescription,
  pageImage,
  pageKeywords
}: SEOProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Determine Title
    let title = '';
    const baseTitle = lang === 'ka' 
      ? (settings.seoTitleKa || settings.headerTextKa || 'Poti.ge') 
      : (settings.seoTitleEn || settings.headerTextEn || 'Poti.ge');

    if (pageTitle) {
      title = `${pageTitle} | ${baseTitle}`;
    } else {
      title = baseTitle;
    }
    document.title = title;

    // 2. Determine Description
    const description = pageDescription || (lang === 'ka' 
      ? (settings.seoDescriptionKa || settings.headerDescKa || '') 
      : (settings.seoDescriptionEn || settings.headerDescEn || ''));

    // 3. Determine Keywords
    const keywords = pageKeywords || (lang === 'ka'
      ? (settings.seoKeywordsKa || '')
      : (settings.seoKeywordsEn || ''));

    // 4. Determine OG Image
    const shareImage = pageImage || settings.seoShareImageUrl || settings.logoUrl || '';

    // 5. Verification Code
    const verification = settings.googleSearchVerification || '';

    const updateOrCreateMeta = (selector: string, attributes: Record<string, string>) => {
      try {
        let element = document.querySelector(selector);
        if (!element) {
          element = document.createElement('meta');
          Object.entries(attributes).forEach(([key, val]) => {
            element!.setAttribute(key, val);
          });
          document.head.appendChild(element);
        } else {
          if (attributes.content !== undefined) {
            element.setAttribute('content', attributes.content);
          }
        }
      } catch (err) {
        console.error('Failed to update meta tag with selector', selector, err);
      }
    };

    // Update common meta tags
    if (description) {
      updateOrCreateMeta('meta[name="description"]', { name: 'description', content: description });
      updateOrCreateMeta('meta[property="og:description"]', { property: 'og:description', content: description });
      updateOrCreateMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    }

    if (keywords) {
      updateOrCreateMeta('meta[name="keywords"]', { name: 'keywords', content: keywords });
    }

    if (shareImage) {
      updateOrCreateMeta('meta[property="og:image"]', { property: 'og:image', content: shareImage });
      updateOrCreateMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: shareImage });
    }

    if (title) {
      updateOrCreateMeta('meta[property="og:title"]', { property: 'og:title', content: title });
      updateOrCreateMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    }

    updateOrCreateMeta('meta[property="og:type"]', { property: 'og:type', content: pageTitle ? 'article' : 'website' });
    updateOrCreateMeta('meta[property="og:url"]', { property: 'og:url', content: window.location.href });
    updateOrCreateMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });

    if (verification) {
      updateOrCreateMeta('meta[name="google-site-verification"]', { name: 'google-site-verification', content: verification });
    }

  }, [settings, lang, pageTitle, pageDescription, pageImage, pageKeywords]);

  return null;
}
