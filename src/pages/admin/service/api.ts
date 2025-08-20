import axios from 'axios';
import { Package } from 'lucide-react';
import type {
  Category,
  CreateCategoryInput,
  RecentUser,
  RecentBooking,
  AdminUser,
  AdminBooking,
  PaginationResponse,
  Country,

  PaymentMethod,
  ProductAvailability
} from '../interfaces';
import {
  type AdminStats,
  type BookingOverridePayload,
  type CreateCountryInput,
  type PaymentTransactionResponse
} from '../interfaces';
import { isProductCurrentlyAvailable } from '../../../lib/utils';
import type { PaymentProvider, CreatePaymentProviderInput, PaymentProviderStats, FeeCalculationResult, ProviderComparisonResponse, BulkUpdatePaymentProvidersPayload, InsuranceProvider, CreateInsuranceProviderInput, InsuranceProviderStats, CategoryRegulation, CreateCategoryRegulationInput, UpdateCategoryRegulationInput, CategoryRegulationStats, ComplianceCheckResult, RegulationAnalytics, BulkRegulationOperation, RegulationTemplate, RegulationValidationResult, RegulationAuditLog, RegulationSearchFilters, RegulationSearchResult, RegulationStatusDashboard, RegulationNotificationPayload, RegulationImportResult, RegulationConflict, RegulationExtensionRequest } from '../interfaces';

export type { AdminBooking } from '../interfaces';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

export async function fetchPricingStats(token?: string) {
  const url = `${API_BASE_URL}/product-prices/stats`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.get(url, { headers });
    return { data: response.data.data, error: null };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch pricing stats';
    console.error('Error fetching pricing stats:', errorMsg);
    return { data: null, error: errorMsg };
  }
}

export async function fetchAllProducts(token?: string, isAdminDashboard: boolean = false) {
  const url = `${API_BASE_URL}/products`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.get(url, { headers });
    
    // For admin dashboard, return all products without filtering
    if (isAdminDashboard) {
      return { 
        data: response.data.data.data, 
        error: null,
        total: response.data.data.data.length
      };
    }

    // Filter for active products for other views
    const activeProducts = response.data.data.data.filter((product: any) => 
      !product.status || product.status.toLowerCase() === 'active'
    );

    return { 
      data: activeProducts, 
      error: null,
      total: activeProducts.length
    };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch products';
    console.error('Error fetching products:', errorMsg);
    return { data: null, error: errorMsg, total: 0 };
  }
}

// Fetch a user by owner_id
export async function fetchUserById(owner_id: string, token?: string) {
  const url = `${API_BASE_URL}/users/${owner_id}`;
  console.log('fetchUserById called for owner_id:', owner_id, 'URL:', url);
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.get(url, { headers });

    // Log full response details
    console.group('User Fetch Details');
    console.log('Raw Response:', JSON.stringify(response.data, null, 2));
    console.log('User ID:', response.data.data?.id);
    console.log('User Email:', response.data.data?.email);
    console.log('User First Name:', response.data.data?.first_name);
    console.log('User Last Name:', response.data.data?.last_name);
    console.groupEnd();

    return { data: response.data.data, error: null };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch user';
    console.error('Error fetching user:', errorMsg);
    return { data: null, error: errorMsg };
  }
}

// Define an interface for image objects
interface ProductImage {
  id?: string;
  product_id?: string;
  image_url: string;
  thumbnail_url?: string | null;
  alt_text?: string | null;
  sort_order?: number;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function fetchProductImages(productId: string, token?: string) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.group(`🖼️ Fetching Product Images for Product ${productId}`);
    console.log('Request URL:', `${API_BASE_URL}/product-images/product/${productId}`);
    console.log('Request Headers:', headers);

    const response = await axios.get(`${API_BASE_URL}/product-images/product/${productId}`, { headers });
    
    console.log('Full Raw Response:', JSON.stringify(response.data, null, 2));
    console.log('Response Type:', typeof response.data);
    console.log('Response Keys:', Object.keys(response.data));

    // Comprehensive image data extraction
    let images: string[] = [];
    
    // Multiple extraction strategies
    const extractImageUrls = (data: any): string[] => {
      console.group('Image URL Extraction');
      console.log('Input Data:', data);

      // Strategy 1: Directly from data property of successful response
      if (data?.success && data?.data) {
        const extractedImages = data.data
          .map((img: any) => img.image_url || img.url || img.path)
          .filter((url: string) => url && url.trim() !== '');
        
        console.log('Extracted from Success Response:', extractedImages);
        console.groupEnd();
        return extractedImages;
      }
      
      // Strategy 2: Direct array of image objects
      if (Array.isArray(data)) {
        const extractedImages = data
          .map((img: any) => img.image_url || img.url || img.path)
          .filter((url: string) => url && url.trim() !== '');
        
        console.log('Extracted from Direct Array:', extractedImages);
        console.groupEnd();
        return extractedImages;
      }
      
      // Strategy 3: Nested data structures
      if (data?.data) {
        const extractedImages = (Array.isArray(data.data) ? data.data : [data.data])
          .map((img: any) => img.image_url || img.url || img.path)
          .filter((url: string) => url && url.trim() !== '');
        
        console.log('Extracted from Nested Data:', extractedImages);
        console.groupEnd();
        return extractedImages;
      }
      
      console.warn('No images extracted');
      console.groupEnd();
      return [];
    };

    // Try different extraction methods
    images = extractImageUrls(response.data);

    console.log('Final Extracted Images:', images);
    console.log('Image Count:', images.length);
    
    console.groupEnd();

    return images.length > 0 
      ? images 
      : ['/assets/img/placeholder-image.png'];
  } catch (err: any) {
    console.group(`❌ Error Fetching Product Images for Product ${productId}`);
    console.error('Error Details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: `${API_BASE_URL}/product-images/product/${productId}`
    });
    console.groupEnd();

    return ['/assets/img/placeholder-image.png']; // Always return a placeholder
  }
}

// Fetch product prices by product ID (admin helper)
export async function fetchProductPricesByProductId(productId: string, options?: { page?: number; limit?: number }) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));

  const url = `${API_BASE_URL}/product-prices/product/${productId}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return {
    success: Boolean(response.data?.success),
    data: Array.isArray(response.data?.data) ? response.data.data : [],
    pagination: response.data?.pagination || null,
  };
}

// Convenience: get the active/first price for display (daily rate + currency)
export async function fetchActiveDailyPrice(productId: string): Promise<{ pricePerDay: number | null; currency: string | null; raw?: any }>{
  const res = await fetchProductPricesByProductId(productId, { page: 1, limit: 1 });
  if (!res.success || !res.data || res.data.length === 0) {
    return { pricePerDay: null, currency: null };
  }
  const first = res.data[0];
  const pricePerDay = first?.price_per_day != null ? Number(first.price_per_day) : null;
  const currency = first?.currency ?? null;
  return { pricePerDay, currency, raw: first };
}

// Fetch a single product by ID
export async function getProductById(productId: string, token?: string) {
  const response = await axios.get(
    `${API_BASE_URL}/products/${productId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  const product = response.data.data;
  try {
    const { pricePerDay, currency } = await fetchActiveDailyPrice(productId);
    return {
      ...product,
      base_price_per_day: pricePerDay ?? product?.base_price_per_day ?? null,
      base_currency: currency ?? product?.base_currency ?? null,
    };
  } catch {
    return product;
  }
}

// Update a product by ID
export async function updateProduct(productId: string, productData: any, token?: string) {
  const response = await axios.put(
    `${API_BASE_URL}/products/${productId}`,
    productData,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data;
}

export async function fetchAdminBookings(
  page: number = 1,
  limit: number = 20,
  token?: string
): Promise<PaginationResponse<AdminBooking>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/bookings`, {
      params: { page, limit },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data?.data || { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }
}

export async function fetchAdminUsers(
  page: number = 1,
  limit: number = 20,
  token?: string
): Promise<PaginationResponse<AdminUser>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      params: { page, limit },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log('Raw API Response:', response.data); // Debug log
    return response.data?.data || { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }
}

// Admin Overview APIs
export async function fetchAdminStats(token?: string): Promise<AdminStats> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    console.log('Admin stats API response:', response.data);
    
    if (response.data?.success && response.data?.data) {
      const data = response.data.data;
      
      // Map the API response to the expected AdminStats interface
      return {
        totalUsers: data.totalUsers || 0,
        totalItems: data.activeProducts || 0, // Map activeProducts to totalItems
        activeBookings: data.totalBookings || 0, // Map totalBookings to activeBookings
        totalRevenue: data.totalRevenue || 0,
        monthlyGrowth: {
          users: data.recentUsers || 0, // Use recentUsers as growth indicator
          items: data.activeProducts || 0,
          bookings: data.recentBookings || 0, // Use recentBookings as growth indicator
          revenue: data.totalRevenue || 0
        }
      };
    }
    
    // Fallback to default values if API structure is unexpected
    return {
      totalUsers: 0,
      totalItems: 0,
      activeBookings: 0,
      totalRevenue: 0,
      monthlyGrowth: {
        users: 0,
        items: 0,
        bookings: 0,
        revenue: 0
      }
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
}

export async function fetchRecentUsers(limit: number = 5, token?: string): Promise<RecentUser[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      params: { page: 1, limit },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const users = response.data?.data?.items || [];
    return users.map((user: AdminUser) => {
      // Get first letter of first and last name for default avatar text
      const firstInitial = user.first_name ? user.first_name[0].toUpperCase() : '';
      const lastInitial = user.last_name ? user.last_name[0].toUpperCase() : '';
      const initials = firstInitial + lastInitial;

      // Default avatar paths based on role
      const defaultAvatars: Record<string, string> = {
        admin: '/assets/img/profiles/avatar-01.jpg',
        host: '/assets/img/profiles/avatar-02.jpg',
        owner: '/assets/img/profiles/avatar-03.jpg',
        vendor: '/assets/img/profiles/avatar-04.jpg',
        user: '/assets/img/profiles/avatar-05.jpg',
        renter: '/assets/img/profiles/avatar-06.jpg'
      };

      // Get default avatar based on user role, fallback to user avatar if role not found
      const userRole = (user.role || 'user').toLowerCase();
      const defaultAvatar = defaultAvatars[userRole] || defaultAvatars.user;

      // Check if user is verified based on kyc_status
      const isVerified = user.kyc_status?.toLowerCase() === 'verified';

      return {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        avatar: user.profile_image || defaultAvatar,
        role: user.role,
        status: user.status,
        joinDate: new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        verified: isVerified,
        initials: initials
      };
    });
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return [];
  }
}

export async function fetchRecentBookings(limit: number = 5, token?: string): Promise<RecentBooking[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/bookings`, {
      params: { page: 1, limit },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const bookings = response.data?.data?.items || [];

    // Fetch product images for each booking
    const bookingsWithImages = await Promise.all(bookings.map(async (booking: AdminBooking) => {
      let itemImage = '/assets/img/items/default-item.jpg'; // Default image

      try {
        const imageResponse = await axios.get(
          `${API_BASE_URL}/product-images/product/${booking.product_id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        // Get the first image URL if available
        const images = imageResponse.data?.data || [];
        if (images.length > 0) {
          itemImage = images[0].url || images[0].image_url || itemImage;
        }
      } catch (error) {
        console.error(`Error fetching image for product ${booking.product_id}:`, error);
        // Keep using default image on error
      }

      return {
        id: booking.id,
        bookingId: booking.booking_number,
        itemName: booking.product_title,
        itemImage: itemImage,
        customerName: `${booking.renter_first_name} ${booking.renter_last_name}`,
        amount: booking.pricing?.totalAmount || 0,
        status: booking.status,
        startDate: new Date(booking.start_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        endDate: new Date(booking.end_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        category: 'General', // Default category
        icon: Package // Default icon
      };
    }));

    return bookingsWithImages;
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    return [];
  }
}

export async function updateBooking(bookingId: string, data: any, token?: string) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/bookings/${bookingId}`,
      data,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return { data: response.data, error: null };
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error.message || 'Failed to update booking';
    return { data: null, error: errorMsg };
  }
}

export async function fetchRecentPaymentTransactions(
  limit: number = 10,
  token?: string,
  page: number = 1,
  status?: string,
  type?: string,
  search?: string
): Promise<PaymentTransactionResponse> {
  let url = `${API_BASE_URL}/payment-transactions?page=${page}&limit=${limit}`;
  if (status && status !== 'all') url += `&status=${encodeURIComponent(status)}`;
  if (type && type !== 'all') url += `&transaction_type=${encodeURIComponent(type)}`;
  if (search && search.trim() !== '') url += `&search=${encodeURIComponent(search)}`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch payment transactions';
    console.error('Error fetching payment transactions:', errorMsg);
    throw new Error(errorMsg);
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    throw new Error(err?.response?.data?.message || 'Failed to fetch categories');
  }
}

export async function createCategory(data: CreateCategoryInput, token?: string): Promise<Category> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.post(`${API_BASE_URL}/categories`, data, { headers });
    return response.data;
  } catch (err: any) {
    console.error('Error creating category:', err);
    throw new Error(err?.response?.data?.message || 'Failed to create category');
  }
}

export async function updateCategory(categoryId: string, data: Partial<CreateCategoryInput>, token?: string): Promise<Category> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.put(`${API_BASE_URL}/categories/${categoryId}`, data, { headers });
    return response.data;
  } catch (err: any) {
    console.error('Error updating category:', err);
    throw new Error(err?.response?.data?.message || 'Failed to update category');
  }
}

export async function deleteCategory(categoryId: string, token?: string): Promise<void> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, { headers });
  } catch (err: any) {
    console.error('Error deleting category:', err);
    throw new Error(err?.response?.data?.message || 'Failed to delete category');
  }
}

export async function fetchCategoryById(categoryId: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/categories/${categoryId}`, { headers });
  return response.data;
}

export async function fetchCountries(): Promise<Country[]> {
  const response = await axios.get(`${API_BASE_URL}/countries`);
  return response.data.data;
}

export async function fetchCountryById(countryId: string, token?: string): Promise<Country> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(`${API_BASE_URL}/countries/${countryId}`, { headers });
    return response.data.data;
  } catch (err: any) {
    console.error('Error fetching country by ID:', err);
    throw new Error(err?.response?.data?.message || 'Failed to fetch country');
  }
}

export async function createCountry(data: CreateCountryInput, token?: string): Promise<Country> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/countries`, data, { headers });
  return response.data.data;
}

export async function updateCountry(countryId: string, data: Partial<CreateCountryInput>, token?: string): Promise<Country> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.put(`${API_BASE_URL}/countries/${countryId}`, data, { headers });
    return response.data.data;
  } catch (err: any) {
    console.error('Error updating country:', err);
    throw new Error(err?.response?.data?.message || 'Failed to update country');
  }
}

export async function deleteCountry(countryId: string, token?: string): Promise<void> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    await axios.delete(`${API_BASE_URL}/countries/${countryId}`, { headers });
  } catch (err: any) {
    console.error('Error deleting country:', err);
    throw new Error(err?.response?.data?.message || 'Failed to delete country');
  }
}

export async function fetchPaymentMethods(token?: string): Promise<PaymentMethod[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/payment-methods`, { headers });
  return response.data.data.data;
}

// Payment Providers CRUD
export async function fetchPaymentProviders(token?: string): Promise<PaymentProvider[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/payment-providers`, { headers });
  // Support both {data:{data:[]}} and {data:[]} response shapes
  return response.data?.data?.data ?? response.data?.data ?? response.data ?? [];
}

export async function createPaymentProvider(payload: CreatePaymentProviderInput, token?: string): Promise<{ data: PaymentProvider | null; error: string | null }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.post(`${API_BASE_URL}/payment-providers`, payload, { headers });
    return { data: response.data?.data ?? response.data, error: null };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to create payment provider';
    return { data: null, error: errorMsg };
  }
}

export async function updatePaymentProvider(providerId: string, payload: Partial<CreatePaymentProviderInput>, token?: string): Promise<{ data: PaymentProvider | null; error: string | null }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.put(`${API_BASE_URL}/payment-providers/${providerId}`, payload, { headers });
    return { data: response.data?.data ?? response.data, error: null };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to update payment provider';
    return { data: null, error: errorMsg };
  }
}

export async function deletePaymentProvider(providerId: string, token?: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    await axios.delete(`${API_BASE_URL}/payment-providers/${providerId}`, { headers });
    return { success: true, error: null };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to delete payment provider';
    return { success: false, error: errorMsg };
  }
}

// Payment Providers Additional APIs
export async function fetchPaymentProviderById(id: string, token?: string): Promise<PaymentProvider> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/payment-providers/${id}`, { headers });
  return response.data?.data ?? response.data;
}

export async function searchPaymentProviders(query: string, token?: string): Promise<PaymentProvider[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/payment-providers/search`, { params: { query }, headers });
  return response.data?.data ?? response.data ?? [];
}

export async function fetchPaymentProviderStats(token?: string): Promise<PaymentProviderStats> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/payment-providers/stats`, { headers });
  const raw = response.data?.data ?? response.data ?? {};
  // Normalize snake_case payload to our camelCase interface
  const normalized: PaymentProviderStats = {
    totalProviders: Number(raw.total_providers ?? raw.totalProviders ?? 0),
    activeProviders: Number(raw.active_providers ?? raw.activeProviders ?? 0),
    avgFeePercentage: raw.average_fee_percentage ?? raw.avgFeePercentage ?? null,
    byType: raw.providers_by_type ?? raw.byType ?? undefined,
    byCurrency: raw.providers_by_currency ?? raw.byCurrency ?? undefined,
  };
  return normalized;
}

export async function bulkUpdatePaymentProviders(payload: BulkUpdatePaymentProvidersPayload, token?: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    await axios.patch(`${API_BASE_URL}/payment-providers/bulk`, payload, { headers });
    return { success: true, error: null };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to bulk update payment providers';
    return { success: false, error: errorMsg };
  }
}

export async function fetchPaymentProvidersByCountry(countryId: string, token?: string): Promise<PaymentProvider[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/payment-providers/country/${countryId}`, { headers });
  return response.data?.data ?? response.data ?? [];
}

export async function calculateFeesForCountry(options: { countryId: string; amount: number; currency: string; provider_type?: string }, token?: string): Promise<FeeCalculationResult[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const { countryId, amount, currency, provider_type } = options;
  const response = await axios.get(`${API_BASE_URL}/payment-providers/country/${countryId}/calculate`, { params: { amount, currency, provider_type }, headers });
  return response.data?.data ?? response.data ?? [];
}

export async function compareProvidersForCountry(options: { countryId: string; amount: number; currency: string; provider_type?: string }, token?: string): Promise<ProviderComparisonResponse> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const { countryId, amount, currency, provider_type } = options;
  const response = await axios.get(`${API_BASE_URL}/payment-providers/country/${countryId}/compare`, { params: { amount, currency, provider_type }, headers });
  const data = response.data?.data ?? response.data;
  return Array.isArray(data) ? { items: data } : data;
}

// Insurance Providers API
export async function fetchInsuranceProviders(params?: Record<string, any>, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/insurance-providers`, { headers, params });
  return response.data;
}

export async function searchInsuranceProviders(params: Record<string, any>, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/search`, { headers, params });
  return response.data;
}

export async function fetchInsuranceProviderStats(params?: { country_id?: string }, token?: string): Promise<InsuranceProviderStats> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/stats`, { headers, params });
  return response.data?.data ?? response.data;
}

export async function fetchLiveInsuranceProviders(params?: { country_id?: string; include_credentials?: boolean }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/live`, { headers, params });
  return response.data;
}

export async function compareInsuranceProviders(params: { category_id: string; coverage_amount?: number; country_id?: string }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/compare`, { headers, params });
  return response.data;
}

export async function coverageAnalysis(params: { category_id: string; country_id: string }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/coverage-analysis`, { headers, params });
  return response.data;
}

export async function bulkUpdateInsuranceProviders(payload: { ids: string[]; updates: Partial<CreateInsuranceProviderInput> }, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/insurance-providers/bulk`, payload, { headers });
  return response.data;
}

export async function fetchInsuranceProvidersByCountry(countryId: string, params?: { include_inactive?: boolean; include_credentials?: boolean }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/country/${countryId}`, { headers, params });
  return response.data;
}

export async function fetchInsuranceProvidersByCategory(categoryId: string, params?: { country_id?: string; include_inactive?: boolean; include_credentials?: boolean }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/category/${categoryId}`, { headers, params });
  return response.data;
}

export async function fetchInsuranceMarketAnalysis(countryId: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/insurance-providers/market-analysis/${countryId}`, { headers });
  return response.data;
}

export async function fetchInsuranceProviderById(id: string, params?: { include_inactive?: boolean; include_credentials?: boolean; include_stats?: boolean }, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(`${API_BASE_URL}/insurance-providers/${id}`, { headers, params });
    return response.data;
  } catch (err: any) {
    console.error('Error fetching insurance provider by ID:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to fetch insurance provider');
  }
}

export async function createInsuranceProvider(payload: CreateInsuranceProviderInput, token?: string): Promise<{ data: InsuranceProvider | null; error: string | null }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.post(`${API_BASE_URL}/insurance-providers`, payload, { headers });
    return { data: response.data?.data ?? response.data, error: null };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to create insurance provider';
    return { data: null, error: errorMsg };
  }
}

export async function updateInsuranceProvider(id: string, payload: Partial<CreateInsuranceProviderInput>, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.put(`${API_BASE_URL}/insurance-providers/${id}`, payload, { headers });
  return response.data;
}

export async function deleteInsuranceProvider(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.delete(`${API_BASE_URL}/insurance-providers/${id}`, { headers });
  return response.data;
}

export async function fetchProductAvailability(productId: string, token?: string): Promise<ProductAvailability[]> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.group(`Fetching Product Availability for Product ${productId}`);
    console.log('Request URL:', `${API_BASE_URL}/product-availability/product/${productId}`);
    console.log('Request Headers:', headers);

    const response = await axios.get(`${API_BASE_URL}/product-availability/product/${productId}`, { headers });

    console.log('Raw Response:', response.data);

    // Normalize response to ensure we always return an array
    const availabilityData = response.data?.data || response.data || [];

    console.log('Processed Availability Data:', availabilityData);
    console.log('Availability Count:', availabilityData.length);
    console.groupEnd();

    return availabilityData;
  } catch (err: any) {
    console.group(`Error Fetching Product Availability for Product ${productId}`);
    console.error('Error Details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: `${API_BASE_URL}/product-availability/product/${productId}`
    });
    console.groupEnd();

    return []; // Return empty array on error
  }
}

export async function fetchAdminAnalytics(token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(`${API_BASE_URL}/admin/analytics`, { headers });
    return response.data;
  } catch (err: any) {
    console.error('Error fetching admin analytics:', err);
    throw new Error(err?.response?.data?.message || 'Failed to fetch admin analytics');
  }
}

export async function fetchAdminRealtimeMetrics(token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(`${API_BASE_URL}/admin/metrics/realtime`, { headers });
    return response.data;
  } catch (err: any) {
    console.error('Error fetching admin realtime metrics:', err);
    throw new Error(err?.response?.data?.message || 'Failed to fetch admin realtime metrics');
  }
}

export async function fetchAdminUserById(userId: string, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(`${API_BASE_URL}/admin/users/${userId}`, { headers });
    return response.data;
  } catch (err: any) {
    console.error('Error fetching admin user by ID:', err);
    throw new Error(err?.response?.data?.message || 'Failed to fetch admin user');
  }
}

export async function moderateAdminUser(userId: string, data: { action: 'ban' | 'suspend' | 'activate' | 'warn'; reason?: string; duration?: number }, token?: string) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.post(`${API_BASE_URL}/admin/users/${userId}/moderate`, data, { headers });
    return response.data;
  } catch (err: any) {
    console.error('Error moderating admin user:', err);
    throw new Error(err?.response?.data?.message || 'Failed to moderate admin user');
  }
}

export async function moderateAdminProduct(productId: string, data: { action: 'approve' | 'reject' | 'flag' | 'quarantine'; reason?: string }, token?: string) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.post(`${API_BASE_URL}/admin/products/${productId}/moderate`, data, { headers });
    return response.data;
  } catch (err: any) {
    console.error('Error moderating admin product:', err);
    throw new Error(err?.response?.data?.message || 'Failed to moderate admin product');
  }
}

export async function fetchAdminBookingById(bookingId: string, token?: string) {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await axios.get(`${API_BASE_URL}/admin/bookings/${bookingId}`, { headers });
    return response.data;
  } catch (err: any) {
    console.error('Error fetching admin booking details:', err);
    throw new Error(err?.response?.data?.message || 'Failed to fetch booking details');
  }
}

/**
 * Override a booking's status by admin
 * @param bookingId The unique identifier of the booking to override
 * @param payload The override details including new status and optional reason
 * @param token Optional authentication token
 * @returns Promise resolving to the updated booking or error
 */
export async function overrideBooking(
  bookingId: string,
  payload: BookingOverridePayload,
  token?: string
) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.group('Booking Override Request');
    console.log('Booking ID:', bookingId);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${API_BASE_URL}/admin/bookings/${bookingId}/override`,
      payload,
      { headers }
    );

    console.log('Override Response:', JSON.stringify(response.data, null, 2));
    console.groupEnd();

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.group('Booking Override Error');
    console.error('Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    console.groupEnd();

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to override booking'
    };
  }
}

/**
 * Fetches products that are active and currently available (not booked)
 * This function filters products for the public portal
 * @param token Optional authentication token
 * @param skipAvailabilityCheck If true, only filters by active status (for performance)
 */
export async function fetchAvailableProducts(token?: string, skipAvailabilityCheck: boolean = false) {
  try {
    // First, get all active products
    const productsResult = await fetchAllProducts(token, false);
    
    if (productsResult.error || !productsResult.data) {
      return productsResult;
    }

    const activeProducts = productsResult.data;
    
    // If skipping availability check, return all active products
    if (skipAvailabilityCheck) {
      console.log(`Returning ${activeProducts.length} active products (skipped availability check)`);
      return {
        data: activeProducts,
        error: null,
        total: activeProducts.length
      };
    }

    const availableProducts = [];

    // Check availability for each product
    for (const product of activeProducts) {
      try {
        // Fetch availability data for this product
        const availabilityData = await fetchProductAvailability(product.id, token);
        
        // Check if product is currently available (not booked)
        const isAvailable = isProductCurrentlyAvailable(availabilityData);
        
        if (isAvailable) {
          availableProducts.push(product);
        }
      } catch (error) {
        console.warn(`Could not check availability for product ${product.id}, including it as available:`, error);
        // If we can't check availability, include the product (fail-safe approach)
        availableProducts.push(product);
      }
    }

    console.log(`Filtered ${activeProducts.length} active products to ${availableProducts.length} available products`);

    return {
      data: availableProducts,
      error: null,
      total: availableProducts.length
    };
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to fetch available products';
    console.error('Error fetching available products:', errorMsg);
    return { data: null, error: errorMsg, total: 0 };
  }
}

/**
 * Settings Management API Functions
 */

// Interface for platform settings
export interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  defaultLanguage: string;
  supportedLanguages?: Array<{
    code: string;
    label?: string;
    nativeName?: string;
    flag?: string;
    enabled?: boolean;
  }>;
  timezone: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  phoneVerificationRequired: boolean;
  kycRequired: boolean;
  maxImagesPerProduct: number;
  maxProductsPerUser: number;
  autoApproveProducts: boolean;
  autoApproveUsers: boolean;
}

// Interface for security settings
export interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
  enableCaptcha: boolean;
  ipWhitelist: string[];
  allowedFileTypes: string[];
  maxFileSize: number;
  enableAuditLog: boolean;
  dataRetentionDays: number;
}

// Interface for notification settings
export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  adminAlerts: boolean;
  bookingNotifications: boolean;
  paymentNotifications: boolean;
  reviewNotifications: boolean;
  systemMaintenanceAlerts: boolean;
}

// Interface for system settings
export interface SystemSettings {
  cacheEnabled: boolean;
  cacheTimeout: number;
  backupEnabled: boolean;
  backupFrequency: string;
  logLevel: string;
  debugMode: boolean;
  apiRateLimit: number;
  maxConcurrentUsers: number;
}

// Combined settings interface
export interface AdminSettings {
  platform: PlatformSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  system: SystemSettings;
}

/**
 * Fetch all admin settings
 */
export async function fetchAdminSettings(token?: string): Promise<AdminSettings> {
  const url = `${API_BASE_URL}/admin/settings`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(url, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch settings';
    console.error('Error fetching admin settings:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Update admin settings
 */
export async function updateAdminSettings(settings: Partial<AdminSettings>, token?: string): Promise<AdminSettings> {
  const url = `${API_BASE_URL}/admin/settings`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.put(url, settings, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to update settings';
    console.error('Error updating admin settings:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Reset admin settings to defaults
 */
export async function resetAdminSettings(token?: string): Promise<AdminSettings> {
  const url = `${API_BASE_URL}/admin/settings/reset`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, {}, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to reset settings';
    console.error('Error resetting admin settings:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Fetch system health and status
 */
export async function fetchSystemHealth(token?: string) {
  const url = `${API_BASE_URL}/admin/system/health`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(url, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch system health';
    console.error('Error fetching system health:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Fetch system logs
 */
export async function fetchSystemLogs(
  level?: string,
  limit: number = 100,
  token?: string
) {
  const url = `${API_BASE_URL}/admin/system/logs`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    params.append('limit', limit.toString());
    
    const response = await axios.get(`${url}?${params.toString()}`, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch system logs';
    console.error('Error fetching system logs:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Clear system cache
 */
export async function clearSystemCache(token?: string) {
  const url = `${API_BASE_URL}/admin/system/cache/clear`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, {}, { headers });
    return response.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to clear cache';
    console.error('Error clearing system cache:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Trigger system backup
 */
export async function triggerSystemBackup(token?: string) {
  const url = `${API_BASE_URL}/admin/system/backup`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, {}, { headers });
    return response.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to trigger backup';
    console.error('Error triggering system backup:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Reports Management API Functions
 */

// Report interfaces
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
  userId?: string;
  productId?: string;
  country?: string;
  paymentMethod?: string;
}

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  revenueByCategory: { category: string; revenue: number; bookings: number }[];
  revenueByCountry: { country: string; revenue: number; bookings: number }[];
  revenueByMonth: { month: string; revenue: number; bookings: number }[];
}

export interface UserReport {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  usersByCountry: { country: string; users: number }[];
  usersByMonth: { month: string; users: number }[];
  topUsers: { userId: string; name: string; bookings: number; revenue: number }[];
}

export interface BookingReport {
  period: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  averageBookingDuration: number;
  bookingsByCategory: { category: string; bookings: number; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
  bookingsByMonth: { month: string; bookings: number; revenue: number }[];
}

export interface ProductReport {
  period: string;
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  averageRating: number;
  productsByCategory: { category: string; products: number }[];
  topProducts: { productId: string; title: string; bookings: number; revenue: number; rating: number }[];
  productsByStatus: { status: string; count: number }[];
}

export interface TransactionReport {
  period: string;
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  failedTransactions: number;
  transactionsByMethod: { method: string; count: number; amount: number }[];
  transactionsByStatus: { status: string; count: number; amount: number }[];
  transactionsByMonth: { month: string; transactions: number; amount: number }[];
}

export interface PerformanceReport {
  period: string;
  averageResponseTime: number;
  uptime: number;
  errorRate: number;
  activeUsers: number;
  peakConcurrentUsers: number;
  apiRequests: number;
  cacheHitRate: number;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'revenue' | 'user' | 'booking' | 'product' | 'transaction' | 'performance' | 'custom';
  filters: ReportFilters;
  schedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recipients?: string[];
  lastGenerated?: string;
  nextGeneration?: string;
}

/**
 * Generate revenue report
 */
export async function generateRevenueReport(filters: ReportFilters, token?: string): Promise<RevenueReport> {
  const url = `${API_BASE_URL}/admin/reports/revenue`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, filters, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to generate revenue report';
    console.error('Error generating revenue report:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Generate user report
 */
export async function generateUserReport(filters: ReportFilters, token?: string): Promise<UserReport> {
  const url = `${API_BASE_URL}/admin/reports/users`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, filters, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to generate user report';
    console.error('Error generating user report:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Generate booking report
 */
export async function generateBookingReport(filters: ReportFilters, token?: string): Promise<BookingReport> {
  const url = `${API_BASE_URL}/admin/reports/bookings`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, filters, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to generate booking report';
    console.error('Error generating booking report:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Generate product report
 */
export async function generateProductReport(filters: ReportFilters, token?: string): Promise<ProductReport> {
  const url = `${API_BASE_URL}/admin/reports/products`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, filters, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to generate product report';
    console.error('Error generating product report:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Generate transaction report
 */
export async function generateTransactionReport(filters: ReportFilters, token?: string): Promise<TransactionReport> {
  const url = `${API_BASE_URL}/admin/reports/transactions`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, filters, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to generate transaction report';
    console.error('Error generating transaction report:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Generate performance report
 */
export async function generatePerformanceReport(filters: ReportFilters, token?: string): Promise<PerformanceReport> {
  const url = `${API_BASE_URL}/admin/reports/performance`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, filters, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to generate performance report';
    console.error('Error generating performance report:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Get all custom reports
 */
export async function fetchCustomReports(token?: string): Promise<CustomReport[]> {
  const url = `${API_BASE_URL}/admin/reports/custom`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(url, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch custom reports';
    console.error('Error fetching custom reports:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Create custom report
 */
export async function createCustomReport(report: Omit<CustomReport, 'id' | 'lastGenerated' | 'nextGeneration'>, token?: string): Promise<CustomReport> {
  const url = `${API_BASE_URL}/admin/reports/custom`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, report, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to create custom report';
    console.error('Error creating custom report:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Update custom report
 */
export async function updateCustomReport(reportId: string, report: Partial<CustomReport>, token?: string): Promise<CustomReport> {
  const url = `${API_BASE_URL}/admin/reports/custom/${reportId}`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.put(url, report, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to update custom report';
    console.error('Error updating custom report:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Delete custom report
 */
export async function deleteCustomReport(reportId: string, token?: string): Promise<void> {
  const url = `${API_BASE_URL}/admin/reports/custom/${reportId}`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    await axios.delete(url, { headers });
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to delete custom report';
    console.error('Error deleting custom report:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Export report to various formats
 */
export async function exportReport(
  reportType: string,
  format: 'pdf' | 'csv' | 'excel' | 'json',
  filters: ReportFilters,
  token?: string
): Promise<Blob> {
  const url = `${API_BASE_URL}/admin/reports/export/${reportType}`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const params = new URLSearchParams();
    params.append('format', format);
    
    const response = await axios.post(`${url}?${params.toString()}`, filters, { 
      headers,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to export report';
    console.error('Error exporting report:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Schedule report generation
 */
export async function scheduleReport(
  reportId: string,
  schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  recipients: string[],
  token?: string
): Promise<void> {
  const url = `${API_BASE_URL}/admin/reports/schedule/${reportId}`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    await axios.post(url, { schedule, recipients }, { headers });
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to schedule report';
    console.error('Error scheduling report:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Get report templates
 */
export async function fetchReportTemplates(token?: string): Promise<any[]> {
  const url = `${API_BASE_URL}/admin/reports/templates`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(url, { headers });
    return response.data.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch report templates';
    console.error('Error fetching report templates:', errorMsg);
    throw new Error(errorMsg);
  }
}

// Category Regulations API Functions
export async function createCategoryRegulation(data: CreateCategoryRegulationInput, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations`, data, { headers });
  return response.data;
}

export async function fetchCategoryRegulations(params?: RegulationSearchFilters, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations`, { headers, params });
  return response.data;
}

export async function fetchCategoryRegulationById(id: string, params?: { include_deleted?: boolean }, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(`${API_BASE_URL}/category-regulations/${id}`, { headers, params });
    return response.data;
  } catch (err: any) {
    console.error('Error fetching category regulation by ID:', err);
    throw new Error(err?.response?.data?.message || err?.message || 'Failed to fetch category regulation');
  }
}

export async function updateCategoryRegulation(id: string, data: UpdateCategoryRegulationInput, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.put(`${API_BASE_URL}/category-regulations/${id}`, data, { headers });
  return response.data;
}

export async function deleteCategoryRegulation(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.delete(`${API_BASE_URL}/category-regulations/${id}`, { headers });
  return response.data;
}

export async function searchCategoryRegulations(params: RegulationSearchFilters, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/search`, { headers, params });
  return response.data;
}

export async function fetchCategoryRegulationStats(params?: { country_id?: string }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/stats`, { headers, params });
  return response.data;
}

export async function fetchCategoryRegulationsByCategory(categoryId: string, params?: { country_id?: string; include_deleted?: boolean }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/category/${categoryId}`, { headers, params });
  return response.data;
}

export async function fetchCategoryRegulationsByCountry(countryId: string, params?: { include_deleted?: boolean }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/country/${countryId}`, { headers, params });
  return response.data;
}

export async function checkCompliance(categoryId: string, countryId: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/compliance/check`, { 
    headers, 
    params: { category_id: categoryId, country_id: countryId } 
  });
  return response.data;
}

export async function getRegulationAnalytics(params?: { period?: string; metric?: string }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/analytics/summary`, { headers, params });
  return response.data;
}

export async function getRegulationAnalyticsByType(token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/analytics/by-type`, { headers });
  return response.data;
}

export async function getRegulationAnalyticsByPriority(token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/analytics/by-priority`, { headers });
  return response.data;
}

export async function getRegulationAnalyticsByCountry(token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/analytics/by-country`, { headers });
  return response.data;
}

export async function bulkCreateCategoryRegulations(data: BulkRegulationOperation, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/bulk-create`, data, { headers });
  return response.data;
}

export async function bulkUpdateCategoryRegulations(data: BulkRegulationOperation, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.put(`${API_BASE_URL}/category-regulations/bulk-update`, data, { headers });
  return response.data;
}

export async function bulkDeleteCategoryRegulations(data: { regulations: string[] }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/bulk-delete`, data, { headers });
  return response.data;
}

export async function getRegulationTemplates(token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/templates`, { headers });
  return response.data;
}

export async function createRegulationFromTemplate(templateId: string, data: Partial<CreateCategoryRegulationInput>, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/from-template`, { template_id: templateId, ...data }, { headers });
  return response.data;
}

export async function getRegulationValidationRules(token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/validation/rules`, { headers });
  return response.data;
}

export async function validateRegulation(data: CreateCategoryRegulationInput, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/validate`, data, { headers });
  return response.data;
}

export async function getRegulationHistory(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/history/${id}`, { headers });
  return response.data;
}

export async function activateRegulation(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/${id}/activate`, {}, { headers });
  return response.data;
}

export async function deactivateRegulation(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/${id}/deactivate`, {}, { headers });
  return response.data;
}

export async function getRegulationStatusDashboard(token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/status/dashboard`, { headers });
  return response.data;
}

export async function notifyRegulation(id: string, data: RegulationNotificationPayload, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/${id}/notify`, data, { headers });
  return response.data;
}

export async function getRegulationAuditLog(params?: { start_date?: string; end_date?: string; user_id?: string; action?: string }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/audit/log`, { headers, params });
  return response.data;
}

export async function importRegulationsCSV(file: File, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_BASE_URL}/category-regulations/import/csv`, formData, { 
    headers: { ...headers, 'Content-Type': 'multipart/form-data' } 
  });
  return response.data;
}

export async function exportRegulationsCSV(params?: RegulationSearchFilters, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/export/csv`, { headers, params, responseType: 'blob' });
  return response.data;
}

export async function exportRegulationsJSON(params?: RegulationSearchFilters, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/export/json`, { headers, params });
  return response.data;
}

export async function getGlobalRegulationStatistics(token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/statistics/global`, { headers });
  return response.data;
}

export async function getRegulationTrends(params?: { period?: string; metric?: string }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/statistics/trends`, { headers, params });
  return response.data;
}

export async function archiveRegulation(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/${id}/archive`, {}, { headers });
  return response.data;
}

export async function getArchivedRegulations(token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/archived`, { headers });
  return response.data;
}

export async function restoreRegulation(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/${id}/restore`, {}, { headers });
  return response.data;
}

export async function checkRegulationConflicts(categoryId: string, countryId: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/conflicts/check`, { 
    headers, 
    params: { category_id: categoryId, country_id: countryId } 
  });
  return response.data;
}

export async function resolveRegulationConflicts(data: { conflicts: string[]; resolution: string }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/conflicts/resolve`, data, { headers });
  return response.data;
}

export async function getExpiringRegulations(params?: { days?: number }, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/expiring/soon`, { headers, params });
  return response.data;
}

export async function extendRegulationDeadline(id: string, data: RegulationExtensionRequest, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/${id}/extend`, data, { headers });
  return response.data;
}

export async function getRelatedRegulations(id: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/category-regulations/related/${id}`, { headers });
  return response.data;
}

export async function copyRegulation(id: string, data?: Partial<CreateCategoryRegulationInput>, token?: string) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/category-regulations/${id}/copy`, data || {}, { headers });
  return response.data;
}
