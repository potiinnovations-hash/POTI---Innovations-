'use client';

import React from 'react';

export const LighthouseBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-10 dark:opacity-20">
      <svg
        viewBox="0 0 800 800"
        className="absolute bottom-0 right-0 w-full h-full max-w-[800px] max-h-[800px] translate-x-1/4 translate-y-1/4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        {/* Simple Lighthouse Line Art */}
        <path d="M400 700 L350 700 L370 300 L430 300 L450 700 Z" />
        <path d="M370 300 L430 300 L430 250 L370 250 Z" />
        <path d="M380 250 L420 250 L410 200 L390 200 Z" />
        <circle cx="400" cy="225" r="10" />
        <path d="M400 225 L100 100" strokeDasharray="5,5" />
        <path d="M400 225 L700 100" strokeDasharray="5,5" />
        <path d="M350 700 Q400 680 450 700" />
        <path d="M300 750 Q400 730 500 750" />
      </svg>
    </div>
  );
};
