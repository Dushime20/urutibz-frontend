import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

// Add new functions for dashboard overview
export async function fetchDashboardStats(token: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data?.data || {
      activeBookings: 0,
      totalEarnings: 0,
      totalTransactions: 0,
      wishlistItems: 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
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
console.log(imageData,'image data')
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
  console.log(formData,'data to send in db')

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
//   console.log(response.data.data)
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
  console.log(response.data.data,'data from single  product')
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
