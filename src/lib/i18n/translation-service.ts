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
   * Translate text using MyMemory API
   */
  private async translateWithMyMemory(text: string, targetLang: string): Promise<string> {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.status === 429) {
        // Rate limited
        this.setRateLimit();
        throw new Error('Rate limited');
      }

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return data.responseData.translatedText;
      }

      throw new Error('Translation failed');
    } catch (error: any) {
      if (error.message === 'Rate limited') {
        throw error;
      }
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
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    
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

