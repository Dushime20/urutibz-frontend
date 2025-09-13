import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, CheckCircle, Clock, Users, Eye, AlertTriangle } from 'lucide-react';
import type { SecuritySettings } from '../../../types/adminSettings.types';

interface SecuritySettingsFormProps {
  settings: SecuritySettings;
  onUpdate: (updates: Partial<SecuritySettings>) => void;
  isLoading: boolean;
  theme: any;
}

const SecuritySettingsForm: React.FC<SecuritySettingsFormProps> = ({
  settings,
  onUpdate,
  isLoading,
}) => {
  const [formData, setFormData] = useState<SecuritySettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof SecuritySettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordPolicyChange = (field: keyof SecuritySettings['passwordPolicy'], value: any) => {
    setFormData(prev => ({
      ...prev,
      passwordPolicy: {
        ...prev.passwordPolicy,
        [field]: value
      }
    }));
  };

  const handleIpWhitelistChange = (value: string) => {
    const ips = value.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0);
    handleChange('ipWhitelist', ips);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
            ✅ Complete Security Settings - All API Fields Integrated
          </span>
        </div>
      </div>

      {/* Authentication Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Authentication Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Current: {formatDuration(formData.sessionTimeout)}
            </p>
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Maximum attempts before account lockout
            </p>
          </div>
        </div>
      </div>

      {/* Password Policy */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Key className="w-5 h-5 mr-2" />
          Password Policy
        </h3>
        
        <div className="space-y-6">
          {/* Minimum Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Password Length
            </label>
            <input
              type="number"
              min="6"
              max="32"
              value={formData.passwordPolicy.minLength}
              onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value) || 8)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Minimum number of characters required for passwords
            </p>
          </div>

          {/* Password Requirements */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
              Password Requirements
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy.requireUppercase}
                  onChange={(e) => handlePasswordPolicyChange('requireUppercase', e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Require Uppercase
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    At least one uppercase letter (A-Z)
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy.requireNumbers}
                  onChange={(e) => handlePasswordPolicyChange('requireNumbers', e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Require Numbers
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    At least one number (0-9)
                  </p>
                </div>
              </label>

              <label className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.passwordPolicy.requireSymbols}
                  onChange={(e) => handlePasswordPolicyChange('requireSymbols', e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Require Symbols
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    At least one symbol (!@#$%^&*)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Password Policy Preview */}
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-teal-800 dark:text-teal-200 mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Current Password Policy
            </h4>
            <div className="text-sm text-teal-700 dark:text-teal-300 space-y-1">
              <p>• Minimum length: {formData.passwordPolicy.minLength} characters</p>
              <p>• Uppercase letters: {formData.passwordPolicy.requireUppercase ? 'Required' : 'Optional'}</p>
              <p>• Numbers: {formData.passwordPolicy.requireNumbers ? 'Required' : 'Optional'}</p>
              <p>• Symbols: {formData.passwordPolicy.requireSymbols ? 'Required' : 'Optional'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Two-Factor Authentication
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.twoFactorRequired}
              onChange={(e) => handleChange('twoFactorRequired', e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 dark:bg-gray-800"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Require two-factor authentication for admin accounts
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Force all admin users to enable 2FA
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* IP Whitelist */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          IP Whitelist
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Allowed IP Addresses
            </label>
            <textarea
              value={formData.ipWhitelist.join(', ')}
              onChange={(e) => handleIpWhitelistChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={3}
              placeholder="192.168.1.1, 10.0.0.1, 203.0.113.0/24"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Comma-separated list of IP addresses allowed for admin access. Leave empty to allow all IPs.
            </p>
          </div>
          
          {formData.ipWhitelist.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Current Whitelist: {formData.ipWhitelist.length} IP(s)
                </span>
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {formData.ipWhitelist.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Log Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Audit Log Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Audit Log Retention (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.auditLogRetention}
              onChange={(e) => handleChange('auditLogRetention', parseInt(e.target.value) || 90)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              How long to keep audit logs before automatic deletion
            </p>
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

export default SecuritySettingsForm;
