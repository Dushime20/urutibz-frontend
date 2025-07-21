// Category interfaces
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  imageUrl: string | null;
  iconName: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  description: string;
  isActive: boolean;
  slug: string;
}

// Payment Transaction interfaces
export interface PaymentTransaction {
  id: string;
  booking_id?: string;
  user_id: string;
  payment_method_id?: string;
  transaction_type: string;
  amount: number;
  currency: string;
  provider: string;
  provider_transaction_id?: string;
  provider_fee: number;
  status: string;
  processed_at?: string;
  created_at: string;
  created_by: string;
  metadata?: Record<string, any>;
  original_currency?: string;
  original_amount?: number;
  exchange_rate?: number;
  exchange_rate_date?: string;
  expires_at?: string;
}

export interface PaymentTransactionResponse {
  success: boolean;
  data: PaymentTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Admin Stats and related interfaces
export interface AdminStats {
  totalUsers: number;
  totalItems: number;
  activeBookings: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    items: number;
    bookings: number;
    revenue: number;
  };
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: string;
  joinDate: string;
  verified: boolean;
  initials: string;
}

export interface RecentBooking {
  id: string;
  bookingId: string;
  itemName: string;
  itemImage: string;
  customerName: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  category: string;
  icon: React.ElementType;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  profile_image?: string;
  kyc_status: string;
  last_login?: string;
}

export interface AdminBooking {
  id: string;
  booking_number: string;
  renter_id: string;
  owner_id: string;
  product_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: string;
  payment_status: string;
  pickup_method: string;
  renter_notes: string;
  pickup_time: string;
  return_time: string;
  pricing: {
    currency: string;
    subtotal: number | null;
    totalDays: number;
    platformFee: number | null;
    totalAmount: number | null;
  };
  renter_email: string;
  renter_first_name: string;
  renter_last_name: string;
  owner_email: string;
  owner_first_name: string;
  owner_last_name: string;
  product_title: string;
  product_description: string;
  created_at: string;
}

export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Country {
  id: string;
  code: string;
  code_alpha3: string;
  name: string;
  local_name: string;
  currency_code: string;
  currency_symbol: string;
  phone_prefix: string;
  timezone: string;
  languages: string[];
  is_active: boolean;
  launch_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCountryInput {
  code: string;
  code_alpha3: string;
  name: string;
  local_name: string;
  currency_code: string;
  currency_symbol: string;
  phone_prefix: string;
  timezone: string;
  languages: string[];
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: string;
  provider: string;
  last_four: string | null;
  card_brand: string | null;
  exp_month: number | null;
  exp_year: number | null;
  phone_number: string | null;
  provider_token: string | null;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
  payment_provider_id: string | null;
  currency: string;
  updated_at: string;
  metadata: Record<string, any>;
} 