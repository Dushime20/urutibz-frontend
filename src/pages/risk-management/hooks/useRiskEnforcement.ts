import { useState, useCallback } from 'react';
import { riskManagementService } from '../../../services/riskManagementService';
import { RiskEnforcementRequest, RiskEnforcementResponse } from '../../../types/riskManagement';

interface UseRiskEnforcementReturn {
  loading: boolean;
  error: string | null;
  result: RiskEnforcementResponse | null;
  triggerEnforcement: (data: RiskEnforcementRequest) => Promise<void>;
  reset: () => void;
}

export const useRiskEnforcement = (): UseRiskEnforcementReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskEnforcementResponse | null>(null);

  const triggerEnforcement = useCallback(async (data: RiskEnforcementRequest) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await riskManagementService.triggerRiskEnforcement(data);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to trigger risk enforcement');
      throw err; // Re-throw to allow component to handle
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    loading,
    error,
    result,
    triggerEnforcement,
    reset
  };
};
