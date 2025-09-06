// Custom hook for handover & return statistics
// Following the same patterns as useRiskManagementStats.ts

import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import handoverReturnService from '../services/handoverReturnService';
import { 
  HandoverReturnStats,
  UseHandoverStatsReturn
} from '../types/handoverReturn';

export const useHandoverStats = (): UseHandoverStatsReturn => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<HandoverReturnStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await handoverReturnService.getHandoverReturnStats();
      setStats(response.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch handover & return statistics';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};
