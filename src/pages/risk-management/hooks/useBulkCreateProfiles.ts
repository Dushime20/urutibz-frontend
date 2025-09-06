import { useState, useCallback } from 'react';
import { riskManagementService } from '../../../services/riskManagementService';
import { CreateRiskProfileRequest, BulkCreateRiskProfileResponse } from '../../../types/riskManagement';

interface UseBulkCreateProfilesOptions {
  onSuccess?: (result: BulkCreateRiskProfileResponse) => void;
  onError?: (error: string) => void;
}

interface UseBulkCreateProfilesReturn {
  loading: boolean;
  error: string | null;
  result: BulkCreateRiskProfileResponse | null;
  createProfiles: (profiles: CreateRiskProfileRequest[]) => Promise<void>;
  reset: () => void;
}

export const useBulkCreateProfiles = (options: UseBulkCreateProfilesOptions = {}): UseBulkCreateProfilesReturn => {
  const { onSuccess, onError } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkCreateRiskProfileResponse | null>(null);

  const createProfiles = useCallback(async (profiles: CreateRiskProfileRequest[]) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await riskManagementService.createRiskProfilesBulk({ profiles });
      
      setResult(response);
      
      if (response.success) {
        onSuccess?.(response);
      } else {
        setError(response.message);
        onError?.(response.message);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create risk profiles';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    loading,
    error,
    result,
    createProfiles,
    reset
  };
};
