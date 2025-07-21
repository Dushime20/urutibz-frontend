import axios from 'axios';
import { Package } from 'lucide-react';
import type {
  Category,
  CreateCategoryInput,
  PaymentTransactionResponse,
  AdminStats,
  RecentUser,
  RecentBooking,
  AdminUser,
  AdminBooking,
  PaginationResponse,
  Country,
  CreateCountryInput,
  PaymentMethod
} from '../interfaces';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

export async function fetchAllProducts(token?: string) {
  const url = `${API_BASE_URL}/products`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.get(url, { headers });
    return { data: response.data.data.data, error: null };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch products';
    console.error('Error fetching products:', errorMsg);
    return { data: null, error: errorMsg };
  }
}

// Fetch a user by owner_id
export async function fetchUserById(owner_id: string, token?: string) {
  const url = `${API_BASE_URL}/users/${owner_id}`;
  console.log('fetchUserById called for owner_id:', owner_id, 'URL:', url);
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.get(url, { headers });
    console.log(response.data.data,'data from user')
    return { data: response.data.data, error: null };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch user';
    console.error('Error fetching user:', errorMsg);
    return { data: null, error: errorMsg };
  }
}

// Fetch product images by productId
export async function fetchProductImages(productId: string, token?: string) {
  const url = `${API_BASE_URL}/product-images/product/${productId}`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.get(url, { headers });
    return { data: response.data, error: null };
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch product images';
    console.error('Error fetching product images:', errorMsg);
    return { data: null, error: errorMsg };
  }
}

// Fetch a single product by ID
export async function getProductById(productId: string, token?: string) {
  const response = await axios.get(
    `${API_BASE_URL}/products/${productId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data.data;
}

// Update a product by ID
export async function updateProduct(productId: string, productData: any, token?: string) {
  const response = await axios.put(
    `${API_BASE_URL}/products/${productId}`,
    productData,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data;
}

export async function fetchAdminBookings(
  page: number = 1,
  limit: number = 20,
  token?: string
): Promise<PaginationResponse<AdminBooking>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/bookings`, {
      params: { page, limit },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data?.data || { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
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
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log('Raw API Response:', response.data); // Debug log
    return response.data?.data || { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }
}

// Admin Overview APIs
export async function fetchAdminStats(token?: string): Promise<AdminStats> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log('Stats API Response:', response.data);
    const statsData = response.data?.data || response.data;

    // Get total verified users (those with kyc_status === 'verified')
    const verifiedUsers = statsData.totalUsers && statsData.verifiedUsers !== undefined 
      ? statsData.verifiedUsers 
      : statsData.totalUsers * 0.2; // Fallback to 20% if not provided

    return {
      totalUsers: statsData.totalUsers || 0,
      totalItems: statsData.activeProducts || 0,
      activeBookings: statsData.totalBookings || 0,
      totalRevenue: statsData.totalRevenue || 0,
      monthlyGrowth: {
        users: 0,
        items: 0,
        bookings: 0,
        revenue: 0
      }
    };
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
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
  }
}

export async function fetchRecentUsers(limit: number = 5, token?: string): Promise<RecentUser[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      params: { page: 1, limit },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    const bookings = response.data?.data?.items || [];

    // Fetch product images for each booking
    const bookingsWithImages = await Promise.all(bookings.map(async (booking: AdminBooking) => {
      let itemImage = '/assets/img/items/default-item.jpg'; // Default image

      try {
        const imageResponse = await axios.get(
          `${API_BASE_URL}/product-images/product/${booking.product_id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
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

export async function updateBooking(bookingId: string, data: any, token?: string) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/bookings/${bookingId}`,
      data,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return { data: response.data, error: null };
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error.message || 'Failed to update booking';
    return { data: null, error: errorMsg };
  }
}

export async function fetchRecentPaymentTransactions(
  limit: number = 10,
  token?: string,
  page: number = 1,
  status?: string,
  type?: string,
  search?: string
): Promise<PaymentTransactionResponse> {
  let url = `${API_BASE_URL}/payment-transactions?page=${page}&limit=${limit}`;
  if (status && status !== 'all') url += `&status=${encodeURIComponent(status)}`;
  if (type && type !== 'all') url += `&transaction_type=${encodeURIComponent(type)}`;
  if (search && search.trim() !== '') url += `&search=${encodeURIComponent(search)}`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (err: any) {
    const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Failed to fetch payment transactions';
    console.error('Error fetching payment transactions:', errorMsg);
    throw new Error(errorMsg);
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    throw new Error(err?.response?.data?.message || 'Failed to fetch categories');
  }
}

export async function createCategory(data: CreateCategoryInput, token?: string): Promise<Category> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.post(`${API_BASE_URL}/categories`, data, { headers });
    return response.data;
  } catch (err: any) {
    console.error('Error creating category:', err);
    throw new Error(err?.response?.data?.message || 'Failed to create category');
  }
}

export async function fetchCountries(): Promise<Country[]> {
  const response = await axios.get(`${API_BASE_URL}/countries`);
  return response.data.data;
}

export async function createCountry(data: CreateCountryInput, token?: string): Promise<Country> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.post(`${API_BASE_URL}/countries`, data, { headers });
  return response.data.data;
}

export async function fetchPaymentMethods(token?: string): Promise<PaymentMethod[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await axios.get(`${API_BASE_URL}/payment-methods`, { headers });
  return response.data.data.data;
}
