import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
console.log(API_BASE_URL)
// Register user function
export async function registerUser(formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
    return response.data;
  } catch (error: any) {
    // Try to extract the most informative error message
    const backendMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    throw new Error(backendMsg || 'Registration failed');
  }
}

// Login user function
export async function loginUser(email: string, password: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return response.data;
  } catch (error: any) {
    const backendMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    throw new Error(backendMsg || 'Login failed');
  }
}