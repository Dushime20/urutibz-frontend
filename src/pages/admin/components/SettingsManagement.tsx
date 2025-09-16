import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  Lock, 
  Mail, 
  Smartphone, 
  AlertTriangle, 
  Save, 
  RefreshCw,
  CheckCircle,
  XCircle,
  MapPin,
  Zap,
  Activity,
  BarChart3,
  FileText,
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
} from '../service';
import { TwoFactorManagement, useTwoFactor } from '../../../components/2fa';
import ChangePasswordModal from '../../my-account/components/ChangePasswordModal';
import { useToast } from '../../../contexts/ToastContext';
import Portal from '../../../components/ui/Portal';

interface SettingsManagementProps {
  // Add props for settings data as needed
}

const SettingsManagement: React.FC<SettingsManagementProps> = () => {
  const [activeTab, setActiveTab] = useState<'platform' | 'security' | 'notifications' | 'system'>('platform');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
  const { status: twoFactorStatus } = useTwoFactor();
  const { showToast } = useToast();

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

  // Mirror requireTwoFactor to localStorage so route guards react immediately
  useEffect(() => {
    try { localStorage.setItem('security.requireTwoFactor', String(securitySettings.requireTwoFactor)); } catch {}
  }, [securitySettings.requireTwoFactor]);

  // Open 2FA when redirected with force2fa
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const forced = params.get('force2fa') === '1' || localStorage.getItem('force2fa') === '1';
      if (forced) {
        setActiveTab('security');
        setShow2FAModal(true);
        // Clean the param to avoid reopening after close
        params.delete('force2fa');
        const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', url);
        try { localStorage.removeItem('force2fa'); } catch {}
      }

      const onForce = () => {
        setActiveTab('security');
        setShow2FAModal(true);
      };
      window.addEventListener('admin:force2fa', onForce as EventListener);
      return () => window.removeEventListener('admin:force2fa', onForce as EventListener);
    } catch {}
  }, []);

  // Load settings on component mount (respect global theme)
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
          ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-700'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
          <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h3>
          <p className="text-gray-600 dark:text-gray-400">Manage platform configuration and system preferences</p>
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
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700' 
            : saveStatus === 'error'
            ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700'
            : 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-700'
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
      <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={platformSettings.siteName}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={platformSettings.siteDescription}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={platformSettings.contactEmail}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={platformSettings.supportPhone}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Currency
                    </label>
                    <select
                      value={platformSettings.defaultCurrency}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, defaultCurrency: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="RWF">RWF (₨)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Language
                    </label>
                    <select
                      value={platformSettings.defaultLanguage}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="rw">Kinyarwanda</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={platformSettings.timezone}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Images Per Product
                    </label>
                    <input
                      type="number"
                      value={platformSettings.maxImagesPerProduct}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, maxImagesPerProduct: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Products Per User
                    </label>
                    <input
                      type="number"
                      value={platformSettings.maxProductsPerUser}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, maxProductsPerUser: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={platformSettings.maintenanceMode}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 bg-white dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Mode</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={platformSettings.registrationEnabled}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
                      className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 bg-white dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable User Registration</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={platformSettings.autoApproveProducts}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, autoApproveProducts: e.target.checked }))}
                      className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 bg-white dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-approve Products</span>
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
                    className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 bg-white dark:bg-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Email Verification</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={platformSettings.phoneVerificationRequired}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, phoneVerificationRequired: e.target.checked }))}
                    className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 bg-white dark:bg-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Phone Verification</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={platformSettings.kycRequired}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, kycRequired: e.target.checked }))}
                    className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 bg-white dark:bg-gray-700"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Require KYC Verification</span>
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

            {/* Account Security (Admin personal controls) */}
            <SettingCard
              icon={Shield}
              title="Account Security"
              description="Manage your own admin account security"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Password</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Update your account password</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="px-3 py-2"
                    onClick={() => {
                      setShowChangePassword(true);
                    }}
                  >
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${twoFactorStatus?.isLoading ? 'text-gray-400' : twoFactorStatus?.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {twoFactorStatus?.isLoading ? 'Loading...' : twoFactorStatus?.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Button
                      className={`px-3 py-2 ${twoFactorStatus?.enabled ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-my-primary hover:bg-primary-700 text-white'}`}
                      onClick={() => {
                        setShow2FAModal(true);
                      }}
                      disabled={twoFactorStatus?.isLoading}
                    >
                      {twoFactorStatus?.isLoading ? 'Loading...' : twoFactorStatus?.enabled ? 'Manage' : 'Enable'}
                    </Button>
                  </div>
                </div>
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

      {/* 2FA Management Modal */}
      {show2FAModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-my-primary/10 rounded-md">
                    <Smartphone className="w-4 h-4 text-my-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage your 2FA settings</p>
                  </div>
                </div>
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  aria-label="Close 2FA"
                >
                  <XCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="p-3">
                <div className="max-h-[70vh] overflow-y-auto scale-95 origin-top">
                  <TwoFactorManagement onStatusChange={() => {}} />
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          token={token}
        />
      )}
    </div>
  );
};

export default SettingsManagement; 