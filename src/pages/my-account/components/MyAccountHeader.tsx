import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Sun, Moon, Menu, X, UserCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { getMyNotifications } from '../../../features/notifications/api';
import { fetchUserProfile } from '../service/api';
import { useMarkReadMutation, useNotificationsQuery } from '../../../features/notifications/queries';
import Portal from '../../../components/ui/Portal';
import { LanguageSwitcher } from '../../../components/language-switcher';

type HeaderProps = { 
  onToggleSidebar?: () => void;
  onNavigateToProfile?: () => void;
};

const MyAccountHeader: React.FC<HeaderProps> = ({ onToggleSidebar, onNavigateToProfile }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const modalQuery = useNotificationsQuery({ page: modalPage, limit: 50 });
  const modalItems = (
    (modalQuery.data as any)?.items ??
    (modalQuery.data as any)?.data?.items ??
    (modalQuery.data as any)?.data?.data ??
    (Array.isArray(modalQuery.data) ? modalQuery.data : [])
  ) as any[];
  
  // Use the full notifications data for dropdown
  const dropdownItems = notificationsData;

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
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
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
        setMobileSearchOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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
    } catch {}
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
        } catch {}
      } catch {}
    })();
  }, []);

  const handleMarkAllRead = () => {
    notificationsData.forEach((n: any) => {
      if (!n.read) markRead(n.id);
    });
  };

  return (
    <div className="w-full">
      <div className="">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-4">
            {/* Mobile: sidebar toggle */}
            <button
              onClick={() => onToggleSidebar?.()}
              className="p-2 rounded-xl border text-gray-700 hover:bg-gray-50 md:hidden dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Open navigation"
            > 
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-base sm:text-xl tracking-tight text-gray-900 dark:text-slate-100 whitespace-nowrap">My Account</h1>
            <button
              onClick={() => navigate('/browse')}
              className="px-3 py-1.5 rounded-xl border text-gray-700 hover:bg-gray-50 hidden sm:inline-flex dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Browse Items
            </button>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Desktop search */}
            <div className="relative hidden md:block" ref={notifRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200 w-64 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:bg-slate-900"
              />
            </div>
            {/* Mobile search button */}
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="p-2 rounded-xl border text-gray-700 md:hidden dark:text-slate-200 dark:border-slate-700"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Language Switcher */}
            <LanguageSwitcher 
              buttonClassName="p-2 rounded-xl border text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
            />
            <div className="relative" ref={notifRef} style={{ zIndex: 3000 }}>
              <button
                onClick={(e) => { e.stopPropagation(); setIsNotifOpen((v) => !v); }}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
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
                  onClickCapture={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between dark:border-slate-700">
                    <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">Notifications</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-slate-400">{unreadCount} unread</span>
                      <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Mark all as read</button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-auto">
                    {notificationsLoading ? (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm dark:text-slate-500">Loading...</div>
                    ) : dropdownItems.length > 0 ? (
                      dropdownItems.map((n: any) => (
                        <button
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-gray-50 dark:hover:bg-slate-800 ${
                            n.read ? '' : 'bg-primary-50/40 dark:bg-primary-900/10'
                          }`}
                        >
                          <div className={`mt-1 w-2 h-2 rounded-full ${n.read ? 'bg-gray-300 dark:bg-slate-600' : 'bg-primary-500'}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate dark:text-slate-100">{n.title || n.type || 'Notification'}</div>
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
                    <button type="button" onPointerDownCapture={(e)=>e.stopPropagation()} onMouseDown={(e)=>e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setIsNotifOpen(false); setShowAllModal(true); setModalPage(1); }} className="text-sm text-teal-600 hover:text-primary-700 font-medium" style={{ zIndex: 3002, pointerEvents: 'auto' }}>
                      View all
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Avatar Menu */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setIsAvatarMenuOpen((v) => !v)}
                className="flex items-center gap-2 group"
                aria-haspopup="menu"
                aria-expanded={isAvatarMenuOpen}
              >
                <span className="hidden sm:block text-sm text-gray-700 group-hover:text-gray-900 max-w-[120px] truncate dark:text-slate-300 dark:group-hover:text-slate-100">{userName}</span>
                <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100 dark:border-slate-700 dark:bg-slate-800">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm"><UserCircle></UserCircle></div>
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

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-x-0 top-16 z-50 px-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2 shadow-xl flex items-center">
            <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 ml-2" />
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              className="flex-1 px-3 py-2 bg-transparent outline-none text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
            />
            <button onClick={() => setMobileSearchOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close search">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
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
                <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                  {modalItems.map((n: any) => (
                    <li
                      key={n.id}
                      className="py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg p-2"
                      onClick={() => {
                        if (!n.read) { markRead(n.id); }
                      }}
                    >
                      <div className={`mt-1 w-2 h-2 rounded-full ${ n.read ? 'bg-gray-300 dark:bg-slate-600' : 'bg-emerald-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-slate-100 truncate">{n.title || n.type || 'Notification'}</h4>
                          {!n.read && (
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
    </div>
  );
};

export default MyAccountHeader;


