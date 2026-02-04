import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAdminSettings } from '../../hooks/useAdminSettings';
import { useToast } from '../../contexts/ToastContext';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslatedText } from '../../components/translated-text';
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
  HardDrive,
  Calendar,
  Eye,
  Trash2,
  Filter,
  X,
  FileDown,
  Search
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
  id: SettingsSection | 'bookings';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  component: React.ComponentType<any>;
}

const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { tSync } = useTranslation();
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

  const [activeTab, setActiveTab] = useState<SettingsSection | 'bookings'>('theme');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [bookingSubTab, setBookingSubTab] = useState<'settings' | 'logs'>('settings');

  // Booking Expiration Settings State
  const [bookingExpirationSettings, setBookingExpirationSettings] = useState({
    booking_expiration_hours: 4,
    booking_expiration_enabled: true,
    booking_expiration_last_run: null as string | null,
  });

  // Booking Expiration Stats State
  const [expirationStats, setExpirationStats] = useState({
    total_expired: 0,
    recent_expired: 0,
    upcoming_expired: 0,
  });

  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  // Booking Expiration Logs State
  const [expirationLogs, setExpirationLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit, setLogsLimit] = useState(10);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [logsFilters, setLogsFilters] = useState({
    startDate: '',
    endDate: '',
    search: '',
  });

  // Load analytics config when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics' && !settings?.analytics) {
      loadAnalyticsConfig();
    }
  }, [activeTab, settings?.analytics, loadAnalyticsConfig]);

  // Booking Expiration Functions
  const loadBookingExpirationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/booking-expiration/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookingExpirationSettings(data.data);
      }
    } catch (error) {
      console.error('Error loading booking expiration settings:', error);
    }
  };

  const loadExpirationStats = async () => {
    try {
      setIsLoadingStats(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/booking-expiration/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExpirationStats(data.data);
      }
    } catch (error) {
      console.error('Error loading expiration stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const updateBookingExpirationSettings = async (settings: Partial<typeof bookingExpirationSettings>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/booking-expiration/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setBookingExpirationSettings(data.data);
        showToast('Booking expiration settings updated successfully', 'success');
        
        // Reload stats after settings change
        loadExpirationStats();
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating booking expiration settings:', error);
      showToast('Failed to update booking expiration settings', 'error');
    }
  };

  const triggerExpirationCleanup = async () => {
    try {
      setIsTriggering(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/booking-expiration/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        showToast(`Cleanup completed: ${data.data.expired_count} bookings processed`, 'success');
        
        // Reload stats and settings after cleanup
        loadExpirationStats();
        loadBookingExpirationSettings();
        
        // Reload logs if on logs tab
        if (bookingSubTab === 'logs') {
          loadExpirationLogs();
        }
      } else {
        throw new Error('Failed to trigger cleanup');
      }
    } catch (error) {
      console.error('Error triggering cleanup:', error);
      showToast('Failed to trigger cleanup', 'error');
    } finally {
      setIsTriggering(false);
    }
  };

  // Booking Expiration Logs Functions
  const loadExpirationLogs = async (page = logsPage, limit = logsLimit) => {
    try {
      setIsLoadingLogs(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(logsFilters.startDate && { startDate: logsFilters.startDate }),
        ...(logsFilters.endDate && { endDate: logsFilters.endDate }),
        ...(logsFilters.search && { search: logsFilters.search }),
      });

      const response = await fetch(`/api/v1/booking-expiration/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExpirationLogs(data.data.logs);
        setLogsTotalPages(data.data.pagination.totalPages);
        setLogsTotal(data.data.pagination.total);
        setLogsPage(page);
      }
    } catch (error) {
      console.error('Error loading expiration logs:', error);
      showToast('Failed to load expiration logs', 'error');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const viewLogDetails = (log: any) => {
    setSelectedLog(log);
    setShowLogDetails(true);
  };

  const closeLogDetails = () => {
    setSelectedLog(null);
    setShowLogDetails(false);
  };

  const deleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this log entry?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/booking-expiration/logs/${logId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showToast('Log deleted successfully', 'success');
        
        // Close modal if it's open
        if (showLogDetails && selectedLog?.id === logId) {
          closeLogDetails();
        }
        
        loadExpirationLogs();
      } else {
        throw new Error('Failed to delete log');
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      showToast('Failed to delete log', 'error');
    }
  };

  const clearAllLogs = async () => {
    if (!confirm('Are you sure you want to delete ALL expiration logs? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/booking-expiration/logs', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showToast('All logs cleared successfully', 'success');
        loadExpirationLogs();
      } else {
        throw new Error('Failed to clear logs');
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      showToast('Failed to clear logs', 'error');
    }
  };

  const exportLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        ...(logsFilters.startDate && { startDate: logsFilters.startDate }),
        ...(logsFilters.endDate && { endDate: logsFilters.endDate }),
        ...(logsFilters.search && { search: logsFilters.search }),
      });

      const response = await fetch(`/api/v1/booking-expiration/logs/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking-expiration-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Logs exported successfully', 'success');
      } else {
        throw new Error('Failed to export logs');
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      showToast('Failed to export logs', 'error');
    }
  };

  const applyLogsFilters = () => {
    setLogsPage(1);
    loadExpirationLogs(1, logsLimit);
  };

  const resetLogsFilters = () => {
    setLogsFilters({
      startDate: '',
      endDate: '',
      search: '',
    });
    setLogsPage(1);
    loadExpirationLogs(1, logsLimit);
  };

  // Load booking expiration settings when bookings tab is active
  useEffect(() => {
    if (activeTab === 'bookings') {
      loadBookingExpirationSettings();
      loadExpirationStats();
      
      if (bookingSubTab === 'logs') {
        loadExpirationLogs();
      }
    }
  }, [activeTab, bookingSubTab]);

  // Settings tabs configuration
  const settingsTabs: SettingsTab[] = [
    {
      id: 'theme',
      label: tSync('Theme & Appearance'),
      icon: Palette,
      description: tSync('Customize colors, fonts, and visual appearance'),
      component: ThemeSettingsForm,
    },
    {
      id: 'business',
      label: tSync('Business Settings'),
      icon: Building,
      description: tSync('Company information and business rules'),
      component: BusinessSettingsForm,
    },
    {
      id: 'system',
      label: tSync('System Settings'),
      icon: Server,
      description: tSync('Server configuration and performance'),
      component: SystemSettingsForm,
    },
    {
      id: 'security',
      label: tSync('Security'),
      icon: Shield,
      description: tSync('Authentication and security policies'),
      component: SecuritySettingsForm,
    },
    {
      id: 'notifications',
      label: tSync('Notifications'),
      icon: Bell,
      description: tSync('Email, SMS, and push notification settings'),
      component: NotificationSettingsForm,
    },
    {
      id: 'platform',
      label: tSync('Platform'),
      icon: Globe,
      description: tSync('Site configuration and user settings'),
      component: PlatformSettingsForm,
    },
    {
      id: 'backup',
      label: tSync('Backup & Recovery'),
      icon: Database,
      description: tSync('Data backup and recovery settings'),
      component: BackupSettingsForm,
    },
    {
      id: 'analytics',
      label: tSync('Analytics'),
      icon: BarChart3,
      description: tSync('Tracking and analytics configuration'),
      component: AnalyticsSettingsForm,
    },
    {
      id: 'bookings',
      label: tSync('Bookings'),
      icon: Calendar,
      description: tSync('Booking expiration and lifecycle management'),
      component: () => null, // We'll render this inline
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
      const sectionLabel = settingsTabs.find(tab => tab.id === section)?.label || section;
      showToast(`${sectionLabel} ${tSync('settings updated successfully')}`, 'success');
    } catch (error: any) {
      showToast(error.message || tSync('Failed to update settings'), 'error');
    }
  };

  // Handle settings reset
  const handleResetSettings = async () => {
    if (!confirm(tSync('Are you sure you want to reset all settings to defaults? This action cannot be undone.'))) {
      return;
    }

    try {
      await resetSettings();
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      showToast(tSync('Settings reset to defaults successfully'), 'success');
    } catch (error: any) {
      showToast(error.message || tSync('Failed to reset settings'), 'error');
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
      showToast(tSync('Settings exported successfully'), 'success');
    } catch (error: any) {
      showToast(error.message || tSync('Failed to export settings'), 'error');
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
        
        if (!confirm(tSync('Are you sure you want to import these settings? This will overwrite your current settings.'))) {
          return;
        }

        await importSettings({ file, validateOnly: false });
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        showToast(tSync('Settings imported successfully'), 'success');
      } catch (error: any) {
        showToast(error.message || tSync('Failed to import settings'), 'error');
      }
    };
    reader.readAsText(file);
  };

  // Handle backup trigger
  const handleTriggerBackup = async () => {
    try {
      const backupData = await triggerBackup();
      showToast(`${tSync('Backup created successfully')}: ${backupData.filename}`, 'success');
    } catch (error: any) {
      showToast(error.message || tSync('Failed to create backup'), 'error');
    }
  };

  // Handle cache clear
  const handleClearCache = async () => {
    try {
      await clearCache();
      showToast(tSync('System cache cleared successfully'), 'success');
    } catch (error: any) {
      showToast(error.message || tSync('Failed to clear cache'), 'error');
    }
  };

  // Handle local storage clear
  const handleClearLocalStorage = () => {
    const confirmed = confirm(tSync('This will clear all app data stored in your browser (including saved sessions). Continue?'));
    if (!confirmed) return;
    try {
      localStorage.clear();
      showToast(tSync('Local storage cleared. You may need to sign in again.'), 'success');
    } catch (err: any) {
      showToast(err?.message || tSync('Failed to clear local storage'), 'error');
    }
  };

  // Render loading state
  if (isLoading && !settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400"><TranslatedText text="Loading settings..." /></p>
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            <TranslatedText text="Failed to Load Settings" />
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              refreshSettings();
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <TranslatedText text="Try Again" />
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                <TranslatedText text="Admin Settings" />
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                <TranslatedText text="Configure your platform settings and preferences" />
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={refreshSettings}
                disabled={isLoading}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-1 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline"><TranslatedText text="Refresh" /></span>
              </button>
              
              <button
                onClick={handleExportSettings}
                disabled={isExporting}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 text-sm"
              >
                <Download className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline"><TranslatedText text="Export" /></span>
              </button>
              
              <label className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center cursor-pointer disabled:opacity-50 text-sm">
                <Upload className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline"><TranslatedText text="Import" /></span>
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
                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 text-sm"
              >
                <RotateCcw className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline"><TranslatedText text="Reset" /></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Compact Top Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 sm:p-3 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-my-primary" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                <TranslatedText text="Settings Categories" />
              </h3>
            </div>
          </div>
          <div className="relative">
            <nav className="flex gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-700 pb-2 sm:pb-3 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 sm:gap-4 min-w-max">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm ${
                        isActive
                          ? 'bg-my-primary text-white shadow-sm transform scale-105'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-my-primary'
                      }`}
                    >
                      <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
            
            {/* Scroll indicators for mobile */}
            <div className="absolute right-0 top-0 bottom-2 sm:bottom-3 w-6 sm:w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none sm:hidden"></div>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
          {/* Status Text */}
          <div className="flex items-center gap-4">
            {isSaving && (
              <div className="flex items-center text-my-primary">
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-xs sm:text-sm">{tSync('Saving...')}</span>
              </div>
            )}
            
            {lastSaved && !isSaving && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-xs sm:text-sm">
                  {tSync('Last saved')}: {lastSaved.toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {!isSaving && !lastSaved && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-xs sm:text-sm">{tSync('No recent saves')}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleClearCache}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm flex items-center"
            >
              <HardDrive className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline"><TranslatedText text="Clear Cache" /></span>
              <span className="sm:hidden"><TranslatedText text="Cache" /></span>
            </button>

            <button
              onClick={handleClearLocalStorage}
              className="bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-800/50 text-orange-700 dark:text-orange-300 px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm flex items-center"
              title={tSync('Clears all local browser data for this app')}
            >
              <HardDrive className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline"><TranslatedText text="Clear Local Storage" /></span>
              <span className="sm:hidden"><TranslatedText text="Storage" /></span>
            </button>
            
            <button
              onClick={handleTriggerBackup}
              disabled={isBackingUp}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm flex items-center disabled:opacity-50"
            >
              <Database className={`w-4 h-4 mr-1 sm:mr-2 ${isBackingUp ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isBackingUp ? tSync('Backing up...') : tSync('Create Backup')}</span>
              <span className="sm:hidden">{isBackingUp ? tSync('Backup...') : tSync('Backup')}</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start sm:items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <h4 className="text-red-800 dark:text-red-200 font-medium text-sm sm:text-base"><TranslatedText text="Error" /></h4>
                      <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 self-end sm:self-auto"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-800 dark:text-yellow-200 font-medium text-sm sm:text-base"><TranslatedText text="Validation Errors" /></h4>
                      <ul className="text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm mt-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>• {error.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={clearValidationErrors}
                    className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 self-end sm:self-auto"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

          {/* Settings Form */}
          {ActiveComponent && settings && activeTab !== 'bookings' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              {activeTab !== 'analytics' && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <div className="p-2 bg-my-primary/10 dark:bg-my-primary/20 rounded-lg flex-shrink-0">
                      {React.createElement(activeTabConfig?.icon || Server, {
                        className: "w-4 h-4 sm:w-5 sm:h-5 text-my-primary"
                      })}
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      {activeTabConfig?.label}
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 sm:ml-11">
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

          {/* Bookings Tab - Booking Expiration Settings */}
          {activeTab === 'bookings' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <div className="p-2 bg-my-primary/10 dark:bg-my-primary/20 rounded-lg flex-shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-my-primary" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    <TranslatedText text="Booking Management" />
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 sm:ml-11">
                  <TranslatedText text="Configure booking expiration and lifecycle management settings" />
                </p>
              </div>

              {/* Booking Subtabs */}
              <div className="mb-6">
                <nav className="flex gap-2 sm:gap-4 border-b border-gray-200 dark:border-gray-700 pb-2 sm:pb-3 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-2 sm:gap-4 min-w-max">
                    <button
                      onClick={() => setBookingSubTab('settings')}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                        bookingSubTab === 'settings'
                          ? 'bg-my-primary text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <TranslatedText text="Expiration Settings" />
                    </button>
                    <button
                      onClick={() => setBookingSubTab('logs')}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                        bookingSubTab === 'logs'
                          ? 'bg-my-primary text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <TranslatedText text="Expiration Logs" />
                    </button>
                  </div>
                </nav>
              </div>

              {/* Settings Subtab */}
              {bookingSubTab === 'settings' && (
                <><div className="space-y-4 sm:space-y-6">
                  {/* Booking Expiration Settings */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                      <TranslatedText text="Booking Expiration Settings" />
                    </h3>

                    <div className="space-y-3 sm:space-y-4">
                      {/* Enable/Disable Expiration */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <TranslatedText text="Enable Automatic Expiration" />
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <TranslatedText text="Automatically delete unpaid bookings after specified time" />
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={bookingExpirationSettings.booking_expiration_enabled}
                            onChange={(e) => updateBookingExpirationSettings({
                              booking_expiration_enabled: e.target.checked
                            })}
                            className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-my-primary/20 dark:peer-focus:ring-my-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-my-primary"></div>
                        </label>
                      </div>

                      {/* Expiration Hours */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <TranslatedText text="Expiration Time (Hours)" />
                        </label>
                        <select
                          value={bookingExpirationSettings.booking_expiration_hours}
                          onChange={(e) => updateBookingExpirationSettings({
                            booking_expiration_hours: parseInt(e.target.value)
                          })}
                          disabled={!bookingExpirationSettings.booking_expiration_enabled}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                          <option value={2}>2 hours</option>
                          <option value={4}>4 hours</option>
                          <option value={8}>8 hours</option>
                          <option value={12}>12 hours</option>
                          <option value={24}>24 hours</option>
                          <option value={48}>48 hours</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <TranslatedText text="Bookings will be automatically deleted after this time if payment is not completed" />
                        </p>
                      </div>

                      {/* Last Run Time */}
                      {bookingExpirationSettings.booking_expiration_last_run && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <TranslatedText text="Last Cleanup Run" />
                          </label>
                          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {new Date(bookingExpirationSettings.booking_expiration_last_run).toLocaleString()}
                          </div>
                        </div>
                      )}

                      {/* Manual Cleanup Button */}
                      <div>
                        <button
                          onClick={triggerExpirationCleanup}
                          disabled={isTriggering}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base"
                        >
                          {isTriggering ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              <TranslatedText text="Processing..." />
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              <TranslatedText text="Trigger Manual Cleanup" />
                            </>
                          )}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <TranslatedText text="Manually run the expiration cleanup process now" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div><div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        <TranslatedText text="Expiration Statistics" />
                      </h3>

                      {isLoadingStats ? (
                        <div className="flex items-center justify-center h-32">
                          <RefreshCw className="w-6 h-6 animate-spin text-my-primary" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                          {/* Total Expired */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                                  <TranslatedText text="Total Expired" />
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                  {expirationStats.total_expired}
                                </p>
                              </div>
                              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                              </div>
                            </div>
                          </div>

                          {/* Recent Expired */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                                  <TranslatedText text="Expired (24h)" />
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                  {expirationStats.recent_expired}
                                </p>
                              </div>
                              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                              </div>
                            </div>
                          </div>

                          {/* Upcoming Expired */}
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                                  <TranslatedText text="Expiring Soon" />
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                  {expirationStats.upcoming_expired}
                                </p>
                              </div>
                              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Refresh Stats Button */}
                      <button
                        onClick={loadExpirationStats}
                        disabled={isLoadingStats}
                        className="w-full mt-3 sm:mt-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
                        <TranslatedText text="Refresh Statistics" />
                      </button>
                    </div>
                  </div></>
              )}

              {/* Information Section */}
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      <TranslatedText text="How Booking Expiration Works" />
                    </h4>
                    <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <p>• <TranslatedText text="Confirmed bookings that remain unpaid will be automatically deleted after the specified time" /></p>
                      <p>• <TranslatedText text="The system runs cleanup every 5 minutes to check for expired bookings" /></p>
                      <p>• <TranslatedText text="Expired bookings are logged for auditing purposes before deletion" /></p>
                      <p>• <TranslatedText text="Reserved product availability is freed up when bookings expire" /></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logs Subtab */}
              {bookingSubTab === 'logs' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Header with Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      <TranslatedText text="Booking Expiration Logs" />
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={exportLogs}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center text-sm"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        <TranslatedText text="Export CSV" />
                      </button>
                      <button
                        onClick={clearAllLogs}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <TranslatedText text="Clear All" />
                      </button>
                      <button
                        onClick={() => loadExpirationLogs()}
                        disabled={isLoadingLogs}
                        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg transition-colors flex items-center text-sm"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                        <TranslatedText text="Refresh" />
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        <TranslatedText text="Filters" />
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          <TranslatedText text="Start Date" />
                        </label>
                        <input
                          type="date"
                          value={logsFilters.startDate}
                          onChange={(e) => setLogsFilters({ ...logsFilters, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          <TranslatedText text="End Date" />
                        </label>
                        <input
                          type="date"
                          value={logsFilters.endDate}
                          onChange={(e) => setLogsFilters({ ...logsFilters, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          <TranslatedText text="Search" />
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={logsFilters.search}
                            onChange={(e) => setLogsFilters({ ...logsFilters, search: e.target.value })}
                            placeholder="Booking number, user..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={applyLogsFilters}
                        className="bg-my-primary hover:bg-my-primary/90 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        <TranslatedText text="Apply Filters" />
                      </button>
                      <button
                        onClick={resetLogsFilters}
                        className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        <TranslatedText text="Reset" />
                      </button>
                    </div>
                  </div>

                  {/* Logs Table */}
                  {isLoadingLogs ? (
                    <div className="flex items-center justify-center h-64">
                      <RefreshCw className="w-8 h-8 animate-spin text-my-primary" />
                    </div>
                  ) : expirationLogs.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        <TranslatedText text="No expiration logs found" />
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <TranslatedText text="Booking" />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <TranslatedText text="Renter" />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <TranslatedText text="Owner" />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <TranslatedText text="Product" />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <TranslatedText text="Amount" />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <TranslatedText text="Expired At" />
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <TranslatedText text="Actions" />
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {expirationLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  {log.booking_reference || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{log.renter_name || 'N/A'}</div>
                                    <div className="text-xs">{log.renter_email || ''}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{log.owner_name || 'N/A'}</div>
                                    <div className="text-xs">{log.owner_email || ''}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {log.product_title || 'N/A'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                  ${parseFloat(log.booking_amount || 0).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(log.expired_at).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => viewLogDetails(log)}
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteLog(log.id)}
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                      title="Delete Log"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <TranslatedText text="Showing" /> {((logsPage - 1) * logsLimit) + 1} - {Math.min(logsPage * logsLimit, logsTotal)} <TranslatedText text="of" /> {logsTotal} <TranslatedText text="logs" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadExpirationLogs(logsPage - 1, logsLimit)}
                            disabled={logsPage === 1}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <TranslatedText text="Previous" />
                          </button>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Page" /> {logsPage} <TranslatedText text="of" /> {logsTotalPages}
                          </span>
                          <button
                            onClick={() => loadExpirationLogs(logsPage + 1, logsLimit)}
                            disabled={logsPage === logsTotalPages}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <TranslatedText text="Next" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Log Details Modal */}
              {showLogDetails && selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        <TranslatedText text="Expiration Log Details" />
                      </h3>
                      <button
                        onClick={closeLogDetails}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      {/* Renter and Owner Info */}
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Renter" />
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1 font-medium">
                            {selectedLog.renter_name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {selectedLog.renter_email || ''}
                          </p>
                          {selectedLog.renter_phone && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {selectedLog.renter_phone}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Owner" />
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1 font-medium">
                            {selectedLog.owner_name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {selectedLog.owner_email || ''}
                          </p>
                          {selectedLog.owner_phone && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {selectedLog.owner_phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Booking Reference" />
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {selectedLog.booking_reference || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Product" />
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {selectedLog.product_title || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Booking Amount" />
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            ${parseFloat(selectedLog.booking_amount || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Booking Status" />
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {selectedLog.booking_status || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Created At" />
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {selectedLog.booking_created_at ? new Date(selectedLog.booking_created_at).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Expired At" />
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {new Date(selectedLog.expired_at).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Expiration Hours Used" />
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {selectedLog.expiration_hours_used || 'N/A'} hours
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Expired By" />
                          </label>
                          <p className="text-sm text-gray-900 dark:text-white mt-1">
                            {selectedLog.expired_by || 'system'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          <TranslatedText text="Deletion Reason" />
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                          {selectedLog.deletion_reason || 'Automatic expiration'}
                        </p>
                      </div>
                      {selectedLog.booking_data && (
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            <TranslatedText text="Booking Data" />
                          </label>
                          <pre className="text-xs text-gray-900 dark:text-white mt-1 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
                            {JSON.stringify(selectedLog.booking_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={() => deleteLog(selectedLog.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        <TranslatedText text="Delete Log" />
                      </button>
                      <button
                        onClick={closeLogDetails}
                        className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        <TranslatedText text="Close" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
