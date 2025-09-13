import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Clock, Shield, Wrench, Calendar } from 'lucide-react';
import type { NotificationSettings } from '../../../types/adminSettings.types';

interface NotificationSettingsFormProps {
  settings: NotificationSettings;
  onUpdate: (updates: Partial<NotificationSettings>) => void;
  isLoading: boolean;
  theme: any;
}

const NotificationSettingsForm: React.FC<NotificationSettingsFormProps> = ({
  settings,
  onUpdate,
  isLoading,
}) => {
  const [formData, setFormData] = useState<NotificationSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof NotificationSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuietHoursChange = (field: keyof NotificationSettings['quietHours'], value: any) => {
    setFormData(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  const handleSystemMaintenanceChange = (field: keyof NotificationSettings['systemMaintenance'], value: any) => {
    setFormData(prev => ({
      ...prev,
      systemMaintenance: {
        ...prev.systemMaintenance,
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
      {/* Version Indicator */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            ✅ Complete Notification Settings - All API Fields Integrated
          </span>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Channels
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              checked={formData.emailEnabled}
              onChange={(e) => handleChange('emailEnabled', e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
            />
            <div className="ml-3 flex items-center">
              <Mail className="w-5 h-5 text-teal-600 mr-3" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Notifications
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Send notifications via email
                </p>
              </div>
            </div>
          </label>

          <label className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              checked={formData.smsEnabled}
              onChange={(e) => handleChange('smsEnabled', e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
            />
            <div className="ml-3 flex items-center">
              <Smartphone className="w-5 h-5 text-teal-600 mr-3" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  SMS Notifications
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Send notifications via SMS
                </p>
              </div>
            </div>
          </label>

          <label className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              checked={formData.pushEnabled}
              onChange={(e) => handleChange('pushEnabled', e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
            />
            <div className="ml-3 flex items-center">
              <Bell className="w-5 h-5 text-teal-600 mr-3" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Push Notifications
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Send browser push notifications
                </p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Quiet Hours
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.quietHours.enabled}
              onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable quiet hours
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pause notifications during specified hours
              </p>
            </div>
          </label>

          {formData.quietHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.quietHours.start}
                  onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.quietHours.end}
                  onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Alerts */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Admin Alerts
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.adminAlerts}
              onChange={(e) => handleChange('adminAlerts', e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Send alerts to admins
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Notify administrators about important system events
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Wrench className="w-5 h-5 mr-2" />
          System Maintenance
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.systemMaintenance.enabled}
              onChange={(e) => handleSystemMaintenanceChange('enabled', e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable maintenance notifications
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Send notifications about scheduled maintenance
              </p>
            </div>
          </label>

          {formData.systemMaintenance.enabled && (
            <div className="space-y-4 ml-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maintenance Message
                </label>
                <textarea
                  value={formData.systemMaintenance.message}
                  onChange={(e) => handleSystemMaintenanceChange('message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows={3}
                  placeholder="Enter maintenance message..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.systemMaintenance.scheduledAt ? new Date(formData.systemMaintenance.scheduledAt).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleSystemMaintenanceChange('scheduledAt', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          )}
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

export default NotificationSettingsForm;