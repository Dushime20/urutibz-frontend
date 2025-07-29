import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

// Fetch current user profile
export async function fetchUserProfile(token: string) {
  try {
    // Extract user ID from JWT token
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id;
    
    if (!userId) {
      return {
        data: null,
        success: false,
        error: 'No user ID found in token'
      };
    }

    // Use the /users/{userId} endpoint instead of /auth/me
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return {
      data: response.data.data || response.data,
      success: true,
      error: null
    };
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to fetch user profile';
    return {
      data: null,
      success: false,
      error: errorMsg
    };
  }
}

// Add new functions for dashboard overview - USER SPECIFIC
export async function fetchDashboardStats(token: string) {
  try {
    // Get user ID from token
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id;
    
    if (!userId) {
      return {
        activeBookings: 0,
        totalEarnings: 0,
        totalTransactions: 0,
        wishlistItems: 0
      };
    }
    
    // Get user-specific data from user endpoints
    const [bookingsRes, myProductsRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/bookings`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API_BASE_URL}/products/my/products`, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    // Fetch user-specific transactions
    const userTransactionData = await fetchUserTransactions(userId, token);

    const bookings = bookingsRes.data?.data?.data || bookingsRes.data?.data || [];
    const transactions = userTransactionData.success && userTransactionData.data ? userTransactionData.data : [];
    const myProducts = myProductsRes.data?.data?.data || myProductsRes.data?.data || [];

    // Calculate user-specific stats
    const activeBookings = bookings.filter((booking: any) => 
      booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'active'
    ).length;

    // Calculate total earnings from completed transactions
    const completedTransactions = transactions.filter((transaction: any) => 
      transaction.status === 'completed'
    );
    
    const totalEarnings = completedTransactions
      .reduce((sum: number, transaction: any) => {
        const amount = parseFloat(transaction.amount) || 0;
        return sum + amount;
      }, 0);

    // Total transaction amount (all transactions)
    const totalTransactions = transactions
      .reduce((sum: number, transaction: any) => {
        const amount = parseFloat(transaction.amount) || 0;
        return sum + amount;
      }, 0);

    // Count user's active products as wishlist proxy
    const wishlistItems = myProducts.filter((product: any) => 
      product.status === 'active' || product.status === 'available'
    ).length;

    const userStats = {
      activeBookings,
      totalEarnings,
      totalTransactions,
      wishlistItems
    };

    return userStats;
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error);
    
    // Return zeros if everything fails
    return {
      activeBookings: 0,
      totalEarnings: 0,
      totalTransactions: 0,
      wishlistItems: 0
    };
  }
}

export async function fetchRecentBookings(token: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings?limit=5&sort=-created_at`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data?.data?.data || [];
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    return [];
  }
}

export async function fetchRecentTransactions(token: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/payment-transactions?limit=5&sort=-created_at`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data?.data?.data || [];
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
}

export async function createProduct(productData: any) {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_BASE_URL}/products`, productData, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

export async function createProductImage(imageData: any) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  
  // Append each image file as 'images'
  if (Array.isArray(imageData.images)) {
    for (const file of imageData.images) {
      formData.append('images', file);
    }
  }

  // Append other fields if present
  if (imageData.product_id) formData.append('product_id', imageData.product_id);
  if (imageData.alt_text) formData.append('alt_text', imageData.alt_text);
  if (imageData.sort_order) formData.append('sort_order', imageData.sort_order);
  if (imageData.isPrimary) formData.append('isPrimary', imageData.isPrimary);

  const response = await axios.post(
    `${API_BASE_URL}/product-images/multiple`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return response.data;
}

export async function getMyProducts() {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/products/my/products`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data.data.data;
}

export async function getProductImagesByProductId(productId: string) {
  const response = await axios.get(`${API_BASE_URL}/product-images/product/${productId}`);

  return response.data.data;
}

export async function getProductById(productId: string) {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `${API_BASE_URL}/products/${productId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data.data;
}

export async function updateProduct(productId: string, productData: any) {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `${API_BASE_URL}/products/${productId}`,
    productData,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data;
}

export async function updateProductImage(imageId: string, imageData: any) {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  if (imageData.image) formData.append('image', imageData.image);
  if (imageData.alt_text) formData.append('alt_text', imageData.alt_text);
  if (imageData.sort_order) formData.append('sort_order', imageData.sort_order);
  if (imageData.isPrimary) formData.append('isPrimary', imageData.isPrimary);
  const response = await axios.put(
    `${API_BASE_URL}/product-images/${imageId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  return response.data;
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchCountries() {
  const res = await fetch(`${API_BASE_URL}/countries`);
  if (!res.ok) throw new Error('Failed to fetch countries');
  return res.json();
}

export async function fetchUserBookings(token: string | null) {
  const response = await axios.get(`${API_BASE_URL}/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Return bookings array and pagination info
  return response.data?.data || { data: [], page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false };
}

// Existing product and image fetchers (if not present, add them)
// export async function getProductById(productId: string, token: string | null | undefined) {
//   const response = await axios.get(`${API_BASE_URL}/products/${productId}`, {
//     headers: token ? { Authorization: `Bearer ${token}` } : {},
//   });
//   return response.data?.data || response.data;
// }

export async function fetchProductImages(productId: string, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/product-images/product/${productId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return { data: response.data?.data || response.data || [], error: null };
  } catch (error) {
    console.error('Error fetching product images:', error);
    return { data: [], error };
  }
}

export async function fetchUserReviews(userId: string, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/review/user/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }
}

export async function fetchReviewById(reviewId: string, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/review/${reviewId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data?.data || null;
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    return null;
  }
}

export async function fetchReviewByBookingId(bookingId: string, token?: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/review/booking/${bookingId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // Handle array response - return the first review if available
    const reviews = response.data?.data || [];
    return {
      review: reviews.length > 0 ? reviews[0] : null,
      count: reviews.length
    };
  } catch (error) {
    console.error('Error fetching review by booking ID:', error);
    return { review: null, count: 0 };
  }
}

// Fetch user-specific transactions using the user ID endpoint
export async function fetchUserTransactions(userId: string, token: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/payment-transactions/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return {
      data: response.data?.data || [],
      count: response.data?.count || 0,
      success: response.data?.success || false
    };
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return {
      data: [],
      count: 0,
      success: false,
      error: error
    };
  }
}
