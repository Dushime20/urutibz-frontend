import axios from 'axios';
import type {
  UserProfile,
  UserProfileUpdate,
  UserStatusUpdate,
  UserRoleUpdate,
  UserVerificationUpdate,
  UserSearchFilters,
  UserProfileStats,
  UserActivity,
  UserSession
} from '../../../types/user';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

export class UserProfileService {
  private static getAuthHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Get user profile by ID
  static async getUserProfile(userId: string, token?: string): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch user profile';
      console.error('Error fetching user profile:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  // Get all users with filters
  static async getAllUsers(filters: UserSearchFilters = {}, token?: string): Promise<{ data: UserProfile[]; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: this.getAuthHeaders(token),
        params: filters,
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch users';
      console.error('Error fetching users:', errorMsg);
      return { data: [], error: errorMsg };
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: UserProfileUpdate, token?: string): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, updates, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update user profile';
      console.error('Error updating user profile:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  // Update user status
  static async updateUserStatus(userId: string, statusUpdate: UserStatusUpdate, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.patch(`${API_BASE_URL}/users/${userId}/status`, statusUpdate, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update user status';
      console.error('Error updating user status:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Update user role
  static async updateUserRole(userId: string, roleUpdate: UserRoleUpdate, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.patch(`${API_BASE_URL}/users/${userId}/role`, roleUpdate, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update user role';
      console.error('Error updating user role:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Update verification status
  static async updateVerificationStatus(userId: string, verificationUpdate: UserVerificationUpdate, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.patch(`${API_BASE_URL}/users/${userId}/verification`, verificationUpdate, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update verification status';
      console.error('Error updating verification status:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Delete user
  static async deleteUser(userId: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to delete user';
      console.error('Error deleting user:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Get user statistics
  static async getUserStats(token?: string): Promise<{ data: UserProfileStats | null; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/stats`, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch user statistics';
      console.error('Error fetching user statistics:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  // Get user activity
  static async getUserActivity(userId: string, page = 1, limit = 50, token?: string): Promise<{ data: UserActivity[]; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/activity`, {
        headers: this.getAuthHeaders(token),
        params: { page, limit },
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch user activity';
      console.error('Error fetching user activity:', errorMsg);
      return { data: [], error: errorMsg };
    }
  }

  // Get user sessions
  static async getUserSessions(userId: string, token?: string): Promise<{ data: UserSession[]; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/sessions`, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch user sessions';
      console.error('Error fetching user sessions:', errorMsg);
      return { data: [], error: errorMsg };
    }
  }

  // Revoke user session
  static async revokeUserSession(userId: string, sessionId: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}/sessions/${sessionId}`, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to revoke user session';
      console.error('Error revoking user session:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Revoke all user sessions
  static async revokeAllUserSessions(userId: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}/sessions`, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to revoke all user sessions';
      console.error('Error revoking all user sessions:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Send verification email
  static async sendVerificationEmail(userId: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.post(`${API_BASE_URL}/users/${userId}/send-verification-email`, {}, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to send verification email';
      console.error('Error sending verification email:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Reset user password
  static async resetUserPassword(userId: string, newPassword: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.post(`${API_BASE_URL}/users/${userId}/reset-password`, { newPassword }, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to reset user password';
      console.error('Error resetting user password:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Export users data
  static async exportUsers(filters: UserSearchFilters = {}, format: 'csv' | 'excel' = 'csv', token?: string): Promise<{ data: Blob | null; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/export`, {
        headers: this.getAuthHeaders(token),
        params: { ...filters, format },
        responseType: 'blob',
      });
      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to export users data';
      console.error('Error exporting users data:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  // Bulk update users
  static async bulkUpdateUsers(userIds: string[], updates: Partial<UserProfileUpdate>, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.patch(`${API_BASE_URL}/users/bulk-update`, { userIds, updates }, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to bulk update users';
      console.error('Error bulk updating users:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Bulk delete users
  static async bulkDeleteUsers(userIds: string[], token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.delete(`${API_BASE_URL}/users/bulk-delete`, {
        headers: this.getAuthHeaders(token),
        data: { userIds },
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to bulk delete users';
      console.error('Error bulk deleting users:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }
}
