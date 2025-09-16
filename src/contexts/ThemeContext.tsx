import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAdminSettingsService } from '../services/adminSettings.service';
import type { ThemeSettings, ThemeMode } from '../types/adminSettings.types';

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
  
  // Initialize settings service
  const settingsService = getAdminSettingsService(token);

  // Get system preference for 'auto' mode
  const getSystemPreference = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  // Generate CSS custom properties from theme
  const generateCSSVariables = useCallback((theme: ThemeSettings): Record<string, string> => {
    const isDark = theme.mode === 'dark' || (theme.mode === 'auto' && getSystemPreference() === 'dark');
    
    return {
      '--color-primary': theme.primaryColor,
      '--color-secondary': theme.secondaryColor,
      '--color-accent': theme.accentColor,
      '--color-background': isDark ? '#0f172a' : theme.backgroundColor,
      '--color-surface': isDark ? '#1e293b' : theme.surfaceColor,
      '--color-text': isDark ? '#f1f5f9' : theme.textColor,
      '--color-border': isDark ? '#334155' : theme.borderColor,
      '--font-family': theme.fontFamily,
      '--font-size': theme.fontSize === 'small' ? '14px' : theme.fontSize === 'large' ? '18px' : '16px',
      '--border-radius': theme.borderRadius === 'none' ? '0px' : 
                       theme.borderRadius === 'small' ? '4px' : 
                       theme.borderRadius === 'large' ? '16px' : '8px',
      '--spacing': theme.spacing === 'compact' ? '0.5rem' : 
                  theme.spacing === 'spacious' ? '1.5rem' : '1rem',
      '--animation-duration': theme.animations ? '0.3s' : '0s',
      '--transition-duration': theme.transitions ? '0.2s' : '0s',
    };
  }, [getSystemPreference]);

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
  }, [generateCSSVariables, getSystemPreference]);

  // Load theme from API
  const loadTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const themeSettings = await settingsService.fetchThemeSettings();
      setTheme(themeSettings);
      applyTheme(themeSettings);
    } catch (err: any) {
      console.error('Failed to load theme:', err);
      setError(err.message || 'Failed to load theme settings');
      
      // Fallback to localStorage or default
      const savedTheme = localStorage.getItem('theme-settings');
      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme);
          setTheme(parsedTheme);
          applyTheme(parsedTheme);
        } catch (parseError) {
          console.error('Failed to parse saved theme:', parseError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [settingsService, applyTheme]);

  // Save theme to API
  const saveTheme = useCallback(async (themeUpdates: Partial<ThemeSettings>) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const updatedTheme = await settingsService.updateThemeSettings(themeUpdates);
      setTheme(updatedTheme);
      applyTheme(updatedTheme);
      
      // Save to localStorage as backup
      localStorage.setItem('theme-settings', JSON.stringify(updatedTheme));
    } catch (err: any) {
      console.error('Failed to save theme:', err);
      setError(err.message || 'Failed to save theme settings');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [settingsService, applyTheme]);

  // Update theme
  const updateTheme = useCallback(async (updates: Partial<ThemeSettings>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    applyTheme(newTheme);
    
    // Save to localStorage immediately for responsive updates
    localStorage.setItem('theme-settings', JSON.stringify(newTheme));
    
    // Save to API
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

  // Update token when it changes
  useEffect(() => {
    if (token) {
      settingsService.setToken(token);
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
