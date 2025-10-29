import axios from 'axios';
import { convertCurrency } from '../../../lib/utils';
import { logger } from '../../../lib/logger';
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Types
export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  bio?: string;
  date_of_birth?: string; // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other' | string;
  province?: string;
  address_line?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  location?: { lat: number; lng: number };
  preferred_currency?: string;
};

// Change user password
export async function changePassword(token: string, currentPassword: string, newPassword: string) {
  try {
    // Extract user ID from JWT token
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id;
    
    if (!userId) {
      return {
        data: null,
        success: false,
        message: 'Invalid token'
      };
    }

    const response = await axios.put(`${API_BASE_URL}/users/${userId}/password`, {
      currentPassword,
      newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    logger.error('Error changing password:', error);
    return {
      data: null,
      success: false,
      message: error.response?.data?.message || 'Failed to change password'
    };
  }
}

// Fetch login history
export async function fetchLoginHistory(token: string, page = 1, limit = 20) {
  try {
    // Extract user ID from JWT token
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id;
    
    if (!userId) {
      return {
        data: null,
        success: false,
        message: 'Invalid token'
      };
    }

    console.log('Fetching login history for user:', userId, 'page:', page, 'limit:', limit);
    
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/login-history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { page, limit }
    });

    console.log('API Response:', response.data);
    return response.data;
  } catch (error: any) {
    logger.error('Error fetching login history:', error);
    return {
      data: null,
      success: false,
      message: error.response?.data?.message || 'Failed to fetch login history'
    };
  }
}

// Fetch current user profile
export async function fetchUserProfile(token: string) {
  try {
    if (!token) {
      return { data: null, success: false, error: 'Missing token' };
    }

    // Canonical profile endpoint with full flags
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const raw = response?.data?.data ?? response?.data ?? {};

    // Normalize to camelCase fields used by the UI
    const data = {
      id: raw.id,
      email: raw.email,
      firstName: raw.firstName ?? raw.first_name,
      lastName: raw.lastName ?? raw.last_name,
      role: raw.role,
      status: raw.status,
      phone: raw.phone ?? null,
      countryId: raw.countryId ?? raw.country_id ?? null,
      emailVerified: (raw.emailVerified ?? raw.email_verified) === true,
      phoneVerified: (raw.phoneVerified ?? raw.phone_verified) === true,
      profileImageUrl: raw.profileImageUrl ?? raw.profile_image_url ?? null,
      profileImagePublicId: raw.profileImagePublicId ?? raw.profile_image_public_id ?? null,
      kyc_status: raw.kyc_status ?? raw.kycStatus,
      createdAt: raw.createdAt ?? raw.created_at,
      updatedAt: raw.updatedAt ?? raw.updated_at,
      district: raw.district,
      sector: raw.sector,
      cell: raw.cell,
      village: raw.village,
      gender: raw.gender,
      province: raw.province,
      addressLine: raw.addressLine ?? raw.address_line,
      location: raw.location,
      bio: raw.bio,
      dateOfBirth: raw.dateOfBirth ?? raw.date_of_birth,
      twoFactorEnabled: raw.twoFactorEnabled ?? raw.two_factor_enabled,
      twoFactorVerified: raw.twoFactorVerified ?? raw.two_factor_verified,
      preferred_currency: raw.preferred_currency ?? raw.preferredCurrency,
      verifications: raw.verifications ?? [],
      kycProgress: raw.kycProgress ?? undefined,
      // Keep any extra fields untouched as a fallback
      ...raw,
    };

    return { data, success: true, error: null };
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to fetch user profile';
    return { data: null, success: false, error: errorMsg };
  }
}

// Upload/update user avatar
export async function uploadUserAvatar(userId: string, file: File, token: string) {
  try {
    const formData = new FormData();
    // Backend expects the field name to be 'file'
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/users/${userId}/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      data: response.data?.data || response.data,
      success: true,
      error: null,
    };
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || 'Failed to upload avatar';
    return { data: null, success: false, error: errorMsg };
  }
}

// Update user profile (snake_case contract)
export async function updateUser(userId: string, payload: UpdateUserPayload, token: string) {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return { data: response.data?.data || response.data, success: true } as const;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      console.error('Unauthorized while updating user');
    }
    return { data: null, success: false, error: error?.response?.data?.message || error?.message } as const;
  }
}

// Add new functions for dashboard overview - USER SPECIFIC
export async function fetchDashboardStats(token: string) {
  try {
    // Get user ID from token
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id;
    
    if (!userId) {
      return {
        activeBookings: 0,
        totalEarnings: 0,
        totalTransactions: 0,
        wishlistItems: 0
      };
    }
    
    // Get user-specific data from user endpoints
    const [bookingsRes, myProductsRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/bookings`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API_BASE_URL}/products/my/products`, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    // Fetch user-specific transactions
    const userTransactionData = await fetchUserTransactions(userId, token);

    const bookings = bookingsRes.data?.data?.data || bookingsRes.data?.data || [];
    const transactions = userTransactionData.success && userTransactionData.data ? userTransactionData.data : [];
    const myProducts = myProductsRes.data?.data?.data || myProductsRes.data?.data || [];

    // Resolve user's preferred currency
    let preferredCurrency = 'USD';
    try {
      const profile = await fetchUserProfile(token);
      preferredCurrency = (profile?.data?.preferred_currency || profile?.data?.preferredCurrency || preferredCurrency).toString().toUpperCase();
    } catch {
      // Fallback to cached user
      try {
        const cached = localStorage.getItem('user');
        if (cached) {
          const u = JSON.parse(cached);
          preferredCurrency = (u?.preferred_currency || u?.preferredCurrency || preferredCurrency).toString().toUpperCase();
        }
      } catch {}
    }

    // Calculate user-specific stats
    const activeBookings = bookings.filter((booking: any) => 
      booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'active'
    ).length;

    // Fetch wallet balance using the dedicated API endpoint
    let totalEarnings = 0;
    let potentialEarnings = 0;
    
    try {
      const walletResponse = await axios.get(`${API_BASE_URL}/wallet/balance/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (walletResponse.data?.success && walletResponse.data?.data) {
        const walletData = walletResponse.data.data;
        const walletBalance = parseFloat(walletData.balance) || 0;
        const walletCurrency = walletData.currency || 'USD';
        
        // Convert wallet balance to user's preferred currency (actual earnings)
        totalEarnings = convertCurrency(walletBalance, walletCurrency, preferredCurrency);
        
        // Calculate potential earnings from debug info (including pending bookings)
        if (walletData.debug?.all_booking_statuses) {
          const allBookings = walletData.debug.all_booking_statuses;
          const totalPotentialAmount = allBookings.reduce((sum: number, booking: any) => {
            const amount = parseFloat(booking.amount) || 0;
            return sum + amount;
          }, 0);
          
          // Convert potential earnings to preferred currency
          potentialEarnings = convertCurrency(totalPotentialAmount, walletCurrency, preferredCurrency);
        }
      }
    } catch (walletError) {
      // Fallback to transaction-based calculation
      const completedTransactions = transactions.filter((transaction: any) => 
        transaction.status === 'completed'
      );
      
      totalEarnings = completedTransactions
        .reduce((sum: number, transaction: any) => {
          const amount = parseFloat(transaction.amount) || 0;
          const fromCurrency = (transaction.currency || 'USD').toString().toUpperCase();
          const converted = convertCurrency(amount, fromCurrency, preferredCurrency);
          return sum + converted;
        }, 0);
    }

    // Calculate transaction volume from completed transactions only
    const completedTransactions = transactions.filter((transaction: any) => 
      transaction.status === 'completed'
    );
    
    const totalTransactions = completedTransactions
      .reduce((sum: number, transaction: any) => {
        const amount = parseFloat(transaction.amount) || 0;
        const fromCurrency = (transaction.currency || 'USD').toString().toUpperCase();
        const converted = convertCurrency(amount, fromCurrency, preferredCurrency);
        return sum + converted;
      }, 0);

    // Count user's active products as wishlist proxy
    const wishlistItems = myProducts.filter((product: any) => 
      product.status === 'active' || product.status === 'available'
    ).length;

    const userStats = {
      activeBookings,
      totalEarnings,
      potentialEarnings,
      totalTransactions,
      wishlistItems,
      preferredCurrency
    };

    return userStats;
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error);
    
    // Return zeros if everything fails
    return {
      activeBookings: 0,
      totalEarnings: 0,
      totalTransactions: 0,
      wishlistItems: 0
    };
  }
}

export async function fetchRecentBookings(token: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings?limit=5&sort=-created_at`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data?.data?.data || [];
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    return [];
  }
}

export async function fetchRecentTransactions(token: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/payment-transactions?limit=5&sort=-created_at`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data?.data?.data || [];
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
}

export async function createProduct(productData: any) {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_BASE_URL}/products`, productData, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

export async function createProductPricing(pricingData: any) {
  const token = localStorage.getItem('token');
  try {
    // Debug outgoing payload and field types
    logger.group('[DEBUG] Outgoing POST /product-prices');
    logger.debug('payload:', pricingData);
    logger.debug('types:', {
      product_id: typeof pricingData?.product_id,
      country_id: typeof pricingData?.country_id,
      currency: typeof pricingData?.currency,
      price_per_day: typeof pricingData?.price_per_day,
    });
    logger.groupEnd();
  } catch {}
  // Build a whitelist payload with only accepted fields
  const safePayload = {
    product_id: String(pricingData?.product_id ?? ''),
    country_id: String(pricingData?.country_id ?? ''),
    currency: pricingData?.currency ?? '',
    price_per_hour: Number(pricingData?.price_per_hour ?? 0),
    price_per_day: Number(pricingData?.price_per_day ?? 0),
    price_per_week: Number(pricingData?.price_per_week ?? 0),
    price_per_month: Number(pricingData?.price_per_month ?? 0),
    security_deposit: Number(pricingData?.security_deposit ?? 0),
    market_adjustment_factor: Number(pricingData?.market_adjustment_factor ?? 1),
    weekly_discount_percentage: Number(pricingData?.weekly_discount_percentage ?? 0),
    monthly_discount_percentage: Number(pricingData?.monthly_discount_percentage ?? 0),
    bulk_discount_threshold: Number(pricingData?.bulk_discount_threshold ?? 0),
    bulk_discount_percentage: Number(pricingData?.bulk_discount_percentage ?? 0),
    dynamic_pricing_enabled: Boolean(pricingData?.dynamic_pricing_enabled),
    peak_season_multiplier: Number(pricingData?.peak_season_multiplier ?? 1),
    off_season_multiplier: Number(pricingData?.off_season_multiplier ?? 1),
    is_active: Boolean(pricingData?.is_active ?? true),
  };
  try {
    const response = await axios.post(`${API_BASE_URL}/product-prices`, safePayload, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return response.data;
  } catch (error: any) {
    // Log full server response body if available
    try {
      logger.group('[DEBUG] Response from POST /product-prices (error)');
      logger.error('status:', error?.response?.status);
      logger.error('data:', error?.response?.data);
      logger.groupEnd();
    } catch {}
    throw error;
  }
}

export async function createProductImage(imageData: any) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  
  // Append each image file as 'images'
  if (Array.isArray(imageData.images)) {
    for (const file of imageData.images) {
      formData.append('images', file);
    }
  }

  // Append other fields if present
  if (imageData.product_id) {
    formData.append('product_id', String(imageData.product_id));
    // Compatibility keys some backends expect
    formData.append('productId', String(imageData.product_id));
  }
  if (imageData.alt_text) formData.append('alt_text', imageData.alt_text);
  if (imageData.sort_order !== undefined) formData.append('sort_order', String(imageData.sort_order));
  if (imageData.isPrimary !== undefined) {
    const isPrimaryVal = typeof imageData.isPrimary === 'boolean' ? imageData.isPrimary : String(imageData.isPrimary) === 'true';
    formData.append('isPrimary', String(isPrimaryVal));
    // Snake_case compatibility
    formData.append('is_primary', String(isPrimaryVal));
  }
  // Debug FormData contents
  try {
    logger.group('[DEBUG] Outgoing POST /product-images/multiple');
    const entries: any[] = [];
    // @ts-ignore
    for (const [key, value] of formData.entries()) {
      entries.push({ key, value: value instanceof File ? { name: value.name, size: value.size, type: value.type } : String(value) });
    }
    logger.debug('formData entries:', entries);
    logger.groupEnd();
  } catch {}

  try {
    const response = await axios.post(
      `${API_BASE_URL}/product-images/multiple`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return response.data;
  } catch (error: any) {
    try {
      logger.group('[DEBUG] Response from POST /product-images/multiple (error)');
      logger.error('status:', error?.response?.status);
      logger.error('data:', error?.response?.data);
      logger.groupEnd();
    } catch {}
    throw error;
  }
}

export async function getMyProducts() {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/products/my/products`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const products = response?.data?.data?.data || [];
  // Enrich with active price so existing UI fields continue to work
  try {
    const enriched = await Promise.all(
      products.map(async (p: any) => {
        try {
          const price = await fetchActiveDailyPrice(p.id);
          return {
            ...p,
            base_price_per_day: price.pricePerDay ?? p.base_price_per_day ?? null,
            base_currency: price.currency ?? p.base_currency ?? null,
          };
        } catch {
          return p;
        }
      })
    );
    return enriched;
  } catch {
    return products;
  }
}

export async function getProductImagesByProductId(productId: string) {
  const response = await axios.get(`${API_BASE_URL}/product-images/product/${productId}`);
  return response.data.data;
}

export async function getProductById(productId: string) {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `${API_BASE_URL}/products/${productId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  const product = response?.data?.data;
  try {
    const price = await fetchActiveDailyPrice(productId);
    return {
      ...product,
      base_price_per_day: price.pricePerDay ?? product?.base_price_per_day ?? null,
      base_currency: price.currency ?? product?.base_currency ?? null,
    };
  } catch {
    return product;
  }
}

// Fetch product prices by product ID (new helper using /product-prices/product/:id)
export async function fetchProductPricesByProductId(productId: string, options?: { page?: number; limit?: number }) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));

  const url = `${API_BASE_URL}/product-prices/product/${productId}${params.toString() ? `?${params.toString()}` : ''}`;
  try {
    const response = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return {
      success: Boolean(response.data?.success),
      data: Array.isArray(response.data?.data) ? response.data.data : [],
      pagination: response.data?.pagination || null,
    };
  } catch (error: any) {
    logger.error('Failed to fetch product prices by product ID:', error?.response?.data || error?.message);
    return { success: false, data: [], pagination: null, error };
  }
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

export async function updateProduct(productId: string, productData: any) {
  const token = localStorage.getItem('token');
  // Debug outgoing payload
  try {
    logger.group('[DEBUG] Outgoing PUT /products/{id}');
    logger.debug('url:', `${API_BASE_URL}/products/${productId}`);
    logger.debug('payload keys:', Object.keys(productData || {}));
    logger.debug('payload:', productData);
    logger.groupEnd();
  } catch {}

  const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Debug response
  try {
    logger.group('[DEBUG] Response from PUT /products/{id}');
    logger.debug('status:', response.status);
    logger.debug('data:', response.data);
    logger.groupEnd();
  } catch {}

  return response.data;
}

export async function updateProductImage(imageId: string, imageData: any) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  if (imageData.image) formData.append('image', imageData.image);
  if (imageData.alt_text) formData.append('alt_text', imageData.alt_text);
  if (imageData.sort_order) formData.append('sort_order', imageData.sort_order);
  if (imageData.isPrimary) formData.append('isPrimary', imageData.isPrimary);
  const response = await axios.put(
    `${API_BASE_URL}/product-images/${imageId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return response.data;
}

export async function updateProductPrice(priceId: string, data: any) {
  const token = localStorage.getItem('token');
  const url = `${API_BASE_URL}/product-prices/${priceId}`;
  try {
    const response = await axios.put(url, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return { success: true, data: response.data?.data ?? response.data };
  } catch (error: any) {
    return { success: false, error: error?.response?.data || error?.message };
  }
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchCountries() {
  const res = await fetch(`${API_BASE_URL}/countries`);
  if (!res.ok) throw new Error('Failed to fetch countries');
  return res.json();
}

export async function fetchBookingsByRole(role: 'renter' | 'owner', page = 1, limit = 100, token?: string | null) {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings?role=${role}&page=${page}&limit=${limit}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // API shape: { success, message, data: { data: [...], page, limit, ... } }
    const payload = response?.data?.data;
    const items = payload?.data ?? [];
    const meta = payload
      ? {
          page: payload.page,
          limit: payload.limit,
          total: payload.total,
          totalPages: payload.totalPages,
          hasNext: payload.hasNext,
          hasPrev: payload.hasPrev,
        }
      : {};
    return { data: items, meta };
  } catch (error) {
    console.error('Error fetching bookings by role:', error);
    return { data: [], meta: {} };
  }
}

export async function fetchUserBookings(token?: string | null) {
  // Backwards-compat wrapper: merge renter + owner
  try {
    const [asRenter, asOwner] = await Promise.all([
      fetchBookingsByRole('renter', 1, 100, token),
      fetchBookingsByRole('owner', 1, 100, token),
    ]);
    return { data: [...(asRenter.data || []), ...(asOwner.data || [])] };
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return { data: [] };
  }
}

// Booking action functions
export async function confirmBooking(bookingId: string, token?: string | null) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${bookingId}/confirm`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { success: true, data: response.data?.data || response.data };
  } catch (error: any) {
    console.error('Error confirming booking:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to confirm booking' 
    };
  }
}

export async function cancelBooking(bookingId: string, reason?: string, token?: string | null) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${bookingId}/cancel`,
      { reason },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { success: true, data: response.data?.data || response.data };
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to cancel booking' 
    };
  }
}

export async function checkInBooking(bookingId: string, token?: string | null) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${bookingId}/checkin`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { success: true, data: response.data?.data || response.data };
  } catch (error: any) {
    console.error('Error checking in booking:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to check in' 
    };
  }
}

export async function checkOutBooking(bookingId: string, token?: string | null) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${bookingId}/checkout`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { success: true, data: response.data?.data || response.data };
  } catch (error: any) {
    console.error('Error checking out booking:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to check out' 
    };
  }
}

// New cancellation workflow functions
export async function requestCancellation(bookingId: string, reason: string, token?: string | null) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${bookingId}/request-cancellation`,
      { reason },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { success: true, data: response.data?.data || response.data };
  } catch (error: any) {
    console.error('Error requesting cancellation:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to request cancellation' 
    };
  }
}

export async function reviewCancellation(bookingId: string, action: 'approve' | 'reject', notes?: string, token?: string | null) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${bookingId}/review-cancellation`,
      { action, notes },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { success: true, data: response.data?.data || response.data };
  } catch (error: any) {
    console.error('Error reviewing cancellation:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to review cancellation' 
    };
  }
}

export async function adminCancelBooking(bookingId: string, reason: string, adminNotes?: string, forceRefund?: boolean, token?: string | null) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${bookingId}/admin-cancel`,
      { reason, admin_notes: adminNotes, force_refund: forceRefund },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { success: true, data: response.data?.data || response.data };
  } catch (error: any) {
    console.error('Error with admin cancel:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to admin cancel booking' 
    };
  }
}

export async function processRefund(bookingId: string, refundAmount?: number, cancellationFee?: number, reason?: string, token?: string | null) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/${bookingId}/process-refund`,
      { refund_amount: refundAmount, cancellation_fee: cancellationFee, reason },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return { success: true, data: response.data?.data || response.data };
  } catch (error: any) {
    console.error('Error processing refund:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to process refund' 
    };
  }
}

// Existing product and image fetchers (if not present, add them)
// export async function getProductById(productId: string, token: string | null | undefined) {
//   const response = await axios.get(`${API_BASE_URL}/products/${productId}`, {
//     headers: token ? { Authorization: `Bearer ${token}` } : {},
//   });
//   return response.data?.data || response.data;
// }

export async function fetchProductImages(productId: string, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/product-images/product/${productId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return { data: response.data?.data || response.data || [], error: null };
  } catch (error) {
    console.error('Error fetching product images:', error);
    return { data: [], error };
  }
}



export async function fetchMyReceivedReviews(token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/review/mine/received`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching received reviews:', error);
    return [];
  }
}

export async function fetchMyWrittenReviews(token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/review/mine/written`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching written reviews:', error);
    return [];
  }
}

export async function fetchReviewById(reviewId: string, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/review/${reviewId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data?.data || null;
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    return null;
  }
}

// Fetch reviews by product ID
export async function fetchProductReviews(productId: string, token?: string) {
  try {
    // Clean and validate product ID
    const cleanProductId = productId.trim();
    if (!cleanProductId) {
      console.warn('Empty product ID provided to fetchProductReviews');
      return [];
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cleanProductId)) {
      console.warn('Invalid product ID format:', cleanProductId);
      return [];
    }

    // Try the primary endpoint first
    const url = `${API_BASE_URL}/review/product/${encodeURIComponent(cleanProductId)}`;
    console.log('Fetching reviews for product:', cleanProductId, 'URL:', url);
    
    const response = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data?.data || [];
  } catch (error: any) {
    // Handle specific error cases gracefully
    if (error.response?.status === 404) {
      console.log('No reviews found for product:', productId, '(404 - Product may not exist or have no reviews)');
      return [];
    } else if (error.response?.status === 403) {
      console.log('Access denied for product reviews:', productId);
      return [];
    } else {
      console.error('Error fetching product reviews:', {
        productId,
        url: `${API_BASE_URL}/review/product/${productId}`,
        status: error.response?.status,
        message: error.message,
        response: error.response?.data
      });
      
      // If the endpoint doesn't exist, try alternative approach
      if (error.response?.status === 404 || error.code === 'ERR_BAD_REQUEST') {
        console.log('Product reviews endpoint not available, returning empty array');
        return [];
      }
    }
    return [];
  }
}

export async function fetchReviewByBookingId(bookingId: string, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/review/booking/${bookingId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // Handle array response - return the first review if available
    const reviews = response.data?.data || [];
    return {
      review: reviews.length > 0 ? reviews[0] : null,
      count: reviews.length
    };
  } catch (error) {
    console.error('Error fetching review by booking ID:', error);
    return { review: null, count: 0 };
  }
}

// Fetch user-specific transactions using the user ID endpoint
export async function fetchUserTransactions(userId: string, token: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/payment-transactions/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return {
      data: response.data?.data || [],
      count: response.data?.count || 0,
      success: response.data?.success || false
    };
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return {
      data: [],
      count: 0,
      success: false,
      error: error
    };
  }
}

// Fetch user-specific inspections
export async function fetchUserInspections(userId: string, token: string) {
  try {
    // Try the user-specific endpoint first
    const response = await axios.get(`${API_BASE_URL}/inspections/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return {
      data: response.data?.data || [],
      count: response.data?.count || 0,
      success: response.data?.success || false
    };
  } catch (error: any) {
    // If the user-specific endpoint fails, try the general inspections endpoint with user filter
    if (error.response?.status === 404 || error.response?.status === 401) {
      try {
        const response = await axios.get(`${API_BASE_URL}/inspections?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        return {
          data: response.data?.data || [],
          count: response.data?.count || 0,
          success: response.data?.success || false
        };
      } catch (fallbackError) {
        console.error('Error fetching user inspections (fallback):', fallbackError);
        return {
          data: [],
          count: 0,
          success: false,
          error: fallbackError
        };
      }
    }
    
    console.error('Error fetching user inspections:', error);
    return {
      data: [],
      count: 0,
      success: false,
      error: error
    };
  }
}
