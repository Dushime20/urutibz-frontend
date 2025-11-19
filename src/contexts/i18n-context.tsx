/**
 * I18n Context Provider
 * 
 * Provides React context for language management and translation functionality.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translationService, TranslationService } from '../lib/i18n/translation-service';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (text: string, targetLang?: string) => Promise<string>;
  tSync: (text: string, targetLang?: string) => string;
  translateBatch: (texts: string[], targetLang?: string) => Promise<string[]>;
  translationService: TranslationService;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
  googleTranslateApiKey?: string;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  defaultLanguage = 'en',
  googleTranslateApiKey,
}) => {
  const [language, setLanguageState] = useState<string>(() => {
    // Get language from localStorage or use default
    const stored = localStorage.getItem('language');
    return stored || defaultLanguage;
  });

  // Initialize translation service
  useEffect(() => {
    translationService.init(defaultLanguage, googleTranslateApiKey);
    translationService.setLanguage(language);
  }, [defaultLanguage, googleTranslateApiKey]);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguageState(event.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  // Update service when language changes
  useEffect(() => {
    translationService.setLanguage(language);
  }, [language]);

  const setLanguage = (lang: string) => {
    translationService.setLanguage(lang);
    setLanguageState(lang);
  };

  const t = async (text: string, targetLang?: string): Promise<string> => {
    return translationService.translate(text, targetLang || language);
  };

  const tSync = (text: string, targetLang?: string): string => {
    return translationService.getCachedTranslation(text, targetLang || language);
  };

  const translateBatch = async (texts: string[], targetLang?: string): Promise<string[]> => {
    return translationService.translateBatch(texts, targetLang || language);
  };

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    tSync,
    translateBatch,
    translationService,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

/**
 * Hook to use I18n context
 */
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

