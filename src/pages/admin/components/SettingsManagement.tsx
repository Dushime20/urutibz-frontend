import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  DollarSign, 
  Database, 
  Lock, 
  Eye, 
  Mail, 
  Smartphone, 
  AlertTriangle, 
  Save, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  Users,
  Calendar,
  CreditCard,
  MapPin,
  Languages,
  Moon,
  Sun,
  Zap,
  Activity,
  BarChart3,
  FileText,
  Key,
  Server,
  Wifi,
  HardDrive
} from 'lucide-react';
import { Button } from '../../../components/ui/DesignSystem';
import { 
  fetchAdminSettings, 
  updateAdminSettings, 
  resetAdminSettings,
  type AdminSettings,
  type PlatformSettings,
  type SecuritySettings,
  type NotificationSettings,
  type SystemSettings
} from '../service/api';

interface SettingsManagementProps {
  // Add props for settings data as needed
}

const SettingsManagement: React.FC<SettingsManagementProps> = () => {
  const [activeTab, setActiveTab] = useState<'platform' | 'security' | 'notifications' | 'system'>('platform');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    siteName: 'Urutibizi',
    siteDescription: 'Your trusted rental platform',
    contactEmail: 'support@urutibizi.com',
    supportPhone: '+250 788 123 456',
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    timezone: 'Africa/Kigali',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    phoneVerificationRequired: false,
    kycRequired: true,
    maxImagesPerProduct: 10,
    maxProductsPerUser: 50,
    autoApproveProducts: false,
    autoApproveUsers: false,
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireTwoFactor: false,
    enableCaptcha: true,
    ipWhitelist: [],
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFileSize: 5,
    enableAuditLog: true,
    dataRetentionDays: 365,
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    bookingNotifications: true,
    paymentNotifications: true,
    reviewNotifications: true,
    systemMaintenanceAlerts: true,
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    cacheEnabled: true,
    cacheTimeout: 3600,
    backupEnabled: true,
    backupFrequency: 'daily',
    logLevel: 'info',
    debugMode: false,
    apiRateLimit: 1000,
    maxConcurrentUsers: 10000,
  });

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const token = localStorage.getItem('token');
        const settings = await fetchAdminSettings(token || undefined);
        
        if (settings.platform) setPlatformSettings(settings.platform);
        if (settings.security) setSecuritySettings(settings.security);
        if (settings.notifications) setNotificationSettings(settings.notifications);
        if (settings.system) setSystemSettings(settings.system);
      } catch (error) {
        console.error('Error loading settings:', error);
        // Keep default values if loading fails
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      const token = localStorage.getItem('token');
      const settings: AdminSettings = {
        platform: platformSettings,
        security: securitySettings,
        notifications: notificationSettings,
        system: systemSettings,
      };
      
      await updateAdminSettings(settings, token || undefined);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const defaultSettings = await resetAdminSettings(token || undefined);
        
        if (defaultSettings.platform) setPlatformSettings(defaultSettings.platform);
        if (defaultSettings.security) setSecuritySettings(defaultSettings.security);
        if (defaultSettings.notifications) setNotificationSettings(defaultSettings.notifications);
        if (defaultSettings.system) setSystemSettings(defaultSettings.system);
        
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
        console.error('Error resetting settings:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const TabButton: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
    onClick: () => void;
  }> = ({ icon: Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        active
          ? 'bg-primary-50 text-primary-700 border border-primary-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  const SettingCard: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    children: React.ReactNode;
  }> = ({ icon: Icon, title, description, children }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary-50 rounded-lg">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Admin Settings</h3>
          <p className="text-gray-600">Manage platform configuration and system preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleResetSettings}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Default
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`flex items-center gap-2 p-4 rounded-xl ${
          saveStatus === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : saveStatus === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {saveStatus === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : saveStatus === 'error' ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
          )}
          <span className="font-medium">
            {saveStatus === 'success' 
              ? 'Settings saved successfully!' 
              : saveStatus === 'error'
              ? 'Failed to save settings. Please try again.'
              : 'Saving settings...'
            }
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
        <TabButton
          icon={Globe}
          label="Platform"
          active={activeTab === 'platform'}
          onClick={() => setActiveTab('platform')}
        />
        <TabButton
          icon={Shield}
          label="Security"
          active={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
        />
        <TabButton
          icon={Bell}
          label="Notifications"
          active={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
        />
        <TabButton
          icon={Database}
          label="System"
          active={activeTab === 'system'}
          onClick={() => setActiveTab('system')}
        />
      </div>

      {/* Settings Content */}
      <div className="space-y-6">
        {activeTab === 'platform' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <SettingCard
              icon={Globe}
              title="Basic Information"
              description="Configure your platform's basic details"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={platformSettings.siteName}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={platformSettings.siteDescription}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={platformSettings.contactEmail}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={platformSettings.supportPhone}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </SettingCard>

            {/* Regional Settings */}
            <SettingCard
              icon={MapPin}
              title="Regional Settings"
              description="Configure default regional preferences"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Currency
                    </label>
                    <select
                      value={platformSettings.defaultCurrency}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, defaultCurrency: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="RWF">RWF (₨)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Language
                    </label>
                    <select
                      value={platformSettings.defaultLanguage}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="rw">Kinyarwanda</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={platformSettings.timezone}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Africa/Kigali">Africa/Kigali</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
              </div>
            </SettingCard>

            {/* Platform Features */}
            <SettingCard
              icon={Zap}
              title="Platform Features"
              description="Configure platform functionality and limits"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Images Per Product
                    </label>
                    <input
                      type="number"
                      value={platformSettings.maxImagesPerProduct}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, maxImagesPerProduct: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Products Per User
                    </label>
                    <input
                      type="number"
                      value={platformSettings.maxProductsPerUser}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, maxProductsPerUser: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={platformSettings.maintenanceMode}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={platformSettings.registrationEnabled}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable User Registration</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={platformSettings.autoApproveProducts}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, autoApproveProducts: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Auto-approve Products</span>
                  </label>
                </div>
              </div>
            </SettingCard>

            {/* Verification Settings */}
            <SettingCard
              icon={Shield}
              title="Verification Settings"
              description="Configure user verification requirements"
            >
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={platformSettings.emailVerificationRequired}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, emailVerificationRequired: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Require Email Verification</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={platformSettings.phoneVerificationRequired}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, phoneVerificationRequired: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Require Phone Verification</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={platformSettings.kycRequired}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, kycRequired: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Require KYC Verification</span>
                </label>
              </div>
            </SettingCard>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Authentication Settings */}
            <SettingCard
              icon={Lock}
              title="Authentication Settings"
              description="Configure login and session security"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (hours)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={securitySettings.requireTwoFactor}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, requireTwoFactor: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Require Two-Factor Authentication</span>
                </label>
              </div>
            </SettingCard>

            {/* File Upload Security */}
            <SettingCard
              icon={FileText}
              title="File Upload Security"
              description="Configure file upload restrictions"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.maxFileSize}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed File Types
                  </label>
                  <input
                    type="text"
                    value={securitySettings.allowedFileTypes.join(', ')}
                    onChange={(e) => setSecuritySettings(prev => ({ 
                      ...prev, 
                      allowedFileTypes: e.target.value.split(',').map(type => type.trim()) 
                    }))}
                    placeholder="jpg, jpeg, png, gif, webp"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={securitySettings.enableCaptcha}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, enableCaptcha: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable CAPTCHA</span>
                </label>
              </div>
            </SettingCard>

            {/* Audit & Monitoring */}
            <SettingCard
              icon={Activity}
              title="Audit & Monitoring"
              description="Configure audit logging and monitoring"
            >
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={securitySettings.enableAuditLog}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, enableAuditLog: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Audit Logging</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Retention (days)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.dataRetentionDays}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, dataRetentionDays: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Whitelist (one per line)
                  </label>
                  <textarea
                    value={securitySettings.ipWhitelist.join('\n')}
                    onChange={(e) => setSecuritySettings(prev => ({ 
                      ...prev, 
                      ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim()) 
                    }))}
                    rows={3}
                    placeholder="192.168.1.1&#10;10.0.0.1"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </SettingCard>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Notifications */}
            <SettingCard
              icon={Mail}
              title="Email Notifications"
              description="Configure email notification preferences"
            >
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Email Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.bookingNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, bookingNotifications: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Booking Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.paymentNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, paymentNotifications: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Payment Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.reviewNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, reviewNotifications: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Review Notifications</span>
                </label>
              </div>
            </SettingCard>

            {/* SMS & Push Notifications */}
            <SettingCard
              icon={Smartphone}
              title="SMS & Push Notifications"
              description="Configure mobile notification preferences"
            >
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable SMS Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Push Notifications</span>
                </label>
              </div>
            </SettingCard>

            {/* Admin Alerts */}
            <SettingCard
              icon={AlertTriangle}
              title="Admin Alerts"
              description="Configure administrative alert preferences"
            >
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.adminAlerts}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, adminAlerts: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Admin Alerts</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.systemMaintenanceAlerts}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemMaintenanceAlerts: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">System Maintenance Alerts</span>
                </label>
              </div>
            </SettingCard>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cache Settings */}
            <SettingCard
              icon={Database}
              title="Cache Settings"
              description="Configure caching and performance settings"
            >
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={systemSettings.cacheEnabled}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, cacheEnabled: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Caching</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cache Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.cacheTimeout}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, cacheTimeout: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </SettingCard>

            {/* Backup Settings */}
            <SettingCard
              icon={HardDrive}
              title="Backup Settings"
              description="Configure system backup preferences"
            >
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={systemSettings.backupEnabled}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, backupEnabled: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Automatic Backups</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={systemSettings.backupFrequency}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </SettingCard>

            {/* System Monitoring */}
            <SettingCard
              icon={BarChart3}
              title="System Monitoring"
              description="Configure system monitoring and limits"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Rate Limit (requests/hour)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.apiRateLimit}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Concurrent Users
                  </label>
                  <input
                    type="number"
                    value={systemSettings.maxConcurrentUsers}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxConcurrentUsers: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Log Level
                  </label>
                  <select
                    value={systemSettings.logLevel}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, logLevel: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={systemSettings.debugMode}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, debugMode: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Debug Mode</span>
                </label>
              </div>
            </SettingCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsManagement; 