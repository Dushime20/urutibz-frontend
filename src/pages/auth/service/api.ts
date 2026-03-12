import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Log API configuration on module load
console.log('🌐 [API Config] Backend URL:', {
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  API_BASE_URL,
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD
});
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
  console.log('🔐 [API] Login attempt:', {
    email,
    apiUrl: `${API_BASE_URL}/auth/login`,
    fullUrl: `${API_BASE_URL}/auth/login`,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    
    console.log('✅ [API] Login response received:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      hasToken: !!response.data?.token,
      dataKeys: response.data ? Object.keys(response.data) : [],
      data: response.data
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Login error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response',
      request: error.request ? {
        url: error.request.responseURL,
        method: error.request.method
      } : 'No request',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        baseURL: error.config.baseURL
      } : 'No config'
    });

    const backendMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    throw new Error(backendMsg || 'Login failed');
  }
}

// Fetch user profile function
export async function fetchUserProfile(token: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    const backendMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    throw new Error(backendMsg || 'Failed to fetch user profile');
  }
}

// Upload document function
export async function uploadDocument({
  documentType,
  fileName,
  fileUrl,
  fileSize,
  mimeType
}: {
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}) {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/documents/upload`,
      {
        documentType,
        fileName,
        fileUrl,
        fileSize,
        mimeType
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const backendMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    throw new Error(backendMsg || 'Document upload failed');
  }
}

// Submit ID for verification: upload to storage, then submit to backend and wait for verification
export async function submitIdForVerification({
  file,
  documentType = 'national_id',
  uploadToStorage
}: {
  file: File;
  documentType?: string;
  uploadToStorage: (file: File) => Promise<string>;
}) {
  const token = localStorage.getItem('token');
  try {
    // 1. Upload file to storage and get fileUrl
    const fileUrl = await uploadToStorage(file);
    // 2. Submit to backend
    const response = await axios.post(
      `${API_BASE_URL}/documents/upload`,
      {
        documentType,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    // 3. Wait for backend to process and return verification status
    return response.data;
  } catch (error: any) {
    const backendMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    throw new Error(backendMsg || 'ID verification failed');
  }
}

// Forgot password function
export async function forgotPassword(email: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
    return response.data;
  } catch (error: any) {
    const backendMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    throw new Error(backendMsg || 'Failed to send reset email');
  }
}

// Reset password function
export async function resetPassword(token: string, newPassword: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
      token,
      newPassword
    });
    return response.data;
  } catch (error: any) {
    const backendMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message;
    throw new Error(backendMsg || 'Failed to reset password');
  }
}