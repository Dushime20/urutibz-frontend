// Custom hook for handover notifications management
// Following the same patterns as useRiskAssessment.ts

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import handoverReturnService from '../services/handoverReturnService';
import { 
  HandoverNotification,
  UseHandoverNotificationsReturn
} from '../types/handoverReturn';

export const useHandoverNotifications = (userId?: string): UseHandoverNotificationsReturn => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<HandoverNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const notificationsData = await handoverReturnService.getNotifications(userId);
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.isRead).length);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch notifications';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await handoverReturnService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to mark notification as read';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    
    try {
      await handoverReturnService.markAllNotificationsAsRead(userId);
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          isRead: true, 
          readAt: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to mark all notifications as read';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  }, [userId, showToast]);

  // Auto-refresh notifications when userId changes
  useEffect(() => {
    if (userId) {
      refreshNotifications();
    }
  }, [userId, refreshNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };
};
