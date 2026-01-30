import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, UserCircle, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getMyNotifications } from '../../../features/notifications/api';
import { fetchUserProfile } from '../service/api';
import { useMarkReadMutation, useNotificationsQuery } from '../../../features/notifications/queries';
import Portal from '../../../components/ui/Portal';
import { LanguageSwitcher } from '../../../components/language-switcher';
import useRealtime from '../../../hooks/useRealtime';
import { useMessaging } from '../../../hooks/useMessaging';

type HeaderProps = {
  onToggleSidebar?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToNotifications?: () => void;
};

const MyAccountHeader: React.FC<HeaderProps> = ({ onToggleSidebar, onNavigateToProfile, onNavigateToNotifications }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const [notificationsData, setNotificationsData] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { mutate: markRead } = useMarkReadMutation();
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const modalQuery = useNotificationsQuery({ page: modalPage, limit: 50 });
  const { socket, isConnected } = useRealtime();
  const { onNewMessage, loadUnreadCount } = useMessaging();

  // Listen for new messages and show notifications
  useEffect(() => {
    const handleNewMessageNotification = (message: any) => {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

      // Only show notification if message is from someone else
      if (message.sender_id !== user?.id) {
        const normalized = {
          id: `message-${message.id}-${Date.now()}`,
          title: 'New Message',
          message: message.content?.substring(0, 100) || 'You have a new message',
          type: 'message',
          createdAt: message.created_at || new Date().toISOString(),
          channels: ['in_app'],
          priority: 'normal',
          status: 'delivered',
          read: false,
          is_read: false,
          data: {
            chatId: message.chat_id,
            messageId: message.id,
            productContext: message.productContext
          },
        };

        setNotificationsData(prev => {
          if (prev.some(item => item.id === normalized.id)) {
            return prev;
          }
          return [normalized, ...prev].slice(0, 100);
        });

        // Reload unread count
        loadUnreadCount();
      }
    };

    const cleanup = onNewMessage(handleNewMessageNotification);
    return cleanup;
  }, [onNewMessage, loadUnreadCount]);

  const modalItems = (
    (modalQuery.data as any)?.items ??
    (modalQuery.data as any)?.data?.items ??
    (modalQuery.data as any)?.data?.data ??
    (Array.isArray(modalQuery.data) ? modalQuery.data : [])
  ) as any[];

  // Use the full notifications data for dropdown
  const dropdownItems = notificationsData;
  const MAX_VISIBLE_NOTIFICATIONS = 3;
  const NOTIFICATION_ROW_HEIGHT = 96; // fallback height
  const dropdownListRef = useRef<HTMLDivElement | null>(null);
  const [dropdownViewportHeight, setDropdownViewportHeight] = useState(
    MAX_VISIBLE_NOTIFICATIONS * NOTIFICATION_ROW_HEIGHT
  );
  const shouldClampDropdownHeight = dropdownItems.length > MAX_VISIBLE_NOTIFICATIONS;
  const dropdownViewportStyle = shouldClampDropdownHeight
    ? { maxHeight: dropdownViewportHeight }
    : undefined;

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

      setNotificationsData(prev => {
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

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const useDark = saved ? saved === 'dark' : prefersDark;
      setIsDark(useDark);
      document.documentElement.classList.toggle('dark', useDark);
    } catch { }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if ((target as HTMLElement)?.closest?.('[data-sticky-portal]')) {
        return; // ignore clicks inside sticky portals (e.g., Notification modal)
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(target)) {
        setIsAvatarMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsAvatarMenuOpen(false);
      }
    }
    function handleOpenNotifications() {
      setIsNotifOpen(true);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-notifications', handleOpenNotifications);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-notifications', handleOpenNotifications);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setNotificationsLoading(true);
        const items = await getMyNotifications({ page: 1, limit: 100 });
        setNotificationsData(Array.isArray(items) ? items : []);
      } catch {
        setNotificationsData([]);
      } finally {
        setNotificationsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!isNotifOpen) return;
      try {
        setNotificationsLoading(true);
        const items = await getMyNotifications({ page: 1, limit: 100 });
        setNotificationsData(Array.isArray(items) ? items : []);
      } catch {
        setNotificationsData([]);
      } finally {
        setNotificationsLoading(false);
      }
    })();
  }, [isNotifOpen]);

  useEffect(() => {
    if (!isNotifOpen) return;
    const container = dropdownListRef.current;
    if (!container) return;

    const measure = () => {
      const firstItem = container.querySelector('[data-notification-item]') as HTMLElement | null;
      if (!firstItem) return;
      const height = firstItem.getBoundingClientRect().height;
      if (!height) return;
      const nextHeight = height * MAX_VISIBLE_NOTIFICATIONS;
      setDropdownViewportHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    };

    const raf = window.requestAnimationFrame(measure);
    if (typeof ResizeObserver === 'undefined') {
      return () => {
        window.cancelAnimationFrame(raf);
      };
    }

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);

    return () => {
      window.cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [isNotifOpen, dropdownItems.length]);

  // Load avatar and display name from stored user (kept in settings)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        const url: string | undefined = u?.avatar || u?.profilePhoto || u?.photoUrl || u?.image;
        const name: string = u?.name || [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.email || 'Account';
        if (url) setAvatarUrl(url);
        setUserName(name);
      }
    } catch { }
  }, []);

  // Mirror Settings: fetch live profile using token and populate avatar/name
  useEffect(() => {
    (async () => {
      try {
        const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
        if (!token) return;
        const res = await fetchUserProfile(token);
        const data = res?.data;
        if (!data) return;
        const url: string | undefined = data.profileImageUrl || data.profile_image || data.avatarUrl || data.avatar;
        const name: string = data.name || [data.firstName, data.lastName].filter(Boolean).join(' ') || data.email || userName;
        if (url) setAvatarUrl(url);
        if (name) setUserName(name);
        try {
          const stored = localStorage.getItem('user');
          const existing = stored ? JSON.parse(stored) : {};
          const merged = { ...existing, name, avatar: url, profileImageUrl: url };
          localStorage.setItem('user', JSON.stringify(merged));
        } catch { }
      } catch { }
    })();
  }, []);

  const isNotificationRead = (notification: any): boolean => {
    if (!notification) return false;
    if (typeof notification.read === 'boolean') return notification.read;
    if (typeof notification.is_read === 'boolean') return notification.is_read;
    if (typeof notification.isRead === 'boolean') return notification.isRead;
    if (notification.read_at || notification.readAt) return true;
    return false;
  };

  const unreadCount = notificationsData.reduce((count, notification) => count + (isNotificationRead(notification) ? 0 : 1), 0);

  const markNotificationLocally = (id: string) => {
    console.log('[MyAccountHeader] marking notification as read locally', id);
    setNotificationsData((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
            ...notification,
            read: true,
            is_read: true,
            isRead: true,
            read_at: notification.read_at || new Date().toISOString(),
            readAt: notification.readAt || new Date().toISOString()
          }
          : notification
      )
    );
  };

  const markAllNotificationsLocally = () => {
    console.log('[MyAccountHeader] marking all notifications as read locally');
    setNotificationsData((prev) =>
      prev.map((notification) =>
        isNotificationRead(notification)
          ? notification
          : {
            ...notification,
            read: true,
            is_read: true,
            isRead: true,
            read_at: notification.read_at || new Date().toISOString(),
            readAt: notification.readAt || new Date().toISOString()
          }
      )
    );
  };

  const handleMarkAllRead = () => {
    console.log('[MyAccountHeader] handleMarkAllRead clicked');
    markAllNotificationsLocally();
    notificationsData.forEach((n: any) => {
      if (!isNotificationRead(n)) {
        console.log('[MyAccountHeader] sending markRead request for', n.id);
        markRead(n.id);
      }
    });
  };

  const getNotificationStatusBadge = (isRead: boolean) => {
    const baseClass = 'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold';
    return isRead
      ? `${baseClass} bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300`
      : `${baseClass} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300`;
  };

  // Mobile navigation items for bottom nav (only 4 items: notifications, items, theme, logout)
  const mobileNavItems = useMemo(
    () => [
      {
        key: 'notifications',
        label: 'Notifications',
        icon: Bell,
        onPress: () => {
          setIsNotifOpen((v) => !v);
        },
        active: isNotifOpen,
        badge: unreadCount > 0 ? unreadCount : null,
        disabled: false
      },
      {
        key: 'items',
        label: 'Items',
        icon: Package,
        onPress: () => {
          navigate('/browse');
        },
        active: false,
        disabled: false
      },
      {
        key: 'theme',
        label: isDark ? 'Light' : 'Dark',
        icon: isDark ? Sun : Moon,
        onPress: toggleTheme,
        active: false,
        disabled: false
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: LogOut,
        onPress: () => {
          logout();
          navigate('/');
        },
        active: false,
        disabled: false
      }
    ],
    [isNotifOpen, unreadCount, isDark, navigate, logout, toggleTheme]
  );

  const navigateToNotificationsTab = () => {
    console.log('[MyAccountHeader] navigateToNotificationsTab triggered');
    if (onNavigateToNotifications) {
      console.log('[MyAccountHeader] using onNavigateToNotifications prop');
      onNavigateToNotifications();
      return true;
    }

    try {
      const event = new CustomEvent('my-account-nav', {
        detail: { tab: 'notifications' }
      });
      window.dispatchEvent(event);
      console.log('[MyAccountHeader] dispatched my-account-nav event');
      return true;
    } catch { }

    console.log('[MyAccountHeader] fallback navigate to /my-account#notifications');
    navigate('/my-account#notifications');
    return true;
  };

  const handleNotificationClick = (notificationId: string) => {
    console.log('[MyAccountHeader] notification clicked', notificationId);
    markNotificationLocally(notificationId);
    markRead(notificationId);
  };

  const handleViewAllClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    console.log('[MyAccountHeader] View all clicked');
    setIsNotifOpen(false);

    const navigated = navigateToNotificationsTab();
    setShowAllModal(false);
    setModalPage(1);

    if (!navigated) {
      setShowAllModal(true);
    }
  };

  return (
    <div className="w-full space-y-4 pl-4">
      {/* Desktop: Full header with all features - Hidden on mobile */}
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-bold text-lg sm:text-2xl tracking-tight text-gray-900 dark:text-slate-100">
                My Account
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/browse')}
              className="hidden sm:inline-flex px-4 py-2 rounded-2xl border text-sm font-semibold text-gray-700 hover:border-teal-400 hover:text-teal-600 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
            >
              Browse Items
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-2xl border text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <LanguageSwitcher
              buttonClassName="p-2.5 rounded-2xl border text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
            />
            <div className="relative" ref={notifRef} style={{ zIndex: 3000 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNotifOpen((v) => !v);
                }}
                className="relative p-2.5 text-gray-400 hover:text-gray-600 transition-colors dark:text-slate-400 dark:hover:text-slate-200 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>
              {isNotifOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl dark:bg-slate-900 dark:border-slate-700"
                  style={{ zIndex: 3001, pointerEvents: 'auto' }}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  onMouseDownCapture={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between dark:border-slate-700">
                    <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">Notifications</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-slate-400">{unreadCount} unread</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAllRead();
                        }}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                  <div
                    ref={dropdownListRef}
                    className="overflow-y-auto pr-1"
                    style={dropdownViewportStyle}
                  >
                    {notificationsLoading ? (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm dark:text-slate-500">Loading...</div>
                    ) : dropdownItems.length > 0 ? (
                      dropdownItems.map((n: any) => (
                        <button
                          key={n.id}
                          data-notification-item
                          onClick={() => handleNotificationClick(n.id)}
                          className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-gray-50 dark:hover:bg-slate-800 ${isNotificationRead(n) ? '' : 'bg-primary-50/40 dark:bg-primary-900/10'
                            }`}
                        >
                          <div className={`mt-1 w-2 h-2 rounded-full ${isNotificationRead(n) ? 'bg-gray-300 dark:bg-slate-600' : 'bg-primary-500'}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate dark:text-slate-100">{n.title || n.type || 'Notification'}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                              <span className={getNotificationStatusBadge(isNotificationRead(n))}>
                                {isNotificationRead(n) ? 'Read' : 'Unread'}
                              </span>
                              <span className="truncate">{n.type || n.category || ''}</span>
                            </div>
                            <div className="text-xs text-gray-500 truncate dark:text-slate-400">{n.message || n.content || n.body || n.description || ''}</div>
                          </div>
                          <div className="ml-2 text-[10px] text-gray-400 whitespace-nowrap dark:text-slate-500">
                            {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500 text-sm dark:text-slate-400">No notifications</div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 text-center dark:border-slate-700" >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAllClick(e);
                      }}
                      className="inline-flex items-center justify-center w-full px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer"
                    >
                      View all
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setIsAvatarMenuOpen((v) => !v)}
                className="flex items-center gap-2 group"
                aria-haspopup="menu"
                aria-expanded={isAvatarMenuOpen}
              >
                <span className="hidden sm:block text-sm text-gray-700 group-hover:text-gray-900 max-w-[140px] truncate dark:text-slate-300 dark:group-hover:text-slate-100">
                  {userName}
                </span>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 dark:border-slate-700 dark:bg-slate-800">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-base">
                      <UserCircle />
                    </div>
                  )}
                </div>
              </button>
              {isAvatarMenuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 dark:bg-slate-900 dark:border-slate-700">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                    <div className="text-sm font-semibold text-gray-900 truncate dark:text-slate-100">{userName}</div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsAvatarMenuOpen(false);
                        onNavigateToProfile?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => { setIsAvatarMenuOpen(false); logout(); navigate('/'); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* All Notifications Modal */}
      {showAllModal && (
        <Portal>
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 h-screen bg-black/50" data-sticky-portal>
            <div className="fixed inset-0 bg-black/30" />
            <div className="relative z-[2001] bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-6 max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">All Notifications</h3>
                <button type="button" onClick={() => setShowAllModal(false)} className="text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100">Close</button>
              </div>
              {modalQuery.isLoading ? (
                <div className="text-center py-12 text-gray-700 dark:text-slate-300">Loading...</div>
              ) : modalItems.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 dark:text-slate-300">No notifications yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
                  {modalItems.map((n: any) => (
                    <li
                      key={n.id}
                      className="py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg p-2"
                      onClick={() => {
                        if (!isNotificationRead(n)) { markRead(n.id); }
                      }}
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full ${isNotificationRead(n) ? 'bg-gray-300 dark:bg-slate-600' : 'bg-emerald-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-slate-100 truncate">{n.title || n.type || 'Notification'}</h4>
                          {!isNotificationRead(n) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                              className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                            >Mark read</button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-slate-300 mt-1 whitespace-pre-line break-words">{n.message || n.content || n.body || n.description || ''}</p>
                        <div className="mt-2 text-xs text-gray-500 dark:text-slate-400">{new Date(n.createdAt || n.created_at || Date.now()).toLocaleString()}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex justify-between">
                <button type="button" onClick={() => setModalPage(p => Math.max(1, p - 1))} className="text-sm px-3 py-1 rounded border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">Prev</button>
                <button type="button" onClick={() => setModalPage(p => p + 1)} className="text-sm px-3 py-1 rounded border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">Next</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Mobile Bottom Navigation - Disabled in favor of DashboardMobileNav */}
    </div>
  );
};

export default MyAccountHeader;


