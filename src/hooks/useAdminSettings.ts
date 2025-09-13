import { useState, useEffect, useCallback, useRef } from 'react';
import { getAdminSettingsService } from '../services/adminSettings.service';
import type { 
  AdminSettings, 
  SettingsSection, 
  SettingsExport, 
  SettingsImport,
  SystemHealthResponse,
  BackupResponse 
} from '../types/adminSettings.types';

interface UseAdminSettingsOptions {
  token?: string;
  autoLoad?: boolean;
  cacheTimeout?: number;
  optimisticUpdates?: boolean;
}

interface UseAdminSettingsReturn {
  // Settings data
  settings: AdminSettings | null;
  systemHealth: SystemHealthResponse['data'] | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isExporting: boolean;
  isImporting: boolean;
  isBackingUp: boolean;
  
  // Error states
  error: string | null;
  validationErrors: Array<{ field: string; message: string; code: string }>;
  
  // Actions
  loadSettings: (section?: SettingsSection) => Promise<void>;
  updateSettings: (updates: Partial<AdminSettings>, section?: SettingsSection) => Promise<void>;
  resetSettings: () => Promise<void>;
  uploadCompanyLogo: (logoFile: File) => Promise<{ success: boolean; message: string; logoUrl?: string }>;
  createManualBackup: (backupData: { type: 'full' | 'settings' | 'users' | 'products' | 'bookings'; description: string }) => Promise<{ success: boolean; message: string; backupId?: string }>;
  exportSettings: () => Promise<SettingsExport>;
  importSettings: (importData: SettingsImport) => Promise<void>;
  validateSettings: (settings: Partial<AdminSettings>, section?: SettingsSection) => Promise<boolean>;
  
  // System operations
  loadSystemHealth: () => Promise<void>;
  triggerBackup: () => Promise<BackupResponse['data']>;
  clearCache: () => Promise<void>;
  
  // Utilities
  refreshSettings: () => Promise<void>;
  clearError: () => void;
  clearValidationErrors: () => void;
  
  // Cache management
  invalidateCache: () => void;
  isCacheValid: boolean;
  lastUpdated: Date | null;
}

export const useAdminSettings = (options: UseAdminSettingsOptions = {}): UseAdminSettingsReturn => {
  const {
    token,
    autoLoad = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    optimisticUpdates = true,
  } = options;

  // State management
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string; code: string }>>([]);
  
  // Cache management
  const cacheRef = useRef<{
    data: AdminSettings | null;
    timestamp: number;
    isValid: boolean;
  }>({
    data: null,
    timestamp: 0,
    isValid: false,
  });
  
  const lastUpdatedRef = useRef<Date | null>(null);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    const now = Date.now();
    return cacheRef.current.isValid && 
           cacheRef.current.data !== null && 
           (now - cacheRef.current.timestamp) < cacheTimeout;
  }, [cacheTimeout]);

  // Load settings from API
  const loadSettings = useCallback(async (section?: SettingsSection) => {
    if (!token) {
      setError('Authentication token required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const settingsService = getAdminSettingsService(token);
      let newSettings: AdminSettings;
      
      if (section) {
        // Load specific section
        const sectionData = await settingsService.fetchAllSettings();
        newSettings = sectionData;
      } else {
        // Load all settings
        newSettings = await settingsService.fetchAllSettings();
      }
      
      setSettings(newSettings);
      cacheRef.current = {
        data: newSettings,
        timestamp: Date.now(),
        isValid: true,
      };
      lastUpdatedRef.current = new Date();
      
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setError(err.message || 'Failed to load settings');
      
      // Fallback to cache if available
      if (cacheRef.current.data) {
        setSettings(cacheRef.current.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Update settings with optimistic updates
  const updateSettings = useCallback(async (updates: Partial<AdminSettings>, section?: SettingsSection) => {
    if (!token) {
      setError('Authentication token required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setValidationErrors([]);
      
      const settingsService = getAdminSettingsService(token);
      
      // Optimistic update
      if (optimisticUpdates && settings) {
        const optimisticSettings = { ...settings, ...updates };
        setSettings(optimisticSettings);
      }
      
      // Update via API - handle section-specific updates
      let updatedSettings: AdminSettings;
      
      if (section === 'theme') {
        // For theme updates, call the specific theme update method
        const updatedTheme = await settingsService.updateThemeSettings(updates as any);
        updatedSettings = { ...settings, theme: updatedTheme } as AdminSettings;
      } else if (section === 'business') {
        // For business updates, call the specific business update method
        const updatedBusiness = await settingsService.updateBusinessSettings(updates as any);
        updatedSettings = { ...settings, business: updatedBusiness } as AdminSettings;
      } else if (section === 'system') {
        // For system updates, call the specific system update method
        const updatedSystem = await settingsService.updateSystemSettings(updates as any);
        updatedSettings = { ...settings, system: updatedSystem } as AdminSettings;
      } else if (section === 'security') {
        // For security updates, call the specific security update method
        const updatedSecurity = await settingsService.updateSecuritySettings(updates as any);
        updatedSettings = { ...settings, security: updatedSecurity } as AdminSettings;
      } else if (section === 'notifications') {
        // For notification updates, call the specific notification update method
        const updatedNotifications = await settingsService.updateNotificationSettings(updates as any);
        updatedSettings = { ...settings, notifications: updatedNotifications } as AdminSettings;
      } else if (section === 'platform') {
        // For platform updates, call the specific platform update method
        const updatedPlatform = await settingsService.updatePlatformSettings(updates as any);
        updatedSettings = { ...settings, platform: updatedPlatform } as AdminSettings;
      } else if (section === 'backup') {
        // For backup updates, call the specific backup update method
        const updatedBackup = await settingsService.updateBackupSettings(updates as any);
        updatedSettings = { ...settings, backup: updatedBackup } as AdminSettings;
      } else {
        // For general updates, use the structured format
        const structuredUpdates = { [section || 'system']: updates };
        updatedSettings = await settingsService.updateAllSettings(structuredUpdates);
      }
      
      setSettings(updatedSettings);
      cacheRef.current = {
        data: updatedSettings,
        timestamp: Date.now(),
        isValid: true,
      };
      lastUpdatedRef.current = new Date();
      
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      setError(err.message || 'Failed to update settings');
      
      // Revert optimistic update
      if (optimisticUpdates && cacheRef.current.data) {
        setSettings(cacheRef.current.data);
      }
      
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [settings, optimisticUpdates, token]);

  // Reset settings to defaults
  const resetSettings = useCallback(async () => {
    if (!token) {
      setError('Authentication token required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const settingsService = getAdminSettingsService(token);
      const defaultSettings = await settingsService.resetAllSettings();
      setSettings(defaultSettings);
      cacheRef.current = {
        data: defaultSettings,
        timestamp: Date.now(),
        isValid: true,
      };
      lastUpdatedRef.current = new Date();
      
    } catch (err: any) {
      console.error('Failed to reset settings:', err);
      setError(err.message || 'Failed to reset settings');
    } finally {
      setIsSaving(false);
    }
  }, [token]);

  // Upload company logo
  const uploadCompanyLogo = useCallback(async (logoFile: File): Promise<{ success: boolean; message: string; logoUrl?: string }> => {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      const settingsService = getAdminSettingsService(token);
      const result = await settingsService.uploadCompanyLogo(logoFile);
      return result;
    } catch (err: any) {
      console.error('Failed to upload logo:', err);
      throw err;
    }
  }, [token]);

  // Create manual backup
  const createManualBackup = useCallback(async (backupData: { type: 'full' | 'settings' | 'users' | 'products' | 'bookings'; description: string }): Promise<{ success: boolean; message: string; backupId?: string }> => {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      const settingsService = getAdminSettingsService(token);
      const result = await settingsService.createManualBackup(backupData);
      return result;
    } catch (err: any) {
      console.error('Failed to create manual backup:', err);
      throw err;
    }
  }, [token]);

  // Export settings
  const exportSettings = useCallback(async (): Promise<SettingsExport> => {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      setIsExporting(true);
      setError(null);
      
      const settingsService = getAdminSettingsService(token);
      const exportData = await settingsService.exportSettings();
      return exportData;
      
    } catch (err: any) {
      console.error('Failed to export settings:', err);
      setError(err.message || 'Failed to export settings');
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [token]);

  // Import settings
  const importSettings = useCallback(async (importData: SettingsImport) => {
    if (!token) {
      setError('Authentication token required');
      return;
    }

    try {
      setIsImporting(true);
      setError(null);
      
      const settingsService = getAdminSettingsService(token);
      const importedSettings = await settingsService.importSettings(importData);
      setSettings(importedSettings);
      cacheRef.current = {
        data: importedSettings,
        timestamp: Date.now(),
        isValid: true,
      };
      lastUpdatedRef.current = new Date();
      
    } catch (err: any) {
      console.error('Failed to import settings:', err);
      setError(err.message || 'Failed to import settings');
      throw err;
    } finally {
      setIsImporting(false);
    }
  }, [token]);

  // Validate settings
  const validateSettings = useCallback(async (settingsToValidate: Partial<AdminSettings>, section?: SettingsSection): Promise<boolean> => {
    if (!token) {
      setError('Authentication token required');
      return false;
    }

    try {
      const settingsService = getAdminSettingsService(token);
      const validation = await settingsService.validateSettings(settingsToValidate, section);
      setValidationErrors(validation.errors);
      return validation.valid;
    } catch (err: any) {
      console.error('Failed to validate settings:', err);
      setError(err.message || 'Failed to validate settings');
      return false;
    }
  }, [token]);

  // Load system health
  const loadSystemHealth = useCallback(async () => {
    if (!token) {
      setError('Authentication token required');
      return;
    }

    try {
      setError(null);
      const settingsService = getAdminSettingsService(token);
      const health = await settingsService.getSystemHealth();
      setSystemHealth(health);
    } catch (err: any) {
      console.error('Failed to load system health:', err);
      setError(err.message || 'Failed to load system health');
    }
  }, [token]);

  // Trigger backup
  const triggerBackup = useCallback(async (): Promise<BackupResponse['data']> => {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      setIsBackingUp(true);
      setError(null);
      
      const settingsService = getAdminSettingsService(token);
      const backupData = await settingsService.triggerSystemBackup();
      return backupData;
      
    } catch (err: any) {
      console.error('Failed to trigger backup:', err);
      setError(err.message || 'Failed to trigger backup');
      throw err;
    } finally {
      setIsBackingUp(false);
    }
  }, [token]);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (!token) {
      setError('Authentication token required');
      return;
    }

    try {
      setError(null);
      const settingsService = getAdminSettingsService(token);
      await settingsService.clearSystemCache();
      
      // Invalidate local cache
      cacheRef.current.isValid = false;
      
    } catch (err: any) {
      console.error('Failed to clear cache:', err);
      setError(err.message || 'Failed to clear cache');
    }
  }, [token]);

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    cacheRef.current.isValid = false;
    await loadSettings();
  }, [loadSettings]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear validation errors
  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  // Invalidate cache
  const invalidateCache = useCallback(() => {
    cacheRef.current.isValid = false;
  }, []);

  // Auto-load settings on mount
  useEffect(() => {
    if (autoLoad && token) {
      loadSettings();
    }
  }, [autoLoad, token, loadSettings]);

  return {
    // Data
    settings,
    systemHealth,
    
    // Loading states
    isLoading,
    isSaving,
    isExporting,
    isImporting,
    isBackingUp,
    
    // Error states
    error,
    validationErrors,
    
    // Actions
    loadSettings,
    updateSettings,
    resetSettings,
    uploadCompanyLogo,
    createManualBackup,
    exportSettings,
    importSettings,
    validateSettings,
    
    // System operations
    loadSystemHealth,
    triggerBackup,
    clearCache,
    
    // Utilities
    refreshSettings,
    clearError,
    clearValidationErrors,
    
    // Cache management
    invalidateCache,
    isCacheValid: isCacheValid(),
    lastUpdated: lastUpdatedRef.current,
  };
};

export default useAdminSettings;
