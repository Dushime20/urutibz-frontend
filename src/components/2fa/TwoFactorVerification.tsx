import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Smartphone, Key, AlertCircle, RefreshCw } from 'lucide-react';
import { twoFactorVerificationSchema, type TwoFactorVerificationFormData } from '../../validations/2faSchemas';
import { twoFactorBackupSchema, type TwoFactorBackupFormData } from '../../validations/2faSchemas';
import { twoFactorService } from '../../services/2faService';
import { useToast } from '../../contexts/ToastContext';

interface TwoFactorVerificationProps {
  onVerificationSuccess: (token?: string) => void;
  onCancel: () => void;
  onBackToLogin: () => void;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onVerificationSuccess,
  onCancel,
  onBackToLogin,
}) => {
  const [mode, setMode] = useState<'totp' | 'backup'>('totp');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasVerified, setHasVerified] = useState<boolean>(false);
  const { showToast } = useToast();

  const totpForm = useForm<TwoFactorVerificationFormData>({
    resolver: zodResolver(twoFactorVerificationSchema),
    mode: 'onChange',
  });

  const backupForm = useForm<TwoFactorBackupFormData>({
    resolver: zodResolver(twoFactorBackupSchema),
    mode: 'onChange',
  });

  const watchedTOTPCode = totpForm.watch('code');
  const watchedBackupCode = backupForm.watch('backupCode');

  // Auto-submit when 6 digits are entered for TOTP
  React.useEffect(() => {
    if (hasVerified || isLoading) return;
    if (watchedTOTPCode && watchedTOTPCode.length === 6) {
      totpForm.handleSubmit(onVerifyTOTP)();
    }
  }, [watchedTOTPCode, hasVerified, isLoading]);

  // Auto-submit when backup code is entered
  React.useEffect(() => {
    if (hasVerified || isLoading) return;
    if (watchedBackupCode && watchedBackupCode.length >= 6) {
      backupForm.handleSubmit(onVerifyBackup)();
    }
  }, [watchedBackupCode, hasVerified, isLoading]);

  const onVerifyTOTP = async (data: TwoFactorVerificationFormData) => {
    if (isLoading || hasVerified) return;
    setIsLoading(true);
    setError('');

    try {
      const userId = (JSON.parse(localStorage.getItem('user') || '{}')?.id) || undefined;
      if (!userId) {
        setError('Missing user context. Please login again.');
        setIsLoading(false);
        return;
      }
      const response = await twoFactorService.verifyToken(userId, data.code);
      if (response.success) {
        showToast('Two-factor authentication verified successfully!', 'success');
        setHasVerified(true);
        onVerificationSuccess(response.data?.token);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
      console.error('2FA TOTP verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyBackup = async (data: TwoFactorBackupFormData) => {
    if (isLoading || hasVerified) return;
    setIsLoading(true);
    setError('');

    try {
      const userId = (JSON.parse(localStorage.getItem('user') || '{}')?.id) || undefined;
      if (!userId) {
        setError('Missing user context. Please login again.');
        setIsLoading(false);
        return;
      }
      const response = await twoFactorService.verifyBackup(userId, data.backupCode);
      if (response.success) {
        showToast('Backup code verified successfully!', 'success');
        setHasVerified(true);
        onVerificationSuccess(response.data?.token);
      } else {
        setError('Invalid backup code. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify backup code. Please try again.');
      console.error('2FA backup verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setMode(mode === 'totp' ? 'backup' : 'totp');
    setError('');
    totpForm.reset();
    backupForm.reset();
  };

  const handleResendCode = () => {
    // This would typically trigger a new code generation
    showToast('New verification code sent', 'success');
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-my-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-my-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
        <p className="text-gray-600">Enter your verification code to continue</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setMode('totp')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            mode === 'totp'
              ? 'bg-white text-my-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-sm font-medium">Authenticator App</span>
        </button>
        <button
          onClick={() => setMode('backup')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            mode === 'backup'
              ? 'bg-white text-my-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span className="text-sm font-medium">Backup Code</span>
        </button>
      </div>

      {/* TOTP Verification Form */}
      {mode === 'totp' && (
        <form onSubmit={totpForm.handleSubmit(onVerifyTOTP)} className="space-y-6">
          <div>
            <label htmlFor="totp-code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              {...totpForm.register('code')}
              type="text"
              id="totp-code"
              maxLength={6}
              placeholder="000000"
              className={`w-full px-4 py-3 border rounded-lg text-center text-lg font-mono tracking-widest placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${
                totpForm.formState.errors.code
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-my-primary focus:ring-my-primary'
              } focus:outline-none focus:ring-2`}
              autoComplete="one-time-code"
              autoFocus
            />
            {totpForm.formState.errors.code && (
              <p className="mt-1 text-sm text-red-600">{totpForm.formState.errors.code.message}</p>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm text-my-primary hover:text-my-primary/80 font-medium flex items-center justify-center mx-auto space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Resend Code</span>
            </button>
          </div>
        </form>
      )}

      {/* Backup Code Verification Form */}
      {mode === 'backup' && (
        <form onSubmit={backupForm.handleSubmit(onVerifyBackup)} className="space-y-6">
          <div>
            <label htmlFor="backup-code" className="block text-sm font-medium text-gray-700 mb-2">
              Backup Code
            </label>
            <input
              {...backupForm.register('backupCode')}
              type="text"
              id="backup-code"
              placeholder="ABC123"
              className={`w-full px-4 py-3 border rounded-lg text-center text-lg font-mono tracking-wider placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${
                backupForm.formState.errors.backupCode
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-my-primary focus:ring-my-primary'
              } focus:outline-none focus:ring-2`}
              autoComplete="off"
              autoFocus
            />
            {backupForm.formState.errors.backupCode && (
              <p className="mt-1 text-sm text-red-600">{backupForm.formState.errors.backupCode.message}</p>
            )}
            <p className="mt-2 text-xs text-gray-500 text-center">
              Enter one of your backup codes (usually 6-8 characters)
            </p>
          </div>
        </form>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-6">
        <button
          onClick={onBackToLogin}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Login
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Having trouble?{' '}
          <button
            onClick={handleModeSwitch}
                          className="text-my-primary hover:text-my-primary/80 font-medium"
          >
            Try {mode === 'totp' ? 'backup code' : 'authenticator app'}
          </button>
        </p>
      </div>
    </div>
  );
};
