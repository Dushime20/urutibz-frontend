/**
 * LanguageSwitcher Component
 * 
 * Provides a dropdown UI for selecting the application language.
 * Automatically triggers re-translation of all components when language changes.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

// Supported languages as per documentation
const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
];

interface LanguageSwitcherProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Show flag emoji
   */
  showFlag?: boolean;
  
  /**
   * Show native name
   */
  showNativeName?: boolean;
  
  /**
   * Custom button text/icon
   */
  buttonClassName?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  showFlag = true,
  showNativeName = true,
  buttonClassName = '',
}) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === language) || SUPPORTED_LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === language) {
      setIsOpen(false);
      return;
    }

    setIsTranslating(true);
    setIsOpen(false);
    
    try {
      setLanguage(langCode);
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        className={`
          flex items-center space-x-2 px-3 py-2 
          text-platform-grey dark:text-gray-300 
          hover:text-platform-dark-grey dark:hover:text-white 
          hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 
          rounded-platform transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${buttonClassName}
        `}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        {isTranslating ? (
          <span className="text-sm">...</span>
        ) : (
          <>
            {showFlag && <span>{currentLanguage.flag}</span>}
            <span className="text-sm">
              {showNativeName ? currentLanguage.nativeName : currentLanguage.name}
            </span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-platform shadow-platform-lg border border-platform-light-grey dark:border-gray-600 py-1 z-50 max-h-96 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full flex items-center space-x-3 px-4 py-2 text-sm 
                hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 
                transition-colors duration-200 text-left
                ${
                  language === lang.code
                    ? 'text-platform-primary dark:text-[#01aaa7] font-medium bg-platform-light-grey/30 dark:bg-gray-700/50'
                    : 'text-platform-grey dark:text-gray-300 hover:text-platform-dark-grey dark:hover:text-white'
                }
              `}
            >
              {showFlag && <span className="text-lg">{lang.flag}</span>}
              <div className="flex flex-col">
                <span className="font-medium">{showNativeName ? lang.nativeName : lang.name}</span>
                {showNativeName && lang.name !== lang.nativeName && (
                  <span className="text-xs opacity-70">{lang.name}</span>
                )}
              </div>
              {language === lang.code && (
                <span className="ml-auto text-platform-primary dark:text-[#01aaa7]">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

