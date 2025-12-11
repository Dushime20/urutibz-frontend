/**
 * Core Translation Service
 * 
 * Provides dynamic, on-the-fly translation using MyMemory Translation API
 * with smart caching, rate limit handling, and optional Google Translate support.
 */

interface CacheEntry {
  [language: string]: string;
}

interface TranslationCache {
  [text: string]: CacheEntry;
}

interface RateLimitStatus {
  isLimited: boolean;
  minutesRemaining: number;
  expiresAt: number | null;
}

const CACHE_KEY = 'translation_cache';
const RATE_LIMIT_KEY = 'translation_rate_limit';
const CACHE_MAX_SIZE = 4 * 1024 * 1024; // 4MB
const RATE_LIMIT_DURATION = 60 * 60 * 1000; // 1 hour

export class TranslationService {
  private currentLanguage: string = 'en';
  private googleTranslateApiKey: string | null = null;
  private componentCache: TranslationCache = {};
  
  /**
   * Get list of all supported language codes
   * These match the languages in the language switcher dropdown
   */
  getSupportedLanguages(): string[] {
    return [
      'en', 'fr', 'sw', 'es', 'pt', 'ar', 'zh', 'hi', 'de', 'it',
      'ja', 'ko', 'ru', 'tr', 'vi', 'nl', 'pl', 'th', 'uk', 'rw'
    ];
  }
  
  /**
   * Check if a language code is supported
   */
  isLanguageSupported(lang: string): boolean {
    const normalized = this.normalizeLanguageCode(lang);
    return this.getSupportedLanguages().includes(normalized);
  }

  /**
   * Initialize the translation service
   */
  init(defaultLanguage: string = 'en', googleApiKey?: string): void {
    this.currentLanguage = defaultLanguage || this.getStoredLanguage() || 'en';
    this.googleTranslateApiKey = googleApiKey || null;
    this.loadCache();
  }

  /**
   * Get stored language from localStorage
   */
  private getStoredLanguage(): string | null {
    return localStorage.getItem('language') || null;
  }

  /**
   * Load cache from localStorage
   */
  private loadCache(): void {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        this.componentCache = JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to load translation cache:', error);
      this.componentCache = {};
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCache(): void {
    try {
      const cacheString = JSON.stringify(this.componentCache);
      const size = new Blob([cacheString]).size;
      
      if (size > CACHE_MAX_SIZE) {
        console.warn('Translation cache exceeded size limit, clearing...');
        this.clearCache();
        return;
      }
      
      localStorage.setItem(CACHE_KEY, cacheString);
    } catch (error) {
      console.warn('Failed to save translation cache:', error);
      // Clear cache if save fails (might be full)
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearCache();
      }
    }
  }

  /**
   * Get cache key for text
   */
  private getCacheKey(text: string): string {
    return text.toLowerCase().trim();
  }

  /**
   * Check if rate limited
   */
  getRateLimitStatus(): RateLimitStatus {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (!stored) {
        return { isLimited: false, minutesRemaining: 0, expiresAt: null };
      }

      const { expiresAt } = JSON.parse(stored);
      const now = Date.now();

      if (expiresAt && now < expiresAt) {
        const minutesRemaining = Math.ceil((expiresAt - now) / (60 * 1000));
        return { isLimited: true, minutesRemaining, expiresAt };
      }

      // Rate limit expired, clear it
      localStorage.removeItem(RATE_LIMIT_KEY);
      return { isLimited: false, minutesRemaining: 0, expiresAt: null };
    } catch (error) {
      return { isLimited: false, minutesRemaining: 0, expiresAt: null };
    }
  }

  /**
   * Set rate limit
   */
  private setRateLimit(): void {
    const expiresAt = Date.now() + RATE_LIMIT_DURATION;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ expiresAt }));
  }

  /**
   * Clear rate limit
   */
  clearRateLimit(): void {
    localStorage.removeItem(RATE_LIMIT_KEY);
  }

  /**
   * Normalize language code for API compatibility
   * MyMemory API uses 2-letter ISO 639-1 codes
   * All languages from the language switcher dropdown are supported
   */
  private normalizeLanguageCode(lang: string): string {
    // Extract 2-letter code if format is like 'pt-BR' or 'es-ES'
    const twoLetterCode = lang.toLowerCase().split('-')[0];
    
    // MyMemory API supported codes (2-letter ISO 639-1)
    // These match ALL languages in the language switcher dropdown (19 languages)
    const supportedCodes = [
      'en', // English (source language, no translation needed)
      'fr', // French - Français
      'sw', // Swahili - Kiswahili
      'es', // Spanish - Español
      'pt', // Portuguese - Português
      'ar', // Arabic - العربية
      'zh', // Chinese - 中文
      'hi', // Hindi - हिन्दी
      'de', // German - Deutsch
      'it', // Italian - Italiano
      'ja', // Japanese - 日本語
      'ko', // Korean - 한국어
      'ru', // Russian - Русский
      'tr', // Turkish - Türkçe
      'vi', // Vietnamese - Tiếng Việt
      'nl', // Dutch - Nederlands
      'pl', // Polish - Polski
      'th', // Thai - ไทย
      'uk', // Ukrainian - Українська
      'rw'  // Kinyarwanda (used in admin but not in main dropdown)
    ];
    
    // Validate that the language code is supported
    if (!supportedCodes.includes(twoLetterCode)) {
      console.warn(`Language code "${lang}" (normalized to "${twoLetterCode}") may not be supported by MyMemory API. Using as-is.`);
    }
    
    // Return 2-letter code if supported, otherwise return as-is
    return supportedCodes.includes(twoLetterCode) ? twoLetterCode : lang.toLowerCase();
  }

  /**
   * Translate text using MyMemory API
   */
  private async translateWithMyMemory(text: string, targetLang: string): Promise<string> {
    // Normalize language code to 2-letter format
    const normalizedLang = this.normalizeLanguageCode(targetLang);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${normalizedLang}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.status === 429) {
        // Rate limited
        this.setRateLimit();
        throw new Error('Rate limited');
      }

      // Check for successful response
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        // Sometimes MyMemory returns the same text if translation fails
        // Also check if translation is actually different (not just whitespace changes)
        const normalizedOriginal = text.trim().toLowerCase();
        const normalizedTranslated = translated.trim().toLowerCase();
        
        if (translated && translated.trim() && normalizedTranslated !== normalizedOriginal) {
          return translated;
        } else {
          // Translation returned but it's the same as original - might be API issue
          console.warn('MyMemory returned same text as translation:', {
            text: text.substring(0, 50),
            targetLang: normalizedLang,
            translated: translated?.substring(0, 50)
          });
        }
      }

      // Log error details for debugging
      console.warn('MyMemory translation failed:', {
        text: text.substring(0, 50),
        targetLang: normalizedLang,
        originalLang: targetLang,
        responseStatus: data.responseStatus,
        responseData: data.responseData,
        fullResponse: data
      });

      // Check for specific error codes
      if (data.responseStatus === 403) {
        throw new Error(`Translation API access denied for language ${normalizedLang}. Please check API configuration.`);
      }
      
      if (data.responseStatus === 400) {
        throw new Error(`Invalid language code: ${normalizedLang}. Language may not be supported.`);
      }

      throw new Error(`Translation failed: ${data.responseStatus || 'Unknown error'} - ${JSON.stringify(data.responseData || {})}`);
    } catch (error: any) {
      if (error.message === 'Rate limited') {
        throw error;
      }
      console.error('MyMemory API error for language', normalizedLang, ':', error);
      throw new Error(`Translation API error: ${error.message}`);
    }
  }

  /**
   * Translate text using Google Translate API (if configured)
   */
  private async translateWithGoogle(text: string, targetLang: string): Promise<string> {
    if (!this.googleTranslateApiKey) {
      throw new Error('Google Translate API key not configured');
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${this.googleTranslateApiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text',
        }),
      });

      if (response.status === 429) {
        this.setRateLimit();
        throw new Error('Rate limited');
      }

      const data = await response.json();
      
      if (data.data?.translations?.[0]?.translatedText) {
        return data.data.translations[0].translatedText;
      }

      throw new Error('Translation failed');
    } catch (error: any) {
      if (error.message === 'Rate limited') {
        throw error;
      }
      throw new Error(`Google Translate API error: ${error.message}`);
    }
  }

  /**
   * Translate text to target language
   */
  async translate(text: string, targetLang?: string): Promise<string> {
    if (!text || !text.trim()) {
      return text;
    }

    const language = targetLang || this.currentLanguage;
    
    // Don't translate if already in English
    if (language === 'en') {
      return text;
    }

    const cacheKey = this.getCacheKey(text);

    // Check component cache first
    if (this.componentCache[cacheKey]?.[language]) {
      return this.componentCache[cacheKey][language];
    }

    // Check localStorage cache
    const storedCache = this.getStoredCache();
    if (storedCache[cacheKey]?.[language]) {
      const translation = storedCache[cacheKey][language];
      // Update component cache
      if (!this.componentCache[cacheKey]) {
        this.componentCache[cacheKey] = {};
      }
      this.componentCache[cacheKey][language] = translation;
      return translation;
    }

    // Check rate limit
    const rateLimitStatus = this.getRateLimitStatus();
    if (rateLimitStatus.isLimited) {
      console.warn(`Translation rate limited. ${rateLimitStatus.minutesRemaining} minutes remaining.`);
      return text; // Return original text as fallback
    }

    // Translate via API
    try {
      let translated: string;
      
      // Try Google Translate first if available
      if (this.googleTranslateApiKey) {
        try {
          translated = await this.translateWithGoogle(text, language);
        } catch (error) {
          // Fallback to MyMemory if Google fails
          translated = await this.translateWithMyMemory(text, language);
        }
      } else {
        translated = await this.translateWithMyMemory(text, language);
      }

      // Cache the translation
      this.cacheTranslation(cacheKey, language, translated);
      
      return translated;
    } catch (error: any) {
      console.warn('Translation failed:', error.message);
      return text; // Return original text as fallback
    }
  }

  /**
   * Translate multiple texts at once
   */
  async translateBatch(texts: string[], targetLang?: string): Promise<string[]> {
    const language = targetLang || this.currentLanguage;
    
    if (language === 'en') {
      return texts;
    }

    // Translate in parallel (with some batching to avoid overwhelming the API)
    const batchSize = 5;
    const results: string[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(text => this.translate(text, language))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get stored cache from localStorage
   */
  private getStoredCache(): TranslationCache {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  }

  /**
   * Cache a translation
   */
  private cacheTranslation(cacheKey: string, language: string, translation: string): void {
    // Update component cache
    if (!this.componentCache[cacheKey]) {
      this.componentCache[cacheKey] = {};
    }
    this.componentCache[cacheKey][language] = translation;

    // Update localStorage cache
    const storedCache = this.getStoredCache();
    if (!storedCache[cacheKey]) {
      storedCache[cacheKey] = {};
    }
    storedCache[cacheKey][language] = translation;

    try {
      const cacheString = JSON.stringify(storedCache);
      const size = new Blob([cacheString]).size;
      
      if (size <= CACHE_MAX_SIZE) {
        localStorage.setItem(CACHE_KEY, cacheString);
      }
    } catch (error) {
      // Cache might be full, ignore
    }
  }

  /**
   * Get current language
   */
  getLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Set current language
   */
  setLanguage(language: string): void {
    const previousLanguage = this.currentLanguage;
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    
    // Clear component cache when language changes to force fresh translations
    if (previousLanguage !== language) {
      this.componentCache = {};
    }
    
    // Dispatch language change event
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language } 
    }));
  }

  /**
   * Clear all cached translations
   */
  clearCache(): void {
    this.componentCache = {};
    localStorage.removeItem(CACHE_KEY);
  }

  /**
   * Clear cache for specific language
   */
  clearLanguageCache(language: string): void {
    const storedCache = this.getStoredCache();
    let modified = false;

    for (const key in storedCache) {
      if (storedCache[key][language]) {
        delete storedCache[key][language];
        modified = true;
      }
    }

    if (modified) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(storedCache));
    }

    // Clear component cache
    for (const key in this.componentCache) {
      if (this.componentCache[key][language]) {
        delete this.componentCache[key][language];
      }
    }
  }

  /**
   * Clean cache (remove warnings)
   */
  cleanCache(): void {
    // This can be used to remove any problematic cache entries
    this.loadCache();
  }

  /**
   * Configure Google Translate API
   */
  configureGoogleTranslate(apiKey: string): void {
    this.googleTranslateApiKey = apiKey;
  }

  /**
   * Get cached translation synchronously (returns original if not cached)
   */
  getCachedTranslation(text: string, targetLang?: string): string {
    if (!text || !text.trim()) {
      return text;
    }

    const language = targetLang || this.currentLanguage;
    
    if (language === 'en') {
      return text;
    }

    const cacheKey = this.getCacheKey(text);

    // Check component cache
    if (this.componentCache[cacheKey]?.[language]) {
      return this.componentCache[cacheKey][language];
    }

    // Check stored cache
    const storedCache = this.getStoredCache();
    if (storedCache[cacheKey]?.[language]) {
      const translation = storedCache[cacheKey][language];
      // Update component cache
      if (!this.componentCache[cacheKey]) {
        this.componentCache[cacheKey] = {};
      }
      this.componentCache[cacheKey][language] = translation;
      return translation;
    }

    return text; // Return original if not cached
  }
}

// Export singleton instance
export const translationService = new TranslationService();

