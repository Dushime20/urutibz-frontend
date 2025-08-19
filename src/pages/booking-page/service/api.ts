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