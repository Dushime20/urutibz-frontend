import axios from 'axios';

// Use same base URL as my-account service
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function requestEmailOtp(email: string, token?: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = `${API_BASE_URL}/auth/email-otp/request`;
  return axios.post(url, { email }, { headers });
}

export async function verifyEmailOtp(email: string, otp: string, token?: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = `${API_BASE_URL}/auth/email-otp/verify`;
  return axios.post(url, { email, otp }, { headers });
}


