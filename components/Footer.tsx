'use client';

import React from 'react';

interface FooterProps {
  settings: any;
  lang: 'ka' | 'en';
}

export const Footer = ({ settings, lang }: FooterProps) => {
  const footerText = lang === 'ka' 
    ? (settings?.footerTextKa || 'მდგრადი განვითარებისა და ინოვაციების სამსახური')
    : (settings?.footerTextEn || 'Service of Sustainable Development and Innovation');

  const footerLinks = settings?.footerLinks || [
    { labelKa: 'კონფიდენციალურობა', labelEn: 'Privacy Policy', url: '#' },
    { labelKa: 'წესები და პირობები', labelEn: 'Terms of Service', url: '#' }
  ];

  return (
    <footer className="w-full py-12 border-t border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 mt-20">
      <div className="container mx-auto px-4 text-center">
        <p className="text-blue-900/60 dark:text-blue-100/40 text-sm font-medium tracking-widest uppercase">
          {footerText}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-blue-900/40 dark:text-blue-100/20">
          <span>&copy; {new Date().getFullYear()}</span>
          {footerLinks.map((link: any, idx: number) => (
            <a key={idx} href={link.url} className="hover:text-blue-600 transition-colors">
              {lang === 'ka' ? link.labelKa : link.labelEn}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
