'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CatalogItem } from './Catalog';
import { MapPin, Phone, Globe, ExternalLink, X, Navigation, Compass, Layers } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface InteractiveMapProps {
  items: CatalogItem[];
  lang: 'ka' | 'en';
  height?: string;
  adminMode?: boolean;
  initialLat?: number;
  initialLng?: number;
  onCoordinatesSelect?: (lat: number, lng: number) => void;
  selectedItemId?: string | null;
}

// Dynamically load Leaflet CDN only in the client
const LeafletLoader = (() => {
  let loadingPromise: Promise<any> | null = null;

  return {
    load: () => {
      if (typeof window === 'undefined') return Promise.reject('SSR Method Unavailable');
      if ((window as any).L) return Promise.resolve((window as any).L);
      if (loadingPromise) return loadingPromise;

      loadingPromise = new Promise((resolve, reject) => {
        let cssLoaded = !!document.getElementById('leaflet-css');
        let jsLoaded = !!document.getElementById('leaflet-js');

        const checkReady = () => {
          if (cssLoaded && jsLoaded) {
            resolve((window as any).L);
          }
        };

        if (cssLoaded && jsLoaded) {
          resolve((window as any).L);
          return;
        }

        if (!cssLoaded) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.id = 'leaflet-css';
          link.onload = () => {
            cssLoaded = true;
            checkReady();
          };
          link.onerror = () => {
            reject(new Error('Leaflet CSS failed to load.'));
          };
          document.head.appendChild(link);
        }

        if (!jsLoaded) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.id = 'leaflet-js';
          script.onload = () => {
            jsLoaded = true;
            checkReady();
          };
          script.onerror = () => {
            reject(new Error('Leaflet script failed to load.'));
            loadingPromise = null;
          };
          document.head.appendChild(script);
        } else {
          jsLoaded = true;
          checkReady();
        }
      });

      return loadingPromise;
    }
  };
})();

export default function InteractiveMap({
  items = [],
  lang,
  height = '600px',
  adminMode = false,
  initialLat = 42.1462, // Poti central coords fallback
  initialLng = 41.6720,
  onCoordinatesSelect,
  selectedItemId = null,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const adminMarkerRef = useRef<any>(null);
  
  const [activeItem, setActiveItem] = useState<CatalogItem | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let mapInstance: any = null;

    LeafletLoader.load()
      .then((L) => {
        if (!mapContainerRef.current) return;

        // Cleanup previous instance if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Create the map focusing on Poti, Georgia
        const startLat = initialLat || 42.1462;
        const startLng = initialLng || 41.6720;
        const zoomLevel = adminMode ? 14 : 13;

        mapInstance = L.map(mapContainerRef.current, {
          zoomControl: false, // Custom styled zoom control placement
          attributionControl: false,
        }).setView([startLat, startLng], zoomLevel);

        mapInstanceRef.current = mapInstance;

        // Add beautiful styled map tiles (CartoDB Positron or Voyager looks amazing and clean!)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(mapInstance);

        // Add custom controls to bottom right
        L.control.zoom({
          position: 'bottomright'
        }).addTo(mapInstance);

        // If adminMode, handle click to pick coordinates
        if (adminMode) {
          // Initialize placeholder marker
          const adminIcon = L.divIcon({
            html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-bounce text-white font-black"><span class="block w-2.5 h-2.5 bg-white rounded-full"></span></div>`,
            className: 'custom-leaflet-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });

          adminMarkerRef.current = L.marker([startLat, startLng], { icon: adminIcon }).addTo(mapInstance);

          mapInstance.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            adminMarkerRef.current.setLatLng([lat, lng]);
            if (onCoordinatesSelect) {
              onCoordinatesSelect(lat, lng);
            }
          });
        }

        setMapLoaded(true);
        setTimeout(() => {
          if (mapInstance) {
            mapInstance.invalidateSize();
          }
        }, 200);
      })
      .catch((err) => {
        console.error('Failed to load Leaflet Map', err);
        setErrorLoading(true);
      });

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminMode]);

  // Update center if initials change in adminMode
  useEffect(() => {
    if (adminMode && mapInstanceRef.current && initialLat && initialLng) {
      mapInstanceRef.current.setView([initialLat, initialLng], 14);
      if (adminMarkerRef.current) {
        adminMarkerRef.current.setLatLng([initialLat, initialLng]);
      }
    }
  }, [initialLat, initialLng, adminMode, mapLoaded]);

  // Render Markers on Map for Catalog Items
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || adminMode) return;

    LeafletLoader.load().then((L) => {
      const map = mapInstanceRef.current;

      // Clear existing item markers
      Object.values(markersRef.current).forEach((m: any) => m.remove());
      markersRef.current = {};

      // Filter items that have coordinates
      const itemsWithCoords = items.filter(
        (item) => item.location && typeof item.location === 'string' && item.location.includes(',')
      );

      itemsWithCoords.forEach((item) => {
        const [latStr, lngStr] = item.location!.split(',');
        const lat = parseFloat(latStr.trim());
        const lng = parseFloat(lngStr.trim());

        if (isNaN(lat) || isNaN(lng)) return;

        // Create Custom Colored Circle Pin Marker
        const pinColor = item.titleColor || '#2563eb';
        const markerHtml = `
          <div class="relative group">
            <div class="absolute -inset-2 rounded-full bg-slate-900/10 blur-sm group-hover:bg-slate-900/20 transition-all"></div>
            <div class="w-10 h-10 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white font-black overflow-hidden transition-transform duration-300 hover:scale-110 active:scale-95" style="background-color: ${pinColor}">
              <div class="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                <span class="block w-2.5 h-2.5 rounded-full" style="background-color: ${pinColor}"></span>
              </div>
            </div>
            <div class="absolute left-1/2 -translate-x-1/2 top-11 opacity-0 group-hover:opacity-100 bg-slate-900 text-white font-bold text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap transition-opacity">
              ${lang === 'ka' ? item.titleKa : item.titleEn}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-leaflet-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          map.setView([lat, lng], 15);
          setActiveItem(item);
        });

        markersRef.current[item.id] = marker;
      });

      // Autofit if there's multiple and no initial focus
      if (itemsWithCoords.length > 0 && !selectedItemId) {
        const bounds = L.latLngBounds(
          itemsWithCoords.map((item) => {
            const [lat, lng] = item.location!.split(',').map((c) => parseFloat(c.trim()));
            return [lat, lng];
          })
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
      
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    });
  }, [items, mapLoaded, adminMode, lang, selectedItemId]);

  // Handle outside programmatic select
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedItemId || adminMode) return;

    const item = items.find((i) => i.id === selectedItemId);
    if (item && item.location) {
      const [latStr, lngStr] = item.location.split(',');
      const lat = parseFloat(latStr.trim());
      const lng = parseFloat(lngStr.trim());

      if (!isNaN(lat) && !isNaN(lng)) {
        mapInstanceRef.current.setView([lat, lng], 16);
        setActiveItem(item);
      }
    }
  }, [selectedItemId, mapLoaded, items, adminMode]);

  return (
    <div 
      style={{ height }}
      className="relative w-full rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 shadow-2xl group/map"
    >
      {/* Absolute Header Overlay */}
      {!adminMode && (
        <div className="absolute top-6 left-6 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl flex items-center gap-3 border border-slate-100/50 dark:border-slate-800">
          <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Compass size={20} className="transform rotate-12" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-none">
              {lang === 'ka' ? 'ფოთის ინტერაქტიული რუკა' : 'Interactive Map of Poti'}
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
              {adminMode ? (lang === 'ka' ? 'მონიშნეთ რუკაზე' : 'Click to Pick Coords') : (lang === 'ka' ? 'ლოკაციები & სერვისები' : 'Poti Directory Locations')}
            </p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full relative z-0" 
        id="leaflet-canvas-container"
      />

      {/* Loading/Error Overlays */}
      {!mapLoaded && !errorLoading && (
        <div className="absolute inset-0 bg-slate-100/60 dark:bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {lang === 'ka' ? 'რუკა იტვირთება...' : 'Loading Interactive Map...'}
          </p>
        </div>
      )}

      {errorLoading && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center z-10 gap-3 p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl">
            ⚠️
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === 'ka' ? 'რუკის ჩატვირთვა ვერ მოხერხდა' : 'Failed to Load Map'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm">
            {lang === 'ka' 
              ? 'გთხოვთ შეამოწმოთ ინტერნეტ კავშირი და სცადოთ გვერდის განახლება.' 
              : 'Please check your internet connection and try reloading.'}
          </p>
        </div>
      )}

      {/* Active Location Info Overlay Panel */}
      {!adminMode && activeItem && (
        <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-md z-10 bg-white dark:bg-slate-900 p-6 rounded-[2.2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all duration-300">
          <button 
            onClick={() => setActiveItem(null)}
            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-inner">
              <Image 
                src={activeItem.imageUrl} 
                alt="" 
                fill 
                className="object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="flex-1 min-w-0 pr-6">
              <span className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-[#2563eb] bg-blue-50 dark:bg-blue-900/20 mb-2">
                {lang === 'ka' ? 'სარეკომენდაციო' : 'Featured Locator'}
              </span>
              <h4 className="text-lg font-black text-slate-950 dark:text-white leading-tight truncate">
                {lang === 'ka' ? activeItem.titleKa : activeItem.titleEn}
              </h4>
              <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-1">
                <MapPin size={12} />
                <span className="truncate">{lang === 'ka' ? (activeItem.addressKa || 'ფოთი') : (activeItem.addressEn || 'Poti')}</span>
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
            {activeItem.redirectDirectly ? (
              <a 
                href={activeItem.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-800 dark:text-white font-bold text-xs text-center transition-colors"
              >
                <Globe size={14} /> {lang === 'ka' ? 'ვებსაიტი' : 'Website'} <ExternalLink size={10} />
              </a>
            ) : (
              <Link 
                href={`/item?id=${activeItem.id}`}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-800 dark:text-white font-bold text-xs text-center transition-colors hover:scale-105 active:scale-95"
              >
                <Layers size={14} /> {lang === 'ka' ? 'დეტალურად' : 'More Details'}
              </Link>
            )}

            {activeItem.location && (
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeItem.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs text-center transition-colors hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20"
              >
                <Navigation size={14} /> {lang === 'ka' ? 'მარშრუტი' : 'Get Route'}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
