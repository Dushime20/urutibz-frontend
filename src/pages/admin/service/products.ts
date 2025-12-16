import axios from 'axios';
import { API_BASE_URL, createAuthHeaders, createJsonHeaders, handleApiError, processApiResponse } from './config';
import { isProductCurrentlyAvailable } from '../../../lib/utils';

// Product Image Interface
interface ProductImage {
  id?: string;
  product_id?: string;
  image_url: string;
  thumbnail_url?: string | null;
  alt_text?: string | null;
  sort_order?: number;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Product Management Functions
export async function fetchAllProducts(
  token?: string,
  isAdminDashboard: boolean = false,
  page?: number,
  limit?: number,
  status?: string,
  sort?: 'newest' | 'oldest'
) {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  if (status && status !== 'all') params.append('status', status);
  if (sort) params.append('sort', sort);
  const url = `${API_BASE_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;
  try {
    const headers = createAuthHeaders(token);
    // Add timeout and ensure request works without token
    const response = await axios.get(url, { 
      headers,
      timeout: 30000, // 30 second timeout
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    });
    
    // Normalize server response shape
    const payload = response?.data?.data || {};
    const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(response?.data?.data) ? response.data.data : [];
    const meta = {
      page: Number(payload?.page ?? page ?? 1),
      limit: Number(payload?.limit ?? limit ?? 20),
      total: Number(payload?.total ?? list.length ?? 0),
      totalPages: Number(payload?.totalPages ?? (payload?.total && (payload?.limit || limit) ? Math.max(1, Math.ceil(Number(payload.total) / Number(payload.limit || limit))) : 1)),
      hasNext: Boolean(payload?.hasNext ?? false),
      hasPrev: Boolean(payload?.hasPrev ?? false),
    };

    // For admin dashboard, return all products without filtering
    if (isAdminDashboard) {
      return { 
        data: list, 
        error: null,
        total: meta.total,
        meta,
      };
    }

    // Filter for active products for other views
    const activeProducts = list.filter((product: any) => 
      !product.status || product.status.toLowerCase() === 'active'
    );

    return { 
      data: activeProducts, 
      error: null,
      total: activeProducts.length,
      meta,
    };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch products');
    console.error('Error fetching products:', errorMsg);
    return { data: null, error: errorMsg, total: 0, meta: { page: page ?? 1, limit: limit ?? 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false } };
  }
}

export async function getProductById(productId: string, token?: string) {
  const response = await axios.get(
    `${API_BASE_URL}/products/${productId}`,
    {
      headers: createAuthHeaders(token),
    }
  );
  const product = response.data.data;
  try {
    const { pricePerDay, currency } = await fetchActiveDailyPrice(productId);
    return {
      ...product,
      base_price_per_day: pricePerDay ?? product?.base_price_per_day ?? null,
      base_currency: currency ?? product?.base_currency ?? null,
    };
  } catch {
    return product;
  }
}

export async function updateProduct(productId: string, productData: any, token?: string) {
  const response = await axios.put(
    `${API_BASE_URL}/products/${productId}`,
    productData,
    {
      headers: createJsonHeaders(token),
    }
  );
  return response.data;
}

// Product Images Functions
export async function fetchProductImages(productId: string, token?: string) {
  try {
    const headers = createJsonHeaders(token);

    console.group(`🖼️ Fetching Product Images for Product ${productId}`);
    console.log('Request URL:', `${API_BASE_URL}/product-images/product/${productId}`);
    console.log('Request Headers:', headers);

    const response = await axios.get(`${API_BASE_URL}/product-images/product/${productId}`, { headers });
    
    console.log('Full Raw Response:', JSON.stringify(response.data, null, 2));
    console.log('Response Type:', typeof response.data);
    console.log('Response Keys:', Object.keys(response.data));

    // Comprehensive image data extraction
    let images: string[] = [];
    
    // Multiple extraction strategies
    const extractImageUrls = (data: any): string[] => {
      console.group('Image URL Extraction');
      console.log('Input Data:', data);

      // Strategy 1: Directly from data property of successful response
      if (data?.success && data?.data) {
        const extractedImages = data.data
          .map((img: any) => img.image_url || img.url || img.path)
          .filter((url: string) => url && url.trim() !== '');
        
        console.log('Extracted from Success Response:', extractedImages);
        console.groupEnd();
        return extractedImages;
      }
      
      // Strategy 2: Direct array of image objects
      if (Array.isArray(data)) {
        const extractedImages = data
          .map((img: any) => img.image_url || img.url || img.path)
          .filter((url: string) => url && url.trim() !== '');
        
        console.log('Extracted from Direct Array:', extractedImages);
        console.groupEnd();
        return extractedImages;
      }
      
      // Strategy 3: Nested data structures
      if (data?.data) {
        const extractedImages = (Array.isArray(data.data) ? data.data : [data.data])
          .map((img: any) => img.image_url || img.url || img.path)
          .filter((url: string) => url && url.trim() !== '');
        
        console.log('Extracted from Nested Data:', extractedImages);
        console.groupEnd();
        return extractedImages;
      }
      
      console.warn('No images extracted');
      console.groupEnd();
      return [];
    };

    // Try different extraction methods
    images = extractImageUrls(response.data);

    console.log('Final Extracted Images:', images);
    console.log('Image Count:', images.length);
    
    console.groupEnd();

    return images.length > 0 
      ? images 
      : ['/assets/img/placeholder-image.png'];
  } catch (err: any) {
    console.group(`❌ Error Fetching Product Images for Product ${productId}`);
    console.error('Error Details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: `${API_BASE_URL}/product-images/product/${productId}`
    });
    console.groupEnd();

    return ['/assets/img/placeholder-image.png']; // Always return a placeholder
  }
}

// Product Pricing Functions
export async function fetchProductPricesByProductId(productId: string, options?: { page?: number; limit?: number }) {
  const token = localStorage.getItem('token') || undefined;
  const params = new URLSearchParams();
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));

  const url = `${API_BASE_URL}/product-prices/product/${productId}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await axios.get(url, {
    headers: createAuthHeaders(token),
  });
  return {
    success: Boolean(response.data?.success),
    data: Array.isArray(response.data?.data) ? response.data.data : [],
    pagination: response.data?.pagination || null,
  };
}

export async function fetchActiveDailyPrice(productId: string): Promise<{ pricePerDay: number | null; currency: string | null; raw?: any }>{
  const res = await fetchProductPricesByProductId(productId, { page: 1, limit: 1 });
  if (!res.success || !res.data || res.data.length === 0) {
    return { pricePerDay: null, currency: null };
  }
  const first = res.data[0];
  const pricePerDay = first?.price_per_day != null ? Number(first.price_per_day) : null;
  const currency = first?.currency ?? null;
  return { pricePerDay, currency, raw: first };
}

export async function fetchPricingStats(token?: string) {
  const url = `${API_BASE_URL}/product-prices/stats`;
  try {
    const headers = createAuthHeaders(token);
    const response = await axios.get(url, { headers });
    return { data: response.data.data, error: null };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch pricing stats');
    console.error('Error fetching pricing stats:', errorMsg);
    return { data: null, error: errorMsg };
  }
}

// Product Availability Functions
export async function fetchProductAvailability(productId: string, token?: string) {
  try {
    const headers = createAuthHeaders(token);
    const response = await axios.get(`${API_BASE_URL}/product-availability/product/${productId}`, { headers });

    // Normalize response to ensure we always return an array
    const availabilityData = response.data?.data || response.data || [];

    return availabilityData;
  } catch (err: any) {
    return []; // Return empty array on error
  }
}

// Product Availability Check
export async function fetchAvailableProducts(token?: string, skipAvailabilityCheck: boolean = false) {
  try {
    // Get ALL active products by fetching all pages
    let allActiveProducts: string | any[] = [];
    let page = 1;
    let hasMore = true;
    const limit = 100; // Fetch 100 products per page
    
    while (hasMore) {
      const productsResult = await fetchAllProducts(token, false, page, limit, 'active');
      
      if (productsResult.error || !productsResult.data) {
        if (page === 1) {
          return productsResult; // Return error only on first page
        }
        break; // If later pages fail, just stop fetching more
      }

      const pageProducts = productsResult.data;
      allActiveProducts = [...allActiveProducts, ...pageProducts];
      
      // Check if there are more pages
      hasMore = pageProducts.length === limit && productsResult.meta?.hasNext;
      page++;
      
    }
    const activeProducts = allActiveProducts;
    
    // If skipping availability check, return all active products
    if (skipAvailabilityCheck) {
      return {
        data: activeProducts,
        error: null,
        total: activeProducts.length
      };
    }

    const availableProducts = [];

    // Check availability for each product
    for (const product of activeProducts) {
      try {
        // Fetch availability data for this product
        const availabilityData = await fetchProductAvailability(product.id, token);
        
        // Check if product is currently available (not booked)
        const isAvailable = isProductCurrentlyAvailable(availabilityData);
        
        if (isAvailable) {
          availableProducts.push(product);
        }
      } catch (error) {
        console.warn(`Could not check availability for product ${product.id}, including it as available:`, error);
        // If we can't check availability, include the product (fail-safe approach)
        availableProducts.push(product);
      }
    }

    console.log(`Filtered ${activeProducts.length} active products to ${availableProducts.length} available products`);

    return {
      data: availableProducts,
      error: null,
      total: availableProducts.length
    };
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to fetch available products';
    console.error('Error fetching available products:', errorMsg);
    return { data: null, error: errorMsg, total: 0 };
  }
}
