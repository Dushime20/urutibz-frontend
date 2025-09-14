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
  appName: string;
  appVersion: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maxFileSize: number;
  sessionTimeout: number;
  defaultCurrency: string;
  fromEmail: string;
  analyticsEnabled: boolean;
  apiRateLimit: number;
  autoApproveProducts: boolean;
  autoBackupEnabled: boolean;
  backupFrequency: string;
  cacheEnabled: boolean;
  contentModerationEnabled: boolean;
  logLevel: string;
  maxLoginAttempts: number;
  passwordMinLength: number;
}

// Security Settings
export interface SecuritySettings {
  auditLogRetention: number;
  ipWhitelist: string[];
  maxLoginAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
  sessionTimeout: number;
  twoFactorRequired: boolean;
}

// Notification Settings
export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  adminAlerts: boolean;
  systemMaintenance: {
    enabled: boolean;
    message: string;
    scheduledAt: string | null;
  };
}

// Platform Settings
export interface PlatformSettings {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  siteKeywords: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  timezone: string;
  dateFormat: string;
  currency: string;
  currencySymbol: string;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  allowGuestBookings: boolean;
  autoApproveListings: boolean;
  requireListingVerification: boolean;
  moderationEnabled: boolean;
  searchRadius: number;
  maxSearchResults: number;
  featuredListingsCount: number;
  contactEmail: string;
  contactPhone: string;
  supportHours: string;
  termsOfServiceUrl: string;
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  enableCookies: boolean;
}

// Backup Settings
export interface BackupSettings {
  autoBackupEnabled: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  backupRetentionDays: number;
  backupTime: string;
  includeUsers: boolean;
  includeProducts: boolean;
  includeBookings: boolean;
  includeSettings: boolean;
  includeMedia: boolean;
  includeLogs: boolean;
  backupStorageType: 'local' | 'cloud' | 'ftp';
  backupStoragePath: string;
  cloudStorageProvider: 'aws' | 'gcp' | 'azure';
  cloudBucketName: string;
  ftpHost: string;
  ftpPort: number;
  ftpUsername: string;
  ftpPassword: string;
  compressBackups: boolean;
  encryptBackups: boolean;
  encryptionKey: string;
  recoveryModeEnabled: boolean;
  recoveryTimeout: number;
  allowPartialRecovery: boolean;
  notifyOnBackupSuccess: boolean;
  notifyOnBackupFailure: boolean;
  notifyOnRecoveryComplete: boolean;
  backupNotificationEmail: string;
  backupMaintenanceMode: boolean;
  backupMaintenanceMessage: string;
  cleanupOldBackups: boolean;
  maxBackupSize: number;
}

// Analytics Settings
export interface AnalyticsSettings {
  core: {
    enabled: boolean;
    trackingLevel: 'minimal' | 'standard' | 'comprehensive';
    dataCollectionMode: 'client-side' | 'server-side' | 'hybrid';
    sessionTracking: boolean;
    userJourneyTracking: boolean;
    conversionTracking: boolean;
    performanceMonitoring: boolean;
    errorTracking: boolean;
  };
  privacy: {
    gdprCompliant: boolean;
    dataAnonymization: boolean;
    ipAddressMasking: boolean;
    userConsentRequired: boolean;
    cookieConsent: boolean;
    dataMinimization: boolean;
    rightToErasure: boolean;
    dataPortability: boolean;
  };
  retention: {
    userSessions: number;
    pageViews: number;
    userInteractions: number;
    conversionEvents: number;
    performanceData: number;
    errorLogs: number;
    auditLogs: number;
    rawAnalyticsData: number;
    aggregatedData: number;
    archivedData: number;
  };
  realTime: {
    enabled: boolean;
    refreshInterval: number;
    webSocketEnabled: boolean;
    liveDashboard: boolean;
    alertThresholds: {
      highTraffic: number;
      lowConversion: number;
      highErrorRate: number;
      slowResponseTime: number;
    };
    maxConnections: number;
    dataBufferSize: number;
  };
  integrations: {
    googleAnalytics: {
      enabled: boolean;
      trackingId: string;
      measurementId: string;
      enhancedEcommerce: boolean;
      customDimensions: string[];
      goals: string[];
    };
    facebookPixel: {
      enabled: boolean;
      pixelId: string;
      events: string[];
      customAudiences: boolean;
    };
    customAnalytics: {
      enabled: boolean;
      endpoints: string[];
    };
  };
  reporting: {
    automatedReports: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      recipients: string[];
      format: 'pdf' | 'excel' | 'csv';
    };
    dashboard: {
      defaultDateRange: string;
      refreshInterval: number;
      maxWidgets: number;
    };
    export: {
      enabled: boolean;
      formats: string[];
      maxRecords: number;
      compression: boolean;
      encryption: boolean;
    };
  };
  performance: {
    dataProcessing: {
      batchSize: number;
      processingInterval: number;
      parallelWorkers: number;
    };
    storage: {
      compressionEnabled: boolean;
      indexingStrategy: 'full' | 'partial' | 'none';
      archiveThreshold: number;
    };
    caching: {
      enabled: boolean;
      ttl: number;
      maxSize: number;
      strategy: 'lru' | 'fifo' | 'ttl';
    };
  };
  security: {
    accessControl: {
      roleBasedAccess: boolean;
      allowedRoles: string[];
      ipWhitelist: string[];
      apiRateLimiting: {
        enabled: boolean;
        requestsPerMinute: number;
      };
    };
    dataProtection: {
      encryptionAtRest: boolean;
      encryptionInTransit: boolean;
      auditLogging: boolean;
      accessLogging: boolean;
    };
  };
  alerting: {
    enabled: boolean;
    channels: {
      email: {
        enabled: boolean;
        recipients: string[];
      };
      slack: {
        enabled: boolean;
        webhookUrl: string;
        channels: string[];
      };
    };
    rules: string[];
  };
  system: {
    timezone: string;
    currency: string;
    language: string;
    dateFormat: string;
    maintenanceMode: boolean;
    debugMode: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
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
export type BackupFrequency = BackupSettings['backupFrequency'];
export type NotificationChannel = 'emailEnabled' | 'smsEnabled' | 'pushEnabled';

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
  appName: 'UruTiBiz',
  appVersion: '1.0.0',
  maintenanceMode: false,
  registrationEnabled: true,
  emailNotifications: true,
  smsNotifications: false,
  maxFileSize: 10485760, // 10MB in bytes
  sessionTimeout: 3600, // 1 hour in seconds
  defaultCurrency: 'RWF',
  fromEmail: 'noreply@urutibiz.com',
  analyticsEnabled: true,
  apiRateLimit: 1000,
  autoApproveProducts: false,
  autoBackupEnabled: true,
  backupFrequency: 'daily',
  cacheEnabled: true,
  contentModerationEnabled: true,
  logLevel: 'info',
  maxLoginAttempts: 5,
  passwordMinLength: 8,
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  auditLogRetention: 90,
  ipWhitelist: [],
  maxLoginAttempts: 5,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
  sessionTimeout: 3600,
  twoFactorRequired: false,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: false,
  pushEnabled: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  adminAlerts: true,
  systemMaintenance: {
    enabled: false,
    message: '',
    scheduledAt: null,
  },
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  siteName: 'UruTiBiz',
  siteTagline: 'Your trusted rental marketplace',
  siteDescription: 'A comprehensive rental marketplace platform',
  siteKeywords: 'rental, marketplace, equipment, tools',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  logoUrl: '',
  faviconUrl: '',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'fr', 'sw'],
  timezone: 'Africa/Kigali',
  dateFormat: 'DD/MM/YYYY',
  currency: 'RWF',
  currencySymbol: '₣',
  allowUserRegistration: true,
  requireEmailVerification: true,
  allowGuestBookings: false,
  autoApproveListings: false,
  requireListingVerification: true,
  moderationEnabled: true,
  searchRadius: 50,
  maxSearchResults: 50,
  featuredListingsCount: 6,
  contactEmail: 'support@urutibiz.com',
  contactPhone: '+250 123 456 789',
  supportHours: 'Mon-Fri 8AM-6PM',
  termsOfServiceUrl: '/terms',
  privacyPolicyUrl: '/privacy',
  cookiePolicyUrl: '/cookies',
  googleAnalyticsId: '',
  facebookPixelId: '',
  enableCookies: true,
};

export const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  autoBackupEnabled: true,
  backupFrequency: 'daily',
  backupRetentionDays: 30,
  backupTime: '02:00',
  includeUsers: true,
  includeProducts: true,
  includeBookings: true,
  includeSettings: true,
  includeMedia: false,
  includeLogs: false,
  backupStorageType: 'local',
  backupStoragePath: '/backups',
  cloudStorageProvider: 'aws',
  cloudBucketName: '',
  ftpHost: '',
  ftpPort: 21,
  ftpUsername: '',
  ftpPassword: '',
  compressBackups: true,
  encryptBackups: false,
  encryptionKey: '',
  recoveryModeEnabled: true,
  recoveryTimeout: 3600,
  allowPartialRecovery: true,
  notifyOnBackupSuccess: true,
  notifyOnBackupFailure: true,
  notifyOnRecoveryComplete: true,
  backupNotificationEmail: 'admin@urutibiz.com',
  backupMaintenanceMode: true,
  backupMaintenanceMessage: 'System backup in progress. Please try again later.',
  cleanupOldBackups: true,
  maxBackupSize: 1024,
};

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  core: {
    enabled: true,
    trackingLevel: 'standard',
    dataCollectionMode: 'hybrid',
    sessionTracking: true,
    userJourneyTracking: true,
    conversionTracking: true,
    performanceMonitoring: true,
    errorTracking: true
  },
  privacy: {
    gdprCompliant: true,
    dataAnonymization: true,
    ipAddressMasking: true,
    userConsentRequired: true,
    cookieConsent: true,
    dataMinimization: true,
    rightToErasure: true,
    dataPortability: true
  },
  retention: {
    userSessions: 90,
    pageViews: 30,
    userInteractions: 30,
    conversionEvents: 365,
    performanceData: 30,
    errorLogs: 90,
    auditLogs: 365,
    rawAnalyticsData: 30,
    aggregatedData: 365,
    archivedData: 2555
  },
  realTime: {
    enabled: true,
    refreshInterval: 30,
    webSocketEnabled: true,
    liveDashboard: true,
    alertThresholds: {
      highTraffic: 1000,
      lowConversion: 5,
      highErrorRate: 10,
      slowResponseTime: 2000
    },
    maxConnections: 100,
    dataBufferSize: 1000
  },
  integrations: {
    googleAnalytics: {
      enabled: false,
      trackingId: '',
      measurementId: '',
      enhancedEcommerce: false,
      customDimensions: [],
      goals: []
    },
    facebookPixel: {
      enabled: false,
      pixelId: '',
      events: [],
      customAudiences: false
    },
    customAnalytics: {
      enabled: false,
      endpoints: []
    }
  },
  reporting: {
    automatedReports: {
      enabled: false,
      frequency: 'weekly',
      recipients: [],
      format: 'pdf'
    },
    dashboard: {
      defaultDateRange: '30d',
      refreshInterval: 60,
      maxWidgets: 20
    },
    export: {
      enabled: true,
      formats: ['csv', 'excel', 'json'],
      maxRecords: 10000,
      compression: true,
      encryption: false
    }
  },
  performance: {
    dataProcessing: {
      batchSize: 1000,
      processingInterval: 15,
      parallelWorkers: 4
    },
    storage: {
      compressionEnabled: true,
      indexingStrategy: 'partial',
      archiveThreshold: 90
    },
    caching: {
      enabled: true,
      ttl: 300,
      maxSize: 100,
      strategy: 'lru'
    }
  },
  security: {
    accessControl: {
      roleBasedAccess: true,
      allowedRoles: ['admin', 'super_admin'],
      ipWhitelist: [],
      apiRateLimiting: {
        enabled: true,
        requestsPerMinute: 60
      }
    },
    dataProtection: {
      encryptionAtRest: false,
      encryptionInTransit: true,
      auditLogging: true,
      accessLogging: true
    }
  },
  alerting: {
    enabled: false,
    channels: {
      email: {
        enabled: false,
        recipients: []
      },
      slack: {
        enabled: false,
        webhookUrl: '',
        channels: []
      }
    },
    rules: []
  },
  system: {
    timezone: 'Africa/Kigali',
    currency: 'RWF',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info'
  }
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
