import { useState, useEffect, useCallback } from 'react';
import { riskManagementService } from '../../../services/riskManagementService';
import { RiskManagementTrends } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';

interface UseRiskManagementTrendsReturn {
  trends: RiskManagementTrends | null;
  loading: boolean;
  error: string | null;
  refetch: (period?: string) => Promise<void>;
  lastUpdated: Date | null;
}

export const useRiskManagementTrends = (initialPeriod: string = '30d'): UseRiskManagementTrendsReturn => {
  const { showToast } = useToast();
  const [trends, setTrends] = useState<RiskManagementTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState(initialPeriod);

  const fetchTrends = useCallback(async (period: string = currentPeriod) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📈 Fetching risk management trends for period:', period);
      const response = await riskManagementService.getRiskManagementTrends(period);
      
      setTrends(response.data);
      setCurrentPeriod(period);
      setLastUpdated(new Date());
      
      console.log('✅ Risk management trends loaded successfully:', response.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch risk management trends';
      setError(errorMessage);
      console.error('❌ Error fetching risk management trends:', err);
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPeriod, showToast]);

  const refetch = useCallback(async (period?: string) => {
    await fetchTrends(period || currentPeriod);
  }, [fetchTrends, currentPeriod]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return {
    trends,
    loading,
    error,
    refetch,
    lastUpdated
  };
};
