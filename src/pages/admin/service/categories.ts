import axios from 'axios';
import { API_BASE_URL, createAuthHeaders, createJsonHeaders, handleApiError, processApiResponse } from './config';
import type { Category, CreateCategoryInput, Country, CreateCountryInput } from '../interfaces';

// Category Management Functions
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    throw new Error(handleApiError(err, 'Failed to fetch categories'));
  }
}

export async function createCategory(data: CreateCategoryInput, token?: string): Promise<Category> {
  try {
    const response = await axios.post(`${API_BASE_URL}/categories`, data, { 
      headers: createJsonHeaders(token) 
    });
    return response.data;
  } catch (err: any) {
    console.error('Error creating category:', err);
    throw new Error(handleApiError(err, 'Failed to create category'));
  }
}

export async function updateCategory(categoryId: string, data: Partial<CreateCategoryInput>, token?: string): Promise<Category> {
  try {
    const response = await axios.put(`${API_BASE_URL}/categories/${categoryId}`, data, { 
      headers: createJsonHeaders(token) 
    });
    return response.data;
  } catch (err: any) {
    console.error('Error updating category:', err);
    throw new Error(handleApiError(err, 'Failed to update category'));
  }
}

export async function deleteCategory(categoryId: string, token?: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, { 
      headers: createAuthHeaders(token) 
    });
  } catch (err: any) {
    console.error('Error deleting category:', err);
    throw new Error(handleApiError(err, 'Failed to delete category'));
  }
}

export async function fetchCategoryById(categoryId: string, token?: string) {
  const response = await axios.get(`${API_BASE_URL}/categories/${categoryId}`, { 
    headers: createAuthHeaders(token) 
  });
  return response.data;
}

// Country Management Functions
export async function fetchCountries(): Promise<Country[]> {
  try {
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Fetching countries from:', `${API_BASE_URL}/countries`);
    const response = await axios.get(`${API_BASE_URL}/countries`);
    console.log('Countries API response:', response.data);
    
    // Check if response has the expected structure
    if (response.data && response.data.success && response.data.data) {
      const countries = response.data.data;
      console.log('Extracted countries:', countries);
      console.log('Countries type:', typeof countries);
      console.log('Countries length:', countries?.length);
      return countries || [];
    } else {
      console.log('Unexpected response structure:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching countries:', error);
    console.error('Error response:', error?.response?.data);
    throw error;
  }
}

export async function fetchCountryById(countryId: string, token?: string): Promise<Country> {
  try {
    const response = await axios.get(`${API_BASE_URL}/countries/${countryId}`, { 
      headers: createAuthHeaders(token) 
    });
    return response.data.data;
  } catch (err: any) {
    console.error('Error fetching country by ID:', err);
    throw new Error(handleApiError(err, 'Failed to fetch country'));
  }
}

export async function createCountry(data: CreateCountryInput, token?: string): Promise<Country> {
  const response = await axios.post(`${API_BASE_URL}/countries`, data, { 
    headers: createJsonHeaders(token) 
  });
  return response.data.data;
}

export async function updateCountry(countryId: string, data: Partial<CreateCountryInput>, token?: string): Promise<Country> {
  try {
    const response = await axios.put(`${API_BASE_URL}/countries/${countryId}`, data, { 
      headers: createJsonHeaders(token) 
    });
    return response.data.data;
  } catch (err: any) {
    console.error('Error updating country:', err);
    throw new Error(handleApiError(err, 'Failed to update country'));
  }
}

export async function deleteCountry(countryId: string, token?: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/countries/${countryId}`, { 
      headers: createAuthHeaders(token) 
    });
  } catch (err: any) {
    console.error('Error deleting country:', err);
    throw new Error(handleApiError(err, 'Failed to delete country'));
  }
}

// Category Regulations Functions (Proper implementations)
export async function fetchCategoryRegulations(params?: any, token?: string): Promise<any[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category_id) queryParams.append('category_id', params.category_id);
    if (params?.country_id) queryParams.append('country_id', params.country_id);
    if (params?.regulation_type) queryParams.append('regulation_type', params.regulation_type);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.enforcement_level) queryParams.append('enforcement_level', params.enforcement_level);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_BASE_URL}/category-regulations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url, { 
      headers: createAuthHeaders(token) 
    });
    
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error fetching category regulations:', err);
    throw new Error(handleApiError(err, 'Failed to fetch category regulations'));
  }
}

export async function createCategoryRegulation(data: any, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const response = await axios.post(`${API_BASE_URL}/category-regulations`, data, { 
      headers: createJsonHeaders(token) 
    });
    
    const result = processApiResponse(response);
    return { success: true, data: result };
  } catch (err: any) {
    console.error('Error creating category regulation:', err);
    const errorMessage = handleApiError(err, 'Failed to create category regulation');
    return { success: false, error: errorMessage };
  }
}

export async function updateCategoryRegulation(id: string, data: any, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const response = await axios.put(`${API_BASE_URL}/category-regulations/${id}`, data, { 
      headers: createJsonHeaders(token) 
    });
    
    const result = processApiResponse(response);
    return { success: true, data: result };
  } catch (err: any) {
    console.error('Error updating category regulation:', err);
    const errorMessage = handleApiError(err, 'Failed to update category regulation');
    return { success: false, error: errorMessage };
  }
}

export async function deleteCategoryRegulation(id: string, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    await axios.delete(`${API_BASE_URL}/category-regulations/${id}`, { 
      headers: createAuthHeaders(token) 
    });
    
    return { success: true, data: { id } };
  } catch (err: any) {
    console.error('Error deleting category regulation:', err);
    const errorMessage = handleApiError(err, 'Failed to delete category regulation');
    return { success: false, error: errorMessage };
  }
}

export async function fetchCategoryRegulationById(id: string, token?: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/category-regulations/${id}`, { 
      headers: createAuthHeaders(token) 
    });
    
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error fetching category regulation by ID:', err);
    throw new Error(handleApiError(err, 'Failed to fetch category regulation'));
  }
}

export async function fetchCategoryRegulationStats(params?: any, token?: string): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category_id) queryParams.append('category_id', params.category_id);
    if (params?.country_id) queryParams.append('country_id', params.country_id);
    if (params?.regulation_type) queryParams.append('regulation_type', params.regulation_type);
    if (params?.date_range) queryParams.append('date_range', params.date_range);

    const url = `${API_BASE_URL}/category-regulations/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url, { 
      headers: createAuthHeaders(token) 
    });
    
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error fetching category regulation stats:', err);
    throw new Error(handleApiError(err, 'Failed to fetch category regulation stats'));
  }
}

export async function checkCompliance(params?: any, token?: string): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category_id) queryParams.append('category_id', params.category_id);
    if (params?.country_id) queryParams.append('country_id', params.country_id);
    if (params?.product_id) queryParams.append('product_id', params.product_id);
    if (params?.user_id) queryParams.append('user_id', params.user_id);

    const url = `${API_BASE_URL}/category-regulations/compliance-check${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.post(url, params?.compliance_data || {}, { 
      headers: createJsonHeaders(token) 
    });
    
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error checking compliance:', err);
    throw new Error(handleApiError(err, 'Failed to check compliance'));
  }
}

// Administrative Divisions Functions
export async function fetchAdministrativeDivisions(filters?: any, token?: string): Promise<any[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.country_id) queryParams.append('country_id', filters.country_id);
    if (filters?.parent_id) queryParams.append('parent_id', filters.parent_id);
    if (filters?.level) queryParams.append('level', filters.level.toString());
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString());
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.has_children !== undefined) queryParams.append('has_children', filters.has_children.toString());
    if (filters?.min_population) queryParams.append('min_population', filters.min_population.toString());
    if (filters?.max_population) queryParams.append('max_population', filters.max_population.toString());
    if (filters?.include_country) queryParams.append('include_country', filters.include_country.toString());
    if (filters?.include_parent) queryParams.append('include_parent', filters.include_parent.toString());
    if (filters?.include_children) queryParams.append('include_children', filters.include_children.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());
    if (filters?.sort_by) queryParams.append('sort_by', filters.sort_by);
    if (filters?.sort_order) queryParams.append('sort_order', filters.sort_order);

    const url = `${API_BASE_URL}/administrative-divisions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url, { 
      headers: createAuthHeaders(token) 
    });
    
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error fetching administrative divisions:', err);
    throw new Error(handleApiError(err, 'Failed to fetch administrative divisions'));
  }
}

export async function searchAdministrativeDivisions(query: string, filters?: any, token?: string): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (filters?.country_id) queryParams.append('country_id', filters.country_id);
    if (filters?.parent_id) queryParams.append('parent_id', filters.parent_id);
    if (filters?.level) queryParams.append('level', filters.level.toString());
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const url = `${API_BASE_URL}/administrative-divisions/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url, { 
      headers: createAuthHeaders(token) 
    });
    
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error searching administrative divisions:', err);
    throw new Error(handleApiError(err, 'Failed to search administrative divisions'));
  }
}

export async function fetchAdministrativeDivisionTree(countryId?: string, token?: string): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    if (countryId) queryParams.append('country_id', countryId);

    const url = `${API_BASE_URL}/administrative-divisions/tree${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url, { 
      headers: createAuthHeaders(token) 
    });
    
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error fetching administrative division tree:', err);
    throw new Error(handleApiError(err, 'Failed to fetch administrative division tree'));
  }
}

export async function fetchAdministrativeDivisionById(id: string, token?: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/administrative-divisions/${id}`, { 
      headers: createAuthHeaders(token) 
    });
    
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error fetching administrative division by ID:', err);
    throw new Error(handleApiError(err, 'Failed to fetch administrative division'));
  }
}

export async function fetchAdministrativeDivisionStats(filters?: any, token?: string): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.country_id) queryParams.append('country_id', filters.country_id);
    if (filters?.level) queryParams.append('level', filters.level.toString());
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString());

    const url = `${API_BASE_URL}/administrative-divisions/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url, { 
      headers: createAuthHeaders(token) 
    });
    
    return processApiResponse(response);
  } catch (err: any) {
    console.error('Error fetching administrative division stats:', err);
    throw new Error(handleApiError(err, 'Failed to fetch administrative division stats'));
  }
}

export async function createAdministrativeDivision(data: any, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const response = await axios.post(`${API_BASE_URL}/administrative-divisions`, data, { 
      headers: createJsonHeaders(token) 
    });
    
    const result = processApiResponse(response);
    return { success: true, data: result };
  } catch (err: any) {
    console.error('Error creating administrative division:', err);
    return { success: false, error: handleApiError(err, 'Failed to create administrative division') };
  }
}

export async function updateAdministrativeDivision(id: string, data: any, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const response = await axios.put(`${API_BASE_URL}/administrative-divisions/${id}`, data, { 
      headers: createJsonHeaders(token) 
    });
    
    const result = processApiResponse(response);
    return { success: true, data: result };
  } catch (err: any) {
    console.error('Error updating administrative division:', err);
    return { success: false, error: handleApiError(err, 'Failed to update administrative division') };
  }
}

export async function deleteAdministrativeDivision(id: string, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const response = await axios.delete(`${API_BASE_URL}/administrative-divisions/${id}`, { 
      headers: createAuthHeaders(token) 
    });
    
    const result = processApiResponse(response);
    return { success: true, data: result };
  } catch (err: any) {
    console.error('Error deleting administrative division:', err);
    return { success: false, error: handleApiError(err, 'Failed to delete administrative division') };
  }
}

export async function toggleAdministrativeDivisionStatus(id: string, data: any, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const response = await axios.patch(`${API_BASE_URL}/administrative-divisions/${id}/toggle-status`, data, { 
      headers: createJsonHeaders(token) 
    });
    
    const result = processApiResponse(response);
    return { success: true, data: result };
  } catch (err: any) {
    console.error('Error toggling administrative division status:', err);
    return { success: false, error: handleApiError(err, 'Failed to toggle administrative division status') };
  }
}
