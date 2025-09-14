import http from '../lib/http';

export interface AnalyticsConfig {
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

export interface AnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    config: AnalyticsConfig;
    lastUpdated: string;
    updatedBy: string;
    version: string;
  };
}

export interface AnalyticsHealthResponse {
  success: boolean;
  message: string;
  data: {
    status: 'healthy' | 'warning' | 'error';
    services: {
      dataCollection: 'up' | 'down';
      processing: 'up' | 'down';
      storage: 'up' | 'down';
      reporting: 'up' | 'down';
    };
    metrics: {
      totalEvents: number;
      processingLatency: number;
      storageUsage: number;
      errorRate: number;
    };
    lastChecked: string;
  };
}

export interface ExportRequest {
  format: 'json' | 'csv' | 'excel';
  includeMetadata?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

class AnalyticsService {
  private baseUrl = '/api/v1/admin/settings/analytics';

  /**
   * Get analytics configuration
   */
  async getAnalyticsConfig(): Promise<AnalyticsResponse> {
    const response = await http.get(this.baseUrl);
    return response.data;
  }

  /**
   * Update analytics configuration
   */
  async updateAnalyticsConfig(config: Partial<AnalyticsConfig>): Promise<AnalyticsResponse> {
    const response = await http.put(this.baseUrl, { config });
    return response.data;
  }

  /**
   * Get analytics health status
   */
  async getAnalyticsHealth(): Promise<AnalyticsHealthResponse> {
    const response = await http.get(`${this.baseUrl}/health`);
    return response.data;
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(request: ExportRequest): Promise<Blob> {
    const response = await http.post(`${this.baseUrl}/export`, request, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/octet-stream'
      }
    });
    return response.data;
  }

  /**
   * Test analytics configuration
   */
  async testConfiguration(): Promise<{ success: boolean; message: string }> {
    const response = await http.post(`${this.baseUrl}/test`);
    return response.data;
  }

  /**
   * Reset analytics configuration to defaults
   */
  async resetToDefaults(): Promise<AnalyticsResponse> {
    const response = await http.post(`${this.baseUrl}/reset`);
    return response.data;
  }

  /**
   * Get analytics metrics summary
   */
  async getMetricsSummary(dateRange?: { start: string; end: string }) {
    const params = dateRange ? { ...dateRange } : {};
    const response = await http.get(`${this.baseUrl}/metrics`, { params });
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
