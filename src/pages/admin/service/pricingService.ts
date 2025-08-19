import axios from 'axios';
import type {
  ProductPrice,
  CreateProductPriceRequest,
  UpdateProductPriceRequest,
  PriceFilters,
  PriceCalculationRequest,
  PriceCalculationResponse,
  PriceComparisonResponse,
  PricingStats,
  PaginatedResponse,
  RentalPriceCalculationRequest,
  RentalPriceCalculationResponse,
} from '../types/pricing';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

// API Service Functions
export class PricingService {
  private static getHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Create a new product price
   */
  static async createProductPrice(
    data: CreateProductPriceRequest,
    token?: string
  ): Promise<ProductPrice> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/product-prices`,
        data,
        { headers: this.getHeaders(token) }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to create product price';
      console.error('Error creating product price:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Get all product prices with optional filters
   */
  static async getProductPrices(
    filters: PriceFilters = {},
    token?: string
  ): Promise<PaginatedResponse<ProductPrice>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/product-prices?${params.toString()}`,
        { headers: this.getHeaders(token) }
      );
      return response.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch product prices';
      console.error('Error fetching product prices:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Get a single product price by ID
   */
  static async getProductPriceById(id: string, token?: string): Promise<ProductPrice> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/product-prices/${id}`,
        { headers: this.getHeaders(token) }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch product price';
      console.error('Error fetching product price:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Update a product price
   */
  static async updateProductPrice(
    data: UpdateProductPriceRequest,
    token?: string
  ): Promise<ProductPrice> {
    try {
      const { id, ...updateData } = data;
      const response = await axios.put(
        `${API_BASE_URL}/product-prices/${id}`,
        updateData,
        { headers: this.getHeaders(token) }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update product price';
      console.error('Error updating product price:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Delete a product price
   */
  static async deleteProductPrice(id: string, token?: string): Promise<void> {
    try {
      await axios.delete(
        `${API_BASE_URL}/product-prices/${id}`,
        { headers: this.getHeaders(token) }
      );
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to delete product price';
      console.error('Error deleting product price:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Calculate rental price
   */
  static async calculatePrice(
    data: PriceCalculationRequest,
    token?: string
  ): Promise<PriceCalculationResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/product-prices/calculate`,
        data,
        { headers: this.getHeaders(token) }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to calculate price';
      console.error('Error calculating price:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Compare prices across countries for a product
   */
  static async comparePrices(
    productId: string,
    query?: { rental_duration_hours?: number; quantity?: number },
    token?: string
  ): Promise<PriceComparisonResponse> {
    try {
      const params = new URLSearchParams();
      if (query?.rental_duration_hours != null) params.append('rental_duration_hours', String(query.rental_duration_hours));
      if (query?.quantity != null) params.append('quantity', String(query.quantity));
      const qs = params.toString();
      const url = `${API_BASE_URL}/product-prices/product/${productId}/compare${qs ? `?${qs}` : ''}`;
      const response = await axios.get(url, { headers: this.getHeaders(token) });
      return response.data.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to compare prices';
      console.error('Error comparing prices:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Get pricing statistics
   */
  static async getPricingStats(token?: string): Promise<PricingStats> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/product-prices/stats`,
        { headers: this.getHeaders(token) }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch pricing stats';
      console.error('Error fetching pricing stats:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Bulk update product prices
   */
  static async bulkUpdatePrices(
    updates: { id: string; data: Partial<CreateProductPriceRequest> }[],
    token?: string
  ): Promise<ProductPrice[]> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/product-prices/bulk`,
        { updates },
        { headers: this.getHeaders(token) }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to bulk update prices';
      console.error('Error bulk updating prices:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Get price history for a product
   */
  static async getPriceHistory(
    productId: string,
    countryId?: string,
    token?: string
  ): Promise<ProductPrice[]> {
    try {
      const params = new URLSearchParams();
      if (countryId) {
        params.append('country_id', countryId);
      }

      const response = await axios.get(
        `${API_BASE_URL}/product-prices/product/${productId}/history?${params.toString()}`,
        { headers: this.getHeaders(token) }
      );
      return response.data.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch price history';
      console.error('Error fetching price history:', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Get all prices for a specific product
   */
  static async getProductPricesByProductId(
    productId: string,
    options?: { page?: number; limit?: number },
    token?: string
  ): Promise<{ data: ProductPrice[]; pagination: any }> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', String(options.page));
    if (options?.limit) params.append('limit', String(options.limit));
    const qs = params.toString();
    const url = `${API_BASE_URL}/product-prices/product/${productId}${qs ? `?${qs}` : ''}`;
    const response = await axios.get(url, { headers: this.getHeaders(token) });
    return {
      data: Array.isArray(response.data?.data) ? response.data.data : [],
      pagination: response.data?.pagination ?? null,
    };
  }

  /**
   * Validate price data
   */
  static validatePriceData(data: CreateProductPriceRequest): string[] {
    const errors: string[] = [];

    if (!data.product_id) errors.push('Product ID is required');
    if (!data.country_id) errors.push('Country ID is required');
    if (!data.currency) errors.push('Currency is required');
    
    if (data.price_per_hour < 0) errors.push('Hourly price cannot be negative');
    if (data.price_per_day < 0) errors.push('Daily price cannot be negative');
    if (data.price_per_week < 0) errors.push('Weekly price cannot be negative');
    if (data.price_per_month < 0) errors.push('Monthly price cannot be negative');
    if (data.security_deposit < 0) errors.push('Security deposit cannot be negative');

    if (data.market_adjustment_factor <= 0) errors.push('Market adjustment factor must be positive');
    if (data.weekly_discount_percentage < 0 || data.weekly_discount_percentage > 1) {
      errors.push('Weekly discount percentage must be between 0 and 1');
    }
    if (data.monthly_discount_percentage < 0 || data.monthly_discount_percentage > 1) {
      errors.push('Monthly discount percentage must be between 0 and 1');
    }
    if (data.bulk_discount_percentage < 0 || data.bulk_discount_percentage > 1) {
      errors.push('Bulk discount percentage must be between 0 and 1');
    }

    if (data.peak_season_multiplier <= 0) errors.push('Peak season multiplier must be positive');
    if (data.off_season_multiplier <= 0) errors.push('Off season multiplier must be positive');

    return errors;
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }

  /**
   * Calculate duration in days between two dates
   */
  static calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate duration in hours between two dates
   */
  static calculateDurationHours(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * Calculate rental price using the calculation API
   */
  static async calculateRentalPrice(
    data: RentalPriceCalculationRequest,
    token?: string
  ): Promise<{ data: RentalPriceCalculationResponse | null; error: string | null }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/product-prices/calculate`,
        data,
        { headers: this.getHeaders(token) }
      );
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to calculate rental price';
      console.error('Error calculating rental price:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }
}

export default PricingService; 