import React, { useState, useEffect } from 'react';
import { BarChart3, Eye, Shield } from 'lucide-react';
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

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof AnalyticsSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: keyof AnalyticsSettings, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Analytics Settings
        </h3>
        
        <div className="space-y-6">
          {/* Google Analytics */}
          <div>
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={formData.googleAnalytics?.enabled || false}
                onChange={(e) => handleNestedChange('googleAnalytics', 'enabled', e.target.checked)}
                className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
              />
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Google Analytics
              </span>
            </label>
            
            {formData.googleAnalytics?.enabled && (
              <input
                type="text"
                value={formData.googleAnalytics?.trackingId || ''}
                onChange={(e) => handleNestedChange('googleAnalytics', 'trackingId', e.target.value)}
                placeholder="GA-XXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            )}
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.privacyCompliant || false}
                onChange={(e) => handleChange('privacyCompliant', e.target.checked)}
                className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Privacy compliant tracking
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.cookieConsent || false}
                onChange={(e) => handleChange('cookieConsent', e.target.checked)}
                className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                Show cookie consent banner
              </span>
            </label>
          </div>
        </div>
      </div>

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

export default AnalyticsSettingsForm;
