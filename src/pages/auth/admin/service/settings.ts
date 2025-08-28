import axios from 'axios';
import { API_BASE_URL, createAuthHeaders, createJsonHeaders, handleApiError } from './config';

// Settings Management API Functions

// Interface for platform settings
export interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  defaultLanguage: string;
  supportedLanguages?: Array<{
    code: string;
    label?: string;
    nativeName?: string;
    flag?: string;
    enabled?: boolean;
  }>;
  timezone: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  phoneVerificationRequired: boolean;
  kycRequired: boolean;
  maxImagesPerProduct: number;
  maxProductsPerUser: number;
  autoApproveProducts: boolean;
  autoApproveUsers: boolean;
}

// Interface for security settings
export interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
  enableCaptcha: boolean;
  ipWhitelist: string[];
  allowedFileTypes: string[];
  maxFileSize: number;
  enableAuditLog: boolean;
  dataRetentionDays: number;
}

// Interface for notification settings
export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  adminAlerts: boolean;
  bookingNotifications: boolean;
  paymentNotifications: boolean;
  reviewNotifications: boolean;
  systemMaintenanceAlerts: boolean;
}

// Interface for system settings
export interface SystemSettings {
  cacheEnabled: boolean;
  cacheTimeout: number;
  backupEnabled: boolean;
  backupFrequency: string;
  logLevel: string;
  debugMode: boolean;
  apiRateLimit: number;
  maxConcurrentUsers: number;
}

// Combined settings interface
export interface AdminSettings {
  platform: PlatformSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  system: SystemSettings;
}

/**
 * Fetch all admin settings
 */
export async function fetchAdminSettings(token?: string): Promise<AdminSettings> {
  const url = `${API_BASE_URL}/admin/settings`;
  try {
    const response = await axios.get(url, { 
      headers: createAuthHeaders(token) 
    });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch settings');
    console.error('Error fetching admin settings:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Update admin settings
 */
export async function updateAdminSettings(settings: Partial<AdminSettings>, token?: string): Promise<AdminSettings> {
  const url = `${API_BASE_URL}/admin/settings`;
  try {
    const response = await axios.put(url, settings, { 
      headers: createJsonHeaders(token) 
    });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to update settings');
    console.error('Error updating admin settings:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Reset admin settings to defaults
 */
export async function resetAdminSettings(token?: string): Promise<AdminSettings> {
  const url = `${API_BASE_URL}/admin/settings/reset`;
  try {
    const response = await axios.post(url, {}, { 
      headers: createAuthHeaders(token) 
    });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to reset settings');
    console.error('Error resetting admin settings:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Fetch system health and status
 */
export async function fetchSystemHealth(token?: string) {
  const url = `${API_BASE_URL}/admin/system/health`;
  try {
    const response = await axios.get(url, { 
      headers: createAuthHeaders(token) 
    });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch system health');
    console.error('Error fetching system health:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Fetch system logs
 */
export async function fetchSystemLogs(
  level?: string,
  limit: number = 100,
  token?: string
) {
  const url = `${API_BASE_URL}/admin/system/logs`;
  try {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    params.append('limit', limit.toString());
    
    const response = await axios.get(`${url}?${params.toString()}`, { 
      headers: createAuthHeaders(token) 
    });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch system logs');
    console.error('Error fetching system logs:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Clear system cache
 */
export async function clearSystemCache(token?: string) {
  const url = `${API_BASE_URL}/admin/system/cache/clear`;
  try {
    const response = await axios.post(url, {}, { 
      headers: createAuthHeaders(token) 
    });
    return response.data;
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to clear cache');
    console.error('Error clearing system cache:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Trigger system backup
 */
export async function triggerSystemBackup(token?: string) {
  const url = `${API_BASE_URL}/admin/system/backup`;
  try {
    const response = await axios.post(url, {}, { 
      headers: createAuthHeaders(token) 
    });
    return response.data;
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to trigger backup');
    console.error('Error triggering system backup:', errorMsg);
    throw new Error(errorMsg);
  }
}
