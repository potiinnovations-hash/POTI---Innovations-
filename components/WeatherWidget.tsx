'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, CloudSun, ChevronRight } from 'lucide-react';

interface WeatherData {
  today: {
    max: number;
    min: number;
    code: number;
  };
  tomorrow: {
    max: number;
    min: number;
    code: number;
  };
}

interface WeatherWidgetProps {
  lang: 'ka' | 'en';
}

const weatherTranslation: Record<number, { ka: string; en: string; icon: any }> = {
  0: { ka: 'მოწმენდილი', en: 'Clear sky', icon: Sun },
  1: { ka: 'უმეტესად მოწმენდილი', en: 'Mainly clear', icon: CloudSun },
  2: { ka: 'ნაწილობრივ ღრუბლიანი', en: 'Partly cloudy', icon: CloudSun },
  3: { ka: 'მოღრუბლული', en: 'Overcast', icon: Cloud },
  45: { ka: 'ნისლი', en: 'Fog', icon: CloudFog },
  48: { ka: 'ნისლი', en: 'Fog', icon: CloudFog },
  51: { ka: 'ცვარი', en: 'Drizzle', icon: CloudDrizzle },
  53: { ka: 'ცვარი', en: 'Drizzle', icon: CloudDrizzle },
  55: { ka: 'ცვარი', en: 'Drizzle', icon: CloudDrizzle },
  56: { ka: 'ცივი ცვარი', en: 'Freezing drizzle', icon: CloudDrizzle },
  57: { ka: 'ცივი ცვარი', en: 'Freezing drizzle', icon: CloudDrizzle },
  61: { ka: 'მცირე წვიმა', en: 'Slight rain', icon: CloudRain },
  63: { ka: 'წვიმა', en: 'Rain', icon: CloudRain },
  65: { ka: 'ძლიერი წვიმა', en: 'Heavy rain', icon: CloudRain },
  66: { ka: 'ყინულოვანი წვიმა', en: 'Freezing rain', icon: CloudRain },
  67: { ka: 'ყინულოვანი წვიმა', en: 'Freezing rain', icon: CloudRain },
  71: { ka: 'თოვლი', en: 'Slight snow', icon: CloudSnow },
  73: { ka: 'თოვლი', en: 'Snow', icon: CloudSnow },
  75: { ka: 'ძლიერი თოვლი', en: 'Heavy snow', icon: CloudSnow },
  77: { ka: 'თოვლის მარცვლები', en: 'Snow grains', icon: CloudSnow },
  80: { ka: 'წვიმა', en: 'Slight showers', icon: CloudRain },
  81: { ka: 'წვიმა', en: 'Showers', icon: CloudRain },
  82: { ka: 'ძლიერი წვიმა', en: 'Heavy showers', icon: CloudRain },
  85: { ka: 'თოვლის ნალექი', en: 'Snow showers', icon: CloudSnow },
  86: { ka: 'ძლიერი თოვლი', en: 'Heavy snow showers', icon: CloudSnow },
  95: { ka: 'ჭექა-ქუხილი', en: 'Thunderstorm', icon: CloudLightning },
  96: { ka: 'ჭექა-ქუხილი სეტყვით', en: 'Thunderstorm with hail', icon: CloudLightning },
  99: { ka: 'ჭექა-ქუხილი სეტყვით', en: 'Thunderstorm with hail', icon: CloudLightning },
};

export const WeatherWidget = ({ lang }: WeatherWidgetProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [showTomorrow, setShowTomorrow] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather');
        if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
        const data = await res.json();
        
        if (data.daily) {
          const weatherCodes = data.daily.weather_code || data.daily.weathercode || [];
          const maxTemp = data.daily.temperature_2m_max || [0, 0];
          const minTemp = data.daily.temperature_2m_min || [0, 0];
          
          setWeather({
            today: {
              max: Math.round(maxTemp[0] !== undefined ? maxTemp[0] : 0),
              min: Math.round(minTemp[0] !== undefined ? minTemp[0] : 0),
              code: weatherCodes[0] !== undefined ? weatherCodes[0] : 0,
            },
            tomorrow: {
              max: Math.round(maxTemp[1] !== undefined ? maxTemp[1] : 0),
              min: Math.round(minTemp[1] !== undefined ? minTemp[1] : 0),
              code: weatherCodes[1] !== undefined ? weatherCodes[1] : 0,
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error instanceof Error ? error.message : String(error));
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 1800000); // Update every 30 mins
    return () => clearInterval(interval);
  }, []);

  if (!weather) return null;

  const current = showTomorrow ? weather.tomorrow : weather.today;
  const t = weatherTranslation[current.code] || { ka: 'უცნობია', en: 'Unknown', icon: Cloud };
  const Icon = t.icon;

  return (
    <div className="flex items-center gap-2 md:gap-4 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-2xl border border-blue-50 dark:border-slate-700">
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
          {showTomorrow 
            ? (lang === 'ka' ? 'ამინდი ხვალ' : 'Weather Tomorrow')
            : (lang === 'ka' ? 'ამინდი დღეს' : 'Weather Today')
          }
        </span>
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-blue-500" />
          <span className="font-black text-xs">
            {current.max}° / {current.min}°
          </span>
          <span className="text-[10px] font-bold text-slate-500 hidden sm:inline">
            {lang === 'ka' ? t.ka : t.en}
          </span>
        </div>
      </div>
      
      <button 
        onClick={() => setShowTomorrow(!showTomorrow)}
        className={`p-2 rounded-xl transition-all ${showTomorrow ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title={lang === 'ka' ? (showTomorrow ? 'ჩვენება დღეს' : 'ჩვენება ხვალ') : (showTomorrow ? 'Show Today' : 'Show Tomorrow')}
      >
        <ChevronRight size={18} className={`transition-transform duration-300 ${showTomorrow ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};
