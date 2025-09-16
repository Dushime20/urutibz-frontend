import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Smartphone, Key, AlertCircle, CheckCircle, XCircle, RefreshCw, Download, Copy, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { twoFactorService } from '../../services/2faService';
import { useToast } from '../../contexts/ToastContext';
import { TwoFactorSetup } from './TwoFactorSetup';
import type { TwoFactorState } from '../../types/2fa';

interface TwoFactorManagementProps {
  onStatusChange?: (status: TwoFactorState) => void;
}

export const TwoFactorManagement: React.FC<TwoFactorManagementProps> = ({
  onStatusChange,
}) => {
  const [status, setStatus] = useState<TwoFactorState>({
    enabled: false,
    verified: false,
    hasSecret: false,
    hasBackupCodes: false,
    isLoading: true,
    error: null,
  });
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();

  // Frontend validation schema for current password
  const currentPasswordSchema = z.object({ currentPassword: z.string().min(1, 'Current password is required') });
  type CurrentPasswordForm = z.infer<typeof currentPasswordSchema>;
  const disableForm = useForm<CurrentPasswordForm>({ resolver: zodResolver(currentPasswordSchema), mode: 'onChange' });

  // Fetch 2FA status on component mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await twoFactorService.getStatus();
      if (response.success) {
        const newStatus: TwoFactorState = {
          enabled: response.data.enabled,
          verified: response.data.verified,
          hasSecret: response.data.hasSecret,
          hasBackupCodes: response.data.hasBackupCodes,
          isLoading: false,
          error: null,
        };
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      } else {
        setStatus(prev => ({ ...prev, isLoading: false, error: 'Failed to fetch 2FA status' }));
      }
    } catch (err) {
      setStatus(prev => ({ ...prev, isLoading: false, error: 'Failed to fetch 2FA status' }));
      console.error('Error fetching 2FA status:', err);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    fetchStatus();
    showToast('Two-factor authentication enabled successfully!', 'success');
  };

  const handleDisable2FA = async (data: CurrentPasswordForm) => {
    setIsLoading(true);
    
    try {
      const response = await twoFactorService.disable(data.currentPassword);
      if ((response as any).success) {
        showToast('Two-factor authentication disabled successfully', 'success');
        setShowDisable(false);
        disableForm.reset();
        fetchStatus();
      } else {
        showToast((response as any).message || 'Failed to disable 2FA. Please check your password.', 'error');
      }
    } catch (err) {
      const status = (err as any)?.response?.status;
      const message = (err as any)?.response?.data?.message;
      if (status === 400) showToast(message || 'Invalid current password', 'error');
      else if (status === 401) showToast('You must be logged in to perform this action', 'error');
      else showToast('Failed to disable 2FA. Please try again.', 'error');
      console.error('Error disabling 2FA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    setShowPasswordPrompt(true);
  };

  const confirmGenerateBackupCodes = async () => {
    if (!currentPassword || typeof currentPassword !== 'string') {
      showToast('Please enter your current password', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await twoFactorService.generateBackupCodes(currentPassword);
      if ((response as any).success) {
        setBackupCodes(response.data.backupCodes);
        setShowBackupCodes(true);
        setShowPasswordPrompt(false);
        setCurrentPassword('');
        showToast('New backup codes generated successfully!', 'success');
      } else {
        const msg = (response as any).message || 'Failed to generate backup codes';
        showToast(msg, 'error');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      if (status === 400) {
        showToast(message || 'Invalid current password', 'error');
      } else if (status === 401) {
        showToast('You must be logged in to perform this action', 'error');
      } else {
        showToast('Failed to generate backup codes. Please try again.', 'error');
      }
      console.error('Error generating backup codes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('Backup code copied to clipboard', 'success');
    } catch (err) {
      showToast('Failed to copy backup code', 'error');
    }
  };

  const downloadBackupCodes = () => {
    const content = `Two-Factor Authentication Backup Codes\n\n${backupCodes
      .map((code, index) => `${index + 1}. ${code}`)
      .join('\n')}\n\nKeep these codes safe! You can use them to access your account if you lose your 2FA device.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Backup codes downloaded', 'success');
  };

  if (status.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-my-primary"></div>
        <span className="ml-3 text-gray-600">Loading 2FA status...</span>
      </div>
    );
  }

  if (showSetup) {
    return (
      <TwoFactorSetup
        onSetupComplete={handleSetupComplete}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  if (showDisable) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Disable 2FA</h2>
          <p className="text-gray-600">Enter your current password to confirm</p>
        </div>

        <form onSubmit={disableForm.handleSubmit(handleDisable2FA)} className="space-y-6">
          <div>
            <label htmlFor="disable-password" className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              {...disableForm.register('currentPassword')}
              type="password"
              id="disable-password"
              placeholder="Enter your current password"
              className={`w-full px-4 py-3 border rounded-lg ${
                disableForm.formState.errors.currentPassword
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-my-primary focus:ring-my-primary'
              } focus:outline-none focus:ring-2`}
              autoComplete="current-password"
              autoFocus
            />
            {disableForm.formState.errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{disableForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                Warning: Disabling 2FA will remove this security layer from your account.
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowDisable(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!disableForm.formState.isValid || isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Disabling...
                </div>
              ) : (
                'Disable 2FA'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (showBackupCodes) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-my-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-my-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">New Backup Codes</h2>
          <p className="text-gray-600">Save these codes in a secure location</p>
        </div>

        <div className="bg-my-primary/10 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {backupCodes.map((code, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-2 rounded border text-sm font-mono"
              >
                <span>{code}</span>
                <button
                  onClick={() => copyBackupCode(code)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={downloadBackupCodes}
            className="w-full flex items-center justify-center space-x-2 bg-my-primary text-white px-4 py-2 rounded-lg hover:bg-my-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup Codes</span>
          </button>
        </div>

        <div className="bg-my-primary/10 border border-my-primary/20 rounded-lg p-3 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-my-primary" />
            <span className="text-sm text-my-primary/80">
              Important: These codes will replace your previous backup codes. Save them securely!
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowBackupCodes(false)}
                      className="w-full px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/90 transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  // Password prompt modal
  const PasswordPrompt = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-3">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Your Password</h3>
          <button onClick={() => setShowPasswordPrompt(false)} className="p-2 hover:bg-gray-100 rounded-md">
            <XCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600">Enter your current password to generate new backup codes.</p>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent"
              placeholder="Current password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowPasswordPrompt(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={confirmGenerateBackupCodes} disabled={isLoading} className="flex-1 px-4 py-2 bg-my-primary text-white rounded-lg disabled:opacity-50">
              {isLoading ? 'Generating…' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {showPasswordPrompt && <PasswordPrompt />}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-my-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-my-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
        <p className="text-gray-600">Manage your account security settings</p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
          <button
            onClick={fetchStatus}
            className="text-my-primary hover:text-my-primary/80 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              status.enabled ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {status.enabled ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">2FA Enabled</p>
              <p className="text-sm text-gray-500">
                {status.enabled ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              status.verified ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {status.verified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">Verified</p>
              <p className="text-sm text-gray-500">
                {status.verified ? 'Complete' : 'Pending'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              status.hasSecret ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {status.hasSecret ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">Secret Key</p>
              <p className="text-sm text-gray-500">
                {status.hasSecret ? 'Generated' : 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              status.hasBackupCodes ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {status.hasBackupCodes ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">Backup Codes</p>
              <p className="text-sm text-gray-500">
                {status.hasBackupCodes ? 'Available' : 'Not generated'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {!status.enabled ? (
          <button
            onClick={() => setShowSetup(true)}
            className="w-full flex items-center justify-center space-x-2 bg-my-primary text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Smartphone className="w-5 h-5" />
            <span>Enable Two-Factor Authentication</span>
          </button>
        ) : (
          <>
            <button
              onClick={handleGenerateBackupCodes}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-my-primary text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <Key className="w-5 h-5" />
              <span>Generate New Backup Codes</span>
            </button>

            <button
              onClick={() => setShowDisable(true)}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-5 h-5" />
              <span>Disable Two-Factor Authentication</span>
            </button>
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
        </p>
      </div>
    </div>
  );
};
