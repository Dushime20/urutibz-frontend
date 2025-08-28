import axios from 'axios';
import { API_BASE_URL, createAuthHeaders, createJsonHeaders, handleApiError } from './config';

// User Management Functions
export async function fetchUserById(owner_id: string, token?: string) {
  const url = `${API_BASE_URL}/users/${owner_id}`;
  console.log('fetchUserById called for owner_id:', owner_id, 'URL:', url);
  try {
    const headers = createAuthHeaders(token);
    const response = await axios.get(url, { headers });

    // Log full response details
    console.group('User Fetch Details');
    console.log('Raw Response:', JSON.stringify(response.data, null, 2));
    console.log('User ID:', response.data.data?.id);
    console.log('User Email:', response.data.data?.email);
    console.log('User First Name:', response.data.data?.first_name);
    console.log('User Last Name:', response.data.data?.last_name);
    console.groupEnd();

    return { data: response.data.data, error: null };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch user');
    console.error('Error fetching user:', errorMsg);
    return { data: null, error: errorMsg };
  }
}

// User Favorites Functions
export async function addUserFavorite(productId: string, token?: string) {
  const url = `${API_BASE_URL}/users/favorites`;
  const headers = createJsonHeaders(token);
  const payload = { product_id: productId };
  const response = await axios.post(url, payload, { headers });
  return response.data;
}

export async function removeUserFavorite(productId: string, token?: string) {
  const url = `${API_BASE_URL}/users/favorites/${productId}`;
  const headers = createAuthHeaders(token);
  const response = await axios.delete(url, { headers });
  return response.data;
}

export async function getUserFavorites(token?: string) {
  const url = `${API_BASE_URL}/users/favorites`;
  const headers = createAuthHeaders(token);
  const response = await axios.get(url, { headers });
  return Array.isArray(response.data?.data) ? response.data.data : [];
}
