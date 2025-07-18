import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Fetch all products
export async function fetchAllProducts(token?: string) {
  const url = `${API_BASE_URL}/products`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await axios.get(url, { headers });
    // console.log(response.data.data.data,'data to test in browse items')
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
