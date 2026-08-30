import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import ur from '../locales/ur.json';
import roman_urdu from '../locales/roman_urdu.json';
import pa from '../locales/pa.json';
import sd from '../locales/sd.json';
import ps from '../locales/ps.json';
import bal from '../locales/bal.json';
import skr from '../locales/skr.json';

type Language = 'en' | 'ur' | 'roman_urdu' | 'pa' | 'sd' | 'ps' | 'bal' | 'skr';

const translations: Record<Language, Record<string, string>> = {
  en,
  ur,
  roman_urdu,
  pa,
  sd,
  ps,
  bal,
  skr
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  autoDetect: boolean;
  setAutoDetect: (auto: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const [autoDetect, setAutoDetectState] = useState<boolean>(() => {
    const saved = localStorage.getItem('auto_detect_language');
    return saved ? saved === 'true' : true;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // If user locks a language, disable auto detect
    if (lang !== 'en' && autoDetect) {
      setAutoDetect(false);
    }
  };

  const setAutoDetect = (auto: boolean) => {
    setAutoDetectState(auto);
    localStorage.setItem('auto_detect_language', String(auto));
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const currentDict = translations[language] || translations['en'];
    let text = currentDict[key] || translations['en'][key] || key;

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, autoDetect, setAutoDetect }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
