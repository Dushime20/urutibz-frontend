import { useState, useEffect, useCallback } from 'react';
import { riskManagementService } from '../../../services/riskManagementService';
import { RiskManagementStats } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';

interface UseRiskManagementStatsReturn {
  stats: RiskManagementStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useRiskManagementStats = (): UseRiskManagementStatsReturn => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<RiskManagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Fetching risk management statistics...');
      const response = await riskManagementService.getRiskManagementStats();
      
      setStats(response.data);
      setLastUpdated(new Date());
      
      console.log('✅ Risk management statistics loaded successfully:', response.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch risk management statistics';
      setError(errorMessage);
      console.error('❌ Error fetching risk management statistics:', err);
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch,
    lastUpdated
  };
};
