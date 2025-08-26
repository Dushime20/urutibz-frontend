import axios from 'axios';
import { Package } from 'lucide-react';
import { API_BASE_URL, createAuthHeaders, handleApiError } from './config';
import type { 
  AdminStats, 
  RecentUser, 
  RecentBooking, 
  AdminUser, 
  AdminBooking,
  PaginationResponse 
} from '../interfaces';

// Admin Dashboard Functions
export async function fetchAdminStats(token?: string): Promise<AdminStats> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
      headers: createAuthHeaders(token),
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

export async function fetchAdminUsers(
  page: number = 1,
  limit: number = 20,
  token?: string
): Promise<PaginationResponse<AdminUser>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      params: { page, limit },
      headers: createAuthHeaders(token),
    });
    console.log('Raw API Response:', response.data); // Debug log
    return response.data?.data || { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }
}

export async function fetchAdminUserById(userId: string, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (err: any) {
    console.error('Error fetching admin user by ID:', err);
    throw new Error(handleApiError(err, 'Failed to fetch admin user'));
  }
}

export async function moderateAdminUser(userId: string, data: { action: 'ban' | 'suspend' | 'activate' | 'warn'; reason?: string; duration?: number }, token?: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/users/${userId}/moderate`, data, { 
      headers: createAuthHeaders(token) 
    });
    return response.data;
  } catch (err: any) {
    console.error('Error moderating admin user:', err);
    throw new Error(handleApiError(err, 'Failed to moderate admin user'));
  }
}

export async function moderateAdminProduct(productId: string, data: { action: 'approve' | 'reject' | 'flag' | 'quarantine'; reason?: string }, token?: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/products/${productId}/moderate`, data, { 
      headers: createAuthHeaders(token) 
    });
    return response.data;
  } catch (err: any) {
    console.error('Error moderating admin product:', err);
    throw new Error(handleApiError(err, 'Failed to moderate admin product'));
  }
}

// Recent Data Functions
export async function fetchRecentUsers(limit: number = 5, token?: string): Promise<RecentUser[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      params: { page: 1, limit },
      headers: createAuthHeaders(token),
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
      headers: createAuthHeaders(token),
    });

    const bookings = response.data?.data?.items || [];

    // Fetch product images for each booking
    const bookingsWithImages = await Promise.all(bookings.map(async (booking: AdminBooking) => {
      let itemImage = '/assets/img/items/default-item.jpg'; // Default image

      try {
        const imageResponse = await axios.get(
          `${API_BASE_URL}/product-images/product/${booking.product_id}`,
          { headers: createAuthHeaders(token) }
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

// Analytics Functions
export async function fetchAdminAnalytics(token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/analytics`, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (err: any) {
    console.error('Error fetching admin analytics:', err);
    throw new Error(handleApiError(err, 'Failed to fetch admin analytics'));
  }
}

export async function fetchAdminRealtimeMetrics(token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/metrics/realtime`, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (err: any) {
    console.error('Error fetching admin realtime metrics:', err);
    throw new Error(handleApiError(err, 'Failed to fetch admin realtime metrics'));
  }
}

// Moderation Functions (Stub implementations)
export async function fetchModerationActions(token?: string): Promise<any> {
  console.warn('fetchModerationActions: Function not implemented yet');
  return { data: [] };
}

export async function fetchModerationStats(token?: string): Promise<any> {
  console.warn('fetchModerationStats: Function not implemented yet');
  return { data: { totalActions: 0, actionsByType: {}, actionsByResource: {}, recentActions: 0 } };
}

export async function fetchProductModerationActions(productId: string, token?: string): Promise<any> {
  console.warn('fetchProductModerationActions: Function not implemented yet');
  return { data: [] };
}

// Report Generation Functions (Stub implementations)
export async function generateRevenueReport(filters?: any, token?: string): Promise<any> {
  console.warn('generateRevenueReport: Function not implemented yet');
  return { data: { totalRevenue: 0, revenueByPeriod: [], topProducts: [] } };
}

export async function generateUserReport(filters?: any, token?: string): Promise<any> {
  console.warn('generateUserReport: Function not implemented yet');
  return { data: { totalUsers: 0, newUsers: 0, activeUsers: 0, userGrowth: [] } };
}

export async function generateBookingReport(filters?: any, token?: string): Promise<any> {
  console.warn('generateBookingReport: Function not implemented yet');
  return { data: { totalBookings: 0, completedBookings: 0, cancelledBookings: 0, bookingTrends: [] } };
}

export async function generateProductReport(filters?: any, token?: string): Promise<any> {
  console.warn('generateProductReport: Function not implemented yet');
  return { data: { totalProducts: 0, activeProducts: 0, popularProducts: [], productPerformance: [] } };
}

export async function generateTransactionReport(filters?: any, token?: string): Promise<any> {
  console.warn('generateTransactionReport: Function not implemented yet');
  return { data: { totalTransactions: 0, successfulTransactions: 0, failedTransactions: 0, transactionVolume: [] } };
}

export async function generatePerformanceReport(filters?: any, token?: string): Promise<any> {
  console.warn('generatePerformanceReport: Function not implemented yet');
  return { data: { systemUptime: 100, responseTime: 0, errorRate: 0, performanceMetrics: [] } };
}

export async function fetchCustomReports(token?: string): Promise<any[]> {
  console.warn('fetchCustomReports: Function not implemented yet');
  return [];
}

export async function createCustomReport(data: any, token?: string): Promise<any> {
  console.warn('createCustomReport: Function not implemented yet');
  return { id: 'temp-id', ...data, created_at: new Date().toISOString() };
}

export async function deleteCustomReport(id: string, token?: string): Promise<void> {
  console.warn('deleteCustomReport: Function not implemented yet');
  // Return void as expected
}

export async function exportReport(reportType: string, format: string, filters?: any, token?: string): Promise<Blob> {
  console.warn('exportReport: Function not implemented yet');
  // Return a mock blob for now
  const mockData = `Mock ${reportType} report in ${format} format`;
  return new Blob([mockData], { type: 'text/plain' });
}
