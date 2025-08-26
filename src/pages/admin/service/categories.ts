import axios from 'axios';
import { API_BASE_URL, createAuthHeaders, createJsonHeaders, handleApiError } from './config';
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

// Category Regulations Functions (Stub implementations)
export async function fetchCategoryRegulations(params?: any, token?: string): Promise<any[]> {
  console.warn('fetchCategoryRegulations: Function not implemented yet');
  return [];
}

export async function createCategoryRegulation(data: any, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  console.warn('createCategoryRegulation: Function not implemented yet');
  return { success: true, data: { id: 'temp-id', ...data } };
}

export async function updateCategoryRegulation(id: string, data: any, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  console.warn('updateCategoryRegulation: Function not implemented yet');
  return { success: true, data: { id, ...data } };
}

export async function deleteCategoryRegulation(id: string, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  console.warn('deleteCategoryRegulation: Function not implemented yet');
  return { success: true, data: { id } };
}

export async function fetchCategoryRegulationById(id: string, token?: string): Promise<any> {
  console.warn('fetchCategoryRegulationById: Function not implemented yet');
  throw new Error('Function not implemented yet');
}

export async function fetchCategoryRegulationStats(params?: any, token?: string): Promise<any> {
  console.warn('fetchCategoryRegulationStats: Function not implemented yet');
  return { data: { total: 0, active: 0, expired: 0 } };
}

export async function checkCompliance(params?: any, token?: string): Promise<any> {
  console.warn('checkCompliance: Function not implemented yet');
  return { compliant: true, issues: [] };
}

// Administrative Divisions Functions (Stub implementations)
export async function fetchAdministrativeDivisions(filters?: any, token?: string): Promise<any[]> {
  console.warn('fetchAdministrativeDivisions: Function not implemented yet');
  return [];
}

export async function searchAdministrativeDivisions(query: string, filters?: any, token?: string): Promise<any> {
  console.warn('searchAdministrativeDivisions: Function not implemented yet');
  return { divisions: [] };
}

export async function fetchAdministrativeDivisionTree(countryId?: string, token?: string): Promise<any> {
  console.warn('fetchAdministrativeDivisionTree: Function not implemented yet');
  return null;
}

export async function fetchAdministrativeDivisionById(id: string, token?: string): Promise<any> {
  console.warn('fetchAdministrativeDivisionById: Function not implemented yet');
  throw new Error('Function not implemented yet');
}

export async function fetchAdministrativeDivisionStats(filters?: any, token?: string): Promise<any> {
  console.warn('fetchAdministrativeDivisionStats: Function not implemented yet');
  return { total: 0, active: 0, inactive: 0 };
}

export async function createAdministrativeDivision(data: any, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  console.warn('createAdministrativeDivision: Function not implemented yet');
  return { success: true, data: { id: 'temp-id', ...data } };
}

export async function updateAdministrativeDivision(id: string, data: any, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  console.warn('updateAdministrativeDivision: Function not implemented yet');
  return { success: true, data: { id, ...data } };
}

export async function deleteAdministrativeDivision(id: string, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  console.warn('deleteAdministrativeDivision: Function not implemented yet');
  return { success: true, data: { id } };
}

export async function toggleAdministrativeDivisionStatus(id: string, data: any, token?: string): Promise<{ success: boolean; error?: string; data?: any }> {
  console.warn('toggleAdministrativeDivisionStatus: Function not implemented yet');
  return { success: true, data: { id, ...data } };
}
