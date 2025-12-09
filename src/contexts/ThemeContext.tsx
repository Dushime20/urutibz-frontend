import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAdminSettingsService } from '../services/adminSettings.service';
import type { ThemeSettings, ThemeMode } from '../types/adminSettings.types';
import { DEFAULT_THEME_SETTINGS } from '../types/adminSettings.types';

interface ThemeContextType {
  // Theme state
  theme: ThemeSettings;
  isDarkMode: boolean;
  themeMode: ThemeMode;
  
  // Theme actions
  toggleDarkMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  updateTheme: (updates: Partial<ThemeSettings>) => Promise<void>;
  resetTheme: () => Promise<void>;
  
  // Theme utilities
  applyTheme: (theme: ThemeSettings) => void;
  generateCSSVariables: (theme: ThemeSettings) => Record<string, string>;
  getSystemPreference: () => 'light' | 'dark';
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  token?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, token }) => {
  const [theme, setTheme] = useState<ThemeSettings>({
    mode: 'auto',
    primaryColor: '#0d9488',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#1e293b',
    borderColor: '#e2e8f0',
    fontFamily: 'Inter',
    fontSize: 'medium',
    borderRadius: 'medium',
    spacing: 'comfortable',
    animations: true,
    transitions: true,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Resolve token from prop or localStorage (fallback)
  const resolvedToken = token ?? (typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : '');

  // Initialize settings service with a token so Authorization header is sent
  const settingsService = getAdminSettingsService(resolvedToken);

  // Get system preference for 'auto' mode
  const getSystemPreference = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  // Generate CSS custom properties from theme
  const generateCSSVariables = useCallback((theme: ThemeSettings): Record<string, string> => {
    // Support multiple fonts by using the first as the primary displayed family
    const rawFont = String(theme.fontFamily || '').trim();
    const families = rawFont.split(/[,|]/).map(f => f.trim()).filter(Boolean);
    const primaryFont = families[0] || 'Inter';
    const isDark = theme.mode === 'dark' || (theme.mode === 'auto' && getSystemPreference() === 'dark');
    
    return {
      '--color-primary': theme.primaryColor,
      '--color-secondary': theme.secondaryColor,
      '--color-accent': theme.accentColor,
      '--color-background': isDark ? '#0f172a' : theme.backgroundColor,
      '--color-surface': isDark ? '#1e293b' : theme.surfaceColor,
      '--color-text': isDark ? '#f1f5f9' : theme.textColor,
      '--color-border': isDark ? '#334155' : theme.borderColor,
      '--font-family': rawFont || 'Inter, sans-serif',
      // Bind primary/secondary to the selected theme (first) font so headings/body follow it
      '--font-primary': primaryFont,
      '--font-secondary': primaryFont,
      // Keep a CSS variable for consumers; actual base size is also set on :root below
      '--font-size': /^[0-9]+(px|rem|em|%)$/i.test(String(theme.fontSize || '')) ? String(theme.fontSize) : '16px',
      '--border-radius': theme.borderRadius === 'none' ? '0px' : 
                       theme.borderRadius === 'small' ? '4px' : 
                       theme.borderRadius === 'large' ? '16px' : '8px',
      '--spacing': theme.spacing === 'compact' ? '0.5rem' : 
                  theme.spacing === 'spacious' ? '1.5rem' : '1rem',
      '--animation-duration': theme.animations ? '0.3s' : '0s',
      '--transition-duration': theme.transitions ? '0.2s' : '0s',
    };
  }, [getSystemPreference]);

  // Helper: inject Google Fonts link for the chosen font family
  const ensureFontLink = useCallback((fontFamily: string) => {
    try {
      if (!fontFamily) return;
      // Skip generic stacks like 'sans-serif' / 'system-ui'
      const generic = ['sans-serif','serif','monospace','system-ui','ui-sans-serif','ui-serif'];
      const parts = String(fontFamily)
        .split(/[,|]/)
        .map(s => s.trim().replace(/['"]/g, ''))
        .filter(s => s && !generic.includes(s.toLowerCase()));
      if (parts.length === 0) return;

      // Build Google Fonts multi-family URL
      const families = parts.map(name => `family=${encodeURIComponent(name.replace(/\s+/g, '+'))}:wght@400;500;600;700`).join('&');
      const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
      const id = 'theme-font-link';
      const existing = document.getElementById(id) as HTMLLinkElement | null;
      if (existing) {
        if (existing.getAttribute('href') !== href) existing.setAttribute('href', href);
        return;
      }
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    } catch {}
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((theme: ThemeSettings) => {
    const cssVariables = generateCSSVariables(theme);
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Apply dark mode class
    const isDark = theme.mode === 'dark' || (theme.mode === 'auto' && getSystemPreference() === 'dark');
    if (isDark) {
      // Respect chosen theme; only add when dark is selected
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set document base font size so it cascades across the app
    try {
      const baseSize = /^[0-9]+(px|rem|em|%)$/i.test(String(theme.fontSize || '')) ? String(theme.fontSize) : '16px';
      root.style.fontSize = baseSize;
    } catch {}

    // Ensure selected font is actually loaded
    ensureFontLink(theme.fontFamily);
    
    // Apply custom CSS if provided
    if (theme.customCSS) {
      let styleElement = document.getElementById('custom-theme-css');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-theme-css';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = theme.customCSS;
    }
  }, [generateCSSVariables, getSystemPreference, ensureFontLink]);

  // Load theme from API
  const loadTheme = useCallback(async () => {
    // Prefer locally saved theme immediately to avoid visual flicker/revert
    const savedThemeRaw = typeof window !== 'undefined' ? localStorage.getItem('theme-settings') : null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (savedThemeRaw) {
        try {
          const parsed = JSON.parse(savedThemeRaw);
          setTheme(parsed);
          applyTheme(parsed);
        } catch {}
      }

      // Check if user is authenticated before fetching theme settings
      if (!resolvedToken) {
        console.log('No authentication token, using default theme');
        // Use default theme for non-authenticated users
        if (!savedThemeRaw) {
          setTheme(DEFAULT_THEME_SETTINGS);
          applyTheme(DEFAULT_THEME_SETTINGS);
        }
        return;
      }
      
      const themeSettings = await settingsService.fetchThemeSettings();
      setTheme(themeSettings);
      applyTheme(themeSettings);
    } catch (err: any) {
      console.warn('Failed to load theme from server, using fallback:', err.message);
      // Don't set error state for theme issues - just use fallback silently
      
      // Fallback already applied above from localStorage; if none, ensure default
      if (!savedThemeRaw) {
        setTheme(DEFAULT_THEME_SETTINGS);
        applyTheme(DEFAULT_THEME_SETTINGS);
      }
    } finally {
      setIsLoading(false);
    }
  }, [settingsService, applyTheme, resolvedToken]);

  // Save theme to API
  const saveTheme = useCallback(async (themeUpdates: Partial<ThemeSettings>) => {
    try {
      setIsSaving(true);
      setError(null);
      
      // If user is not authenticated, just save to localStorage
      if (!resolvedToken) {
        console.log('No authentication token, saving theme to localStorage only');
        const updatedTheme = { ...theme, ...themeUpdates };
        setTheme(updatedTheme);
        applyTheme(updatedTheme);
        localStorage.setItem('theme-settings', JSON.stringify(updatedTheme));
        return;
      }
      
      const updatedTheme = await settingsService.updateThemeSettings(themeUpdates);
      setTheme(updatedTheme);
      applyTheme(updatedTheme);
      
      // Save to localStorage as backup
      localStorage.setItem('theme-settings', JSON.stringify(updatedTheme));
    } catch (err: any) {
      console.warn('Failed to save theme to server, saving to localStorage:', err.message);
      // Fallback to localStorage save
      const updatedTheme = { ...theme, ...themeUpdates };
      setTheme(updatedTheme);
      applyTheme(updatedTheme);
      localStorage.setItem('theme-settings', JSON.stringify(updatedTheme));
    } finally {
      setIsSaving(false);
    }
  }, [settingsService, applyTheme, resolvedToken, theme]);

  // Update theme
  const updateTheme = useCallback(async (updates: Partial<ThemeSettings>) => {
    // If fontFamily is being changed, only apply after successful save
    const isFontChange = Object.prototype.hasOwnProperty.call(updates, 'fontFamily');
    if (isFontChange) {
      await saveTheme(updates);
      return;
    }

    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    applyTheme(newTheme);

    // Save to localStorage immediately for responsive updates (non-font fields only)
    localStorage.setItem('theme-settings', JSON.stringify(newTheme));

    // Persist to API
    await saveTheme(updates);
  }, [theme, applyTheme, saveTheme]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newMode = theme.mode === 'dark' ? 'light' : 'dark';
    updateTheme({ mode: newMode });
  }, [theme.mode, updateTheme]);

  // Set theme mode
  const setThemeMode = useCallback((mode: ThemeMode) => {
    updateTheme({ mode });
  }, [updateTheme]);

  // Reset theme to defaults
  const resetTheme = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const defaultTheme = await settingsService.fetchThemeSettings();
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
      
      localStorage.setItem('theme-settings', JSON.stringify(defaultTheme));
    } catch (err: any) {
      console.error('Failed to reset theme:', err);
      setError(err.message || 'Failed to reset theme settings');
    } finally {
      setIsSaving(false);
    }
  }, [settingsService, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyTheme(theme);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, applyTheme]);

  // Initialize theme on mount
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Update token when it changes (prop or localStorage refresh)
  useEffect(() => {
    const latest = token ?? (typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : '');
    if (latest) {
      settingsService.setToken(latest);
    }
  }, [token, settingsService]);

  const contextValue: ThemeContextType = {
    theme,
    isDarkMode: theme.mode === 'dark' || (theme.mode === 'auto' && getSystemPreference() === 'dark'),
    themeMode: theme.mode,
    toggleDarkMode,
    setThemeMode,
    updateTheme,
    resetTheme,
    applyTheme,
    generateCSSVariables,
    getSystemPreference,
    isLoading,
    isSaving,
    error,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Legacy hook for backward compatibility
export const useDarkMode = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  return { isDarkMode, toggleDarkMode };
};

// Utility hook for theme-aware styling
export const useThemeStyles = () => {
  const { theme, generateCSSVariables } = useTheme();
  
  return {
    cssVariables: generateCSSVariables(theme),
    isDark: theme.mode === 'dark' || (theme.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    theme,
  };
};

export default ThemeContext;
