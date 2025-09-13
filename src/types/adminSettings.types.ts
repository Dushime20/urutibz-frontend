// Comprehensive Admin Settings TypeScript Interfaces

// Theme Settings
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  fontSize: string; // API expects pixel values like "20px"
  borderRadius: string; // API expects pixel values like "12px"
  spacing: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
  transitions: boolean;
  customCSS?: string;
}

// Business Settings
export interface BusinessSettings {
  companyName: string;
  companyLogo?: string;
  businessType: 'marketplace' | 'rental' | 'both';
  currency: string;
  supportedCurrencies: string[];
  taxRate: number;
  commissionRate: number;
  minimumBookingDuration: number;
  maximumBookingDuration: number;
  timezone: string;
  autoApproval?: boolean;
  cancellationPolicy: string;
  refundPolicy: string;
  termsOfService: string;
  privacyPolicy: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    website: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

// System Settings
export interface SystemSettings {
  cacheEnabled: boolean;
  cacheTimeout: number;
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  debugMode: boolean;
  apiRateLimit: number;
  maxConcurrentUsers: number;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  autoUpdates: boolean;
  performanceMonitoring: boolean;
  errorReporting: boolean;
}

// Security Settings
export interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
  requireTwoFactor: boolean;
  enableCaptcha: boolean;
  captchaProvider: 'google' | 'hcaptcha' | 'custom';
  captchaSiteKey?: string;
  ipWhitelist: string[];
  allowedFileTypes: string[];
  maxFileSize: number;
  enableAuditLog: boolean;
  dataRetentionDays: number;
  encryptionEnabled: boolean;
  sslRequired: boolean;
  corsOrigins: string[];
}

// Notification Settings
export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  adminAlerts: boolean;
  bookingNotifications: boolean;
  paymentNotifications: boolean;
  reviewNotifications: boolean;
  systemMaintenanceAlerts: boolean;
  marketingEmails: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  realTimeUpdates: boolean;
  notificationChannels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  notificationTemplates: {
    welcome: boolean;
    bookingConfirmation: boolean;
    paymentReceived: boolean;
    reviewRequest: boolean;
    maintenanceAlert: boolean;
  };
}

// Platform Settings
export interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  siteKeywords: string[];
  siteLogo?: string;
  siteFavicon?: string;
  defaultLanguage: string;
  supportedLanguages: Array<{
    code: string;
    label: string;
    nativeName: string;
    flag: string;
    enabled: boolean;
    rtl: boolean;
  }>;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  phoneVerificationRequired: boolean;
  kycRequired: boolean;
  maxImagesPerProduct: number;
  maxProductsPerUser: number;
  autoApproveProducts: boolean;
  autoApproveUsers: boolean;
  featuredProductsLimit: number;
  searchResultsPerPage: number;
  enableReviews: boolean;
  enableRatings: boolean;
  enableWishlist: boolean;
  enableSocialLogin: boolean;
  socialProviders: {
    google: boolean;
    facebook: boolean;
    twitter: boolean;
    github: boolean;
  };
}

// Backup Settings
export interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  includeMedia: boolean;
  includeDatabase: boolean;
  includeLogs: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  storageProvider: 'local' | 'aws' | 'google' | 'azure';
  storageConfig?: {
    bucket?: string;
    region?: string;
    accessKey?: string;
    secretKey?: string;
  };
  lastBackup?: string;
  nextBackup?: string;
  backupSize?: number;
}

// Analytics Settings
export interface AnalyticsSettings {
  googleAnalytics: {
    enabled: boolean;
    trackingId?: string;
  };
  facebookPixel: {
    enabled: boolean;
    pixelId?: string;
  };
  customAnalytics: {
    enabled: boolean;
    script?: string;
  };
  performanceTracking: boolean;
  userBehaviorTracking: boolean;
  conversionTracking: boolean;
  privacyCompliant: boolean;
  cookieConsent: boolean;
}

// Complete Admin Settings Interface
export interface AdminSettings {
  theme: ThemeSettings;
  business: BusinessSettings;
  system: SystemSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  platform: PlatformSettings;
  backup: BackupSettings;
  analytics: AnalyticsSettings;
  lastModified?: string;
  modifiedBy?: string;
  version?: string;
}

// API Response Types
export interface SettingsResponse {
  success: boolean;
  data: AdminSettings;
  message?: string;
}

export interface SettingsUpdateResponse {
  success: boolean;
  data: AdminSettings;
  message?: string;
  changes?: string[];
}

export interface BackupResponse {
  success: boolean;
  data: {
    backupId: string;
    filename: string;
    size: number;
    createdAt: string;
    downloadUrl?: string;
  };
  message?: string;
}

export interface SystemHealthResponse {
  success: boolean;
  data: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
    database: {
      connected: boolean;
      responseTime: number;
    };
    cache: {
      enabled: boolean;
      hitRate: number;
    };
    lastBackup?: string;
    version: string;
  };
}

// Form Validation Types
export interface SettingsFormData {
  [key: string]: any;
}

export interface SettingsValidationError {
  field: string;
  message: string;
  code: string;
}

// Export/Import Types
export interface SettingsExport {
  version: string;
  exportedAt: string;
  exportedBy: string;
  settings: AdminSettings;
  metadata: {
    environment: string;
    version: string;
    checksum: string;
  };
}

export interface SettingsImport {
  file: File;
  validateOnly?: boolean;
  mergeMode?: 'replace' | 'merge' | 'selective';
  selectedSections?: string[];
}

// Real-time Update Types
export interface SettingsUpdateEvent {
  type: 'settings_updated';
  section: string;
  changes: Record<string, any>;
  timestamp: string;
  updatedBy: string;
}

export interface SettingsConflictEvent {
  type: 'settings_conflict';
  section: string;
  localChanges: Record<string, any>;
  remoteChanges: Record<string, any>;
  timestamp: string;
  conflictId: string;
}

// Utility Types
export type SettingsSection = keyof AdminSettings;
export type ThemeMode = ThemeSettings['mode'];
export type LogLevel = SystemSettings['logLevel'];
export type BackupFrequency = BackupSettings['frequency'];
export type NotificationChannel = keyof NotificationSettings['notificationChannels'];

// Default Settings
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
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
};

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  companyName: 'Urutibz',
  businessType: 'marketplace',
  currency: 'USD',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'RWF'],
  taxRate: 0,
  commissionRate: 5,
  minimumBookingDuration: 1,
  maximumBookingDuration: 365,
  timezone: 'Africa/Kigali',
  autoApproval: false,
  cancellationPolicy: '',
  refundPolicy: '',
  termsOfService: '',
  privacyPolicy: '',
  contactInfo: {
    email: '',
    phone: '',
    address: '',
    website: '',
  },
  socialMedia: {},
};

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  cacheEnabled: true,
  cacheTimeout: 300,
  backupEnabled: true,
  backupFrequency: 'daily',
  logLevel: 'info',
  debugMode: false,
  apiRateLimit: 1000,
  maxConcurrentUsers: 1000,
  maintenanceMode: false,
  autoUpdates: true,
  performanceMonitoring: true,
  errorReporting: true,
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  sessionTimeout: 3600,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  passwordRequireSpecialChars: true,
  passwordRequireNumbers: true,
  passwordRequireUppercase: true,
  requireTwoFactor: false,
  enableCaptcha: false,
  captchaProvider: 'google',
  ipWhitelist: [],
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
  maxFileSize: 10485760, // 10MB
  enableAuditLog: true,
  dataRetentionDays: 365,
  encryptionEnabled: true,
  sslRequired: true,
  corsOrigins: [],
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  adminAlerts: true,
  bookingNotifications: true,
  paymentNotifications: true,
  reviewNotifications: true,
  systemMaintenanceAlerts: true,
  marketingEmails: false,
  weeklyReports: true,
  monthlyReports: true,
  realTimeUpdates: true,
  notificationChannels: {
    email: true,
    sms: false,
    push: true,
    inApp: true,
  },
  notificationTemplates: {
    welcome: true,
    bookingConfirmation: true,
    paymentReceived: true,
    reviewRequest: true,
    maintenanceAlert: true,
  },
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  siteName: 'Urutibz',
  siteDescription: 'Your trusted marketplace for rentals',
  siteKeywords: ['rental', 'marketplace', 'items', 'equipment'],
  defaultLanguage: 'en',
  supportedLanguages: [
    { code: 'en', label: 'English', nativeName: 'English', flag: '🇺🇸', enabled: true, rtl: false },
    { code: 'fr', label: 'French', nativeName: 'Français', flag: '🇫🇷', enabled: true, rtl: false },
    { code: 'rw', label: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼', enabled: true, rtl: false },
  ],
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  registrationEnabled: true,
  emailVerificationRequired: true,
  phoneVerificationRequired: false,
  kycRequired: false,
  maxImagesPerProduct: 10,
  maxProductsPerUser: 50,
  autoApproveProducts: false,
  autoApproveUsers: false,
  featuredProductsLimit: 20,
  searchResultsPerPage: 20,
  enableReviews: true,
  enableRatings: true,
  enableWishlist: true,
  enableSocialLogin: false,
  socialProviders: {
    google: false,
    facebook: false,
    twitter: false,
    github: false,
  },
};

export const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  enabled: true,
  frequency: 'daily',
  retentionDays: 30,
  includeMedia: true,
  includeDatabase: true,
  includeLogs: false,
  compressionEnabled: true,
  encryptionEnabled: false,
  storageProvider: 'local',
};

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  googleAnalytics: { enabled: false },
  facebookPixel: { enabled: false },
  customAnalytics: { enabled: false },
  performanceTracking: true,
  userBehaviorTracking: true,
  conversionTracking: true,
  privacyCompliant: true,
  cookieConsent: true,
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  theme: DEFAULT_THEME_SETTINGS,
  business: DEFAULT_BUSINESS_SETTINGS,
  system: DEFAULT_SYSTEM_SETTINGS,
  security: DEFAULT_SECURITY_SETTINGS,
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  platform: DEFAULT_PLATFORM_SETTINGS,
  backup: DEFAULT_BACKUP_SETTINGS,
  analytics: DEFAULT_ANALYTICS_SETTINGS,
};
