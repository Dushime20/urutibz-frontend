import { useState, useCallback } from 'react';
import axios from 'axios';
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

      let enriched = response.data as any;

      // Enrich with product name and category name if missing
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
      try {
        if (!enriched.productName && enriched.productId) {
          const prodRes = await axios.get(`${API_BASE_URL}/products/${enriched.productId}`);
          const prod = prodRes?.data?.data || prodRes?.data;
          const productName = prod?.name || prod?.title || prod?.productName;
          if (productName) enriched.productName = productName;
          // If product includes category_id string, prefer it for category fetch
          const candidateCategoryId = enriched.categoryId || prod?.category_id || prod?.categoryId;
          if (candidateCategoryId && !enriched.categoryId) enriched.categoryId = candidateCategoryId;
        }
      } catch {}

      try {
        const categoryId = enriched?.categoryId;
        if (categoryId && !enriched.categoryName) {
          const catRes = await axios.get(`${API_BASE_URL}/categories/${categoryId}`);
          const cat = catRes?.data?.data || catRes?.data;
          const categoryName = cat?.name || cat?.category_name || cat?.title;
          if (categoryName) enriched.categoryName = categoryName;
        }
      } catch {}

      setProfile(enriched);
      
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
