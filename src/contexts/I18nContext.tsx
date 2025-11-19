/**
 * DEPRECATED: This file is kept for backward compatibility.
 * 
 * All components should use the new translation system:
 * 
 * import { useTranslation } from '../hooks/useTranslation';
 * import { TranslatedText } from '../components/translated-text';
 * 
 * This file now exports a wrapper that uses the new translation system internally
 * so old components using useI18n() will still work.
 */

import { createContext } from 'react';
import { useI18n as useNewI18n } from './i18n-context';

// Re-export useI18n for backward compatibility - now uses new system
export const useI18n = () => {
  const { language, setLanguage, tSync } = useNewI18n();
  
  return {
    language,
    setLanguage,
    t: tSync, // Map tSync to t for backward compatibility
    translations: {} // Not used anymore, kept for type compatibility
  };
};

// Re-export I18nProvider from new system for backward compatibility
export { I18nProvider } from './i18n-context';

// Empty context for backward compatibility
const I18nContext = createContext<any>(undefined);
export default I18nContext;

