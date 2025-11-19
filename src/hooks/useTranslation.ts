/**
 * useTranslation Hook
 * 
 * Convenient hook for accessing translation functionality in components.
 * This is a wrapper around useI18n that provides a cleaner API.
 */

import { useI18n } from '../contexts/i18n-context';

export const useTranslation = () => {
  const { language, setLanguage, t, tSync, translateBatch, translationService } = useI18n();

  return {
    /**
     * Current language code
     */
    language,

    /**
     * Set the current language
     */
    setLanguage,

    /**
     * Translate text asynchronously (will call API if not cached)
     */
    t,

    /**
     * Translate text synchronously (returns cached translation or original text)
     */
    tSync,

    /**
     * Translate multiple texts at once
     */
    translateBatch,

    /**
     * Direct access to translation service (for advanced usage)
     */
    translationService,
  };
};

