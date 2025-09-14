import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Shield, 
  Clock, 
  Settings, 
  Download,
  Zap,
  Globe,
  Lock,
  Bell,
  Server,
  Activity
} from 'lucide-react';
import type { AnalyticsSettings } from '../../../types/adminSettings.types';

interface AnalyticsSettingsFormProps {
  settings: AnalyticsSettings;
  onUpdate: (updates: Partial<AnalyticsSettings>) => void;
  isLoading: boolean;
  theme: any;
}

const AnalyticsSettingsForm: React.FC<AnalyticsSettingsFormProps> = ({
  settings,
  onUpdate,
  isLoading,
}) => {
  const [formData, setFormData] = useState<AnalyticsSettings>(settings);
  const [activeSection, setActiveSection] = useState<string>('core');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (settings) {
    setFormData(settings);
    }
  }, [settings]);

  const handleChange = (section: keyof AnalyticsSettings, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/v1/admin/settings/analytics/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'json',
          includeMetadata: true
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const sections = [
    { id: 'core', label: 'Core Settings', icon: Settings },
    { id: 'privacy', label: 'Privacy & Compliance', icon: Shield },
    { id: 'retention', label: 'Data Retention', icon: Clock },
    { id: 'realTime', label: 'Real-time Analytics', icon: Activity },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'reporting', label: 'Reporting', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'alerting', label: 'Alerting', icon: Bell },
    { id: 'system', label: 'System', icon: Server }
  ];

  const renderCoreSettings = () => {
    if (!formData?.core) {
  return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading analytics configuration...</p>
        </div>
      );
    }

    return (
        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tracking Level
            </label>
            <select
              value={formData.core.trackingLevel}
              onChange={(e) => handleChange('core', 'trackingLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value="minimal">Minimal</option>
              <option value="standard">Standard</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Collection Mode
            </label>
            <select
              value={formData.core.dataCollectionMode}
              onChange={(e) => handleChange('core', 'dataCollectionMode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value="client-side">Client-side</option>
              <option value="server-side">Server-side</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Tracking Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'sessionTracking', label: 'Session Tracking' },
              { key: 'userJourneyTracking', label: 'User Journey Tracking' },
              { key: 'conversionTracking', label: 'Conversion Tracking' },
              { key: 'performanceMonitoring', label: 'Performance Monitoring' },
              { key: 'errorTracking', label: 'Error Tracking' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.core[key as keyof typeof formData.core] as boolean}
                  onChange={(e) => handleChange('core', key, e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPrivacySettings = () => {
    if (!formData?.privacy) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading privacy settings...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">GDPR Compliance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'gdprCompliant', label: 'GDPR Compliant' },
              { key: 'dataAnonymization', label: 'Data Anonymization' },
              { key: 'ipAddressMasking', label: 'IP Address Masking' },
              { key: 'userConsentRequired', label: 'User Consent Required' },
              { key: 'cookieConsent', label: 'Cookie Consent' },
              { key: 'dataMinimization', label: 'Data Minimization' },
              { key: 'rightToErasure', label: 'Right to Erasure' },
              { key: 'dataPortability', label: 'Data Portability' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.privacy[key as keyof typeof formData.privacy] as boolean}
                  onChange={(e) => handleChange('privacy', key, e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRetentionSettings = () => {
    if (!formData?.retention) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading retention settings...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Data Retention Periods (Days)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Sessions
              </label>
              <input
                type="number"
                value={formData.retention.userSessions}
                onChange={(e) => handleChange('retention', 'userSessions', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="3650"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Views
              </label>
              <input
                type="number"
                value={formData.retention.pageViews}
                onChange={(e) => handleChange('retention', 'pageViews', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="3650"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Interactions
              </label>
              <input
                type="number"
                value={formData.retention.userInteractions}
                onChange={(e) => handleChange('retention', 'userInteractions', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="3650"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conversion Events
              </label>
              <input
                type="number"
                value={formData.retention.conversionEvents}
                onChange={(e) => handleChange('retention', 'conversionEvents', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="3650"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Performance Data
              </label>
              <input
                type="number"
                value={formData.retention.performanceData}
                onChange={(e) => handleChange('retention', 'performanceData', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="3650"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Error Logs
              </label>
              <input
                type="number"
                value={formData.retention.errorLogs}
                onChange={(e) => handleChange('retention', 'errorLogs', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="3650"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Audit Logs
              </label>
              <input
                type="number"
                value={formData.retention.auditLogs}
                onChange={(e) => handleChange('retention', 'auditLogs', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="3650"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Raw Analytics Data
              </label>
              <input
                type="number"
                value={formData.retention.rawAnalyticsData}
                onChange={(e) => handleChange('retention', 'rawAnalyticsData', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="3650"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aggregated Data
              </label>
              <input
                type="number"
                value={formData.retention.aggregatedData}
                onChange={(e) => handleChange('retention', 'aggregatedData', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="3650"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Archived Data
              </label>
              <input
                type="number"
                value={formData.retention.archivedData}
                onChange={(e) => handleChange('retention', 'archivedData', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="36500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRealTimeSettings = () => {
    if (!formData?.realTime) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading real-time settings...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Real-time Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Refresh Interval (seconds)
              </label>
              <input
                type="number"
                value={formData.realTime.refreshInterval}
                onChange={(e) => handleChange('realTime', 'refreshInterval', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="5"
                max="300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Connections
              </label>
              <input
                type="number"
                value={formData.realTime.maxConnections}
                onChange={(e) => handleChange('realTime', 'maxConnections', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="10"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Buffer Size
              </label>
              <input
                type="number"
                value={formData.realTime.dataBufferSize}
                onChange={(e) => handleChange('realTime', 'dataBufferSize', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="100"
                max="10000"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Real-time Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.realTime.enabled}
                onChange={(e) => handleChange('realTime', 'enabled', e.target.checked)}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Real-time Analytics Enabled</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.realTime.webSocketEnabled}
                onChange={(e) => handleChange('realTime', 'webSocketEnabled', e.target.checked)}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">WebSocket Enabled</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.realTime.liveDashboard}
                onChange={(e) => handleChange('realTime', 'liveDashboard', e.target.checked)}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Live Dashboard</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Alert Thresholds</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                High Traffic Threshold
              </label>
              <input
                type="number"
                value={formData.realTime.alertThresholds.highTraffic}
                onChange={(e) => handleChange('realTime', 'alertThresholds', { ...formData.realTime.alertThresholds, highTraffic: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="100"
                max="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Low Conversion Rate (%)
              </label>
              <input
                type="number"
                value={formData.realTime.alertThresholds.lowConversion}
                onChange={(e) => handleChange('realTime', 'alertThresholds', { ...formData.realTime.alertThresholds, lowConversion: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                High Error Rate (%)
              </label>
              <input
                type="number"
                value={formData.realTime.alertThresholds.highErrorRate}
                onChange={(e) => handleChange('realTime', 'alertThresholds', { ...formData.realTime.alertThresholds, highErrorRate: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slow Response Time (ms)
              </label>
              <input
                type="number"
                value={formData.realTime.alertThresholds.slowResponseTime}
                onChange={(e) => handleChange('realTime', 'alertThresholds', { ...formData.realTime.alertThresholds, slowResponseTime: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="100"
                max="10000"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReportingSettings = () => {
    if (!formData?.reporting) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading reporting settings...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Automated Reports */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Automated Reports</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.reporting.automatedReports.enabled}
                onChange={(e) => handleChange('reporting', 'automatedReports', { ...formData.reporting.automatedReports, enabled: e.target.checked })}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enabled</span>
            </label>
          </div>
          
          {formData.reporting.automatedReports.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency
                </label>
                <select
                  value={formData.reporting.automatedReports.frequency}
                  onChange={(e) => handleChange('reporting', 'automatedReports', { ...formData.reporting.automatedReports, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Format
                </label>
                <select
                  value={formData.reporting.automatedReports.format}
                  onChange={(e) => handleChange('reporting', 'automatedReports', { ...formData.reporting.automatedReports, format: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">Dashboard Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Date Range
              </label>
              <select
                value={formData.reporting.dashboard.defaultDateRange}
                onChange={(e) => handleChange('reporting', 'dashboard', { ...formData.reporting.dashboard, defaultDateRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Refresh Interval (seconds)
              </label>
              <input
                type="number"
                value={formData.reporting.dashboard.refreshInterval}
                onChange={(e) => handleChange('reporting', 'dashboard', { ...formData.reporting.dashboard, refreshInterval: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="30"
                max="3600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Widgets
              </label>
              <input
                type="number"
                value={formData.reporting.dashboard.maxWidgets}
                onChange={(e) => handleChange('reporting', 'dashboard', { ...formData.reporting.dashboard, maxWidgets: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="5"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Export Settings</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.reporting.export.enabled}
                onChange={(e) => handleChange('reporting', 'export', { ...formData.reporting.export, enabled: e.target.checked })}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enabled</span>
            </label>
          </div>

          {formData.reporting.export.enabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Records
                </label>
                <input
                  type="number"
                  value={formData.reporting.export.maxRecords}
                  onChange={(e) => handleChange('reporting', 'export', { ...formData.reporting.export, maxRecords: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  min="100"
                  max="100000"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reporting.export.compression}
                    onChange={(e) => handleChange('reporting', 'export', { ...formData.reporting.export, compression: e.target.checked })}
                    className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Enable Compression</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reporting.export.encryption}
                    onChange={(e) => handleChange('reporting', 'export', { ...formData.reporting.export, encryption: e.target.checked })}
                    className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Enable Encryption</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPerformanceSettings = () => {
    if (!formData?.performance) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading performance settings...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Data Processing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">Data Processing</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch Size
              </label>
              <input
                type="number"
                value={formData.performance.dataProcessing.batchSize}
                onChange={(e) => handleChange('performance', 'dataProcessing', { ...formData.performance.dataProcessing, batchSize: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="100"
                max="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Processing Interval (seconds)
              </label>
              <input
                type="number"
                value={formData.performance.dataProcessing.processingInterval}
                onChange={(e) => handleChange('performance', 'dataProcessing', { ...formData.performance.dataProcessing, processingInterval: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="5"
                max="300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parallel Workers
              </label>
              <input
                type="number"
                value={formData.performance.dataProcessing.parallelWorkers}
                onChange={(e) => handleChange('performance', 'dataProcessing', { ...formData.performance.dataProcessing, parallelWorkers: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                min="1"
                max="16"
              />
            </div>
          </div>
        </div>

        {/* Storage Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">Storage Settings</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.performance.storage.compressionEnabled}
                  onChange={(e) => handleChange('performance', 'storage', { ...formData.performance.storage, compressionEnabled: e.target.checked })}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Enable Compression</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Indexing Strategy
                </label>
                <select
                  value={formData.performance.storage.indexingStrategy}
                  onChange={(e) => handleChange('performance', 'storage', { ...formData.performance.storage, indexingStrategy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                >
                  <option value="full">Full Indexing</option>
                  <option value="partial">Partial Indexing</option>
                  <option value="none">No Indexing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Archive Threshold (days)
                </label>
                <input
                  type="number"
                  value={formData.performance.storage.archiveThreshold}
                  onChange={(e) => handleChange('performance', 'storage', { ...formData.performance.storage, archiveThreshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  min="1"
                  max="365"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Caching Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Caching Settings</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.performance.caching.enabled}
                onChange={(e) => handleChange('performance', 'caching', { ...formData.performance.caching, enabled: e.target.checked })}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enabled</span>
            </label>
          </div>
          
          {formData.performance.caching.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  TTL (seconds)
                </label>
                <input
                  type="number"
                  value={formData.performance.caching.ttl}
                  onChange={(e) => handleChange('performance', 'caching', { ...formData.performance.caching, ttl: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  min="60"
                  max="3600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Size (MB)
                </label>
                <input
                  type="number"
                  value={formData.performance.caching.maxSize}
                  onChange={(e) => handleChange('performance', 'caching', { ...formData.performance.caching, maxSize: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  min="10"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Strategy
                </label>
                <select
                  value={formData.performance.caching.strategy}
                  onChange={(e) => handleChange('performance', 'caching', { ...formData.performance.caching, strategy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                >
                  <option value="lru">LRU (Least Recently Used)</option>
                  <option value="fifo">FIFO (First In First Out)</option>
                  <option value="ttl">TTL (Time To Live)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSecuritySettings = () => {
    if (!formData?.security) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading security settings...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Access Control */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">Access Control</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.security.accessControl.roleBasedAccess}
                  onChange={(e) => handleChange('security', 'accessControl', { ...formData.security.accessControl, roleBasedAccess: e.target.checked })}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Role-based Access</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Allowed Roles
              </label>
              <div className="space-y-2">
                {['admin', 'super_admin', 'analyst', 'viewer'].map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.security.accessControl.allowedRoles.includes(role)}
                      onChange={(e) => {
                        const currentRoles = formData.security.accessControl.allowedRoles;
                        const newRoles = e.target.checked
                          ? [...currentRoles, role]
                          : currentRoles.filter(r => r !== role);
                        handleChange('security', 'accessControl', { ...formData.security.accessControl, allowedRoles: newRoles });
                      }}
                      className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 capitalize">{role.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IP Whitelist (one per line)
              </label>
              <textarea
                value={formData.security.accessControl.ipWhitelist.join('\n')}
                onChange={(e) => handleChange('security', 'accessControl', { ...formData.security.accessControl, ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim()) })}
                placeholder="192.168.1.1&#10;10.0.0.0/8&#10;172.16.0.0/12"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.security.accessControl.apiRateLimiting.enabled}
                  onChange={(e) => handleChange('security', 'accessControl', { 
                    ...formData.security.accessControl, 
                    apiRateLimiting: { ...formData.security.accessControl.apiRateLimiting, enabled: e.target.checked }
                  })}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">API Rate Limiting</span>
              </label>
              {formData.security.accessControl.apiRateLimiting.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requests per Minute
                  </label>
                  <input
                    type="number"
                    value={formData.security.accessControl.apiRateLimiting.requestsPerMinute}
                    onChange={(e) => handleChange('security', 'accessControl', { 
                      ...formData.security.accessControl, 
                      apiRateLimiting: { ...formData.security.accessControl.apiRateLimiting, requestsPerMinute: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                    min="10"
                    max="1000"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Protection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">Data Protection</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.security.dataProtection.encryptionAtRest}
                onChange={(e) => handleChange('security', 'dataProtection', { ...formData.security.dataProtection, encryptionAtRest: e.target.checked })}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Encryption at Rest</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.security.dataProtection.encryptionInTransit}
                onChange={(e) => handleChange('security', 'dataProtection', { ...formData.security.dataProtection, encryptionInTransit: e.target.checked })}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Encryption in Transit</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.security.dataProtection.auditLogging}
                onChange={(e) => handleChange('security', 'dataProtection', { ...formData.security.dataProtection, auditLogging: e.target.checked })}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Audit Logging</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.security.dataProtection.accessLogging}
                onChange={(e) => handleChange('security', 'dataProtection', { ...formData.security.dataProtection, accessLogging: e.target.checked })}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Access Logging</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderAlertingSettings = () => {
    if (!formData?.alerting) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading alerting settings...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Alerting Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Alerting System</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.alerting.enabled}
                onChange={(e) => handleChange('alerting', 'enabled', e.target.checked)}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enabled</span>
            </label>
          </div>
        </div>

        {/* Email Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Email Alerts</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.alerting.channels.email.enabled}
                onChange={(e) => handleChange('alerting', 'channels', { 
                  ...formData.alerting.channels, 
                  email: { ...formData.alerting.channels.email, enabled: e.target.checked }
                })}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enabled</span>
            </label>
          </div>
          
          {formData.alerting.channels.email.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipients (one per line)
              </label>
              <textarea
                value={formData.alerting.channels.email.recipients.join('\n')}
                onChange={(e) => handleChange('alerting', 'channels', { 
                  ...formData.alerting.channels, 
                  email: { ...formData.alerting.channels.email, recipients: e.target.value.split('\n').filter(email => email.trim()) }
                })}
                placeholder="admin@example.com&#10;alerts@example.com"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              />
            </div>
          )}
        </div>

        {/* Slack Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Slack Alerts</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.alerting.channels.slack.enabled}
                onChange={(e) => handleChange('alerting', 'channels', { 
                  ...formData.alerting.channels, 
                  slack: { ...formData.alerting.channels.slack, enabled: e.target.checked }
                })}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enabled</span>
            </label>
          </div>
          
          {formData.alerting.channels.slack.enabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={formData.alerting.channels.slack.webhookUrl}
                  onChange={(e) => handleChange('alerting', 'channels', { 
                    ...formData.alerting.channels, 
                    slack: { ...formData.alerting.channels.slack, webhookUrl: e.target.value }
                  })}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Channels (one per line)
                </label>
                <textarea
                  value={formData.alerting.channels.slack.channels.join('\n')}
                  onChange={(e) => handleChange('alerting', 'channels', { 
                    ...formData.alerting.channels, 
                    slack: { ...formData.alerting.channels.slack, channels: e.target.value.split('\n').filter(channel => channel.trim()) }
                  })}
                  placeholder="#alerts&#10;#analytics"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSystemSettings = () => {
    if (!formData?.system) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading system settings...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* System Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">System Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={formData.system.timezone}
                onChange={(e) => handleChange('system', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              >
                <option value="Africa/Kigali">Africa/Kigali</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={formData.system.currency}
                onChange={(e) => handleChange('system', 'currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              >
                <option value="RWF">RWF (Rwandan Franc)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="JPY">JPY (Japanese Yen)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={formData.system.language}
                onChange={(e) => handleChange('system', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="sw">Kiswahili</option>
                <option value="rw">Kinyarwanda</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Format
              </label>
              <select
                value={formData.system.dateFormat}
                onChange={(e) => handleChange('system', 'dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">System Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.system.maintenanceMode}
                onChange={(e) => handleChange('system', 'maintenanceMode', e.target.checked)}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Maintenance Mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.system.debugMode}
                onChange={(e) => handleChange('system', 'debugMode', e.target.checked)}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">Debug Mode</span>
            </label>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Log Level
            </label>
            <select
              value={formData.system.logLevel}
              onChange={(e) => handleChange('system', 'logLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderIntegrationsSettings = () => {
    if (!formData?.integrations) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading integration settings...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Google Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Google Analytics</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.integrations.googleAnalytics.enabled}
                onChange={(e) => handleChange('integrations', 'googleAnalytics', { ...formData.integrations.googleAnalytics, enabled: e.target.checked })}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enabled</span>
            </label>
          </div>
          
          {formData.integrations.googleAnalytics.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tracking ID
                </label>
                <input
                  type="text"
                  value={formData.integrations.googleAnalytics.trackingId}
                  onChange={(e) => handleChange('integrations', 'googleAnalytics', { ...formData.integrations.googleAnalytics, trackingId: e.target.value })}
                  placeholder="GA-XXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Measurement ID
                </label>
                <input
                  type="text"
                  value={formData.integrations.googleAnalytics.measurementId}
                  onChange={(e) => handleChange('integrations', 'googleAnalytics', { ...formData.integrations.googleAnalytics, measurementId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Facebook Pixel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">Facebook Pixel</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.integrations.facebookPixel.enabled}
                onChange={(e) => handleChange('integrations', 'facebookPixel', { ...formData.integrations.facebookPixel, enabled: e.target.checked })}
                className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enabled</span>
            </label>
          </div>
          
          {formData.integrations.facebookPixel.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pixel ID
              </label>
              <input
                type="text"
                value={formData.integrations.facebookPixel.pixelId}
                onChange={(e) => handleChange('integrations', 'facebookPixel', { ...formData.integrations.facebookPixel, pixelId: e.target.value })}
                placeholder="123456789012345"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'core':
        return renderCoreSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'retention':
        return renderRetentionSettings();
      case 'realTime':
        return renderRealTimeSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      case 'reporting':
        return renderReportingSettings();
      case 'performance':
        return renderPerformanceSettings();
      case 'security':
        return renderSecuritySettings();
      case 'alerting':
        return renderAlertingSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Section configuration coming soon...</p>
          </div>
        );
    }
  };

  // Show loading state if settings are not loaded
  if (!settings || !formData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-my-primary mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading analytics configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-my-primary" />
            Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Tracking and analytics configuration</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="bg-my-primary hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Settings'}
        </button>
      </div>

      {/* Compact Top Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-my-primary" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Settings Categories</h3>
          </div>
        </div>
        <nav className="flex gap-1 border-b border-gray-200 dark:border-gray-700 pb-3 overflow-x-auto scrollbar-hide">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-0.5 px-1 py-1 rounded-md transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-my-primary text-white shadow-sm transform scale-105'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-my-primary'
                }`}
              >
                <Icon className={`w-2.5 h-2.5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-my-primary/10 dark:bg-my-primary/20 rounded-lg">
              {React.createElement(sections.find(s => s.id === activeSection)?.icon || Settings, {
                className: "w-5 h-5 text-my-primary"
              })}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {sections.find(s => s.id === activeSection)?.label}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-11">
            {sections.find(s => s.id === activeSection)?.description}
          </p>
        </div>
        
        {renderSectionContent()}
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-my-primary hover:bg-opacity-80 text-white px-6 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default AnalyticsSettingsForm;