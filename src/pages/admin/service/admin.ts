import axios from 'axios';
import { Package } from 'lucide-react';
import { API_BASE_URL, createAuthHeaders, handleApiError, processApiResponse } from './config';
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
    
    return response.data?.data || { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }
}

// Admin user registration interface
export interface AdminUserRegistration {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'renter' | 'inspector' | 'admin';
}

// Register new user as admin
export async function registerUserAsAdmin(
  userData: AdminUserRegistration,
  token?: string
): Promise<{ success: boolean; data?: AdminUser; error?: string }> {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/users/register`, userData, {
      headers: createAuthHeaders(token),
    });
    
    return {
      success: true,
      data: response.data?.data,
      error: undefined
    };
  } catch (error: any) {
    console.error('Error registering user as admin:', error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to register user';
    return {
      success: false,
      data: undefined,
      error: errorMessage
    };
  }
}

// Inspections Management Functions
export async function fetchAllInspections(
  page: number = 1,
  limit: number = 20,
  token?: string
): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/inspections`, {
      params: { page, limit },
      headers: createAuthHeaders(token),
    });
    return response.data?.data || { data: [], total: 0, page: 1, limit: 20 };
  } catch (error) {
    console.error('Error fetching inspections:', error);
    throw error;
  }
}

export async function fetchInspectionSummary(token?: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/inspections/summary`, {
      headers: createAuthHeaders(token),
    });
    return response.data?.data || null;
  } catch (error) {
    console.error('Error fetching inspection summary:', error);
    throw error;
  }
}

export async function fetchAllDisputes(
  page: number = 1,
  limit: number = 20,
  token?: string
): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/inspections/admin/disputes`, {
      params: { page, limit },
      headers: createAuthHeaders(token),
    });
    
    // Handle the API response structure: { success, message, data: { disputes, pagination } }
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    // Fallback to empty structure if API response is unexpected
    return { disputes: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  } catch (error) {
    console.error('Error fetching disputes:', error);
    throw error;
  }
}

export async function resolveDispute(
  inspectionId: string,
  disputeId: string,
  data: { resolutionNotes: string; agreedAmount?: number },
  token?: string
): Promise<any> {
  try {
    const response = await axios.put(`${API_BASE_URL}/inspections/admin/disputes/${disputeId}/resolve`, data, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error('Error resolving dispute:', error);
    throw error;
  }
}

// Add item to inspection (Admin function)
export async function addInspectionItem(
  inspectionId: string,
  data: {
    itemName: string;
    description: string;
    condition: string;
    notes: string;
    repairCost: number;
    replacementCost: number;
  },
  token?: string
): Promise<any> {
  try {
    const response = await axios.post(`${API_BASE_URL}/inspections/admin/${inspectionId}/items`, data, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error('Error adding inspection item:', error);
    throw error;
  }
}

// Update inspection item (Admin function)
export async function updateInspectionItem(
  inspectionId: string,
  itemId: string,
  data: Partial<{
    itemName: string;
    description: string;
    condition: string;
    notes: string;
    repairCost: number;
    replacementCost: number;
  }>,
  token?: string
): Promise<any> {
  try {
    const response = await axios.put(`${API_BASE_URL}/inspections/admin/${inspectionId}/items/${itemId}`, data, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error('Error updating inspection item:', error);
    throw error;
  }
}

// Delete inspection item (Admin function)
export async function deleteInspectionItem(
  inspectionId: string,
  itemId: string,
  token?: string
): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/inspections/admin/${inspectionId}/items/${itemId}`, {
      headers: createAuthHeaders(token),
    });
  } catch (error) {
    console.error('Error deleting inspection item:', error);
    throw error;
  }
}

export async function fetchAdminUserById(userId: string, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: createAuthHeaders(token),
    });
    const payload = response.data;
    // Normalize to always return the user object
    if (payload?.success && payload?.data) return payload.data;
    if (payload?.data) return payload.data;
    return payload;
  } catch (err: any) {
    console.error('Error fetching admin user by ID:', err);
    throw new Error(handleApiError(err, 'Failed to retrieve user details'));
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
        avatar: user.profile_image || user.profileImageUrl || defaultAvatar,
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

// Moderation Functions
export async function fetchModerationActions(token?: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/moderation/actions`, {
      headers: createAuthHeaders(token)
    });
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error fetching moderation actions:', err);
    throw new Error(handleApiError(err, 'Failed to fetch moderation actions'));
  }
}

export async function fetchModerationStats(token?: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/moderation/stats`, {
      headers: createAuthHeaders(token)
    });
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error fetching moderation stats:', err);
    throw new Error(handleApiError(err, 'Failed to fetch moderation stats'));
  }
}

export async function fetchProductModerationActions(productId: string, token?: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/moderation/products/${productId}/actions`, {
      headers: createAuthHeaders(token)
    });
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error fetching product moderation actions:', err);
    throw new Error(handleApiError(err, 'Failed to fetch product moderation actions'));
  }
}

export async function fetchModeratorDetails(moderatorId: string, token?: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users/${moderatorId}`, {
      headers: createAuthHeaders(token)
    });
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error fetching moderator details:', err);
    // Return a fallback object if moderator details can't be fetched
    return { data: { id: moderatorId, name: 'Unknown Moderator', email: 'unknown@example.com' } };
  }
}

// Report Generation Functions (Stub implementations)
export async function generateRevenueReport(filters?: any, token?: string): Promise<any> {
  try {
    // Derive a period string from date range (fallback to 30d)
    const start = filters?.startDate ? new Date(filters.startDate) : null;
    const end = filters?.endDate ? new Date(filters.endDate) : null;
    let period = '30d';
    if (start && end) {
      const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      if (diffDays <= 7) period = '7d';
      else if (diffDays <= 30) period = '30d';
      else period = '90d';
    }

    const response = await axios.get(`${API_BASE_URL}/admin/analytics`, {
      headers: createAuthHeaders(token),
      params: { period, granularity: 'day' },
    });

    // Debug: raw analytics payload
    console.log('[Reports] generateRevenueReport raw payload:', response?.data);

    const data = response.data?.data || response.data;
    const revenueData = data?.revenueData || {};
    const topProducts = data?.topProducts || [];

    const totalRevenue = revenueData?.total || revenueData?.totalRevenue || 0;
    const totalBookings = revenueData?.totalBookings || 0;
    const averageBookingValue = totalBookings ? totalRevenue / totalBookings : 0;

    const categoryBreakdown = revenueData?.byCategory || revenueData?.categoryBreakdown || [];
    let revenueByCategory: Array<{ category: string; revenue: number; bookings: number }>; 

    if (Array.isArray(categoryBreakdown) && categoryBreakdown.length) {
      revenueByCategory = categoryBreakdown.map((c: any) => ({
        category: c.category || c.name || 'Uncategorized',
        revenue: c.revenue || c.total || 0,
        bookings: c.bookings || 0,
      }));
    } else {
      // Fallback: synthesize from topProducts if needed
      const map: Record<string, { revenue: number; bookings: number }> = {};
      (topProducts as any[]).forEach((p) => {
        const key = p.category || 'Uncategorized';
        if (!map[key]) map[key] = { revenue: 0, bookings: 0 };
        map[key].revenue += p.revenue || 0;
        map[key].bookings += p.bookings || 0;
      });
      revenueByCategory = Object.keys(map).map((k) => ({ category: k, revenue: map[k].revenue, bookings: map[k].bookings }));
    }

    const result = {
      totalRevenue,
      totalBookings,
      averageBookingValue,
      period: `${filters?.startDate || 'N/A'} to ${filters?.endDate || 'N/A'}`,
      revenueByCategory,
    };

    // Debug: computed revenue report
    console.log('[Reports] generateRevenueReport computed:', result);

    return result;
  } catch (err) {
    console.error('Error generating revenue report:', err);
    return { totalRevenue: 0, totalBookings: 0, averageBookingValue: 0, period: 'N/A', revenueByCategory: [] };
  }
}

export async function generateUserReport(filters?: any, token?: string): Promise<any> {
  try {
    // Fetch users list with optional date range filters
    const params: Record<string, string> = {};
    if (filters?.startDate) params['startDate'] = filters.startDate;
    if (filters?.endDate) params['endDate'] = filters.endDate;

    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: createAuthHeaders(token),
      params,
    });

    // Debug: raw payload structure
    console.log('[Reports] generateUserReport raw payload:', response?.data);

    const usersPayload = response?.data;
    const usersList = usersPayload?.data?.items || usersPayload?.data || usersPayload?.items || [];

    // Fallback to helper if needed
    let users: any[] = Array.isArray(usersList) ? usersList : [];
    if (!users.length) {
      const processed: any = processApiResponse(response);
      if (processed && Array.isArray(processed.items)) users = processed.items as any[];
      else if (Array.isArray(processed)) users = processed as any[];
    }

    const toDate = filters?.endDate ? new Date(filters.endDate) : new Date();
    const fromDate = filters?.startDate ? new Date(filters.startDate) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const withinRange = (dateStr?: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= fromDate && d <= toDate;
    };

    const totalUsers = users.length;
    const newUsers = users.filter(u => withinRange(u.created_at || u.createdAt)).length;
    const activeUsers = users.filter(u => u.isActive === true || u.active === true || u.status === 'active').length;
    const verifiedUsers = users.filter(u => u.is_verified === true || u.verified === true || u.kyc_status === 'verified').length;

    const topUsers = users
      .map(u => ({
        userId: u.id,
        name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.name || u.email || 'Unknown',
        email: u.email,
        bookings: u.bookingsCount || u.totalBookings || 0,
        revenue: u.revenue || u.totalRevenue || 0,
      }))
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 10);

    // Debug: computed aggregates
    console.log('[Reports] generateUserReport computed:', {
      totalUsers,
      newUsers,
      activeUsers,
      verifiedUsers,
      sampleUser: users[0]
    });

    return {
      totalUsers,
      newUsers,
      activeUsers,
      verifiedUsers,
      period: `${fromDate.toISOString().split('T')[0]} to ${toDate.toISOString().split('T')[0]}`,
      topUsers,
    };
  } catch (err: any) {
    console.error('Error generating user report:', err);
    // Fallback minimal structure
    return {
      totalUsers: 0,
      newUsers: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      period: 'N/A',
      topUsers: [],
    };
  }
}

export async function generateBookingReport(filters?: any, token?: string): Promise<any> {
  try {
    const params: Record<string, string> = {};
    // Derive timeframe the backend expects (7d/30d/90d)
    const start = filters?.startDate ? new Date(filters.startDate) : null;
    const end = filters?.endDate ? new Date(filters.endDate) : null;
    let timeframe = '30d';
    if (start && end) {
      const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      if (diffDays <= 7) timeframe = '7d';
      else if (diffDays <= 30) timeframe = '30d';
      else timeframe = '90d';
    }
    params['timeframe'] = timeframe;

    const response = await axios.get(`${API_BASE_URL}/bookings/analytics`, {
      headers: createAuthHeaders(token),
      params,
    });

    console.log('[Reports] generateBookingReport raw payload:', response?.data);

    const data = response.data?.data || response.data || {};

    // New structured payload from AnalyticsService
    const metrics = data?.metrics?.current;
    const statusDistribution = Array.isArray(data?.statusDistribution) ? data.statusDistribution : [];

    let totalBookings = metrics?.totalBookings ?? data?.total_bookings ?? data?.totalBookings ?? 0;
    let totalRevenue = metrics?.totalRevenue ?? data?.total_revenue ?? data?.totalRevenue ?? 0;
    const averageBookingValue = metrics?.averageBookingValue ?? data?.average_booking_value ?? data?.averageBookingValue ?? (totalBookings ? totalRevenue / totalBookings : 0);

    // Map bookings by status from either flat object or statusDistribution array
    let bookingsByStatus: Array<{ status: string; count: number; percentage: number }>; 
    if (statusDistribution.length > 0) {
      const totalForPct = statusDistribution.reduce((sum: number, s: any) => sum + (parseInt(s.count) || s.count || 0), 0) || totalBookings || 1;
      bookingsByStatus = statusDistribution.map((s: any) => ({
        status: s.status,
        count: parseInt(s.count) || s.count || 0,
        percentage: Math.round(((parseInt(s.count) || s.count || 0) / totalForPct) * 100)
      }));
    } else {
      const bookingsByStatusObj = data?.bookings_by_status || data?.bookingsByStatus || {};
      bookingsByStatus = Object.keys(bookingsByStatusObj).map((status) => ({
        status,
        count: bookingsByStatusObj[status] || 0,
        percentage: totalBookings ? Math.round(((bookingsByStatusObj[status] || 0) / totalBookings) * 100) : 0,
      }));
    }

    // Fallback: if analytics returned 0, try admin bookings list to get pagination total
    if (!totalBookings) {
      const listResp = await axios.get(`${API_BASE_URL}/admin/bookings`, {
        headers: createAuthHeaders(token),
        params: { page: 1, limit: 1 },
      });
      const listData = listResp.data?.data || listResp.data || {};
      const paginationTotal = listData?.pagination?.total ?? listData?.total ?? 0;
      if (paginationTotal) totalBookings = paginationTotal;
    }

    const result = {
      totalBookings,
      totalRevenue,
      averageBookingValue,
      period: `${filters?.startDate || 'N/A'} to ${filters?.endDate || 'N/A'}`,
      bookingsByStatus,
      // Support multiple shapes: trends.revenue, revenue_over_time, revenueOverTime
      revenueOverTime: (data?.trends?.revenue) || data?.revenue_over_time || data?.revenueOverTime || [],
      completedBookings: bookingsByStatus.find(s => s.status === 'completed')?.count || 0,
      cancelledBookings: bookingsByStatus.find(s => s.status === 'cancelled')?.count || 0,
    };

    console.log('[Reports] generateBookingReport computed:', result);

    return result;
  } catch (err) {
    console.error('Error generating booking report:', err);
    return {
      totalBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      period: 'N/A',
      bookingsByStatus: [],
      revenueOverTime: [],
    };
  }
}

export async function generateProductReport(filters?: any, token?: string): Promise<any> {
  try {
    const period = (() => {
      if (filters?.startDate && filters?.endDate) {
        const diffDays = Math.max(1, Math.round((new Date(filters.endDate).getTime() - new Date(filters.startDate).getTime()) / (1000*60*60*24)));
        if (diffDays <= 7) return '7d';
        if (diffDays <= 30) return '30d';
        if (diffDays <= 90) return '90d';
        return '1y';
      }
      return '30d';
    })();

    const analyticsResp = await axios.get(`${API_BASE_URL}/admin/products/analytics`, {
      headers: createAuthHeaders(token),
      params: { period }
    });
    const data = analyticsResp.data?.data || analyticsResp.data || {};
    const totals = data?.totals || {};
    const resultFromAnalytics = {
      totalProducts: totals.totalProducts || 0,
      activeProducts: totals.activeProducts || 0,
      rentedProducts: totals.rentedProducts || 0,
      period: period,
      topProducts: (data.topProducts || []).map((p: any) => ({
        name: p.title || 'Unnamed',
        category: p.category || 'General',
        bookings: p.bookings || 0,
        revenue: p.revenue || 0,
      })),
    };
    console.log('[Reports] generateProductReport (analytics) computed:', resultFromAnalytics);
    return resultFromAnalytics;
  } catch (err) {
    console.error('Error generating product report:', err);
    return {
      totalProducts: 0,
      activeProducts: 0,
      rentedProducts: 0,
      period: 'N/A',
      topProducts: [],
    };
  }
}

export async function generateTransactionReport(filters?: any, token?: string): Promise<any> {
  try {
    const params: Record<string, string> = {};
    if (filters?.startDate) params['created_after'] = filters.startDate;
    if (filters?.endDate) params['created_before'] = filters.endDate;

    const response = await axios.get(`${API_BASE_URL}/payment-transactions/stats`, {
      headers: createAuthHeaders(token),
      params,
    });

    // Debug: raw stats payload
    console.log('[Reports] generateTransactionReport raw payload:', response?.data);

    const data = response.data?.data || response.data;

    const totalTransactions = data?.totalCount || data?.totalTransactions || 0;
    const totalAmount = data?.totalAmount || data?.sumAmount || 0;
    const successfulTransactions = data?.statusBreakdown?.completed || 0;

    const transactionsByType: Array<{ type: string; count: number; amount: number }> = [];
    const typeCounts = data?.transactionTypeBreakdown || data?.typeCounts || {};
    Object.keys(typeCounts).forEach((type) => {
      transactionsByType.push({ type, count: typeCounts[type] || 0, amount: 0 });
    });

    const monthlyTrends = Array.isArray(data?.monthlyTrends || data?.monthly_trends)
      ? (data.monthlyTrends || data.monthly_trends).map((t: any) => ({
          month: t.month,
          count: t.count,
          amount: t.amount
        }))
      : [];

    const result = {
      totalTransactions,
      totalAmount,
      successfulTransactions,
      period: `${filters?.startDate || 'N/A'} to ${filters?.endDate || 'N/A'}`,
      transactionsByType,
      monthlyTrends,
    };

    // Debug: computed transaction report
    console.log('[Reports] generateTransactionReport computed:', result);

    return result;
  } catch (err) {
    console.error('Error generating transaction report:', err);
    return {
      totalTransactions: 0,
      totalAmount: 0,
      successfulTransactions: 0,
      period: 'N/A',
      transactionsByType: [],
    };
  }
}

export async function generatePerformanceReport(filters?: any, token?: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/performance/metrics`, {
      headers: createAuthHeaders(token),
    });

    // Debug: raw performance payload
    console.log('[Reports] generatePerformanceReport raw payload:', response?.data);

    const metrics = response.data?.data || response.data;

    const apiAvg = metrics?.api?.avgResponseTime || 0;
    const apiErrorRatePct = (metrics?.api?.errorRate || 0) * 100;
    const cacheHitPct = (metrics?.cache?.hitRate || 0) * 100;

    const performanceMetrics = [
      { metric: 'Response Time (ms)', value: apiAvg, target: 300, status: apiAvg <= 300 ? 'good' : apiAvg <= 500 ? 'warning' : 'poor' },
      { metric: 'Error Rate (%)', value: apiErrorRatePct, target: 1, status: apiErrorRatePct <= 1 ? 'good' : apiErrorRatePct <= 5 ? 'warning' : 'poor' },
      { metric: 'Cache Hit Rate (%)', value: cacheHitPct, target: 80, status: cacheHitPct >= 80 ? 'good' : cacheHitPct >= 60 ? 'warning' : 'poor' },
    ] as any;

    // Fetch history for trends
    let apiTrend: Array<{ date: string; value: number }> = [];
    try {
      const histResp = await axios.get(`${API_BASE_URL}/performance/metrics/history`, {
        headers: createAuthHeaders(token),
        params: { hours: 6 },
      });
      const history = histResp.data?.data || [];
      apiTrend = history.map((h: any) => ({ date: h.timestamp, value: h.api?.avgResponseTime || 0 }));
    } catch (e) {
      // ignore
    }

    const result = {
      totalRevenue: 0,
      totalBookings: 0,
      averageRating: 0,
      period: `${filters?.startDate || 'N/A'} to ${filters?.endDate || 'N/A'}`,
      performanceMetrics,
      performanceTrend: apiTrend,
    };

    // Debug: computed performance report
    console.log('[Reports] generatePerformanceReport computed:', result);

    return result;
  } catch (err) {
    console.error('Error generating performance report:', err);
    return {
      totalRevenue: 0,
      totalBookings: 0,
      averageRating: 0,
      period: 'N/A',
      performanceMetrics: [],
    };
  }
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
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/export`,
      {
        type: reportType,
        filters: filters || {},
        format,
      },
      { headers: createAuthHeaders(token) }
    );

    // If backend returns a downloadable URL, prefer it
    const data = response.data?.data || response.data;
    if (data?.url) {
      const fileResp = await axios.get(data.url, { responseType: 'blob' });
      return fileResp.data as Blob;
    }

    // Otherwise, serialize the response to a file-like blob according to requested format
    const payload = data || response.data || { success: true };

    if (format === 'json') {
      return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    }

    // Minimal CSV/Excel-compatible text (tabular not guaranteed). Provide a simple key/value export.
    const flat = typeof payload === 'object' ? payload : { result: String(payload) };
    const lines: string[] = [];
    const walk = (obj: any, prefix: string = '') => {
      Object.keys(obj || {}).forEach((k) => {
        const v = (obj as any)[k];
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          walk(v, key);
        } else {
          lines.push(`${key},${JSON.stringify(v)}`);
        }
      });
    };
    walk(flat);
    const csvText = ['key,value', ...lines].join('\n');

    const mime = format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel';
    return new Blob([csvText], { type: mime });
  } catch (error) {
    console.error('Error exporting report:', error);
    const fallback = `Export failed for ${reportType} in ${format}`;
    return new Blob([fallback], { type: 'text/plain' });
  }
}

// Verification Management Functions
export async function fetchAllVerifications(
  page: number = 1,
  limit: number = 20,
  filters?: any,
  token?: string
): Promise<any> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.verification_type) params.append('verification_type', filters.verification_type);
    if (filters?.ai_processing_status) params.append('ai_processing_status', filters.ai_processing_status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);

    const response = await axios.get(`${API_BASE_URL}/admin/verifications`, {
      params,
      headers: createAuthHeaders(token),
    });
    
    // Handle the API response structure: { success, message, data: { verifications, pagination } }
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    // Fallback to empty structure if API response is unexpected
    return { verifications: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  } catch (error) {
    console.error('Error fetching verifications:', error);
    throw error;
  }
}

export async function updateVerificationStatus(
  verificationId: string,
  data: { verification_status: 'verified' | 'rejected'; notes?: string },
  token?: string
): Promise<any> {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/verifications/${verificationId}/status`, data, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error('Error updating verification status:', error);
    throw error;
  }
}

export async function getVerificationById(
  verificationId: string,
  token?: string
): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/verifications/${verificationId}`, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching verification by ID:', error);
    throw error;
  }
}

export async function getVerificationStats(token?: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/verifications/stats`, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching verification stats:', error);
    throw error;
  }
}

export async function bulkUpdateVerifications(
  verificationIds: string[],
  data: { verification_status: 'verified' | 'rejected'; notes?: string },
  token?: string
): Promise<any> {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/verifications/bulk-update`, {
      verification_ids: verificationIds,
      ...data
    }, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating verifications:', error);
    throw error;
  }
}

// Bulk review verifications using the bulk-review endpoint
export async function bulkReviewVerifications(
  verificationIds: string[],
  status: 'verified' | 'rejected',
  notes?: string,
  token?: string
): Promise<any> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/verifications/bulk-review`,
      {
        verificationIds,
        status,
        notes,
      },
      {
        headers: createAuthHeaders(token),
      }
    );

    return processApiResponse(response);
  } catch (error) {
    console.error('Error bulk reviewing verifications:', error);
    throw error;
  }
}

// Reject a specific verification
export async function rejectVerification(
  verificationId: string,
  notes: string,
  token?: string
): Promise<any> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/verifications/${verificationId}/reject`,
      {
        notes,
      },
      {
        headers: createAuthHeaders(token),
      }
    );
    return processApiResponse(response);
  } catch (error) {
    console.error('Error rejecting verification:', error);
    throw error;
  }
}

// Fetch pending verifications specifically
export async function fetchPendingVerifications(
  page: number = 1,
  limit: number = 20,
  token?: string
): Promise<any> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await axios.get(`${API_BASE_URL}/admin/verifications/pending`, {
      params,
      headers: createAuthHeaders(token),
    });

    // Handle the API response structure: { success, message, data }
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    // Fallback to empty array if API response is unexpected
    return [];
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    throw error;
  }
}

// Fetch verification statistics
export async function fetchVerificationStats(token?: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/verifications/stats`, {
      headers: createAuthHeaders(token),
    });

    // Handle the API response structure: { success, message, data }
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    // Fallback to empty stats if API response is unexpected
    return {
      statusBreakdown: { verified: 0, pending: 0, rejected: 0 },
      typeBreakdown: {},
      totalUsers: 0,
      verifiedUsers: 0,
      verificationRate: 0,
      recentActivity: 0
    };
  } catch (error) {
    console.error('Error fetching verification stats:', error);
    throw error;
  }
}

// Update user KYC status
export async function updateUserKycStatus(
  userId: string,
  data: { kycStatus: 'verified' | 'rejected' | 'pending'; notes?: string },
  token?: string
): Promise<any> {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/users/${userId}/kyc-status`,
      data,
      {
        headers: createAuthHeaders(token),
      }
    );
    return processApiResponse(response);
  } catch (error) {
    console.error('Error updating user KYC status:', error);
    throw error;
  }
}
