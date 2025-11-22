import React, { useState, useEffect, useMemo } from 'react';
import { Bell, CheckCircle, Circle, Trash2, Filter } from 'lucide-react';
import { getMyNotifications } from '../../../features/notifications/api';
import { useMarkReadMutation, useNotificationsQuery } from '../../../features/notifications/queries';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';
import useRealtime from '../../../hooks/useRealtime';

interface NotificationsSectionProps {}

type NotificationFilter = 'all' | 'unread' | 'read';

const NotificationsSection: React.FC<NotificationsSectionProps> = () => {
  const { tSync } = useTranslation();
  const { mutate: markRead } = useMarkReadMutation();
  const { socket, isConnected } = useRealtime();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [page, setPage] = useState(1);
  const limit = 50;

  const modalQuery = useNotificationsQuery({ page, limit });
  const modalItems = (
    (modalQuery.data as any)?.items ??
    (modalQuery.data as any)?.data?.items ??
    (modalQuery.data as any)?.data?.data ??
    (Array.isArray(modalQuery.data) ? modalQuery.data : [])
  ) as any[];

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const items = await getMyNotifications({ page: 1, limit: 100 });
        setNotifications(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleRealtimeNotification = (payload: any) => {
      const normalized = {
        id: payload.id || `${Date.now()}-${Math.random()}`,
        title: payload.title || payload.type || 'Notification',
        message: payload.message || '',
        type: payload.type || 'notification',
        createdAt: payload.createdAt || new Date().toISOString(),
        channels: payload.channels || [],
        priority: payload.priority || 'normal',
        status: payload.status || 'delivered',
        read: Boolean(payload.isRead),
        is_read: Boolean(payload.isRead),
        data: payload.data || {},
      };

      setNotifications(prev => {
        if (prev.some(item => item.id === normalized.id)) {
          return prev;
        }
        return [normalized, ...prev].slice(0, 100);
      });
    };

    socket.on('notification', handleRealtimeNotification);
    return () => {
      socket.off('notification', handleRealtimeNotification);
    };
  }, [socket, isConnected]);

  const isNotificationRead = (notification: any): boolean => {
    if (!notification) return false;
    if (typeof notification.read === 'boolean') return notification.read;
    if (typeof notification.is_read === 'boolean') return notification.is_read;
    if (typeof notification.isRead === 'boolean') return notification.isRead;
    if (notification.read_at || notification.readAt) return true;
    return false;
  };

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !isNotificationRead(n));
    return notifications.filter(n => isNotificationRead(n));
  }, [notifications, filter]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !isNotificationRead(n)).length,
    [notifications]
  );

  const readCount = useMemo(
    () => notifications.filter(n => isNotificationRead(n)).length,
    [notifications]
  );

  const handleMarkAsRead = (notificationId: string) => {
    markRead(notificationId);
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach((n: any) => {
      if (!isNotificationRead(n)) {
        markRead(n.id);
      }
    });
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true, is_read: true }))
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return tSync('Just now');
      if (diffMins < 60) return `${diffMins} ${tSync('min ago')}`;
      if (diffHours < 24) return `${diffHours} ${tSync('hour ago')}`;
      if (diffDays < 7) return `${diffDays} ${tSync('day ago')}`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-slate-900 dark:border-slate-700">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded dark:bg-slate-700 w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded dark:bg-slate-700"></div>
            <div className="h-4 bg-gray-200 rounded dark:bg-slate-700 w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              <TranslatedText text="Notifications" />
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              <TranslatedText text="Manage your notifications" />
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              <TranslatedText text="Mark all as read" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <TranslatedText text="All" /> ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'unread'
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <TranslatedText text="Unread" /> ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'read'
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <TranslatedText text="Read" /> ({readCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center dark:bg-slate-900 dark:border-slate-700">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
              <TranslatedText text="No notifications" />
            </h3>
            <p className="text-gray-500 dark:text-slate-400">
              {filter === 'unread' ? (
                <TranslatedText text="You're all caught up! No unread notifications." />
              ) : filter === 'read' ? (
                <TranslatedText text="No read notifications yet." />
              ) : (
                <TranslatedText text="You don't have any notifications yet." />
              )}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const isRead = isNotificationRead(notification);
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border p-4 sm:p-6 transition-all hover:shadow-md dark:bg-slate-900 dark:border-slate-700 ${
                  !isRead
                    ? 'border-teal-200 bg-teal-50/30 dark:bg-teal-900/10 dark:border-teal-800'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Indicator */}
                  <div className="flex-shrink-0 mt-1">
                    {isRead ? (
                      <CheckCircle className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-teal-600 dark:text-teal-400 fill-teal-600 dark:fill-teal-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">
                          {notification.title || notification.type || 'Notification'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-300 whitespace-pre-line break-words">
                          {notification.message ||
                            notification.content ||
                            notification.body ||
                            notification.description ||
                            ''}
                        </p>
                      </div>
                      {!isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors dark:text-teal-400 dark:hover:bg-teal-900/20"
                        >
                          <TranslatedText text="Mark read" />
                        </button>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {notification.type || notification.category || 'General'}
                      </span>
                      <span>{formatDate(notification.createdAt || notification.created_at || '')}</span>
                      {!isRead && (
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-semibold dark:bg-teal-900/30 dark:text-teal-300">
                          <TranslatedText text="New" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;


