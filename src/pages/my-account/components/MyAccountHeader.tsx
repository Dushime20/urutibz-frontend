import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getMyNotifications } from '../../../features/notifications/api';
import { useMarkReadMutation } from '../../../features/notifications/queries';

const MyAccountHeader: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [notificationsData, setNotificationsData] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const unreadCount = notificationsData.filter((n: any) => !n.read).length;
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { mutate: markRead } = useMarkReadMutation();
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNotifOpen]);

  useEffect(() => {
    (async () => {
      try {
        setNotificationsLoading(true);
        const items = await getMyNotifications({ page: 1, limit: 10 });
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
        const items = await getMyNotifications({ page: 1, limit: 10 });
        setNotificationsData(Array.isArray(items) ? items : []);
      } catch {
        setNotificationsData([]);
      } finally {
        setNotificationsLoading(false);
      }
    })();
  }, [isNotifOpen]);

  const handleMarkAllRead = () => {
    notificationsData.forEach((n: any) => {
      if (!n.read) markRead(n.id);
    });
  };

  return (
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-900">My Account</h1>
        <button
          onClick={() => navigate('/browse')}
          className="px-3 py-1.5 rounded-xl border text-gray-700 hover:bg-gray-50"
        >
          Browse Items
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative" ref={notifRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200 w-64"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen((v) => !v)}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{unreadCount} unread</span>
                  <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Mark all as read</button>
                </div>
              </div>
              <div className="max-h-80 overflow-auto">
                {notificationsLoading ? (
                  <div className="px-4 py-6 text-center text-gray-400 text-sm">Loading...</div>
                ) : notificationsData.length > 0 ? (
                  notificationsData.map((n: any) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-gray-50 ${
                        n.read ? '' : 'bg-primary-50/40'
                      }`}
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? 'bg-gray-300' : 'bg-primary-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{n.title || 'Notification'}</div>
                        <div className="text-xs text-gray-500 truncate">{n.message || n.content}</div>
                      </div>
                      <div className="ml-2 text-[10px] text-gray-400 whitespace-nowrap">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">No notifications</div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 text-center">
                <button onClick={() => navigate('/dashboard/notifications')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="px-3 py-1.5 rounded-xl border text-gray-700 hover:bg-gray-50 whitespace-nowrap"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default MyAccountHeader;


