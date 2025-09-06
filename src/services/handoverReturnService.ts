// Handover & Return API Service
// Following the same patterns as riskManagementService.ts

import axios, { AxiosResponse } from 'axios';
import { 
  HandoverSession,
  ReturnSession,
  HandoverMessage,
  HandoverNotification,
  CreateHandoverSessionRequest,
  CreateHandoverSessionResponse,
  CreateReturnSessionRequest,
  CreateReturnSessionResponse,
  UploadPhotoRequest,
  UploadPhotoResponse,
  SendMessageRequest,
  SendMessageResponse,
  CompleteHandoverRequest,
  CompleteHandoverResponse,
  CompleteReturnRequest,
  CompleteReturnResponse,
  HandoverReturnStatsResponse
} from '../types/handoverReturn';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance for handover & return API
const handoverReturnApi = axios.create({
  baseURL: `${API_BASE_URL}/handover-return`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
handoverReturnApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
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
handoverReturnApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Handover Session Management
export const handoverReturnService = {
  // Create handover session
  createHandoverSession: async (data: CreateHandoverSessionRequest): Promise<CreateHandoverSessionResponse> => {
    try {
      console.log('🔍 Creating handover session:', data);
      const response: AxiosResponse<CreateHandoverSessionResponse> = await handoverReturnApi.post('/handover-sessions', data);
      console.log('✅ Handover session created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating handover session:', error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid handover session data');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Insufficient permissions. Please check your access rights.');
      } else if (error.response?.status === 404) {
        throw new Error('Handover API endpoint not found. Please implement the backend API.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to create handover session');
      }
    }
  },

  // Get handover sessions by user ID
  getHandoverSessionsByUser: async (userId: string, page: number = 1, limit: number = 20): Promise<{ data: HandoverSession[], meta: any }> => {
    try {
      console.log('Fetching handover sessions for user:', userId);
      const response: AxiosResponse<{ success: boolean; data: HandoverSession[], meta: any }> = 
        await handoverReturnApi.get(`/handover-sessions?userId=${userId}&page=${page}&limit=${limit}`);
      console.log('Handover sessions fetched:', response.data);
      return {
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error: any) {
      console.error('Error fetching handover sessions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch handover sessions');
    }
  },

  // Get handover session by ID
  getHandoverSession: async (sessionId: string): Promise<HandoverSession> => {
    try {
      console.log('Fetching handover session:', sessionId);
      const response: AxiosResponse<{ success: boolean; data: HandoverSession }> = 
        await handoverReturnApi.get(`/handover-sessions/${sessionId}`);
      console.log('Handover session fetched:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching handover session:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch handover session');
    }
  },

  // Update handover session
  updateHandoverSession: async (sessionId: string, data: Partial<HandoverSession>): Promise<HandoverSession> => {
    try {
      console.log('Updating handover session:', sessionId, data);
      const response: AxiosResponse<{ success: boolean; data: HandoverSession }> = 
        await handoverReturnApi.put(`/handover-sessions/${sessionId}`, data);
      console.log('Handover session updated:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating handover session:', error);
      throw new Error(error.response?.data?.message || 'Failed to update handover session');
    }
  },

  // Complete handover session
  completeHandoverSession: async (data: CompleteHandoverRequest): Promise<CompleteHandoverResponse> => {
    try {
      console.log('Completing handover session:', data);
      const response: AxiosResponse<CompleteHandoverResponse> = 
        await handoverReturnApi.post(`/handover-sessions/${data.sessionId}/complete`, data);
      console.log('Handover session completed:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error completing handover session:', error);
      throw new Error(error.response?.data?.message || 'Failed to complete handover session');
    }
  },

  // Upload handover photo
  uploadHandoverPhoto: async (data: UploadPhotoRequest): Promise<UploadPhotoResponse> => {
    try {
      console.log('Uploading handover photo:', data);
      const formData = new FormData();
      formData.append('photo', data.photo);
      formData.append('category', data.category);
      if (data.caption) {
        formData.append('caption', data.caption);
      }

      const response: AxiosResponse<UploadPhotoResponse> = 
        await handoverReturnApi.post(`/handover-sessions/${data.sessionId}/photos`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      console.log('Handover photo uploaded:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error uploading handover photo:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload handover photo');
    }
  },

  // Create return session
  createReturnSession: async (data: CreateReturnSessionRequest): Promise<CreateReturnSessionResponse> => {
    try {
      console.log('🔍 Creating return session:', data);
      const response: AxiosResponse<CreateReturnSessionResponse> = 
        await handoverReturnApi.post('/return-sessions', data);
      console.log('✅ Return session created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating return session:', error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid return session data');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Insufficient permissions. Please check your access rights.');
      } else if (error.response?.status === 404) {
        // API endpoint doesn't exist yet - return mock response for development
        console.warn('⚠️ Return API endpoint not found. Returning mock response for development.');
        return {
          success: true,
          message: 'Return session created successfully (Mock Response)',
          data: {
            session: {
              id: `return_${Date.now()}`,
              bookingId: data.bookingId,
              productId: data.productId,
              renterId: data.renterId,
              ownerId: data.ownerId,
              handoverSessionId: data.handoverSessionId,
              status: 'pending' as const,
              verificationCode: Math.random().toString().substr(2, 6),
              returnLocation: data.returnLocation,
              returnPhotos: [],
              returnNotes: data.returnNotes || '',
              returnSignature: '',
              returnTimestamp: '',
              conditionAssessment: {
                overallCondition: 'good' as const,
                conditionScore: 4,
                damages: [],
                accessories: [],
                notes: '',
                assessedBy: 'system',
                assessedAt: new Date().toISOString()
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            verificationCode: Math.random().toString().substr(2, 6)
          }
        };
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to create return session');
      }
    }
  },

  // Get return sessions by user ID
  getReturnSessionsByUser: async (userId: string, page: number = 1, limit: number = 20): Promise<{ data: ReturnSession[], meta: any }> => {
    try {
      console.log('Fetching return sessions for user:', userId);
      const response: AxiosResponse<{ success: boolean; data: ReturnSession[], meta: any }> = 
        await handoverReturnApi.get(`/return-sessions?userId=${userId}&page=${page}&limit=${limit}`);
      console.log('Return sessions fetched:', response.data);
      return {
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error: any) {
      console.error('Error fetching return sessions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch return sessions');
    }
  },

  // Get return session by ID
  getReturnSession: async (sessionId: string): Promise<ReturnSession> => {
    try {
      console.log('Fetching return session:', sessionId);
      const response: AxiosResponse<{ success: boolean; data: ReturnSession }> = 
        await handoverReturnApi.get(`/return-sessions/${sessionId}`);
      console.log('Return session fetched:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching return session:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch return session');
    }
  },

  // Update return session
  updateReturnSession: async (sessionId: string, data: Partial<ReturnSession>): Promise<ReturnSession> => {
    try {
      console.log('Updating return session:', sessionId, data);
      const response: AxiosResponse<{ success: boolean; data: ReturnSession }> = 
        await handoverReturnApi.patch(`/return-sessions/${sessionId}`, data);
      console.log('Return session updated:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating return session:', error);
      throw new Error(error.response?.data?.message || 'Failed to update return session');
    }
  },

  // Complete return session
  completeReturnSession: async (data: CompleteReturnRequest): Promise<CompleteReturnResponse> => {
    try {
      console.log('Completing return session:', data);
      const response: AxiosResponse<CompleteReturnResponse> = 
        await handoverReturnApi.post(`/return-sessions/${data.sessionId}/complete`, data);
      console.log('Return session completed:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error completing return session:', error);
      throw new Error(error.response?.data?.message || 'Failed to complete return session');
    }
  },

  // Upload return photo
  uploadReturnPhoto: async (data: UploadPhotoRequest): Promise<UploadPhotoResponse> => {
    try {
      console.log('Uploading return photo:', data);
      const formData = new FormData();
      formData.append('photo', data.photo);
      formData.append('category', data.category);
      if (data.caption) {
        formData.append('caption', data.caption);
      }

      const response: AxiosResponse<UploadPhotoResponse> = 
        await handoverReturnApi.post(`/return-sessions/${data.sessionId}/photos`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      console.log('Return photo uploaded:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error uploading return photo:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload return photo');
    }
  },

  // Send message
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    try {
      console.log('Sending message:', data);
      const response: AxiosResponse<SendMessageResponse> = 
        await handoverReturnApi.post('/messages', data);
      console.log('Message sent:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  },

  // Get messages for session
  getSessionMessages: async (sessionId: string): Promise<HandoverMessage[]> => {
    try {
      console.log('Fetching messages for session:', sessionId);
      const response: AxiosResponse<{ success: boolean; data: HandoverMessage[] }> = 
        await handoverReturnApi.get(`/messages/session/${sessionId}`);
      console.log('Messages fetched:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch messages');
    }
  },

  // Mark message as read
  markMessageAsRead: async (messageId: string): Promise<void> => {
    try {
      console.log('Marking message as read:', messageId);
      await handoverReturnApi.patch(`/messages/${messageId}/read`);
      console.log('Message marked as read');
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark message as read');
    }
  },

  // Get notifications
  getNotifications: async (userId: string): Promise<HandoverNotification[]> => {
    try {
      console.log('Fetching notifications for user:', userId);
      const response: AxiosResponse<{ success: boolean; data: HandoverNotification[] }> = 
        await handoverReturnApi.get(`/notifications/user/${userId}`);
      console.log('Notifications fetched:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    try {
      console.log('Marking notification as read:', notificationId);
      await handoverReturnApi.patch(`/notifications/${notificationId}/read`);
      console.log('Notification marked as read');
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (userId: string): Promise<void> => {
    try {
      console.log('Marking all notifications as read for user:', userId);
      await handoverReturnApi.patch(`/notifications/user/${userId}/read-all`);
      console.log('All notifications marked as read');
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  // Get handover & return statistics
  getHandoverReturnStats: async (): Promise<HandoverReturnStatsResponse> => {
    try {
      console.log('📊 Fetching handover & return statistics...');
      const response: AxiosResponse<HandoverReturnStatsResponse> = 
        await handoverReturnApi.get('/stats');
      console.log('✅ Statistics fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching statistics:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Insufficient permissions. Admin access required.');
      } else if (error.response?.status === 404) {
        // API endpoint doesn't exist yet - return mock response for development
        console.warn('⚠️ Statistics API endpoint not found. Returning mock response for development.');
        return {
          success: true,
          message: 'Statistics retrieved successfully (Mock Response)',
          data: {
            totalHandovers: 45,
            totalReturns: 42,
            completedHandovers: 40,
            completedReturns: 38,
            disputedSessions: 3,
            averageHandoverTime: 25,
            averageReturnTime: 20,
            successRate: 92.5,
            disputeRate: 6.7,
            userSatisfaction: 4.2
          }
        };
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch statistics');
      }
    }
  },

  // Generate verification code
  generateVerificationCode: async (sessionId: string, sessionType: 'handover' | 'return'): Promise<{ code: string }> => {
    try {
      console.log('Generating verification code for session:', sessionId, sessionType);
      const response: AxiosResponse<{ success: boolean; data: { code: string } }> = 
        await handoverReturnApi.post(`/${sessionType}-sessions/${sessionId}/generate-code`);
      console.log('Verification code generated:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error generating verification code:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate verification code');
    }
  },

  // Verify code
  verifyCode: async (sessionId: string, code: string, sessionType: 'handover' | 'return'): Promise<{ valid: boolean }> => {
    try {
      console.log('Verifying code for session:', sessionId, sessionType);
      const response: AxiosResponse<{ success: boolean; data: { valid: boolean } }> = 
        await handoverReturnApi.post(`/${sessionType}-sessions/${sessionId}/verify-code`, { code });
      console.log('Code verification result:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error verifying code:', error);
      throw new Error(error.response?.data?.message || 'Failed to verify code');
    }
  }
};

export default handoverReturnService;
