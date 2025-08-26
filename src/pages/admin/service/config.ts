// API Configuration and Constants
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';

// Common HTTP Headers
export const createAuthHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const createJsonHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Common Error Handling
export const handleApiError = (err: any, defaultMessage: string): string => {
  return err?.response?.data?.message || 
         err?.response?.data?.error || 
         err.message || 
         defaultMessage;
};

// Common Response Processing
export const processApiResponse = <T>(response: any): T => {
  return response.data?.data ?? response.data ?? response;
};
