import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to create auth headers
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface AdminUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  countryId: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  kyc_status: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  gender?: string | null;
  province?: string | null;
  addressLine?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  verifications: Array<{
    verification_type: string;
    verification_status: string;
    created_at: string;
    updated_at: string;
  }>;
  kycProgress: {
    required: string[];
    verified: string[];
    pending: string[];
    rejected: string[];
    completionRate: number;
  };
}

export const adminService = {
  // Fetch current admin user profile
  async getCurrentUserProfile(): Promise<AdminUserProfile> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get user ID from token or localStorage
      const userData = localStorage.getItem('user');
      let userId: string;
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        userId = parsedUser.id;
      } else {
        throw new Error('User data not found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/users/${userId}`,
        { headers: createAuthHeaders() }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching admin user profile:', error);
      throw error;
    }
  },

  // Update admin user profile
  async updateUserProfile(userId: string, payload: Partial<AdminUserProfile>): Promise<AdminUserProfile> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${userId}`,
        payload,
        { headers: createAuthHeaders() }
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update user profile');
      }
    } catch (error) {
      console.error('Error updating admin user profile:', error);
      throw error;
    }
  },

  // Upload admin user avatar
  async uploadUserAvatar(userId: string, file: File): Promise<{ profileImageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/users/${userId}/avatar`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData
          },
        }
      );

      if (response.data.success) {
        return { profileImageUrl: response.data.data.profileImageUrl };
      } else {
        throw new Error(response.data.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading admin user avatar:', error);
      throw error;
    }
  },

  // Upload avatar for any user (admin functionality)
  async uploadUserAvatarAsAdmin(userId: string, file: File): Promise<{ profileImageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/users/${userId}/avatar`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Don't set Content-Type for FormData
          },
        }
      );

      if (response.data.success) {
        return { profileImageUrl: response.data.data.profileImageUrl };
      } else {
        throw new Error(response.data.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading user avatar as admin:', error);
      throw error;
    }
  }
};
