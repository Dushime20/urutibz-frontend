import { useState, useEffect, useCallback } from 'react';
import PricingService, {
  ProductPrice,
  CreateProductPriceRequest,
  UpdateProductPriceRequest,
  PriceFilters,
  PaginatedResponse,
} from '../service/pricingService';

interface UsePricingReturn {
  // Data
  prices: ProductPrice[];
  pagination: PaginatedResponse<ProductPrice>['pagination'] | null;
  selectedPrice: ProductPrice | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchPrices: (filters?: PriceFilters) => Promise<void>;
  createPrice: (data: CreateProductPriceRequest) => Promise<ProductPrice>;
  updatePrice: (data: UpdateProductPriceRequest) => Promise<ProductPrice>;
  deletePrice: (id: string) => Promise<void>;
  selectPrice: (price: ProductPrice | null) => void;
  clearError: () => void;
  
  // Utility
  refreshPrices: () => Promise<void>;
}

export const usePricing = (initialFilters?: PriceFilters): UsePricingReturn => {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<ProductPrice>['pagination'] | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<ProductPrice | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<PriceFilters>(initialFilters || {});

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchPrices = useCallback(async (filters?: PriceFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const newFilters = filters || currentFilters;
      setCurrentFilters(newFilters);
      
      const response = await PricingService.getProductPrices(newFilters, token || undefined);
      
      setPrices(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prices');
      console.error('Error fetching prices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters]);

  const createPrice = useCallback(async (data: CreateProductPriceRequest): Promise<ProductPrice> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const newPrice = await PricingService.createProductPrice(data, token || undefined);
      
      // Add the new price to the current list
      setPrices(prev => [newPrice, ...prev]);
      
      return newPrice;
    } catch (err: any) {
      setError(err.message || 'Failed to create price');
      console.error('Error creating price:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updatePrice = useCallback(async (data: UpdateProductPriceRequest): Promise<ProductPrice> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const updatedPrice = await PricingService.updateProductPrice(data, token || undefined);
      
      // Update the price in the current list
      setPrices(prev => prev.map(price => 
        price.id === data.id ? updatedPrice : price
      ));
      
      // Update selected price if it's the one being updated
      if (selectedPrice?.id === data.id) {
        setSelectedPrice(updatedPrice);
      }
      
      return updatedPrice;
    } catch (err: any) {
      setError(err.message || 'Failed to update price');
      console.error('Error updating price:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedPrice]);

  const deletePrice = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      await PricingService.deleteProductPrice(id, token || undefined);
      
      // Remove the price from the current list
      setPrices(prev => prev.filter(price => price.id !== id));
      
      // Clear selected price if it's the one being deleted
      if (selectedPrice?.id === id) {
        setSelectedPrice(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete price');
      console.error('Error deleting price:', err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [selectedPrice]);

  const selectPrice = useCallback((price: ProductPrice | null) => {
    setSelectedPrice(price);
  }, []);

  const refreshPrices = useCallback(async () => {
    await fetchPrices();
  }, [fetchPrices]);

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, []);

  return {
    // Data
    prices,
    pagination,
    selectedPrice,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error states
    error,
    
    // Actions
    fetchPrices,
    createPrice,
    updatePrice,
    deletePrice,
    selectPrice,
    clearError,
    
    // Utility
    refreshPrices,
  };
}; 