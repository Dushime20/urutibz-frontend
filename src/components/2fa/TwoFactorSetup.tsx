import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Download, Copy, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { twoFactorSetupSchema, type TwoFactorSetupFormData } from '../../validations/2faSchemas';
import { twoFactorService } from '../../services/2faService';
import { useToast } from '../../contexts/ToastContext';

interface TwoFactorSetupProps {
  onSetupComplete: () => void;
  onCancel: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  onSetupComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<'setup' | 'verification'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [secret, setSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<TwoFactorSetupFormData>({
    resolver: zodResolver(twoFactorSetupSchema),
    mode: 'onChange',
  });

  const watchedCode = watch('code');

  // Auto-advance to next input when 6 digits are entered
  useEffect(() => {
    if (watchedCode && watchedCode.length === 6) {
      // Auto-submit when 6 digits are entered
      handleSubmit(onVerifyCode)();
    }
  }, [watchedCode]);

  // Initialize 2FA setup
  useEffect(() => {
    initializeSetup();
  }, []);

  const initializeSetup = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await twoFactorService.setup();
      if (response.success) {
        setQrCode(response.data.qrCode);
        setBackupCodes(response.data.backupCodes);
        setSecret(response.data.secret);
        // Don't auto-advance to verification - let user click "Continue to Verification"
        setStep('setup');
      } else {
        setError('Failed to initialize 2FA setup');
      }
    } catch (err) {
      setError('Failed to initialize 2FA setup. Please try again.');
      console.error('2FA setup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyCode = async (data: TwoFactorSetupFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await twoFactorService.verify(data.code);
      if (response.success) {
        showToast('Two-factor authentication enabled successfully!', 'success');
        onSetupComplete();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
      console.error('2FA verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      showToast('Backup code copied to clipboard', 'success');
      setTimeout(() => setCopiedIndex(null), 2000);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-my-primary"></div>
        <span className="ml-3 text-gray-600">Initializing 2FA setup...</span>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-my-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-my-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Two-Factor Authentication</h2>
          <p className="text-gray-600">Secure your account with an extra layer of protection</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Smartphone className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Step 1: Scan QR Code</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Use your authenticator app (Google Authenticator, Authy, etc.) to scan this QR code:
          </p>
          
          {qrCode && (
            <div className="text-center">
              <img
                src={qrCode}
                alt="2FA QR Code"
                className="mx-auto border border-gray-200 rounded-lg"
                style={{ width: '200px', height: '200px' }}
              />
            </div>
          )}
        </div>

        <div className="bg-my-primary/10 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-my-primary" />
            <span className="font-medium text-my-primary">Step 2: Save Backup Codes</span>
          </div>
          <p className="text-sm text-my-primary/80 mb-4">
            Save these backup codes in a secure location. You can use them to access your account if you lose your 2FA device.
          </p>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {backupCodes.map((code, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-2 rounded border text-sm font-mono"
              >
                <span>{code}</span>
                <button
                  onClick={() => copyBackupCode(code, index)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedIndex === index ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
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

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setStep('verification')}
            className="flex-1 px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/90 transition-colors"
          >
            Continue to Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-my-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-my-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Setup</h2>
        <p className="text-gray-600">Enter the 6-digit code from your authenticator app</p>
      </div>

      <form onSubmit={handleSubmit(onVerifyCode)} className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            {...register('code')}
            type="text"
            id="code"
            maxLength={6}
            placeholder="000000"
            className={`w-full px-4 py-3 border rounded-lg text-center text-lg font-mono tracking-widest ${
              errors.code
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                 : 'border-gray-300 focus:border-my-primary focus:ring-my-primary'
            } focus:outline-none focus:ring-2`}
            autoComplete="one-time-code"
            autoFocus
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setStep('setup')}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!isValid || isLoading}
                         className="flex-1 px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify & Enable'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
