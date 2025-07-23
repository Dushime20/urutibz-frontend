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
