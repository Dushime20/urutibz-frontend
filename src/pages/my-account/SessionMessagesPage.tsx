import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHandoverMessages } from '../../hooks/useHandoverMessages';
import handoverReturnService from '../../services/handoverReturnService';
import { 
  ArrowLeft, 
  Bell, 
  Search, 
  Sun, 
  Moon,
  RefreshCw
} from 'lucide-react';
import { fetchUserProfile } from './service/api';
import { getMyNotifications } from '../../features/notifications/api';
import { useMarkReadMutation } from '../../features/notifications/queries';

const SessionMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { type, id } = useParams<{ type: 'handover' | 'return'; id: string }>();

  const isHandover = type === 'handover';
  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem('user') || localStorage.getItem('authUser');
      const u = raw ? JSON.parse(raw) : {};
      return u?.id || u?.userId || '';
    } catch { return ''; }
  }, []);
  const { messages, loading, error, refreshMessages } = useHandoverMessages(
    isHandover ? id : undefined,
    !isHandover ? id : undefined
  );
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
  const [stats, setStats] = useState<any | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Header state
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [notificationsData, setNotificationsData] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const unreadCount = notificationsData.filter((n: any) => !n.read).length;
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { mutate: markRead } = useMarkReadMutation();
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const useDark = saved ? saved === 'dark' : prefersDark;
      setIsDark(useDark);
      document.documentElement.classList.toggle('dark', useDark);
    } catch {}
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const authToken = localStorage.getItem('token');
        if (authToken) {
          const response = await fetchUserProfile(authToken);
          if (response.success && response.data) {
            setAvatarUrl(response.data.profileImageUrl || null);
            setUserName(`${response.data.firstName || ''} ${response.data.lastName || ''}`.trim());
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const data = await getMyNotifications();
        setNotificationsData((data as any).notifications || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Handle click outside for dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(target)) {
        setIsAvatarMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    refreshMessages(isHandover ? id : undefined, !isHandover ? id : undefined);
    const loadNotifs = async () => {
      if (!id) return;
      setNotifLoading(true);
      setNotifError(null);
      try {
        const res = await handoverReturnService.getSessionNotifications({
          handoverSessionId: isHandover ? id : undefined,
          returnSessionId: !isHandover ? id : undefined,
          page: 1,
          limit: 50,
        });
        setNotifications(res.data || []);
      } catch (e: any) {
        setNotifError(e?.message || 'Failed to load notifications');
      } finally {
        setNotifLoading(false);
      }
    };
    loadNotifs();
    const loadStats = async () => {
      try {
        const res = await handoverReturnService.getHandoverReturnStats();
        setStats(res?.data || null);
      } catch (e: any) {
        setStatsError(e?.message || 'Failed to load stats');
      }
    };
    loadStats();
  }, [id, isHandover, refreshMessages]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl border-b border-gray-200 bg-white dark:bg-slate-900 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-slate-600"></div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">
                  Session {isHandover ? 'Handover' : 'Return'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  #{id?.slice(0,8)}…
                </p>
              </div>
            </div>

            {/* Right side - Actions and user menu */}
            <div className="flex items-center gap-3">
              {/* Refresh button */}
              <button
                onClick={() => refreshMessages(isHandover ? id : undefined, !isHandover ? id : undefined)}
                className="flex items-center gap-2 px-3 py-2 bg-my-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                      <h3 className="font-semibold text-gray-900 dark:text-slate-100">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto scrollbar-hide">
                      {notificationsLoading ? (
                        <div className="p-4 text-center text-gray-500 dark:text-slate-400">Loading...</div>
                      ) : notificationsData.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-slate-400">No notifications</div>
                      ) : (
                        notificationsData.slice(0, 5).map((notification: any) => (
                          <div
                            key={notification.id}
                            className="p-3 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                            onClick={() => {
                              markRead(notification.id);
                              setIsNotifOpen(false);
                            }}
                          >
                            <p className="text-sm text-gray-900 dark:text-slate-100">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar */}
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-slate-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-slate-300">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-slate-300">
                    {userName || 'User'}
                  </span>
                </button>

                {/* Avatar dropdown */}
                {isAvatarMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{userName}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/my-account');
                          setIsAvatarMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          localStorage.removeItem('authUser');
                          navigate('/login');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700"
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
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Tabs */}
        <div className="mb-6">
          <div className="inline-flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            {(['messages','notifications'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-slate-700 text-my-primary dark:text-teal-400 shadow-sm' 
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'messages' ? 'Messages' : 'Notifications'}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Panel */}
        {activeTab === 'messages' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Messages</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">Live</span>
          </div>

          <div className="p-5">
            {loading && <div className="text-sm text-gray-500 dark:text-slate-400">Loading…</div>}
            {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

            <div className="space-y-4">
              {messages.length === 0 && !loading && (
                <div className="text-sm text-gray-500 dark:text-slate-400">No messages yet for this session.</div>
              )}

              {messages.map((m) => {
                const mine = m.senderId === currentUserId;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border ${
                      mine 
                        ? 'bg-my-primary text-white border-my-primary' 
                        : 'bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 border-gray-200 dark:border-slate-600'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs uppercase tracking-wide opacity-80">{m.messageType || 'text'}</div>
                        {m.senderType && (
                          <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full border ${
                            mine 
                              ? 'bg-white/20 text-white border-white/30' 
                              : 'bg-my-primary/10 text-my-primary border-my-primary/30'
                          }`}>
                            {m.senderType}
                          </span>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                      <div className={`mt-2 text-xs ${mine ? 'text-white/80' : 'text-gray-500 dark:text-slate-400'}`}>
                        {new Date(m.sentAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {/* Notifications Panel */}
        {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Notifications</h2>
          </div>
          <div className="p-5">
            {notifLoading && <div className="text-sm text-gray-500 dark:text-slate-400">Loading…</div>}
            {notifError && <div className="text-sm text-red-600 dark:text-red-400">{notifError}</div>}
            <ul className="space-y-3">
              {notifications.length === 0 && !notifLoading && (
                <li className="text-sm text-gray-500 dark:text-slate-400">No notifications for this session.</li>
              )}
              {notifications.map((n) => (
                <li key={n.id} className="text-sm text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-600 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">{n.type}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">{n.channel}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{new Date(n.scheduledAt).toLocaleString()}</span>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-slate-100">{n.message || n.title}</div>
                  {n.priority && <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Priority: {n.priority}</div>}
                  {n.status && <div className="text-xs text-gray-500 dark:text-slate-400">Status: {n.status}</div>}
                </li>
              ))}
            </ul>
          </div>
        </div>
        )}

        {/* Stats Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 mt-6">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Handover & Return Stats</h2>
          </div>
          <div className="p-5">
            {statsError && <div className="text-sm text-red-600 dark:text-red-400 mb-2">{statsError}</div>}
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 dark:border-slate-600 p-4">
                  <div className="text-xs text-gray-500 dark:text-slate-400">Total Handovers</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-slate-100">{stats.totalHandovers}</div>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-slate-600 p-4">
                  <div className="text-xs text-gray-500 dark:text-slate-400">Total Returns</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-slate-100">{stats.totalReturns}</div>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-slate-600 p-4">
                  <div className="text-xs text-gray-500 dark:text-slate-400">Handover Success</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-slate-100">{stats.handoverSuccessRate}%</div>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-slate-600 p-4">
                  <div className="text-xs text-gray-500 dark:text-slate-400">Return On-Time</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-slate-100">{stats.returnOnTimeRate}%</div>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-slate-600 p-4">
                  <div className="text-xs text-gray-500 dark:text-slate-400">Avg Handover Time</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-slate-100">{stats.averageHandoverTime} min</div>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-slate-600 p-4">
                  <div className="text-xs text-gray-500 dark:text-slate-400">Avg Return Processing</div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-slate-100">{stats.averageReturnProcessingTime} min</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-slate-400">Loading stats…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionMessagesPage;


