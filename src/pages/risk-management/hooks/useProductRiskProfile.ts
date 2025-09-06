import { useState, useCallback } from 'react';
import { riskManagementService } from '../../../services/riskManagementService';
import { ProductRiskProfileResponse } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';

interface UseProductRiskProfileReturn {
  profile: ProductRiskProfileResponse['data'] | null;
  loading: boolean;
  error: string | null;
  getProfile: (productId: string) => Promise<void>;
  clearProfile: () => void;
}

export const useProductRiskProfile = (): UseProductRiskProfileReturn => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProductRiskProfileResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Getting risk profile for product:', productId);
      const response = await riskManagementService.getProductRiskProfile(productId);
      
      setProfile(response.data);
      
      console.log('✅ Product risk profile retrieved successfully');
      showToast('Product risk profile loaded successfully', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get product risk profile';
      setError(errorMessage);
      console.error('❌ Failed to get product risk profile:', err);
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  return {
    profile,
    loading,
    error,
    getProfile,
    clearProfile
  };
};
