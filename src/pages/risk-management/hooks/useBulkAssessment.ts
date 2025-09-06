import { useState, useCallback } from 'react';
import { riskManagementService } from '../../../services/riskManagementService';
import { BulkRiskAssessmentRequest, BulkRiskAssessmentResponse } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';

interface UseBulkAssessmentReturn {
  results: BulkRiskAssessmentResponse['data'] | null;
  loading: boolean;
  error: string | null;
  assessBulk: (data: BulkRiskAssessmentRequest) => Promise<void>;
  clearResults: () => void;
}

export const useBulkAssessment = (): UseBulkAssessmentReturn => {
  const { showToast } = useToast();
  const [results, setResults] = useState<BulkRiskAssessmentResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessBulk = useCallback(async (data: BulkRiskAssessmentRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Performing bulk risk assessment...');
      const response = await riskManagementService.bulkAssessRisk(data);
      
      setResults(response.data);
      
      const successCount = response.data.successful;
      const totalCount = response.data.totalAssessments;
      
      console.log('✅ Bulk risk assessment completed successfully');
      showToast(`Bulk assessment completed: ${successCount}/${totalCount} successful`, 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to perform bulk risk assessment';
      setError(errorMessage);
      console.error('❌ Bulk risk assessment failed:', err);
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    assessBulk,
    clearResults
  };
};
