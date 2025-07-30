import { useState, useCallback } from 'react';
import PricingService, {
  PriceCalculationRequest,
  PriceCalculationResponse,
} from '../service/pricingService';

interface UsePriceCalculationReturn {
  // Data
  calculation: PriceCalculationResponse | null;
  
  // Form state
  formData: PriceCalculationRequest;
  
  // Loading states
  isCalculating: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  calculatePrice: (data?: Partial<PriceCalculationRequest>) => Promise<void>;
  updateFormData: (data: Partial<PriceCalculationRequest>) => void;
  resetCalculation: () => void;
  clearError: () => void;
  
  // Utility
  formatPrice: (price: number, currency: string) => string;
  calculateDuration: (startDate: string, endDate: string) => number;
  calculateDurationHours: (startDate: string, endDate: string) => number;
}

const defaultFormData: PriceCalculationRequest = {
  product_id: '',
  country_id: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  quantity: 1,
  include_deposit: true,
  apply_discounts: true,
};

export const usePriceCalculation = (): UsePriceCalculationReturn => {
  const [calculation, setCalculation] = useState<PriceCalculationResponse | null>(null);
  const [formData, setFormData] = useState<PriceCalculationRequest>(defaultFormData);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateFormData = useCallback((data: Partial<PriceCalculationRequest>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const calculatePrice = useCallback(async (data?: Partial<PriceCalculationRequest>) => {
    try {
      setIsCalculating(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const requestData = data ? { ...formData, ...data } : formData;
      
      // Validate required fields
      if (!requestData.product_id) {
        throw new Error('Product ID is required');
      }
      if (!requestData.country_id) {
        throw new Error('Country ID is required');
      }
      if (!requestData.start_date || !requestData.end_date) {
        throw new Error('Start and end dates are required');
      }
      
      // Validate dates
      const startDate = new Date(requestData.start_date);
      const endDate = new Date(requestData.end_date);
      
      if (startDate >= endDate) {
        throw new Error('End date must be after start date');
      }
      
      const result = await PricingService.calculatePrice(requestData, token || undefined);
      setCalculation(result);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate price');
      console.error('Error calculating price:', err);
    } finally {
      setIsCalculating(false);
    }
  }, [formData]);

  const resetCalculation = useCallback(() => {
    setCalculation(null);
    setError(null);
  }, []);

  const formatPrice = useCallback((price: number, currency: string): string => {
    return PricingService.formatPrice(price, currency);
  }, []);

  const calculateDuration = useCallback((startDate: string, endDate: string): number => {
    return PricingService.calculateDuration(startDate, endDate);
  }, []);

  const calculateDurationHours = useCallback((startDate: string, endDate: string): number => {
    return PricingService.calculateDurationHours(startDate, endDate);
  }, []);

  return {
    // Data
    calculation,
    
    // Form state
    formData,
    
    // Loading states
    isCalculating,
    
    // Error states
    error,
    
    // Actions
    calculatePrice,
    updateFormData,
    resetCalculation,
    clearError,
    
    // Utility
    formatPrice,
    calculateDuration,
    calculateDurationHours,
  };
}; 