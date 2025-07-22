// Booking Status Type
export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// Booking Override Payload Interface
export interface BookingOverridePayload {
  status: BookingStatus;
  reason?: string;
}

// Product Interfaces
export interface Product {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  category_id?: string;
  location?: string;
  status?: string;
  image?: string;
  images?: string[];
  bookings?: number;
  rating?: number;
  price?: number;
  icon?: any;
  [key: string]: any;
}

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

// User Interfaces
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

// Booking Interfaces
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
  icon?: any;
}

// Utility Interfaces
export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
}

// Product Availability Interface
export interface ProductAvailability {
  id?: string;
  product_id?: string;
  date: string;
  availability_type: 'available' | 'unavailable';
  price_override?: number | null;
  notes?: string;
  created_at?: string;
} 

// Ensure AdminStats is exported
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

// Payment Transaction Interface
export interface PaymentTransactionResponse {
  transactions: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
} 

// Country Input Interface
export interface CreateCountryInput {
  name: string;
  code: string;
  code_alpha3?: string;
  local_name?: string;
  currency_code?: string;
  currency_symbol?: string;
  phone_prefix?: string;
  timezone?: string;
  languages?: string[];
  is_active?: boolean;
} 