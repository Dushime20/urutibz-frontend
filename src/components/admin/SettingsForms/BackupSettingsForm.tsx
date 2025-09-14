import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Clock, 
  Shield, 
  Cloud, 
  HardDrive, 
  Settings, 
  Users, 
  Package, 
  Calendar, 
  Mail, 
  Bell, 
  Lock, 
  FileText,
  Download,
  Upload,
  Server,
  Globe,
  Key,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { BackupSettings } from '../../../types/adminSettings.types';
import { DEFAULT_BACKUP_SETTINGS } from '../../../types/adminSettings.types';

interface BackupSettingsFormProps {
  settings: BackupSettings;
  onUpdate: (updates: Partial<BackupSettings>) => void;
  isLoading: boolean;
  theme: any;
  onCreateManualBackup?: (backupData: { type: 'full' | 'settings' | 'users' | 'products' | 'bookings'; description: string }) => Promise<void>;
}

const BackupSettingsForm: React.FC<BackupSettingsFormProps> = ({
  settings,
  onUpdate,
  isLoading,
  onCreateManualBackup,
}) => {
  const [formData, setFormData] = useState<BackupSettings>(settings || DEFAULT_BACKUP_SETTINGS);
  const [manualBackupData, setManualBackupData] = useState({
    type: 'full' as 'full' | 'settings' | 'users' | 'products' | 'bookings',
    description: ''
  });
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    setFormData(settings || DEFAULT_BACKUP_SETTINGS);
  }, [settings]);

  const handleChange = (field: keyof BackupSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleManualBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateManualBackup) return;
    
    setIsCreatingBackup(true);
    try {
      await onCreateManualBackup(manualBackupData);
      setManualBackupData({ type: 'full', description: '' });
    } catch (error) {
      console.error('Failed to create manual backup:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Automatic Backup Settings */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Database className="w-5 h-5 mr-2 text-my-primary" />
            Automatic Backup Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 flex items-center">
                <Settings className="w-4 h-4 mr-2 text-my-primary" />
                Basic Settings
              </h4>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.autoBackupEnabled}
                  onChange={(e) => handleChange('autoBackupEnabled', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup Time
                </label>
                <input
                  type="time"
                  value={formData.backupTime}
                  onChange={(e) => handleChange('backupTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Retention Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.backupRetentionDays}
                  onChange={(e) => handleChange('backupRetentionDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>
            </div>

            {/* Data Selection */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-my-primary" />
                Data Selection
              </h4>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeUsers}
                  onChange={(e) => handleChange('includeUsers', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <Users className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Users</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeProducts}
                  onChange={(e) => handleChange('includeProducts', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <Package className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Products</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeBookings}
                  onChange={(e) => handleChange('includeBookings', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <Calendar className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Bookings</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeSettings}
                  onChange={(e) => handleChange('includeSettings', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <Settings className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Settings</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeMedia}
                  onChange={(e) => handleChange('includeMedia', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <Upload className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Media</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeLogs}
                  onChange={(e) => handleChange('includeLogs', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <FileText className="w-4 h-4 ml-3 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Logs</span>
              </label>
            </div>
          </div>
        </div>

        {/* Storage Settings */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <HardDrive className="w-5 h-5 mr-2 text-my-primary" />
            Storage Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Storage Type
                </label>
                <select
                  value={formData.backupStorageType}
                  onChange={(e) => handleChange('backupStorageType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                >
                  <option value="local">Local Storage</option>
                  <option value="cloud">Cloud Storage</option>
                  <option value="ftp">FTP Server</option>
                </select>
              </div>

              {formData.backupStorageType === 'local' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Storage Path
                  </label>
                  <input
                    type="text"
                    value={formData.backupStoragePath}
                    onChange={(e) => handleChange('backupStoragePath', e.target.value)}
                    placeholder="/backups"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  />
                </div>
              )}

              {formData.backupStorageType === 'cloud' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cloud Provider
                    </label>
                    <select
                      value={formData.cloudStorageProvider}
                      onChange={(e) => handleChange('cloudStorageProvider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                    >
                      <option value="aws">Amazon Web Services</option>
                      <option value="gcp">Google Cloud Platform</option>
                      <option value="azure">Microsoft Azure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bucket Name
                    </label>
                    <input
                      type="text"
                      value={formData.cloudBucketName}
                      onChange={(e) => handleChange('cloudBucketName', e.target.value)}
                      placeholder="my-backup-bucket"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                    />
                  </div>
                </>
              )}

              {formData.backupStorageType === 'ftp' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      FTP Host
                    </label>
                    <input
                      type="text"
                      value={formData.ftpHost}
                      onChange={(e) => handleChange('ftpHost', e.target.value)}
                      placeholder="ftp.example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      FTP Port
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="65535"
                      value={formData.ftpPort}
                      onChange={(e) => handleChange('ftpPort', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      FTP Username
                    </label>
                    <input
                      type="text"
                      value={formData.ftpUsername}
                      onChange={(e) => handleChange('ftpUsername', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      FTP Password
                    </label>
                    <input
                      type="password"
                      value={formData.ftpPassword}
                      onChange={(e) => handleChange('ftpPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-my-primary" />
                Security & Compression
              </h4>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.compressBackups}
                  onChange={(e) => handleChange('compressBackups', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Compress backup files
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.encryptBackups}
                  onChange={(e) => handleChange('encryptBackups', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Encrypt backup files
                </span>
              </label>

              {formData.encryptBackups && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Encryption Key
                  </label>
                  <input
                    type="password"
                    value={formData.encryptionKey}
                    onChange={(e) => handleChange('encryptionKey', e.target.value)}
                    placeholder="Enter encryption key"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Backup Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10240"
                  value={formData.maxBackupSize}
                  onChange={(e) => handleChange('maxBackupSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recovery Settings */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Download className="w-5 h-5 mr-2 text-my-primary" />
            Recovery Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.recoveryModeEnabled}
                  onChange={(e) => handleChange('recoveryModeEnabled', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Enable recovery mode
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recovery Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="60"
                  max="86400"
                  value={formData.recoveryTimeout}
                  onChange={(e) => handleChange('recoveryTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowPartialRecovery}
                  onChange={(e) => handleChange('allowPartialRecovery', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Allow partial data recovery
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 flex items-center">
                <Bell className="w-4 h-4 mr-2 text-my-primary" />
                Notifications
              </h4>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifyOnBackupSuccess}
                  onChange={(e) => handleChange('notifyOnBackupSuccess', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <CheckCircle className="w-4 h-4 ml-3 mr-2 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Notify on backup success</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifyOnBackupFailure}
                  onChange={(e) => handleChange('notifyOnBackupFailure', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <AlertTriangle className="w-4 h-4 ml-3 mr-2 text-red-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Notify on backup failure</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.notifyOnRecoveryComplete}
                  onChange={(e) => handleChange('notifyOnRecoveryComplete', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <Download className="w-4 h-4 ml-3 mr-2 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Notify on recovery completion</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Email
                </label>
                <input
                  type="email"
                  value={formData.backupNotificationEmail}
                  onChange={(e) => handleChange('backupNotificationEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Settings */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Server className="w-5 h-5 mr-2 text-my-primary" />
            Maintenance Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.backupMaintenanceMode}
                  onChange={(e) => handleChange('backupMaintenanceMode', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Enable maintenance mode during backup
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maintenance Message
                </label>
                <textarea
                  value={formData.backupMaintenanceMessage}
                  onChange={(e) => handleChange('backupMaintenanceMessage', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.cleanupOldBackups}
                  onChange={(e) => handleChange('cleanupOldBackups', e.target.checked)}
                  className="w-4 h-4 text-my-primary border-gray-300 dark:border-gray-600 rounded focus:ring-my-primary dark:bg-gray-800"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Automatically cleanup old backups
                </span>
              </label>
            </div>
          </div>
        </div>

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

      {/* Manual Backup Section */}
      {onCreateManualBackup && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Database className="w-5 h-5 mr-2 text-my-primary" />
            Manual Backup
          </h3>
          
          <form onSubmit={handleManualBackup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Backup Type
                </label>
                <select
                  value={manualBackupData.type}
                  onChange={(e) => setManualBackupData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                >
                  <option value="full">Full System Backup</option>
                  <option value="settings">Settings Only</option>
                  <option value="users">Users Only</option>
                  <option value="products">Products Only</option>
                  <option value="bookings">Bookings Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={manualBackupData.description}
                  onChange={(e) => setManualBackupData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Manual backup before system update"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isCreatingBackup || !manualBackupData.description}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
              >
                {isCreatingBackup ? 'Creating Backup...' : 'Create Manual Backup'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BackupSettingsForm;