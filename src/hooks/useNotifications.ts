import { useEffect, useState, useCallback } from 'react';
import useRealtime from './useRealtime';

interface Notification {
  id: string;
  type: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

export const useNotifications = () => {
  const { socket, isConnected } = useRealtime();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for notifications
    const handleNotification = (data: any) => {
      const newNotification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: data.type,
        message: data.message,
        data: data.data,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    // Listen for new messages
    const handleNewMessage = (data: any) => {
      const messageNotification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'message',
        message: data.message || 'New message received',
        data: {
          chatId: data.chatId,
          fromUserId: data.fromUserId,
        },
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [messageNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    // Listen for booking updates
    const handleBookingUpdate = (data: any) => {
      const bookingNotification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'booking-update',
        message: data.notification?.message || `Booking ${data.bookingId} status changed to ${data.status}`,
        data: {
          bookingId: data.bookingId,
          status: data.status,
        },
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [bookingNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification', handleNotification);
    socket.on('new-message', handleNewMessage);
    socket.on('booking-status-changed', handleBookingUpdate);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('new-message', handleNewMessage);
      socket.off('booking-status-changed', handleBookingUpdate);
    };
  }, [socket, isConnected]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};

export default useNotifications;

