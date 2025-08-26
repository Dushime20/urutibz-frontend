import axios from 'axios';
import { API_BASE_URL, createAuthHeaders, createJsonHeaders, handleApiError } from './config';
import type { AdminBooking, PaginationResponse, BookingOverridePayload } from '../interfaces';

// Booking Management Functions
export async function fetchAdminBookings(
  page: number = 1,
  limit: number = 20,
  token?: string
): Promise<PaginationResponse<AdminBooking>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/bookings`, {
      params: { page, limit },
      headers: createAuthHeaders(token),
    });
    return response.data?.data || { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }
}

export async function updateBooking(bookingId: string, data: any, token?: string) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/bookings/${bookingId}`,
      data,
      { headers: createJsonHeaders(token) }
    );
    return { data: response.data, error: null };
  } catch (error: any) {
    const errorMsg = handleApiError(error, 'Failed to update booking');
    return { data: null, error: errorMsg };
  }
}

export async function fetchAdminBookingById(bookingId: string, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/bookings/${bookingId}`, { 
      headers: createJsonHeaders(token) 
    });
    return response.data;
  } catch (err: any) {
    console.error('Error fetching admin booking details:', err);
    throw new Error(handleApiError(err, 'Failed to fetch booking details'));
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
    const headers = createJsonHeaders(token);

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
