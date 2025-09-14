import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  UserPlus,
  FileText,
  Database,
  Server,
  Activity,
  Bell,
  Lock,
  CheckCircle
} from 'lucide-react';
import type { SystemSettings } from '../../../types/adminSettings.types';

interface SystemSettingsFormProps {
  settings: SystemSettings;
  onUpdate: (updates: Partial<SystemSettings>) => void;
  isLoading: boolean;
  theme: any;
}

const SystemSettingsForm: React.FC<SystemSettingsFormProps> = ({
  settings,
  onUpdate,
  isLoading,
}) => {
  console.log('SystemSettingsForm loaded - NEW VERSION with simplified fields');
  const [formData, setFormData] = useState<SystemSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const backupFrequencies = [
    { value: 'hourly', label: 'Hourly', description: 'Backup every hour' },
    { value: 'daily', label: 'Daily', description: 'Backup every day' },
    { value: 'weekly', label: 'Weekly', description: 'Backup every week' },
  ];

  const logLevels = [
    { value: 'error', label: 'Error', description: 'Only error messages' },
    { value: 'warn', label: 'Warning', description: 'Errors and warnings' },
    { value: 'info', label: 'Info', description: 'Informational messages' },
    { value: 'debug', label: 'Debug', description: 'All messages including debug' },
  ];

  const currencies = [
    { value: 'RWF', label: 'Rwandan Franc', symbol: 'RWF' },
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Version Indicator */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            ✅ Complete System Settings Form - All API Fields Integrated
          </span>
        </div>
      </div>

      {/* Application Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Application Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Application Name
            </label>
            <input
              type="text"
              value={formData.appName}
              onChange={(e) => handleChange('appName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="Enter application name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Application Version
            </label>
            <input
              type="text"
              value={formData.appVersion}
              onChange={(e) => handleChange('appVersion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="e.g., 1.0.0"
            />
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          System Status
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.maintenanceMode}
              onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable maintenance mode
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Temporarily disable access for system maintenance
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <UserPlus className="w-5 h-5 mr-2" />
          User Management
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.registrationEnabled}
              onChange={(e) => handleChange('registrationEnabled', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable user registration
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Allow new users to create accounts
              </p>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.autoApproveProducts}
              onChange={(e) => handleChange('autoApproveProducts', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-approve products
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically approve new product listings
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable email notifications
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Send email notifications to users
              </p>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.smsNotifications}
              onChange={(e) => handleChange('smsNotifications', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable SMS notifications
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Send SMS notifications to users
              </p>
            </div>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Email Address
            </label>
            <input
              type="email"
              value={formData.fromEmail}
              onChange={(e) => handleChange('fromEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              placeholder="noreply@urutibiz.com"
            />
          </div>
        </div>
      </div>

      {/* File & Session Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          File & Session Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum File Size
            </label>
            <input
              type="number"
              min="1048576"
              max="104857600"
              step="1048576"
              value={formData.maxFileSize}
              onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value) || 10485760)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Current: {formatFileSize(formData.maxFileSize)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Timeout
            </label>
            <input
              type="number"
              min="300"
              max="86400"
              step="300"
              value={formData.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value) || 3600)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Current: {formatDuration(formData.sessionTimeout)}
            </p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Security Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={formData.maxLoginAttempts}
              onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Password Length
            </label>
            <input
              type="number"
              min="6"
              max="20"
              value={formData.passwordMinLength}
              onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value) || 8)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>
        </div>
      </div>

      {/* Performance & Cache */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Performance & Cache
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.cacheEnabled}
              onChange={(e) => handleChange('cacheEnabled', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable system cache
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Improve performance with caching
              </p>
            </div>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Rate Limit (requests per hour)
            </label>
            <input
              type="number"
              min="100"
              max="10000"
              value={formData.apiRateLimit}
              onChange={(e) => handleChange('apiRateLimit', parseInt(e.target.value) || 1000)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>
        </div>
      </div>

      {/* Backup & Recovery */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Server className="w-5 h-5 mr-2" />
          Backup & Recovery
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.autoBackupEnabled}
              onChange={(e) => handleChange('autoBackupEnabled', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable automatic backups
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically backup system data
              </p>
            </div>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Backup Frequency
            </label>
            <select
              value={formData.backupFrequency}
              onChange={(e) => handleChange('backupFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              {backupFrequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label} - {freq.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logging & Analytics */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Logging & Analytics
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Log Level
            </label>
            <select
              value={formData.logLevel}
              onChange={(e) => handleChange('logLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              {logLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label} - {level.description}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.analyticsEnabled}
              onChange={(e) => handleChange('analyticsEnabled', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable analytics tracking
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track user behavior and system performance
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Content Moderation */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Content Moderation
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.contentModerationEnabled}
              onChange={(e) => handleChange('contentModerationEnabled', e.target.checked)}
              className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable content moderation
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically moderate user-generated content
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Platform Settings
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Currency
          </label>
          <select
            value={formData.defaultCurrency}
            onChange={(e) => handleChange('defaultCurrency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
          >
            {currencies.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>
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

export default SystemSettingsForm;


