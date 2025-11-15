import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Types
export interface ThirdPartyInspectionRequest {
  productId: string;
  categoryId: string;
  bookingId: string; // Required - third-party inspections must be linked to a booking
  scheduledAt: string; // ISO date string
  location?: string;
  notes?: string;
  priority?: 'low' | 'normal' | 'high';
  inspectionTier?: 'standard' | 'advanced';
  currency?: string;
  countryId?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  preferredLanguage?: string;
}

export interface InspectionPaymentRequest {
  paymentMethodId: string;
  amount: number;
  currency: string;
  provider?: string;
}

export interface OwnerBooking {
  id: string;
  booking_number: string;
  status: string;
  start_date: string;
  end_date: string;
  renter_id: string;
  created_at: string;
  total_amount: number;
  payment_status: string;
  renter?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface ThirdPartyInspection {
  id: string;
  productId: string;
  bookingId?: string;
  status: string;
  inspectionCost: number;
  currency: string;
  inspectionTier: 'standard' | 'advanced';
  scheduledAt: string;
  paymentRequired?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableInspector {
  inspectorId: string;
  inspectorName: string;
  certificationLevel: 'certified' | 'expert' | 'master';
  certificationType: string;
  averageRating: number;
  totalInspections: number;
  specializations?: string[];
  distance?: number;
  countryId?: string;
  region?: string;
  internationallyRecognized?: boolean;
  languages?: string[];
}

/**
 * Get bookings for a product owner
 */
export async function getOwnerBookings(productId: string, token: string): Promise<OwnerBooking[]> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/third-party-inspections/bookings/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data?.data || [];
  } catch (error: any) {
    console.error('Error fetching owner bookings:', error);
    throw error;
  }
}

/**
 * Create third-party inspection request
 */
export async function createThirdPartyInspection(
  request: ThirdPartyInspectionRequest,
  token: string
): Promise<ThirdPartyInspection> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/third-party-inspections`,
      request,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('Error creating inspection:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error message:', error.response?.data?.message || error.response?.data?.error || error.message);
    
    // Extract the actual error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to create inspection request';
    
    throw new Error(errorMessage);
  }
}

/**
 * Process inspection payment
 */
export async function processInspectionPayment(
  inspectionId: string,
  payment: InspectionPaymentRequest,
  token: string
): Promise<any> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/third-party-inspections/${inspectionId}/pay`,
      payment,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error('Error processing payment:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

/**
 * Get available inspectors for a category and location
 */
export async function getAvailableInspectors(
  categoryId: string,
  locationParams?: {
    countryId?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    preferredLanguage?: string;
  },
  token?: string
): Promise<AvailableInspector[]> {
  try {
    const params = new URLSearchParams();
    params.append('categoryId', categoryId);
    
    if (locationParams) {
      if (locationParams.countryId) params.append('countryId', locationParams.countryId);
      if (locationParams.region) params.append('region', locationParams.region);
      if (locationParams.latitude !== undefined) params.append('latitude', locationParams.latitude.toString());
      if (locationParams.longitude !== undefined) params.append('longitude', locationParams.longitude.toString());
      if (locationParams.preferredLanguage) params.append('preferredLanguage', locationParams.preferredLanguage);
    }

    const response = await axios.get(
      `${API_BASE_URL}/third-party-inspections/available-inspectors?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data?.data || [];
  } catch (error: any) {
    console.error('Error fetching available inspectors:', error);
    // Return empty array on error so user can still proceed
    return [];
  }
}

