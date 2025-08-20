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

// Payment Provider Interfaces
export interface PaymentProviderSettings {
  public_key?: string;
  secret_key?: string;
  webhook_secret?: string;
  [key: string]: any;
}

export interface PaymentProvider {
  id: string;
  country_id: string;
  provider_name: string; // machine name, e.g., mtn_momo
  provider_type: 'mobile_money' | 'bank' | 'card' | 'wallet' | string;
  display_name: string;
  logo_url?: string;
  supported_currencies: string[];
  min_amount?: number;
  max_amount?: number;
  fee_percentage?: number;
  fee_fixed?: number;
  supports_refunds?: boolean;
  supports_recurring?: boolean;
  processing_time_minutes?: number;
  description?: string;
  settings?: PaymentProviderSettings;
  api_endpoint?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaymentProviderInput {
  country_id: string;
  provider_name: string;
  provider_type: 'mobile_money' | 'bank' | 'card' | 'wallet' | string;
  display_name: string;
  logo_url?: string;
  supported_currencies: string[];
  min_amount?: number;
  max_amount?: number;
  fee_percentage?: number;
  fee_fixed?: number;
  supports_refunds?: boolean;
  supports_recurring?: boolean;
  processing_time_minutes?: number;
  description?: string;
  settings?: PaymentProviderSettings;
  api_endpoint?: string;
}

// Insurance Provider Interfaces
export interface InsuranceProviderAddress {
  line1?: string;
  city?: string;
  [key: string]: any;
}

export interface InsuranceProviderContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  address?: InsuranceProviderAddress;
}

export interface InsuranceProvider {
  id: string;
  country_id: string;
  provider_name: string;
  display_name: string;
  logo_url?: string;
  contact_info?: InsuranceProviderContactInfo;
  supported_categories?: string[]; // category IDs
  api_endpoint?: string;
  api_credentials?: Record<string, any>;
  is_active: boolean;
  provider_type?: string; // TRADITIONAL | AGGREGATOR | etc.
  license_number?: string;
  rating?: number | string;
  coverage_types?: string[];
  min_coverage_amount?: number | string;
  max_coverage_amount?: number | string;
  deductible_options?: Array<number | string>;
  processing_time_days?: number;
  languages_supported?: string[];
  commission_rate?: number | string;
  integration_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInsuranceProviderInput {
  country_id: string;
  provider_name: string;
  display_name: string;
  logo_url?: string;
  contact_info?: InsuranceProviderContactInfo;
  supported_categories?: string[];
  api_endpoint?: string;
  api_credentials?: Record<string, any>;
  is_active?: boolean;
  provider_type?: string;
  license_number?: string;
  rating?: number;
  coverage_types?: string[];
  min_coverage_amount?: number;
  max_coverage_amount?: number;
  deductible_options?: number[];
  processing_time_days?: number;
  languages_supported?: string[];
  commission_rate?: number;
  integration_status?: string;
}

export interface InsuranceProviderStats {
  total_providers?: number;
  active_providers?: number;
  inactive_providers?: number;
  providers_by_country?: Record<string, number>;
  providers_by_type?: Record<string, number>;
  providers_with_refunds?: number; // if applicable
  providers_with_recurring?: number; // if applicable
  average_rating?: number | null;
  average_processing_days?: number | null;
  countries_with_providers?: number;
  supported_currencies?: string[];
}

// Payment Provider Stats/Responses
export interface PaymentProviderStats {
  totalProviders: number;
  byType?: Record<string, number>;
  byCurrency?: Record<string, number>;
  avgFeePercentage?: number | null;
  activeProviders?: number;
}

export interface FeeCalculationResult {
  country_id: string;
  provider_id: string;
  provider_name: string;
  provider_type: string;
  currency: string;
  amount: number;
  fee_percentage?: number;
  fee_fixed?: number;
  total_fee: number;
  total_amount: number;
  processing_time_minutes?: number;
}

export interface ProviderComparisonItem extends FeeCalculationResult {
  display_name: string;
  logo_url?: string;
}

export interface ProviderComparisonResponse {
  items: ProviderComparisonItem[];
}

export interface BulkUpdatePaymentProvidersPayload {
  ids: string[];
  updates: Partial<CreatePaymentProviderInput>;
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
export interface PaymentTransaction {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  processed_at?: string;
  user_id?: string;
  booking_id?: string;
  description?: string;
  transaction_type?: string; // For backward compatibility
  provider?: string; // For backward compatibility
}

export interface PaymentTransactionResponse {
  data: PaymentTransaction[];
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

// Category Regulations Interfaces
export interface CategoryRegulation {
  id: string;
  category_id: string;
  country_id: string;
  regulation_type: 'LICENSING' | 'SAFETY' | 'ENVIRONMENTAL' | 'FINANCIAL' | 'OPERATIONAL' | 'COMPLIANCE';
  title: string;
  description: string;
  requirements: string[];
  compliance_deadline: string;
  penalties: string[];
  is_active: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  enforcement_level: 'LENIENT' | 'MODERATE' | 'STRICT' | 'VERY_STRICT';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreateCategoryRegulationInput {
  category_id: string;
  country_id: string;
  regulation_type: 'LICENSING' | 'SAFETY' | 'ENVIRONMENTAL' | 'FINANCIAL' | 'OPERATIONAL' | 'COMPLIANCE';
  title: string;
  description: string;
  requirements: string[];
  compliance_deadline: string;
  penalties: string[];
  is_active?: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  enforcement_level: 'LENIENT' | 'MODERATE' | 'STRICT' | 'VERY_STRICT';
}

export interface UpdateCategoryRegulationInput extends Partial<CreateCategoryRegulationInput> {}

export interface CategoryRegulationStats {
  total_regulations: number;
  active_regulations: number;
  inactive_regulations: number;
  regulations_by_type: Record<string, number>;
  regulations_by_priority: Record<string, number>;
  regulations_by_enforcement: Record<string, number>;
  countries_with_regulations: number;
  categories_with_regulations: number;
  compliance_rate: number;
  upcoming_deadlines: number;
}

export interface ComplianceCheckResult {
  category_id: string;
  country_id: string;
  is_compliant: boolean;
  missing_requirements: string[];
  compliance_score: number;
  next_deadline: string;
  recommendations: string[];
}

export interface RegulationAnalytics {
  total_regulations: number;
  compliance_rate: number;
  enforcement_metrics: Record<string, number>;
  priority_distribution: Record<string, number>;
  type_distribution: Record<string, number>;
  country_distribution: Record<string, number>;
  trend_data: Array<{
    period: string;
    compliance_rate: number;
    new_regulations: number;
    expiring_regulations: number;
  }>;
}

export interface BulkRegulationOperation {
  regulations: Array<{
    id?: string;
    operation: 'create' | 'update' | 'delete';
    data?: CreateCategoryRegulationInput | UpdateCategoryRegulationInput;
  }>;
}

export interface RegulationTemplate {
  id: string;
  name: string;
  description: string;
  regulation_type: string;
  default_requirements: string[];
  default_penalties: string[];
  applicable_categories: string[];
  applicable_countries: string[];
}

export interface RegulationValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface RegulationAuditLog {
  id: string;
  regulation_id: string;
  user_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE' | 'ARCHIVE' | 'RESTORE';
  changes: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface RegulationSearchFilters {
  category_id?: string;
  country_id?: string;
  regulation_type?: string;
  is_active?: boolean;
  priority?: string;
  enforcement_level?: string;
  page?: number;
  limit?: number;
  include_deleted?: boolean;
  q?: string;
  fields?: string[];
  fuzzy?: boolean;
}

export interface RegulationSearchResult {
  regulations: CategoryRegulation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface RegulationStatusDashboard {
  total_regulations: number;
  active_regulations: number;
  compliance_overview: {
    compliant: number;
    non_compliant: number;
    at_risk: number;
  };
  pending_deadlines: Array<{
    regulation_id: string;
    title: string;
    deadline: string;
    days_remaining: number;
  }>;
  enforcement_metrics: {
    total_violations: number;
    resolved_violations: number;
    pending_violations: number;
  };
}

export interface RegulationNotificationPayload {
  recipients: string[];
  message: string;
  notification_type: 'DEADLINE_REMINDER' | 'COMPLIANCE_ALERT' | 'ENFORCEMENT_UPDATE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface RegulationImportResult {
  total_imported: number;
  total_failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export interface RegulationConflict {
  regulation_id: string;
  conflict_type: 'DUPLICATE' | 'OVERLAPPING' | 'CONTRADICTORY';
  conflicting_regulations: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  resolution_suggestions: string[];
}

export interface RegulationExtensionRequest {
  new_deadline: string;
  reason: string;
  approved_by: string;
} 

// Administrative Divisions Interfaces
export interface AdministrativeDivision {
  id: string;
  country_id: string;
  parent_id?: string | null;
  level: number;
  name: string;
  local_name?: string;
  type: 'province' | 'district' | 'sector' | 'cell' | 'village' | string;
  code: string;
  population?: number;
  area_km2?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  country?: Country;
  parent?: AdministrativeDivision;
  children?: AdministrativeDivision[];
}

export interface CreateAdministrativeDivisionInput {
  country_id: string;
  parent_id?: string;
  level: number;
  name: string;
  local_name?: string;
  type: string;
  code: string;
  population?: number;
  area_km2?: number;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  is_active?: boolean;
}

export interface UpdateAdministrativeDivisionInput extends Partial<CreateAdministrativeDivisionInput> {}

export interface AdministrativeDivisionSearchFilters {
  country_id?: string;
  parent_id?: string;
  level?: number;
  type?: string;
  is_active?: boolean;
  search?: string;
  has_children?: boolean;
  min_population?: number;
  max_population?: number;
  include_country?: boolean;
  include_parent?: boolean;
  include_children?: boolean;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface AdministrativeDivisionSearchResult {
  divisions: AdministrativeDivision[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AdministrativeDivisionTree {
  country: Country;
  divisions: AdministrativeDivision[];
}

export interface AdministrativeDivisionHierarchy {
  division: AdministrativeDivision;
  ancestors: AdministrativeDivision[];
  descendants: AdministrativeDivision[];
}

export interface AdministrativeDivisionStats {
  total_divisions: number;
  active_divisions: number;
  inactive_divisions: number;
  by_level: Record<string, number>;
  by_type: Record<string, number>;
  by_country: Record<string, number>;
  total_population: number;
  total_area_km2: number;
}

export interface ToggleStatusPayload {
  is_active: boolean;
  reason?: string;
} 