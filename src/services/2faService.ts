import axios from 'axios';
import type {
  TwoFactorSetupResponse,
  TwoFactorStatusResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
  TwoFactorBackupVerifyRequest,
  TwoFactorSetupRequest,
  TwoFactorDisableRequest,
  TwoFactorDisableResponse,
  TwoFactorBackupCodesResponse,
} from '../types/2fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to create auth headers
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const twoFactorService = {
  // Setup 2FA - Generates QR code and backup codes
  async setup(): Promise<TwoFactorSetupResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/2fa/setup`,
      {},
      { headers: createAuthHeaders() }
    );
    return response.data;
  },

  // Verify 2FA setup with 6-digit code
  async verify(code: string): Promise<TwoFactorVerifyResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/2fa/verify`,
      { token: code }, // Changed from { code } to { token: code }
      { headers: createAuthHeaders() }
    );
    return response.data;
  },

  // Verify 2FA token during login (public endpoint)
  async verifyToken(token: string): Promise<TwoFactorVerifyResponse> {
    const response = await axios.post(`${API_BASE_URL}/2fa/verify-token`, { token });
    return response.data;
  },

  // Verify backup code during login (public endpoint)
  async verifyBackup(backupCode: string): Promise<TwoFactorVerifyResponse> {
    const response = await axios.post(`${API_BASE_URL}/2fa/verify-backup`, { backupCode });
    return response.data;
  },

  // Disable 2FA
  async disable(code: string): Promise<TwoFactorDisableResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/2fa/disable`,
      { code },
      { headers: createAuthHeaders() }
    );
    return response.data;
  },

  // Get 2FA status
  async getStatus(): Promise<TwoFactorStatusResponse> {
    const response = await axios.get(`${API_BASE_URL}/2fa/status`, {
      headers: createAuthHeaders(),
    });
    return response.data;
  },

  // Generate new backup codes
  async generateBackupCodes(): Promise<TwoFactorBackupCodesResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/2fa/backup-codes`,
      {},
      { headers: createAuthHeaders() }
    );
    return response.data;
  },
};
