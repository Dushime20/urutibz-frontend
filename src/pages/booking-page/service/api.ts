import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Review submission interface
export interface ReviewSubmission {
  bookingId: string;
  reviewedUserId: string;
  overallRating: number;
  communicationRating: number;
  conditionRating: number;
  valueRating: number;
  title: string;
  comment: string;
}

// Function to create a review
export async function createReview(reviewData: ReviewSubmission, token?: string) {
  const url = `${API_BASE_URL}/review`;
  
  console.log('Creating review with URL:', url);
  console.log('Review data:', reviewData);
  console.log('Token available:', !!token);
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('Request headers:', headers);
    
    const response = await axios.post(url, reviewData, { headers });
    
    console.log('Review API response:', response.data);
    
    // Check if the response has success at top level or nested
    const responseData = response.data;
    const isSuccess = responseData.success === true || responseData.data?.success === true;
    
    return {
      success: isSuccess,
      data: responseData.data || responseData,
      message: responseData.message || 'Review submitted successfully'
    };
  } catch (error: any) {
    console.error('Error submitting review:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to submit review',
      data: null
    };
  }
}

export async function createBooking(bookingData: any, token: string) {
  const url = `${API_BASE_URL}/bookings`;
  
  try {
    const response = await axios.post(url, bookingData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Booking created successfully'
    };
  } catch (error: any) {
    console.error('Error creating booking:', error);
    
    // Extract actual error messages from errors array
    const errorData = error.response?.data;
    let errorMessage = errorData?.message || error.message || 'Failed to create booking';
    
    // If there are specific validation errors, use the first one's message
    if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      errorMessage = errorData.errors[0].message || errorMessage;
    }
    
    return {
      success: false,
      error: errorMessage,
      errors: errorData?.errors || [], // Also pass errors array for detailed display
      data: null
    };
  }
}

export async function fetchPaymentMethods(token?: string) {
  const url = `${API_BASE_URL}/payment-methods`;
  
  try {
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(url, { headers });
    
    // Normalize response to ensure we always return an object with data
    return {
      data: response.data?.data || response.data || [],
      pagination: response.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 }
    };
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }
    };
  }
}

// Fetch user's default payment methods (e.g., for auto-fill)
export interface PaymentMethodRecord {
  id: string;
  type: 'card' | 'mobile_money' | string;
  provider?: string;
  last_four?: string | null;
  card_brand?: string | null;
  exp_month?: number | null;
  exp_year?: number | null;
  phone_number?: string | null;
  is_default?: boolean;
  currency?: string | null;
  metadata?: Record<string, any> | null;
}

export async function fetchDefaultPaymentMethods(token?: string): Promise<PaymentMethodRecord[]> {
  const url = `${API_BASE_URL}/payment-methods?is_default=true`;
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(url, { headers });
    const data = response.data?.data?.data ?? response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export async function addPaymentMethod(paymentData: any, token: string) {
  // Normalize inputs
  const normalizedType = String(paymentData?.type || '').trim().toLowerCase();
  const rawProvider = String(paymentData?.provider || '').trim();
  
  // Map mobile money provider names from database format to validation format
  // Database has: mtn_momo, airtel_money
  // Validation expects: MTN, AIRTEL
  // Backend expects: mtn_momo, airtel_money (lowercase with underscores)
  let normalizedProvider = rawProvider.toUpperCase();
  let backendProvider = rawProvider.toLowerCase();
  
  // Map mobile money providers
  const mobileMoneyProviderMap: { [key: string]: { validation: string; backend: string } } = {
    'mtn_momo': { validation: 'MTN', backend: 'mtn_momo' },
    'MTN_MOMO': { validation: 'MTN', backend: 'mtn_momo' },
    'airtel_money': { validation: 'AIRTEL', backend: 'airtel_money' },
    'AIRTEL_MONEY': { validation: 'AIRTEL', backend: 'airtel_money' },
    'mtn': { validation: 'MTN', backend: 'mtn_momo' },
    'MTN': { validation: 'MTN', backend: 'mtn_momo' },
    'airtel': { validation: 'AIRTEL', backend: 'airtel_money' },
    'AIRTEL': { validation: 'AIRTEL', backend: 'airtel_money' },
  };
  
  if (normalizedType === 'mobile_money') {
    const providerKey = rawProvider.toLowerCase();
    const providerKeyUpper = rawProvider.toUpperCase();
    if (mobileMoneyProviderMap[providerKey]) {
      const mapping = mobileMoneyProviderMap[providerKey];
      normalizedProvider = mapping.validation;
      backendProvider = mapping.backend;
    } else if (mobileMoneyProviderMap[providerKeyUpper]) {
      const mapping = mobileMoneyProviderMap[providerKeyUpper];
      normalizedProvider = mapping.validation;
      backendProvider = mapping.backend;
    }
  }

  const payload = { ...paymentData, type: normalizedType, provider: backendProvider };

  // Validate provider by type before sending to backend
  const allowedMobileMoneyProviders = ['MTN', 'AIRTEL'];
  const allowedCardProviders = ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'UNIONPAY', 'MAESTRO', 'OTHER', 'UNKNOWN'];

  if (normalizedType === 'mobile_money') {
    if (!allowedMobileMoneyProviders.includes(normalizedProvider)) {
      const msg = `Invalid provider '${rawProvider}' for type 'mobile_money'. Allowed: ${allowedMobileMoneyProviders.join(', ')}`;
      const err: any = new Error(msg);
      err.status = 400;
      err.response = { status: 400, data: { success: false, message: msg } };
      throw err;
    }
  } else if (normalizedType === 'card') {
    if (!allowedCardProviders.includes(normalizedProvider)) {
      const msg = `Invalid provider '${normalizedProvider}' for type 'card'. Allowed: ${allowedCardProviders.join(', ')}`;
      const err: any = new Error(msg);
      err.status = 400;
      err.response = { status: 400, data: { success: false, message: msg } };
      throw err;
    }
  }

  const response = await axios.post(
    `${API_BASE_URL}/payment-methods`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

export async function processPaymentTransaction(paymentData: any, token?: string) {
  const response = await axios.post(
    `${API_BASE_URL}/payment-transactions/process`,
    paymentData,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

// Payment Providers (for booking flows)
export interface BookingPaymentProvider {
  id: string;
  provider_name: string;
  provider_type: string; // 'card' | 'mobile_money' | 'bank' | 'wallet'
  display_name: string;
  logo_url?: string;
  supported_currencies?: string[];
}

export async function fetchPaymentProviders(token?: string): Promise<BookingPaymentProvider[]> {
  const url = `${API_BASE_URL}/payment-providers`;
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(url, { headers });
    const data = response.data?.data?.data ?? response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

// Fetch payment providers by country (same shape used in admin)
export interface CountryPaymentProvidersResponse {
  country_id?: string;
  country_name?: string;
  country_code?: string;
  providers: BookingPaymentProvider[];
  mobile_money_providers?: BookingPaymentProvider[];
  card_providers?: BookingPaymentProvider[];
  bank_transfer_providers?: BookingPaymentProvider[];
  digital_wallet_providers?: BookingPaymentProvider[];
  active_providers?: BookingPaymentProvider[];
  supported_currencies?: string[];
}

export async function fetchPaymentProvidersByCountry(countryId: string, token?: string): Promise<CountryPaymentProvidersResponse | null> {
  if (!countryId) return null;
  const url = `${API_BASE_URL}/payment-providers/country/${countryId}`;
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(url, { headers });
    const data = response.data?.data ?? response.data ?? null;
    if (!data) return null;
    // Normalize to ensure providers array exists
    return {
      providers: Array.isArray(data.providers) ? data.providers : [],
      mobile_money_providers: Array.isArray(data.mobile_money_providers) ? data.mobile_money_providers : undefined,
      card_providers: Array.isArray(data.card_providers) ? data.card_providers : undefined,
      bank_transfer_providers: Array.isArray(data.bank_transfer_providers) ? data.bank_transfer_providers : undefined,
      digital_wallet_providers: Array.isArray(data.digital_wallet_providers) ? data.digital_wallet_providers : undefined,
      active_providers: Array.isArray(data.active_providers) ? data.active_providers : undefined,
      supported_currencies: Array.isArray(data.supported_currencies) ? data.supported_currencies : undefined,
      country_id: data.country_id,
      country_name: data.country_name,
      country_code: data.country_code,
    };
  } catch (error) {
    return null;
  }
}

// Live currency conversion via backend API
export async function convertCurrencyLive(params: { from: string; to: string; amount: number }, token?: string): Promise<{ amount: number; rate: number; timestamp?: string }> {
  const { from, to, amount } = params;
  const url = `${API_BASE_URL}/currency/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(String(amount))}`;
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(url, { headers });
    const data = response.data?.data || response.data;
    const convertedAmount = Number(data?.amount ?? data?.converted_amount ?? data?.result ?? 0);
    const rate = Number(data?.rate ?? data?.exchange_rate ?? (convertedAmount && amount ? convertedAmount / amount : 0));
    const timestamp = data?.timestamp || data?.date || undefined;
    if (!convertedAmount || !rate) throw new Error('Invalid conversion response');
    return { amount: convertedAmount, rate, timestamp };
  } catch (err) {
    // Bubble up for caller to optionally fallback
    throw err as any;
  }
}

// Fetch booking by ID
export async function fetchBookingById(bookingId: string, token: string) {
  const url = `${API_BASE_URL}/bookings/${bookingId}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Booking retrieved successfully'
    };
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch booking',
      data: null
    };
  }
}

// Owner confirms booking
export async function confirmBookingByOwner(bookingId: string, notes?: string, token?: string) {
  const url = `${API_BASE_URL}/bookings/${bookingId}/owner-confirm`;
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, { notes }, { headers });
    
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Booking confirmed successfully'
    };
  } catch (error: any) {
    console.error('Error confirming booking:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to confirm booking',
      data: null
    };
  }
}

// Owner rejects booking
export async function rejectBookingByOwner(bookingId: string, reason: string, notes?: string, token?: string) {
  const url = `${API_BASE_URL}/bookings/${bookingId}/owner-reject`;
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.post(url, { reason, notes }, { headers });
    
    return {
      success: true,
      data: response.data?.data || response.data,
      message: response.data?.message || 'Booking rejected successfully'
    };
  } catch (error: any) {
    console.error('Error rejecting booking:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to reject booking',
      data: null
    };
  }
}