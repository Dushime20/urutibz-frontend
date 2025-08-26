import { useState, useEffect, useCallback } from 'react';
import { twoFactorService } from '../services/2faService';
import type { TwoFactorState } from '../types/2fa';

export const useTwoFactor = () => {
  const [status, setStatus] = useState<TwoFactorState>({
    enabled: false,
    verified: false,
    hasSecret: false,
    hasBackupCodes: false,
    isLoading: true,
    error: null,
  });

  const fetchStatus = useCallback(async () => {
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
        return newStatus;
      } else {
        const errorStatus: TwoFactorState = {
          ...status,
          isLoading: false,
          error: 'Failed to fetch 2FA status',
        };
        setStatus(errorStatus);
        return errorStatus;
      }
    } catch (err) {
      const errorStatus: TwoFactorState = {
        ...status,
        isLoading: false,
        error: 'Failed to fetch 2FA status',
      };
      setStatus(errorStatus);
      console.error('Error fetching 2FA status:', err);
      return errorStatus;
    }
  }, []);

  const refreshStatus = useCallback(() => {
    return fetchStatus();
  }, [fetchStatus]);

  const updateStatus = useCallback((updates: Partial<TwoFactorState>) => {
    setStatus(prev => ({ ...prev, ...updates }));
  }, []);

  const resetStatus = useCallback(() => {
    setStatus({
      enabled: false,
      verified: false,
      hasSecret: false,
      hasBackupCodes: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    fetchStatus,
    refreshStatus,
    updateStatus,
    resetStatus,
    isLoading: status.isLoading,
    isEnabled: status.enabled,
    isVerified: status.verified,
    hasSecret: status.hasSecret,
    hasBackupCodes: status.hasBackupCodes,
    error: status.error,
  };
};
