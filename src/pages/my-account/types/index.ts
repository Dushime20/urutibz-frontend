export interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: boolean;
  color: string;
  bgColor: string;
}

export type FormState = {
  title: string;
  slug: string;
  description: string;
  category_id: string;
  condition: string;
  brand?: string;
  model?: string;
  year_manufactured?: string;
  address_line?: string;
  delivery_fee?: string;
  price_per_hour: string;
  price_per_day: string;
  price_per_week: string;
  price_per_month: string;
  security_deposit: string;
  currency: string;
  market_adjustment_factor: string;
  weekly_discount_percentage: string;
  monthly_discount_percentage: string;
  bulk_discount_threshold: string;
  bulk_discount_percentage: string;
  dynamic_pricing_enabled: boolean;
  peak_season_multiplier: string;
  off_season_multiplier: string;
  pickup_methods: string[];
  country_id: string;
  specifications: { [key: string]: string };
  features?: string[];
  included_accessories?: string[];
  images: File[];
  alt_text: string;
  sort_order: string;
  isPrimary: string;
  product_id: string;
  location: { latitude: string; longitude: string };
};


