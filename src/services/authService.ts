import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance for auth API
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token for protected routes
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isVerified?: boolean;
    avatarUrl?: string;
    kyc_status?: string;
    role?: string;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  token?: string; // For backward compatibility
  sessionToken?: string;
  refreshToken?: string;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export class AuthService {
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      
      const response = await authApi.post('/login', {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      });

      console.log('✅ Login successful:', response.data);
      
      // Handle different response formats from backend
      const data = response.data.data || response.data;
      
      // Store tokens
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.sessionToken) {
        localStorage.setItem('sessionToken', data.sessionToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Login failed. Please try again.';
      
      throw new Error(errorMessage);
    }
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
      const response = await authApi.post('/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone
      });

      console.log('✅ Registration successful:', response.data);
      
      // Handle different response formats from backend
      const data = response.data.data || response.data;
      
      // For registration, user might not be immediately logged in
      // Check if tokens are provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.sessionToken) {
        localStorage.setItem('sessionToken', data.sessionToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Registration failed. Please try again.';
      
      throw new Error(errorMessage);
    }
  }

  static async logout(): Promise<void> {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      
      if (sessionToken) {
        await authApi.post('/logout', { sessionToken });
      }
    } catch (error) {
      console.warn('⚠️ Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.post('/refresh', {
        refreshToken
      });

      const data = response.data;
      const newToken = data.tokens?.accessToken || data.token;
      
      if (newToken) {
        localStorage.setItem('token', newToken);
        
        // Update refresh token if provided
        if (data.tokens?.refreshToken) {
          localStorage.setItem('refreshToken', data.tokens.refreshToken);
        }
        
        return newToken;
      }
      
      throw new Error('No token in refresh response');
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);
      
      // Clear auth data on refresh failure
      localStorage.removeItem('token');
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return null;
    }
  }

  static async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const response = await authApi.get('/me');
      return response.data.data || response.data.user || response.data;
    } catch (error: any) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await authApi.post('/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to send password reset email.';
      
      throw new Error(errorMessage);
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/reset-password', {
        token,
        newPassword
      });

      const data = response.data.data || response.data;
      
      // Store tokens if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.sessionToken) {
        localStorage.setItem('sessionToken', data.sessionToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to reset password.';
      
      throw new Error(errorMessage);
    }
  }

  static async validateResetToken(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await authApi.get(`/validate-reset-token/${token}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid or expired token'
      };
    }
  }
}

export default AuthService;