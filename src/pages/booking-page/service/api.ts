import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

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
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to create booking',
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
  const response = await axios.post(
    `${API_BASE_URL}/payment-methods`,
    paymentData,
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