import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAdminSettings } from '../../hooks/useAdminSettings';
import { useToast } from '../../contexts/ToastContext';
import { 
  Palette, 
  Building, 
  Shield, 
  Bell, 
  Globe, 
  Database, 
  BarChart3,
  RotateCcw,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Server,
  HardDrive
} from 'lucide-react';
import type { SettingsSection } from '../../types/adminSettings.types';
import { DEFAULT_ANALYTICS_SETTINGS } from '../../types/adminSettings.types';

// Import form components (we'll create these next)
import ThemeSettingsForm from '../../components/admin/SettingsForms/ThemeSettingsForm';
import BusinessSettingsForm from '../../components/admin/SettingsForms/BusinessSettingsForm';
import SystemSettingsForm from '../../components/admin/SettingsForms/SystemSettingsForm';
import SecuritySettingsForm from '../../components/admin/SettingsForms/SecuritySettingsForm';
import NotificationSettingsForm from '../../components/admin/SettingsForms/NotificationSettingsForm';
import PlatformSettingsForm from '../../components/admin/SettingsForms/PlatformSettingsForm';
import BackupSettingsForm from '../../components/admin/SettingsForms/BackupSettingsForm';
import AnalyticsSettingsForm from '../../components/admin/SettingsForms/AnalyticsSettingsForm';

interface SettingsTab {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  component: React.ComponentType<any>;
}

const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { isDarkMode } = useDarkMode();
  
  const {
    settings,
    systemHealth,
    isLoading,
    isSaving,
    isExporting,
    isImporting,
    isBackingUp,
    error,
    validationErrors,
    updateSettings,
    resetSettings,
    uploadCompanyLogo,
    createManualBackup,
    exportSettings,
    importSettings,
    loadSystemHealth,
    triggerBackup,
    clearCache,
    refreshSettings,
    clearError,
    clearValidationErrors,
    loadAnalyticsConfig
  } = useAdminSettings({
    token: localStorage.getItem('token') || undefined,
    autoLoad: true,
    optimisticUpdates: true,
  });

  const [activeTab, setActiveTab] = useState<SettingsSection>('theme');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load analytics config when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics' && !settings?.analytics) {
      loadAnalyticsConfig();
    }
  }, [activeTab, settings?.analytics, loadAnalyticsConfig]);

  // Settings tabs configuration
  const settingsTabs: SettingsTab[] = [
    {
      id: 'theme',
      label: 'Theme & Appearance',
      icon: Palette,
      description: 'Customize colors, fonts, and visual appearance',
      component: ThemeSettingsForm,
    },
    {
      id: 'business',
      label: 'Business Settings',
      icon: Building,
      description: 'Company information and business rules',
      component: BusinessSettingsForm,
    },
    {
      id: 'system',
      label: 'System Settings',
      icon: Server,
      description: 'Server configuration and performance',
      component: SystemSettingsForm,
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      description: 'Authentication and security policies',
      component: SecuritySettingsForm,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Email, SMS, and push notification settings',
      component: NotificationSettingsForm,
    },
    {
      id: 'platform',
      label: 'Platform',
      icon: Globe,
      description: 'Site configuration and user settings',
      component: PlatformSettingsForm,
    },
    {
      id: 'backup',
      label: 'Backup & Recovery',
      icon: Database,
      description: 'Data backup and recovery settings',
      component: BackupSettingsForm,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Tracking and analytics configuration',
      component: AnalyticsSettingsForm,
    },
  ];

  // Load system health on mount
  useEffect(() => {
    loadSystemHealth();
  }, [loadSystemHealth]);

  // Handle settings updates
  const handleSettingsUpdate = async (updates: any, section: SettingsSection) => {
    try {
      setHasUnsavedChanges(false);
      await updateSettings(updates, section);
      setLastSaved(new Date());
      showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update settings', 'error');
    }
  };

  // Handle settings reset
  const handleResetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return;
    }

    try {
      await resetSettings();
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      showToast('Settings reset to defaults successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to reset settings', 'error');
    }
  };

  // Handle settings export
  const handleExportSettings = async () => {
    try {
      const exportData = await exportSettings();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Settings exported successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to export settings', 'error');
    }
  };

  // Handle settings import
  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        JSON.parse(content);
        
        if (!confirm('Are you sure you want to import these settings? This will overwrite your current settings.')) {
          return;
        }

        await importSettings({ file, validateOnly: false });
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        showToast('Settings imported successfully', 'success');
      } catch (error: any) {
        showToast(error.message || 'Failed to import settings', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Handle backup trigger
  const handleTriggerBackup = async () => {
    try {
      const backupData = await triggerBackup();
      showToast(`Backup created successfully: ${backupData.filename}`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to create backup', 'error');
    }
  };

  // Handle cache clear
  const handleClearCache = async () => {
    try {
      await clearCache();
      showToast('System cache cleared successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to clear cache', 'error');
    }
  };

  // Render loading state
  if (isLoading && !settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              refreshSettings();
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activeTabConfig = settingsTabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure your platform settings and preferences
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshSettings}
                disabled={isLoading}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={handleExportSettings}
                disabled={isExporting}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              
              <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center cursor-pointer disabled:opacity-50">
                <Upload className="w-4 h-4 mr-2" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
              
              <button
                onClick={handleResetSettings}
                disabled={isSaving}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-4 py-8">
        {/* Compact Top Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-my-primary" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Settings Categories</h3>
            </div>
          </div>
          <nav className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-3">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-0.5 px-1.5 py-1 rounded-md transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-my-primary text-white shadow-sm transform scale-105'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-my-primary'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center justify-between mb-6">
          {/* Status Text */}
          <div className="flex items-center gap-4">
            {isSaving && (
              <div className="flex items-center text-my-primary">
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
            
            {lastSaved && !isSaving && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Last saved: {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            
            {!isSaving && !lastSaved && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">No recent saves</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearCache}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors text-sm flex items-center"
            >
              <HardDrive className="w-4 h-4 mr-2" />
              Clear Cache
            </button>
            
            <button
              onClick={handleTriggerBackup}
              disabled={isBackingUp}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center disabled:opacity-50"
            >
              <Database className={`w-4 h-4 mr-2 ${isBackingUp ? 'animate-spin' : ''}`} />
              {isBackingUp ? 'Backing up...' : 'Create Backup'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    <div>
                      <h4 className="text-red-800 dark:text-red-200 font-medium">Error</h4>
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
                    <div>
                      <h4 className="text-yellow-800 dark:text-yellow-200 font-medium">Validation Errors</h4>
                      <ul className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={clearValidationErrors}
                    className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

          {/* Settings Form */}
          {ActiveComponent && settings && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {activeTab !== 'analytics' && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-my-primary/10 dark:bg-my-primary/20 rounded-lg">
                      {React.createElement(activeTabConfig?.icon || Server, {
                        className: "w-5 h-5 text-my-primary"
                      })}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {activeTabConfig?.label}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 ml-11">
                    {activeTabConfig?.description}
                  </p>
                </div>
              )}
              
              <ActiveComponent
                settings={settings[activeTab] || (activeTab === 'analytics' ? DEFAULT_ANALYTICS_SETTINGS : undefined)}
                onUpdate={(updates: any) => handleSettingsUpdate(updates, activeTab)}
                onLogoUpload={activeTab === 'business' ? uploadCompanyLogo : undefined}
                onCreateManualBackup={activeTab === 'backup' ? createManualBackup : undefined}
                isLoading={isSaving}
                theme={{ isDarkMode }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
