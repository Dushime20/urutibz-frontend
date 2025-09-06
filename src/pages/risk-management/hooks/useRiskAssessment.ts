import { useState, useCallback } from 'react';
import { riskManagementService } from '../../../services/riskManagementService';
import { RiskAssessmentRequest, RiskAssessmentResponse } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';

interface UseRiskAssessmentReturn {
  assessment: RiskAssessmentResponse['data'] | null;
  loading: boolean;
  error: string | null;
  assessRisk: (data: RiskAssessmentRequest) => Promise<void>;
  clearAssessment: () => void;
}

export const useRiskAssessment = (): UseRiskAssessmentReturn => {
  const { showToast } = useToast();
  const [assessment, setAssessment] = useState<RiskAssessmentResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessRisk = useCallback(async (data: RiskAssessmentRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Performing risk assessment...');
      const response = await riskManagementService.assessRisk(data);
      
      setAssessment(response.data);
      
      console.log('✅ Risk assessment completed successfully');
      showToast('Risk assessment completed successfully', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to perform risk assessment';
      setError(errorMessage);
      console.error('❌ Risk assessment failed:', err);
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const clearAssessment = useCallback(() => {
    setAssessment(null);
    setError(null);
  }, []);

  return {
    assessment,
    loading,
    error,
    assessRisk,
    clearAssessment
  };
};
