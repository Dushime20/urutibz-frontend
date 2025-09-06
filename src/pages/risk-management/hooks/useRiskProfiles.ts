import { useState, useEffect, useCallback } from 'react';
import { riskManagementService } from '../../../services/riskManagementService';
import { RiskProfile, RiskProfileFilters } from '../../../types/riskManagement';

interface UseRiskProfilesOptions {
  autoFetch?: boolean;
  initialFilters?: RiskProfileFilters;
  pageSize?: number;
}

interface UseRiskProfilesReturn {
  profiles: RiskProfile[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  fetchProfiles: (filters?: RiskProfileFilters, page?: number) => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: RiskProfileFilters) => void;
  setPage: (page: number) => void;
}

export const useRiskProfiles = (options: UseRiskProfilesOptions = {}): UseRiskProfilesReturn => {
  const {
    autoFetch = true,
    initialFilters = {},
    pageSize = 20
  } = options;

  const [profiles, setProfiles] = useState<RiskProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [filters, setFilters] = useState<RiskProfileFilters>(initialFilters);

  const fetchProfiles = useCallback(async (newFilters?: RiskProfileFilters, newPage?: number) => {
    setLoading(true);
    setError(null);

    try {
      const currentFilters = newFilters || filters;
      const currentPage = newPage || page;

      const response = await riskManagementService.getRiskProfiles(
        currentFilters,
        currentPage,
        pageSize
      );

      setProfiles(response.data);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setHasNext(response.hasNext);
      setHasPrev(response.hasPrev);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch risk profiles');
      setProfiles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  const refresh = useCallback(async () => {
    await fetchProfiles();
  }, [fetchProfiles]);

  const handleSetFilters = useCallback((newFilters: RiskProfileFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchProfiles();
    }
  }, [autoFetch, fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    total,
    page,
    totalPages,
    hasNext,
    hasPrev,
    fetchProfiles,
    refresh,
    setFilters: handleSetFilters,
    setPage: handleSetPage
  };
};
