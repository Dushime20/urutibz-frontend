import axios from 'axios';

import type {
  Chat,
  Message,
  MessageTemplate,
  AdminMessageStats,
  AdminNotificationStats,
  SystemNotification,
  PushNotification,
  EmailTemplate,
  ScheduledNotification
} from '../../../types/messaging';

// Messaging API Service
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';
export class MessagingService {
  private static getAuthHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Chat Management
//   static async getChats(token?: string): Promise<{ data: Chat[]; error: string | null }> {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/admin/chats`, {
//         headers: this.getAuthHeaders(token),
//       });
//       return { data: response.data.data, error: null };
//     } catch (error: any) {
//       const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch chats';
//       console.error('Error fetching chats:', errorMsg);
//       return { data: [], error: errorMsg };
//     }
//   }

  static async getChatById(chatId: string, token?: string): Promise<{ data: Chat | null; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/chats/${chatId}`, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch chat';
      console.error('Error fetching chat:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  static async getChatMessages(chatId: string, page = 1, limit = 50, token?: string): Promise<{ data: Message[]; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/chats/${chatId}/messages`, {
        headers: this.getAuthHeaders(token),
        params: { page, limit },
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch messages';
      console.error('Error fetching messages:', errorMsg);
      return { data: [], error: errorMsg };
    }
  }

  static async sendMessage(chatId: string, messageData: Partial<Message>, token?: string): Promise<{ data: Message | null; error: string | null }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/chats/${chatId}/messages`, messageData, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to send message';
      console.error('Error sending message:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  static async updateMessage(messageId: string, updates: Partial<Message>, token?: string): Promise<{ data: Message | null; error: string | null }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/messages/${messageId}`, updates, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update message';
      console.error('Error updating message:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  static async deleteMessage(messageId: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.delete(`${API_BASE_URL}/admin/messages/${messageId}`, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to delete message';
      console.error('Error deleting message:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Message Templates
  static async getMessageTemplates(token?: string): Promise<{ data: MessageTemplate[]; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/message-templates`, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch message templates';
      console.error('Error fetching message templates:', errorMsg);
      return { data: [], error: errorMsg };
    }
  }

  static async createMessageTemplate(templateData: Partial<MessageTemplate>, token?: string): Promise<{ data: MessageTemplate | null; error: string | null }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/message-templates`, templateData, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to create message template';
      console.error('Error creating message template:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  static async updateMessageTemplate(templateId: string, updates: Partial<MessageTemplate>, token?: string): Promise<{ data: MessageTemplate | null; error: string | null }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/message-templates/${templateId}`, updates, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update message template';
      console.error('Error updating message template:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  static async deleteMessageTemplate(templateId: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.delete(`${API_BASE_URL}/admin/message-templates/${templateId}`, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to delete message template';
      console.error('Error deleting message template:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Messaging Statistics
  static async getMessageStats(token?: string): Promise<{ data: AdminMessageStats | null; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/messaging/stats`, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch message stats';
      console.error('Error fetching message stats:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  // AI Features
  static async analyzeSentiment(messageId: string, token?: string): Promise<{ data: any; error: string | null }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/messages/${messageId}/analyze-sentiment`, {}, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to analyze sentiment';
      console.error('Error analyzing sentiment:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  static async detectConflict(chatId: string, token?: string): Promise<{ data: any; error: string | null }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/chats/${chatId}/detect-conflict`, {}, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to detect conflict';
      console.error('Error detecting conflict:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  static async generateResponseSuggestions(chatId: string, context: string, token?: string): Promise<{ data: string[]; error: string | null }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/chats/${chatId}/generate-suggestions`, { context }, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to generate response suggestions';
      console.error('Error generating response suggestions:', errorMsg);
      return { data: [], error: errorMsg };
    }
  }
}

// Notification API Service
export class NotificationService {
  private static getAuthHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // System Notifications
  static async getSystemNotifications(token?: string): Promise<{ data: SystemNotification[]; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/notifications/system`, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch system notifications';
      console.error('Error fetching system notifications:', errorMsg);
      return { data: [], error: errorMsg };
    }
  }

  static async markNotificationAsRead(notificationId: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.put(`${API_BASE_URL}/admin/notifications/${notificationId}/read`, {}, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to mark notification as read';
      console.error('Error marking notification as read:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  static async markAllNotificationsAsRead(token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.put(`${API_BASE_URL}/admin/notifications/mark-all-read`, {}, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to mark all notifications as read';
      console.error('Error marking all notifications as read:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Push Notifications
  static async sendPushNotification(notificationData: Partial<PushNotification>, userIds: string[], token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.post(`${API_BASE_URL}/admin/notifications/push`, {
        ...notificationData,
        userIds,
      }, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to send push notification';
      console.error('Error sending push notification:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Email Templates
  static async getEmailTemplates(token?: string): Promise<{ data: EmailTemplate[]; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/email-templates`, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch email templates';
      console.error('Error fetching email templates:', errorMsg);
      return { data: [], error: errorMsg };
    }
  }

  static async createEmailTemplate(templateData: Partial<EmailTemplate>, token?: string): Promise<{ data: EmailTemplate | null; error: string | null }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/email-templates`, templateData, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to create email template';
      console.error('Error creating email template:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  static async updateEmailTemplate(templateId: string, updates: Partial<EmailTemplate>, token?: string): Promise<{ data: EmailTemplate | null; error: string | null }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/email-templates/${templateId}`, updates, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update email template';
      console.error('Error updating email template:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  static async deleteEmailTemplate(templateId: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.delete(`${API_BASE_URL}/admin/email-templates/${templateId}`, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to delete email template';
      console.error('Error deleting email template:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  // Scheduled Notifications
  static async getScheduledNotifications(token?: string): Promise<{ data: ScheduledNotification[]; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/notifications/scheduled`, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch scheduled notifications';
      console.error('Error fetching scheduled notifications:', errorMsg);
      return { data: [], error: errorMsg };
    }
  }

  static async createScheduledNotification(notificationData: Partial<ScheduledNotification>, token?: string): Promise<{ data: ScheduledNotification | null; error: string | null }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/notifications/scheduled`, notificationData, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to create scheduled notification';
      console.error('Error creating scheduled notification:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  static async updateScheduledNotification(notificationId: string, updates: Partial<ScheduledNotification>, token?: string): Promise<{ data: ScheduledNotification | null; error: string | null }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/notifications/scheduled/${notificationId}`, updates, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update scheduled notification';
      console.error('Error updating scheduled notification:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }

  static async deleteScheduledNotification(notificationId: string, token?: string): Promise<{ success: boolean; error: string | null }> {
    try {
      await axios.delete(`${API_BASE_URL}/admin/notifications/scheduled/${notificationId}`, {
        headers: this.getAuthHeaders(token),
      });
      return { success: true, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to delete scheduled notification';
      console.error('Error deleting scheduled notification:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Notification Statistics
  static async getNotificationStats(token?: string): Promise<{ data: AdminNotificationStats | null; error: string | null }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/notifications/stats`, {
        headers: this.getAuthHeaders(token),
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to fetch notification stats';
      console.error('Error fetching notification stats:', errorMsg);
      return { data: null, error: errorMsg };
    }
  }
}
