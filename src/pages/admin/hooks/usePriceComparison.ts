import { useState, useCallback } from 'react';
import PricingService, {
  PriceComparisonResponse,
} from '../service/pricingService';

interface UsePriceComparisonReturn {
  // Data
  comparison: PriceComparisonResponse | null;
  
  // Loading states
  isLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  comparePrices: (productId: string) => Promise<void>;
  clearComparison: () => void;
  clearError: () => void;
  
  // Utility
  formatPrice: (price: number, currency: string) => string;
  getLowestPrice: () => { country_id: string; price_per_day: number; currency: string } | null;
  getHighestPrice: () => { country_id: string; price_per_day: number; currency: string } | null;
  getAveragePrice: () => number;
}

export const usePriceComparison = (): UsePriceComparisonReturn => {
  const [comparison, setComparison] = useState<PriceComparisonResponse | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const comparePrices = useCallback(async (productId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      const token = localStorage.getItem('token');
      const result = await PricingService.comparePrices(productId, token || undefined);
      setComparison(result);
    } catch (err: any) {
      setError(err.message || 'Failed to compare prices');
      console.error('Error comparing prices:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearComparison = useCallback(() => {
    setComparison(null);
    setError(null);
  }, []);

  const formatPrice = useCallback((price: number, currency: string): string => {
    return PricingService.formatPrice(price, currency);
  }, []);

  const getLowestPrice = useCallback(() => {
    if (!comparison?.comparisons || comparison.comparisons.length === 0) {
      return null;
    }
    
    const lowest = comparison.comparisons.reduce((min, current) => 
      current.price_per_day < min.price_per_day ? current : min
    );
    
    return {
      country_id: lowest.country_id,
      price_per_day: lowest.price_per_day,
      currency: lowest.currency,
    };
  }, [comparison]);

  const getHighestPrice = useCallback(() => {
    if (!comparison?.comparisons || comparison.comparisons.length === 0) {
      return null;
    }
    
    const highest = comparison.comparisons.reduce((max, current) => 
      current.price_per_day > max.price_per_day ? current : max
    );
    
    return {
      country_id: highest.country_id,
      price_per_day: highest.price_per_day,
      currency: highest.currency,
    };
  }, [comparison]);

  const getAveragePrice = useCallback(() => {
    if (!comparison?.comparisons || comparison.comparisons.length === 0) {
      return 0;
    }
    
    const total = comparison.comparisons.reduce((sum, current) => 
      sum + current.price_per_day, 0
    );
    
    return total / comparison.comparisons.length;
  }, [comparison]);

  return {
    // Data
    comparison,
    
    // Loading states
    isLoading,
    
    // Error states
    error,
    
    // Actions
    comparePrices,
    clearComparison,
    clearError,
    
    // Utility
    formatPrice,
    getLowestPrice,
    getHighestPrice,
    getAveragePrice,
  };
}; 