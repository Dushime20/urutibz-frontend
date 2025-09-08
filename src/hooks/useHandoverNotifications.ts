// Custom hook for handover notifications management
// Following the same patterns as useRiskAssessment.ts

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import handoverReturnService from '../services/handoverReturnService';
import { 
  HandoverNotification,
  UseHandoverNotificationsReturn,
  ScheduleNotificationRequest
} from '../types/handoverReturn';

export const useHandoverNotifications = (userId?: string, bookingId?: string): UseHandoverNotificationsReturn => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<HandoverNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (!userId && !bookingId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (bookingId) {
        const res = await handoverReturnService.getNotificationsFeed({ bookingId, page: 1, limit: 100 });
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      } else if (userId) {
        const notificationsData = await handoverReturnService.getNotifications(userId);
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.isRead).length);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch notifications';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, bookingId, showToast]);

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
    if (userId || bookingId) {
      refreshNotifications();
    }
  }, [userId, bookingId, refreshNotifications]);

  const schedule = useCallback(async (req: ScheduleNotificationRequest) => {
    setLoading(true);
    setError(null);
    try {
      await handoverReturnService.scheduleNotification(req);
      await refreshNotifications();
      showToast('Notification scheduled', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to schedule notification';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshNotifications, showToast]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    schedule
  };
};
