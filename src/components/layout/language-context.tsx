"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

export type Language = "de" | "en";

type TranslationKey = keyof typeof translations.de;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ 
  children,
  initialLanguage = "de"
}: { 
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language;
    const cookieLang = typeof document !== "undefined" 
      ? document.cookie.split("; ").find(row => row.startsWith("lang="))?.split("=")[1] as Language
      : undefined;
    
    let detectedLang: Language = "de";
    if (savedLang === "de" || savedLang === "en") {
      detectedLang = savedLang;
    } else if (cookieLang === "de" || cookieLang === "en") {
      detectedLang = cookieLang;
    } else {
      const browserLang = typeof navigator !== "undefined"
        ? navigator.language.slice(0, 2).toLowerCase()
        : "de";
      detectedLang = browserLang === "en" ? "en" : "de";
    }

    if (detectedLang !== initialLanguage) {
      localStorage.setItem("lang", detectedLang);
      document.cookie = `lang=${detectedLang}; path=/; max-age=31536000; SameSite=Lax`;
      window.location.reload();
    } else {
      localStorage.setItem("lang", initialLanguage);
      document.cookie = `lang=${initialLanguage}; path=/; max-age=31536000; SameSite=Lax`;
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
    // Write cookie so server components can access if needed
    document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    const dict = translations[language] || translations.de;
    let text = dict[key] || translations.de[key] || String(key);

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
