import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAdminSettings } from '../hooks/useAdminSettings';
import type { AdminSettings, SettingsSection } from '../types/adminSettings.types';

interface AdminSettingsContextType {
  settings: AdminSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updateSection: (section: SettingsSection, updates: Partial<AdminSettings>) => Promise<void>;
  refresh: () => Promise<void>;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  formatDate: (date: Date | string | number) => string;
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined);

interface AdminSettingsProviderProps {
  children: React.ReactNode;
  token?: string;
}

export const AdminSettingsProvider: React.FC<AdminSettingsProviderProps> = ({ children, token }) => {
  const {
    settings,
    isLoading,
    isSaving,
    error,
    updateSettings,
    loadSettings,
  } = useAdminSettings({ token, autoLoad: true, optimisticUpdates: true });

  const [appliedTitle, setAppliedTitle] = useState<string | null>(null);
  const [appliedLang, setAppliedLang] = useState<string | null>(null);

  // Apply basic platform/business settings globally: title and lang
  useEffect(() => {
    if (!settings) return;

    const siteTitle = settings.platform?.siteName || settings.business?.companyName;
    if (siteTitle && siteTitle !== appliedTitle) {
      document.title = siteTitle;
      setAppliedTitle(siteTitle);
    }

    const lang = settings.platform?.defaultLanguage || 'en';
    if (lang && lang !== appliedLang) {
      try {
        document.documentElement.setAttribute('lang', lang);
        setAppliedLang(lang);
      } catch { }
    }
  }, [settings, appliedLang, appliedTitle]);

  // Listen for external updates (e.g., settings saved in Admin)
  useEffect(() => {
    const onUpdated = () => {
      // Refresh to pick up latest flags like maintenance
      loadSettings();
    };
    window.addEventListener('admin:settings-updated', onUpdated as EventListener);
    return () => window.removeEventListener('admin:settings-updated', onUpdated as EventListener);
  }, [loadSettings]);

  // Apply maintenance body class when enabled (system or notifications.systemMaintenance)
  useEffect(() => {
    const enabled = Boolean(
      settings?.system?.maintenanceMode || settings?.notifications?.systemMaintenance?.enabled
    );
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('maintenance-mode');
    } else {
      root.classList.remove('maintenance-mode');
    }

    // Debug exposure (safe to keep, helpful for diagnosis)
    try {
      (window as any).__appSettings = settings;
      (window as any).__maintenanceFlags = {
        system: settings?.system?.maintenanceMode,
        notif: settings?.notifications?.systemMaintenance?.enabled,
        message: settings?.notifications?.systemMaintenance?.message,
      };
      // Uncomment to log once for debugging
      // console.log('maintenance flags', (window as any).__maintenanceFlags);
    } catch { }
  }, [settings?.system?.maintenanceMode, settings?.notifications?.systemMaintenance?.enabled]);

  const updateSection = useCallback(async (section: SettingsSection, updates: Partial<AdminSettings>) => {
    await updateSettings(updates, section);
  }, [updateSettings]);

  const formatCurrency = useCallback((amount: number, currencyCode?: string) => {
    const code = currencyCode || settings?.platform?.currency || settings?.business?.currency || 'USD';
    const locale = (settings?.platform?.defaultLanguage || 'en') + '-US';
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${code}`;
    }
  }, [settings?.platform?.currency, settings?.business?.currency, settings?.platform?.defaultLanguage]);

  const formatDate = useCallback((date: Date | string | number) => {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const locale = (settings?.platform?.defaultLanguage || 'en') + '-US';
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
      }).format(d);
    } catch {
      return d.toISOString();
    }
  }, [settings?.platform?.defaultLanguage]);

  const value = useMemo<AdminSettingsContextType>(() => ({
    settings,
    isLoading,
    isSaving,
    error,
    updateSection,
    refresh: async () => { await loadSettings(); },
    formatCurrency,
    formatDate,
  }), [settings, isLoading, isSaving, error, updateSection, loadSettings, formatCurrency, formatDate]);

  return (
    <AdminSettingsContext.Provider value={value}>
      {children}
    </AdminSettingsContext.Provider>
  );
};

export const useAdminSettingsContext = (): AdminSettingsContextType => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) {
    throw new Error('useAdminSettingsContext must be used within an AdminSettingsProvider');
  }
  return ctx;
};

export default AdminSettingsContext;


