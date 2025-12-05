/**
 * Image Search API Service
 * Handles AI-powered image search functionality similar to Alibaba.com
 */

import axios from 'axios';
import { API_BASE_URL, createAuthHeaders, handleApiError } from './config';

export interface ImageSearchResult {
  product: {
    id: string;
    title: string;
    description: string;
    base_price_per_day: number;
    currency: string;
  };
  image: {
    id: string;
    url: string;
    thumbnail_url?: string;
    is_primary: boolean;
  };
  similarity: number;
  similarity_percentage: number;
}

export interface ImageSearchResponse {
  items: ImageSearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  search_metadata: {
    threshold: number;
    query_features_dimension: number;
  };
}

/**
 * Search products by image file upload
 */
export async function searchByImageFile(
  imageFile: File,
  options: {
    threshold?: number;
    page?: number;
    limit?: number;
  } = {},
  token?: string
): Promise<{ success: boolean; data?: ImageSearchResponse; error?: string }> {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  if (options.threshold !== undefined) {
    formData.append('threshold', String(options.threshold));
  }
  if (options.page !== undefined) {
    formData.append('page', String(options.page));
  }
  if (options.limit !== undefined) {
    formData.append('limit', String(options.limit));
  }

  try {
    const headers = createAuthHeaders(token);
    // Remove Content-Type header to let browser set it with boundary for FormData
    delete headers['Content-Type'];

    const response = await axios.post(
      `${API_BASE_URL}/products/search-by-image`,
      formData,
      {
        headers,
        params: {
          threshold: options.threshold || 0.5,
          page: options.page || 1,
          limit: options.limit || 20,
        },
      }
    );

    const data = response.data?.data || response.data;
    return {
      success: true,
      data: {
        items: data.items || [],
        pagination: data.pagination || {
          page: options.page || 1,
          limit: options.limit || 20,
          total: 0,
          totalPages: 0,
        },
        search_metadata: data.search_metadata || {
          threshold: options.threshold || 0.5,
          query_features_dimension: 0,
        },
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: handleApiError(error, 'Failed to search by image'),
    };
  }
}

/**
 * Search products by image URL
 */
export async function searchByImageUrl(
  imageUrl: string,
  options: {
    threshold?: number;
    page?: number;
    limit?: number;
  } = {},
  token?: string
): Promise<{ success: boolean; data?: ImageSearchResponse; error?: string }> {
  try {
    const headers = createAuthHeaders(token);
    headers['Content-Type'] = 'application/json';

    const response = await axios.post(
      `${API_BASE_URL}/products/search-by-image`,
      {
        image_url: imageUrl,
      },
      {
        headers,
        params: {
          threshold: options.threshold || 0.5,
          page: options.page || 1,
          limit: options.limit || 20,
        },
      }
    );

    const data = response.data?.data || response.data;
    return {
      success: true,
      data: {
        items: data.items || [],
        pagination: data.pagination || {
          page: options.page || 1,
          limit: options.limit || 20,
          total: 0,
          totalPages: 0,
        },
        search_metadata: data.search_metadata || {
          threshold: options.threshold || 0.5,
          query_features_dimension: 0,
        },
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: handleApiError(error, 'Failed to search by image URL'),
    };
  }
}

