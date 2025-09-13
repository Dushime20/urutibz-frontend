import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL, createAuthHeaders, createJsonHeaders, handleApiError } from '../pages/admin/service/config';
import type {
  AdminSettings,
  SettingsResponse,
  SettingsUpdateResponse,
  BackupResponse,
  SystemHealthResponse,
  SettingsExport,
  SettingsImport,
  SettingsSection,
  ThemeSettings,
  BusinessSettings,
  SystemSettings,
  SecuritySettings,
  NotificationSettings,
  PlatformSettings,
  BackupSettings,
  AnalyticsSettings,
} from '../types/adminSettings.types';
import { DEFAULT_SECURITY_SETTINGS, DEFAULT_NOTIFICATION_SETTINGS, DEFAULT_PLATFORM_SETTINGS } from '../types/adminSettings.types';

// Service class for comprehensive admin settings management
export class AdminSettingsService {
  private baseUrl: string;
  public token?: string;

  constructor(token?: string) {
    this.baseUrl = `${API_BASE_URL}`;
    this.token = token;
  }

  // Update authentication token
  setToken(token: string) {
    this.token = token;
  }

  // Generic API call wrapper with error handling
  private async apiCall<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config = {
        method,
        url,
        data,
        headers: headers || createAuthHeaders(this.token),
      };

      const response: AxiosResponse<T> = await axios(config);
      return response.data;
    } catch (error: any) {
      const errorMessage = handleApiError(error, `Failed to ${method} ${endpoint}`);
      console.error(`AdminSettings API Error [${method} ${endpoint}]:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  // ==================== GENERAL SETTINGS ====================

  /**
   * Fetch all admin settings
   */
  async fetchAllSettings(): Promise<AdminSettings> {
    // Since we don't have a single endpoint for all settings, we'll fetch them individually
    const [systemSettings, themeSettings, securitySettings, businessSettings, notificationSettings] = await Promise.allSettled([
      this.fetchSystemSettings(),
      this.fetchThemeSettings(),
      this.fetchSecuritySettings(),
      this.fetchBusinessSettings(),
      this.fetchNotificationSettings()
    ]);

    return {
      system: systemSettings.status === 'fulfilled' ? systemSettings.value : {} as SystemSettings,
      theme: themeSettings.status === 'fulfilled' ? themeSettings.value : {} as ThemeSettings,
      security: securitySettings.status === 'fulfilled' ? securitySettings.value : {} as SecuritySettings,
      business: businessSettings.status === 'fulfilled' ? businessSettings.value : {} as BusinessSettings,
      notifications: notificationSettings.status === 'fulfilled' ? notificationSettings.value : {} as NotificationSettings,
      analytics: {} as AnalyticsSettings,
      backup: {} as BackupSettings,
      platform: {} as PlatformSettings
    };
  }

  /**
   * Update all admin settings
   */
  async updateAllSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
    // Update each section individually since we don't have a single endpoint
    const updates = [];
    
    if (settings.system) {
      updates.push(this.updateSystemSettings(settings.system));
    }
    if (settings.theme) {
      updates.push(this.updateThemeSettings(settings.theme));
    }
    if (settings.security) {
      updates.push(this.updateSecuritySettings(settings.security));
    }
    if (settings.business) {
      updates.push(this.updateBusinessSettings(settings.business));
    }
    if (settings.notifications) {
      updates.push(this.updateNotificationSettings(settings.notifications));
    }
    
    await Promise.allSettled(updates);
    
    // Return the updated settings
    return await this.fetchAllSettings();
  }

  /**
   * Reset all settings to defaults
   */
  async resetAllSettings(): Promise<AdminSettings> {
    const response = await this.apiCall<SettingsResponse>('POST', '/reset');
    return response.data;
  }

  /**
   * Export settings to JSON
   */
  async exportSettings(): Promise<SettingsExport> {
    const response = await this.apiCall<{ data: SettingsExport }>('GET', '/export');
    return response.data;
  }

  /**
   * Import settings from JSON
   */
  async importSettings(importData: SettingsImport): Promise<AdminSettings> {
    const formData = new FormData();
    formData.append('file', importData.file);
    formData.append('validateOnly', String(importData.validateOnly || false));
    formData.append('mergeMode', importData.mergeMode || 'replace');
    if (importData.selectedSections) {
      formData.append('selectedSections', JSON.stringify(importData.selectedSections));
    }

    const response = await this.apiCall<SettingsUpdateResponse>('POST', '/import', formData, {
      ...createAuthHeaders(this.token),
      'Content-Type': 'multipart/form-data',
    });
    return response.data;
  }

  // ==================== SECTION-SPECIFIC SETTINGS ====================

  /**
   * Fetch theme settings
   */
  async fetchThemeSettings(): Promise<ThemeSettings> {
    const response = await this.apiCall<{ 
      success: boolean;
      message: string;
      data: Record<string, { value: any; type: string; description: string }>;
    }>('GET', '/admin/settings/theme');
    
    // Transform the API response format to ThemeSettings format
    const themeData: Partial<ThemeSettings> = {};
    
    Object.entries(response.data).forEach(([key, setting]) => {
      (themeData as any)[key] = setting.value;
    });
    
    console.log('Fetched theme settings:', themeData);
    return themeData as ThemeSettings;
  }

  /**
   * Update theme settings
   */
  async updateThemeSettings(settings: Partial<ThemeSettings>): Promise<ThemeSettings> {
    // Send settings directly as a flat object (not as type/value array)
    console.log('Sending theme settings to API:', settings);
    
    const response = await this.apiCall<{ 
      success: boolean;
      message: string;
      data: Record<string, { value: any; type: string; description: string }>;
    }>('PUT', '/admin/settings/theme', settings, createJsonHeaders(this.token));
    
    console.log('API response:', response);
    
    // Transform the API response format to ThemeSettings format
    const themeData: Partial<ThemeSettings> = {};
    
    Object.entries(response.data).forEach(([key, setting]) => {
      (themeData as any)[key] = setting.value;
    });
    
    console.log('Transformed theme settings:', themeData);
    return themeData as ThemeSettings;
  }

  /**
   * Fetch business settings
   */
  async fetchBusinessSettings(): Promise<BusinessSettings> {
    const response = await this.apiCall<{ 
      success: boolean;
      message: string;
      data: Record<string, { value: any; type: string; description: string }>;
    }>('GET', '/admin/settings/business');
    
    // Transform the API response format to BusinessSettings format
    const businessData: Partial<BusinessSettings> = {};
    
    Object.entries(response.data).forEach(([key, setting]) => {
      // Handle field name mappings
      let mappedKey = key;
      if (key === 'maxBookingDuration') mappedKey = 'maximumBookingDuration';
      if (key === 'minBookingDuration') mappedKey = 'minimumBookingDuration';
      if (key === 'platformLogo') mappedKey = 'companyLogo';
      
      // Handle special cases
      if (key === 'platformLogo' && typeof setting.value === 'string' && setting.value.startsWith('{')) {
        // Parse nested JSON for platformLogo
        try {
          const parsed = JSON.parse(setting.value);
          (businessData as any)[mappedKey] = parsed.value;
        } catch {
          (businessData as any)[mappedKey] = setting.value;
        }
      } else {
        (businessData as any)[mappedKey] = setting.value;
      }
    });
    
    console.log('Transformed business settings:', businessData);
    return businessData as BusinessSettings;
  }

  /**
   * Update business settings
   */
  async updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const response = await this.apiCall<{ data: BusinessSettings }>('PUT', '/admin/settings/business', settings, createJsonHeaders(this.token));
    return response.data;
  }

  /**
   * Upload company logo
   */
  async uploadCompanyLogo(logoFile: File): Promise<{ success: boolean; message: string; logoUrl?: string }> {
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      // Don't set Content-Type for FormData, let browser set it with boundary
    };
    
    const response = await this.apiCall<{ success: boolean; message: string; logoUrl?: string }>('POST', '/admin/settings/logo', formData, headers);
    return response;
  }

  /**
   * Fetch system settings
   */
  async fetchSystemSettings(): Promise<SystemSettings> {
    const response = await this.apiCall<{ 
      success: boolean;
      message: string;
      data: Record<string, { value: any; type: string; description: string }>;
    }>('GET', '/admin/settings/system');
    
    // Transform the API response format to SystemSettings format
    const systemData: Partial<SystemSettings> = {};
    
    Object.entries(response.data).forEach(([key, setting]) => {
      // Convert string values to appropriate types
      let value = setting.value;
      
      // Boolean fields
      if (['maintenanceMode', 'registrationEnabled', 'emailNotifications', 'smsNotifications', 
           'analyticsEnabled', 'autoApproveProducts', 'autoBackupEnabled', 'cacheEnabled', 
           'contentModerationEnabled'].includes(key)) {
        value = setting.value === 'true' || setting.value === true;
      } 
      // Number fields
      else if (['maxFileSize', 'sessionTimeout', 'apiRateLimit', 'maxLoginAttempts', 'passwordMinLength'].includes(key)) {
        value = parseInt(setting.value) || 0;
      }
      // String fields (default)
      else {
        value = setting.value;
      }
      
      (systemData as any)[key] = value;
    });
    
    console.log('Transformed system settings:', systemData);
    return systemData as SystemSettings;
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    // Transform the settings to the API format
    const apiSettings: Record<string, string> = {};
    
    Object.entries(settings).forEach(([key, value]) => {
      // Convert values to strings as expected by the API
      if (typeof value === 'boolean') {
        apiSettings[key] = value.toString();
      } else if (typeof value === 'number') {
        apiSettings[key] = value.toString();
      } else {
        apiSettings[key] = value as string;
      }
    });
    
    const payload = { settings: apiSettings };
    console.log('Sending system settings to API:', payload);
    
    const response = await this.apiCall<{ 
      success: boolean;
      message: string;
      data: SystemSettings;
    }>('PUT', '/admin/settings/system', payload, createJsonHeaders(this.token));
    
    console.log('System settings update response:', response);
    return response.data;
  }

  /**
   * Fetch security settings
   */
  async fetchSecuritySettings(): Promise<SecuritySettings> {
    const response = await this.apiCall<{ 
      success: boolean;
      message: string;
      data: Record<string, {
        value: string;
        type: string;
        description: string;
      }>;
    }>('GET', '/admin/settings/security');
    
    // Transform the API response format to SecuritySettings format
    const securityData: Partial<SecuritySettings> = {};
    
    Object.entries(response.data).forEach(([key, setting]) => {
      try {
        let parsedValue: any = setting.value;
        
        // Parse JSON strings for complex objects
        if (setting.type === 'object' || setting.value.startsWith('{')) {
          const parsed = JSON.parse(setting.value);
          parsedValue = parsed.value || parsed;
        }
        
        // Convert values to appropriate types based on field
        if (key === 'auditLogRetention' || key === 'maxLoginAttempts' || key === 'sessionTimeout') {
          (securityData as any)[key] = parseInt(parsedValue) || 0;
        } else if (key === 'twoFactorRequired') {
          (securityData as any)[key] = parsedValue === 'true' || parsedValue === true;
        } else if (key === 'ipWhitelist') {
          (securityData as any)[key] = Array.isArray(parsedValue) ? parsedValue : [];
        } else if (key === 'passwordPolicy') {
          // Handle password policy object
          (securityData as any)[key] = {
            minLength: parseInt(parsedValue.minLength) || 8,
            requireUppercase: parsedValue.requireUppercase === 'true' || parsedValue.requireUppercase === true,
            requireNumbers: parsedValue.requireNumbers === 'true' || parsedValue.requireNumbers === true,
            requireSymbols: parsedValue.requireSymbols === 'true' || parsedValue.requireSymbols === true,
          };
        } else {
          // Default case - keep as string
          (securityData as any)[key] = parsedValue;
        }
      } catch (error) {
        console.warn(`Failed to parse security setting ${key}:`, error);
        // Use default value if parsing fails
        (securityData as any)[key] = (DEFAULT_SECURITY_SETTINGS as any)[key];
      }
    });
    
    console.log('Transformed security settings:', securityData);
    return securityData as SecuritySettings;
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const response = await this.apiCall<{ data: SecuritySettings }>('PUT', '/admin/settings/security', settings, createJsonHeaders(this.token));
    return response.data;
  }

  /**
   * Fetch notification settings
   */
  async fetchNotificationSettings(): Promise<NotificationSettings> {
    const response = await this.apiCall<{ 
      success: boolean;
      message: string;
      data: Record<string, {
        value: any;
        type: string;
        description: string;
      }>;
    }>('GET', '/admin/settings/notifications');
    
    // Transform the API response format to NotificationSettings format
    const notificationData: Partial<NotificationSettings> = {};
    
    Object.entries(response.data).forEach(([key, setting]) => {
      try {
        let value = setting.value;
        
        // Parse JSON strings for complex objects
        if (setting.type === 'object' && typeof setting.value === 'string') {
          value = JSON.parse(setting.value);
        }
        
        // Convert values to appropriate types based on field
        if (['emailEnabled', 'smsEnabled', 'pushEnabled', 'adminAlerts'].includes(key)) {
          value = value === 'true' || value === true;
        } else if (key === 'quietHours') {
          value = {
            enabled: value.enabled === 'true' || value.enabled === true,
            start: value.start || '22:00',
            end: value.end || '08:00',
          };
        } else if (key === 'systemMaintenance') {
          value = {
            enabled: value.enabled === 'true' || value.enabled === true,
            message: value.message || '',
            scheduledAt: value.scheduledAt || null,
          };
        }
        
        (notificationData as any)[key] = value;
      } catch (error) {
        console.warn(`Failed to parse notification setting ${key}:`, error);
        // Use default value if parsing fails
        (notificationData as any)[key] = (DEFAULT_NOTIFICATION_SETTINGS as any)[key];
      }
    });
    
    console.log('Transformed notification settings:', notificationData);
    return notificationData as NotificationSettings;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await this.apiCall<{ data: NotificationSettings }>('PUT', '/admin/settings/notifications', settings, createJsonHeaders(this.token));
    return response.data;
  }

  /**
   * Fetch platform settings
   */
  async fetchPlatformSettings(): Promise<PlatformSettings> {
    const response = await this.apiCall<{ 
      success: boolean;
      message: string;
      data: Record<string, {
        value: any;
        type: string;
        description: string;
      }>;
    }>('GET', '/admin/settings/platform');
    
    // Transform the API response format to PlatformSettings format
    const platformData: Partial<PlatformSettings> = {};
    
    Object.entries(response.data).forEach(([key, setting]) => {
      try {
        let value = setting.value;
        
        // Convert values to appropriate types based on field
        if (['allowUserRegistration', 'requireEmailVerification', 'allowGuestBookings', 'autoApproveListings', 'requireListingVerification', 'moderationEnabled', 'enableCookies'].includes(key)) {
          value = value === 'true' || value === true;
        } else if (['searchRadius', 'maxSearchResults', 'featuredListingsCount'].includes(key)) {
          value = parseInt(value) || 0;
        } else if (key === 'supportedLanguages') {
          // Handle array values
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch {
              value = value.split(',').map((item: string) => item.trim());
            }
          }
        }
        
        (platformData as any)[key] = value;
      } catch (error) {
        console.warn(`Failed to parse platform setting ${key}:`, error);
        // Use default value if parsing fails
        (platformData as any)[key] = (DEFAULT_PLATFORM_SETTINGS as any)[key];
      }
    });
    
    console.log('Transformed platform settings:', platformData);
    return platformData as PlatformSettings;
  }

  /**
   * Update platform settings
   */
  async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const response = await this.apiCall<{ data: PlatformSettings }>('PUT', '/admin/settings/platform', settings, createJsonHeaders(this.token));
    return response.data;
  }

  /**
   * Fetch backup settings
   */
  async fetchBackupSettings(): Promise<BackupSettings> {
    const response = await this.apiCall<{ data: BackupSettings }>('GET', '/backup');
    return response.data;
  }

  /**
   * Update backup settings
   */
  async updateBackupSettings(settings: Partial<BackupSettings>): Promise<BackupSettings> {
    const response = await this.apiCall<{ data: BackupSettings }>('PUT', '/backup', settings, createJsonHeaders(this.token));
    return response.data;
  }

  /**
   * Fetch analytics settings
   */
  async fetchAnalyticsSettings(): Promise<AnalyticsSettings> {
    const response = await this.apiCall<{ data: AnalyticsSettings }>('GET', '/analytics');
    return response.data;
  }

  /**
   * Update analytics settings
   */
  async updateAnalyticsSettings(settings: Partial<AnalyticsSettings>): Promise<AnalyticsSettings> {
    const response = await this.apiCall<{ data: AnalyticsSettings }>('PUT', '/analytics', settings, createJsonHeaders(this.token));
    return response.data;
  }

  // ==================== SYSTEM OPERATIONS ====================

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealthResponse['data']> {
    const response = await this.apiCall<SystemHealthResponse>('GET', '/admin/system/health');
    return response.data;
  }

  /**
   * Clear system cache
   */
  async clearSystemCache(): Promise<{ success: boolean; message: string }> {
    const response = await this.apiCall<{ success: boolean; message: string }>('POST', '/system/cache/clear');
    return response;
  }

  /**
   * Trigger system backup
   */
  async triggerSystemBackup(): Promise<BackupResponse['data']> {
    const response = await this.apiCall<BackupResponse>('POST', '/system/backup');
    return response.data;
  }

  /**
   * Get backup history
   */
  async getBackupHistory(): Promise<BackupResponse['data'][]> {
    const response = await this.apiCall<{ data: BackupResponse['data'][] }>('GET', '/system/backups');
    return response.data;
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.apiCall<{ success: boolean; message: string }>('POST', `/system/backups/${backupId}/restore`);
    return response;
  }

  /**
   * Download backup file
   */
  async downloadBackup(backupId: string): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseUrl}/system/backups/${backupId}/download`, {
        headers: createAuthHeaders(this.token),
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'Failed to download backup');
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.apiCall<{ success: boolean; message: string }>('DELETE', `/system/backups/${backupId}`);
    return response;
  }

  // ==================== VALIDATION ====================

  /**
   * Validate settings before saving
   */
  async validateSettings(settings: Partial<AdminSettings>, section?: SettingsSection): Promise<{
    valid: boolean;
    errors: Array<{ field: string; message: string; code: string }>;
  }> {
    // Flatten nested settings into individual type/value pairs
    const transformedSettings: Array<{ type: string; value: any }> = [];
    
    const flattenSettings = (obj: any, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          // Recursively flatten nested objects
          flattenSettings(value, fullKey);
        } else {
          // Add as type/value pair
          transformedSettings.push({
            type: fullKey,
            value: value
          });
        }
      });
    };
    
    flattenSettings(settings);
    
    const response = await this.apiCall<{
      valid: boolean;
      errors: Array<{ field: string; message: string; code: string }>;
    }>('POST', '/validate', transformedSettings, createJsonHeaders(this.token));
    return response;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get settings schema for form generation
   */
  async getSettingsSchema(): Promise<any> {
    const response = await this.apiCall<{ data: any }>('GET', '/schema');
    return response.data;
  }

  /**
   * Get available options for select fields
   */
  async getSettingsOptions(): Promise<{
    currencies: string[];
    languages: Array<{ code: string; name: string; nativeName: string }>;
    timezones: string[];
    fontFamilies: string[];
    themes: Array<{ name: string; colors: Record<string, string> }>;
  }> {
    const response = await this.apiCall<{ data: any }>('GET', '/options');
    return response.data;
  }

  /**
   * Preview theme changes
   */
  async previewTheme(themeSettings: Partial<ThemeSettings>): Promise<{
    css: string;
    preview: string;
  }> {
    const response = await this.apiCall<{ data: { css: string; preview: string } }>('POST', '/theme/preview', themeSettings, createJsonHeaders(this.token));
    return response.data;
  }

  /**
   * Test notification settings
   */
  async testNotification(channel: 'email' | 'sms' | 'push', settings: Partial<NotificationSettings>): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.apiCall<{ success: boolean; message: string }>('POST', `/notifications/test/${channel}`, settings, createJsonHeaders(this.token));
    return response;
  }

  /**
   * Get settings change history
   */
  async getSettingsHistory(section?: SettingsSection, limit: number = 50): Promise<Array<{
    id: string;
    section: string;
    changes: Record<string, any>;
    timestamp: string;
    changedBy: string;
    changeType: 'create' | 'update' | 'delete';
  }>> {
    const params = new URLSearchParams();
    if (section) params.append('section', section);
    params.append('limit', limit.toString());
    
    const response = await this.apiCall<{ data: any[] }>('GET', `/history?${params.toString()}`);
    return response.data;
  }

  /**
   * Rollback settings to previous version
   */
  async rollbackSettings(historyId: string): Promise<AdminSettings> {
    const response = await this.apiCall<SettingsResponse>('POST', `/history/${historyId}/rollback`);
    return response.data;
  }

  /**
   * Fetch all settings
   */
  async fetchAllSettings(): Promise<AdminSettings> {
    try {
      const [
        themeSettings,
        businessSettings,
        systemSettings,
        securitySettings,
        notificationSettings,
        platformSettings,
        // TODO: Add other settings when implemented
        // backupSettings,
        // analyticsSettings,
      ] = await Promise.all([
        this.fetchThemeSettings(),
        this.fetchBusinessSettings(),
        this.fetchSystemSettings(),
        this.fetchSecuritySettings(),
        this.fetchNotificationSettings(),
        this.fetchPlatformSettings(),
        // TODO: Add other settings when implemented
        // this.fetchBackupSettings(),
        // this.fetchAnalyticsSettings(),
      ]);

      return {
        theme: themeSettings,
        business: businessSettings,
        system: systemSettings,
        security: securitySettings,
        notifications: notificationSettings,
        platform: platformSettings,
        // TODO: Add other settings when implemented
        // backup: backupSettings,
        // analytics: analyticsSettings,
      } as AdminSettings;
    } catch (error) {
      console.error('Failed to fetch all settings:', error);
      throw error;
    }
  }
}

// Create singleton instance
let settingsServiceInstance: AdminSettingsService | null = null;

export const getAdminSettingsService = (token?: string): AdminSettingsService => {
  if (!settingsServiceInstance || (token && settingsServiceInstance.token !== token)) {
    settingsServiceInstance = new AdminSettingsService(token);
  }
  return settingsServiceInstance;
};

// Export individual functions for backward compatibility
export const fetchAdminSettings = (token?: string) => {
  const service = getAdminSettingsService(token);
  return service.fetchAllSettings();
};

export const updateAdminSettings = (settings: Partial<AdminSettings>, token?: string) => {
  const service = getAdminSettingsService(token);
  return service.updateAllSettings(settings);
};

export const resetAdminSettings = (token?: string) => {
  const service = getAdminSettingsService(token);
  return service.resetAllSettings();
};

export const exportAdminSettings = (token?: string) => {
  const service = getAdminSettingsService(token);
  return service.exportSettings();
};

export const importAdminSettings = (importData: SettingsImport, token?: string) => {
  const service = getAdminSettingsService(token);
  return service.importSettings(importData);
};

export const getSystemHealth = (token?: string) => {
  const service = getAdminSettingsService(token);
  return service.getSystemHealth();
};

export const triggerSystemBackup = (token?: string) => {
  const service = getAdminSettingsService(token);
  return service.triggerSystemBackup();
};

export const clearSystemCache = (token?: string) => {
  const service = getAdminSettingsService(token);
  return service.clearSystemCache();
};

// Export the service class and types
export default AdminSettingsService;
