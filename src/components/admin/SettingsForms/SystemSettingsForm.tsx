import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Clock, 
  Shield, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
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
  const [formData, setFormData] = useState<SystemSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const backupFrequencies = [
    { value: 'daily', label: 'Daily', description: 'Backup every day' },
    { value: 'weekly', label: 'Weekly', description: 'Backup every week' },
    { value: 'monthly', label: 'Monthly', description: 'Backup every month' },
  ];

  const logLevels = [
    { value: 'error', label: 'Error', description: 'Only error messages' },
    { value: 'warn', label: 'Warning', description: 'Errors and warnings' },
    { value: 'info', label: 'Info', description: 'Informational messages' },
    { value: 'debug', label: 'Debug', description: 'All messages including debug' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Cache Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Cache Settings
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.cacheEnabled}
              onChange={(e) => handleChange('cacheEnabled', e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Enable system cache
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cache Timeout (seconds)
            </label>
            <input
              type="number"
              min="60"
              max="3600"
              value={formData.cacheTimeout}
              onChange={(e) => handleChange('cacheTimeout', parseInt(e.target.value) || 300)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              How long to keep cached data before refreshing
            </p>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Server className="w-5 h-5 mr-2" />
          Backup Settings
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.backupEnabled}
              onChange={(e) => handleChange('backupEnabled', e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Enable automatic backups
            </span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Backup Frequency
            </label>
            <select
              value={formData.backupFrequency}
              onChange={(e) => handleChange('backupFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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

      {/* Logging Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Logging Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Log Level
            </label>
            <select
              value={formData.logLevel}
              onChange={(e) => handleChange('logLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
              checked={formData.debugMode}
              onChange={(e) => handleChange('debugMode', e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Enable debug mode (not recommended for production)
            </span>
          </label>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Performance Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Rate Limit (requests per minute)
            </label>
            <input
              type="number"
              min="100"
              max="10000"
              value={formData.apiRateLimit}
              onChange={(e) => handleChange('apiRateLimit', parseInt(e.target.value) || 1000)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Concurrent Users
            </label>
            <input
              type="number"
              min="100"
              max="10000"
              value={formData.maxConcurrentUsers}
              onChange={(e) => handleChange('maxConcurrentUsers', parseInt(e.target.value) || 1000)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
            />
            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Enable maintenance mode
            </span>
          </label>

          {formData.maintenanceMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maintenance Message
              </label>
              <textarea
                value={formData.maintenanceMessage || ''}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                rows={3}
                placeholder="Enter maintenance message for users..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoUpdates}
                onChange={(e) => handleChange('autoUpdates', e.target.checked)}
                className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Auto Updates
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.performanceMonitoring}
                onChange={(e) => handleChange('performanceMonitoring', e.target.checked)}
                className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Performance Monitoring
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.errorReporting}
                onChange={(e) => handleChange('errorReporting', e.target.checked)}
                className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Error Reporting
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default SystemSettingsForm;
