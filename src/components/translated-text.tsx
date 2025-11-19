/**
 * TranslatedText Component
 * 
 * Automatically translates text based on the current language.
 * This is the recommended way to display translatable text in components.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TranslatedTextProps {
  /**
   * Text to translate (required)
   */
  text: string;
  
  /**
   * Fallback text if translation fails
   */
  fallback?: string;
  
  /**
   * HTML element type (default: 'span')
   */
  as?: keyof JSX.IntrinsicElements;
  
  /**
   * CSS classes
   */
  className?: string;
  
  /**
   * Target language (optional, uses current language if not provided)
   */
  targetLang?: string;
  
  /**
   * Additional props to pass to the element
   */
  [key: string]: any;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  fallback,
  as: Component = 'span',
  className,
  targetLang,
  ...props
}) => {
  const { t, tSync, language } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>(() => {
    // Start with cached translation if available
    return tSync(text, targetLang) || text;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get cached translation first
    const cached = tSync(text, targetLang);
    
    if (cached && cached !== text) {
      // We have a cached translation
      setTranslatedText(cached);
      setIsLoading(false);
    } else {
      // Try to translate if not cached
      setIsLoading(true);
      t(text, targetLang)
        .then((translated) => {
          setTranslatedText(translated);
          setIsLoading(false);
        })
        .catch(() => {
          // Use fallback or original text
          setTranslatedText(fallback || text);
          setIsLoading(false);
        });
    }
  }, [text, language, targetLang, t, tSync, fallback]);

  // If text is empty, return nothing
  if (!text || !text.trim()) {
    return null;
  }

  // Don't translate if already in English and target is English
  const targetLanguage = targetLang || language;
  if (targetLanguage === 'en') {
    return <Component className={className} {...props}>{text}</Component>;
  }

  return (
    <Component className={className} {...props}>
      {isLoading ? (fallback || text) : translatedText}
    </Component>
  );
};

