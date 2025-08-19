// Pricing Types and Interfaces
export interface ProductPrice {
  id?: string;
  product_id: string;
  country_id: string;
  currency: string;
  price_per_hour: number;
  price_per_day: number;
  price_per_week: number;
  price_per_month: number;
  security_deposit: number;
  market_adjustment_factor: number;
  weekly_discount_percentage: number;
  monthly_discount_percentage: number;
  bulk_discount_threshold: number;
  bulk_discount_percentage: number;
  dynamic_pricing_enabled: boolean;
  peak_season_multiplier: number;
  off_season_multiplier: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductPriceRequest {
  product_id: string;
  country_id: string;
  currency: string;
  price_per_hour: number;
  price_per_day: number;
  price_per_week: number;
  price_per_month: number;
  security_deposit: number;
  market_adjustment_factor: number;
  weekly_discount_percentage: number;
  monthly_discount_percentage: number;
  bulk_discount_threshold: number;
  bulk_discount_percentage: number;
  dynamic_pricing_enabled: boolean;
  peak_season_multiplier: number;
  off_season_multiplier: number;
  is_active: boolean;
}

export interface UpdateProductPriceRequest extends Partial<CreateProductPriceRequest> {
  id: string;
}

export interface PriceFilters {
  product_id?: string;
  country_id?: string;
  currency?: string;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PriceCalculationRequest {
  product_id: string;
  country_id: string;
  start_date: string;
  end_date: string;
  quantity?: number;
  include_deposit?: boolean;
  apply_discounts?: boolean;
}

export interface RentalPriceCalculationRequest {
  product_id: string;
  country_id: string;
  currency: string;
  rental_duration_hours: number;
  quantity?: number;
}

export interface PriceCalculationResponse {
  base_price: number;
  total_price: number;
  security_deposit: number;
  discounts_applied: number;
  final_price: number;
  breakdown: {
    hourly_rate: number;
    daily_rate: number;
    weekly_rate: number;
    monthly_rate: number;
    duration_discount: number;
    bulk_discount: number;
    seasonal_adjustment: number;
  };
  currency: string;
  duration_hours: number;
  duration_days: number;
}

export interface RentalPriceCalculationResponse {
  product_id: string;
  country_id: string;
  currency: string;
  rental_duration_hours: number;
  rental_duration_days: number;
  quantity: number;
  base_rate_type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  base_rate: string; // e.g., "50.00"
  base_amount: number; // e.g., 100
  market_adjustment_factor: string; // e.g., "1.00"
  seasonal_multiplier: number;
  peak_season_adjustment: number;
  weekly_discount: number;
  monthly_discount: number;
  bulk_discount: number;
  total_discount: number;
  subtotal: number;
  security_deposit: number;
  total_amount: number;
  calculation_date: string; // ISO timestamp
  exchange_rate_used: number | null;
  pricing_tier_used: string; // e.g., "daily"
  discounts_applied: string[];
  notes: string[];
}

export interface PriceComparisonResponse {
  product_id: string;
  comparison_date: string;
  base_duration_hours: number;
  quantity: number;
  country_prices: {
    country_id: string;
    country_name: string | null | '';
    currency: string;
    price_calculation: RentalPriceCalculationResponse;
    rank_by_total: number;
    rank_by_daily_rate: number;
  }[];
  cheapest_country: {
    country_id: string;
    total_amount: number;
    currency: string;
    savings_percentage: number;
  };
  most_expensive_country: {
    country_id: string;
    total_amount: number;
    currency: string;
    premium_percentage: number;
  };
  average_price: number;
  price_variance: number;
  currency_diversity: string[];
}

export interface PricingStats {
  total_prices: number;
  active_prices: number;
  average_daily_rate: number;
  average_weekly_rate: number;
  average_monthly_rate: number;
  top_currencies: { currency: string; count: number }[];
  price_distribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  recent_changes: {
    id: string;
    product_id: string;
    country_id: string;
    change_type: 'created' | 'updated' | 'deleted';
    timestamp: string;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
} 