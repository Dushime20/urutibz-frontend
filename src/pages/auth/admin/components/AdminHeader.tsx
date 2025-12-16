import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Shield, User, LogOut, ChevronDown, CheckCircle, Clock, AlertCircle, UserCircle, RefreshCw, Upload, X, Check } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { adminService, type AdminUserProfile } from '../service';
import { getMyNotifications } from '../../../features/notifications/api';
import { useMarkReadMutation } from '../../../features/notifications/queries';

interface AdminHeaderProps {
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (val: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ selectedLocation, setSelectedLocation, selectedLanguage, setSelectedLanguage }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState<AdminUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const { mutate: markRead } = useMarkReadMutation();
  const notificationRef = useRef<HTMLDivElement | null>(null);

    // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Fetch real user data from backend
      const userData = await adminService.getCurrentUserProfile();
      setUser(userData);
      setError(null);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load profile. Using default data.');
      // Set a minimal user object for display
      setUser({
        id: 'unknown',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'active',
        countryId: null,
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        kyc_status: 'verified',
        verifications: [],
        kycProgress: {
          required: [],
          verified: [],
          pending: [],
          rejected: [],
          completionRate: 100
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (!showNotifications) return;
    
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const items = await getMyNotifications({ page: 1, limit: 50 });
        setNotifications(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();
  }, [showNotifications]);

  // Close notifications dropdown on outside click
  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const withinNotification = notificationRef.current?.contains(target ?? null) ?? false;
      if (!withinNotification) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Helper function to check if notification is read
  const isNotificationRead = (notification: any): boolean => {
    if (!notification) return false;
    if (typeof notification.read === 'boolean') return notification.read;
    if (typeof notification.is_read === 'boolean') return notification.is_read;
    if (typeof notification.isRead === 'boolean') return notification.isRead;
    if (notification.read_at || notification.readAt) return true;
    return false;
  };

  // Calculate unread count
  const unreadCount = notifications.reduce((count, notification) => 
    count + (isNotificationRead(notification) ? 0 : 1), 0
  );

  // Handle marking notification as read
  const handleMarkAsRead = (id: string) => {
    markRead(id);
    setNotifications(prev => 
      prev.map(n => 
        n.id === id 
          ? { ...n, read: true, is_read: true, isRead: true }
          : n
      )
    );
  };

  // Handle marking all as read
  const handleMarkAllAsRead = () => {
    notifications.forEach(n => {
      if (!isNotificationRead(n)) {
        markRead(n.id);
      }
    });
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true, is_read: true, isRead: true }))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Get verification status icon
  const getVerificationIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get verification status color
  const getVerificationColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleAvatarUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !avatarFile) return;

    try {
      setAvatarUploadLoading(true);
      setAvatarUploadError(null);
      setAvatarUploadSuccess(null);

      const result = await adminService.uploadUserAvatar(user.id, avatarFile);
      
      // Update the user in local state
      setUser(prevUser => prevUser ? { ...prevUser, profileImageUrl: result.profileImageUrl } : null);
      
      setAvatarUploadSuccess('Avatar uploaded successfully!');
      setTimeout(() => {
        setShowAvatarUpload(false);
        setAvatarFile(null);
        setAvatarUploadSuccess(null);
      }, 2000);
    } catch (error: any) {
      setAvatarUploadError(error.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploadLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setAvatarUploadError('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAvatarUploadError('File size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarUploadError(null);
    }
  };

  if (loading) {
    return (
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-my-primary" aria-label="Dashboard" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
              </div>
            </div>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-32 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      {/* Mobile: Minimal compact header */}
      <div className="md:hidden px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">Admin</h1>
          </div>
          <div className="flex items-center gap-1">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" 
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{unreadCount} unread</span>
                      )}
                      {notifications.length > 0 && unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-my-primary hover:text-my-primary/80 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                              !isNotificationRead(notification) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {notification.title || notification.type || 'Notification'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {notification.message || notification.content || notification.body || ''}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {notification.createdAt 
                                    ? new Date(notification.createdAt).toLocaleString()
                                    : notification.created_at
                                    ? new Date(notification.created_at).toLocaleString()
                                    : ''}
                                </p>
                              </div>
                              {!isNotificationRead(notification) && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="p-1 text-my-primary hover:bg-my-primary/10 rounded transition-colors flex-shrink-0"
                                  title="Mark as read"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative flex items-center">
              <button
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-my-primary rounded-xl"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label="Open profile menu"
                tabIndex={0}
                onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
              >
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {!user?.profileImageUrl && (
                  <UserCircle className="w-8 h-8 text-gray-400" />
                )}
              </button>
              {profileOpen && (
                <div className={`absolute right-0 top-10 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 transition-all duration-200 ${profileOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                  tabIndex={-1}
                  aria-hidden={!profileOpen}
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                  <div className="px-4 py-2">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => { setShowProfileModal(true); }}
                      aria-label="Profile"
                    >
                      <User className="w-4 h-4 mr-2" /> Profile Details
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors mt-1"
                      onClick={handleLogout}
                      aria-label="Logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Full header */}
      <div className="hidden md:block w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-my-primary" aria-label="Dashboard" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
            </div>
          </div>
                      {error && (
              <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
                <button
                  onClick={fetchCurrentUser}
                  disabled={loading}
                  className="ml-2 p-1 hover:bg-yellow-100 rounded transition-colors disabled:opacity-50"
                  title="Retry loading profile"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary"
              >
                <option value="all">All Locations</option>
                <option value="Kigali">🇷🇼 Kigali</option>
                <option value="Butare">🇷🇼 Butare</option>
                <option value="Kampala">🇺🇬 Kampala</option>
                <option value="Nairobi">🇰🇪 Nairobi</option>
              </select>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary"
              >
                <option value="en">🇺🇸 English</option>
                <option value="rw">🇷🇼 Kinyarwanda</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="sw">🇹🇿 Kiswahili</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-label="Search" />
              <input
                type="text"
                placeholder="Search users, items, bookings..."
                className="pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-my-primary focus:bg-white dark:focus:bg-gray-900 transition-all duration-200 w-80 text-gray-900 dark:text-gray-100"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Clear search">
                &times;
              </button>
            </div>
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" 
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{unreadCount} unread</span>
                      )}
                      {notifications.length > 0 && unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-my-primary hover:text-my-primary/80 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                              !isNotificationRead(notification) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {notification.title || notification.type || 'Notification'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {notification.message || notification.content || notification.body || ''}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {notification.createdAt 
                                    ? new Date(notification.createdAt).toLocaleString()
                                    : notification.created_at
                                    ? new Date(notification.created_at).toLocaleString()
                                    : ''}
                                </p>
                              </div>
                              {!isNotificationRead(notification) && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="p-1 text-my-primary hover:bg-my-primary/10 rounded transition-colors flex-shrink-0"
                                  title="Mark as read"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative flex items-center space-x-2 pl-4 border-l border-gray-200 dark:border-gray-800">
              <button
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-my-primary rounded-xl"
                onClick={() => setProfileOpen((open) => !open)}
                aria-label="Open profile menu"
                tabIndex={0}
                onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
              >
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to empty user icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {!user?.profileImageUrl && (
                  <UserCircle className="w-8 h-8 text-gray-400" />
                )}
                <UserCircle className="w-8 h-8 text-gray-400 hidden" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {/* Enhanced Dropdown with user details */}
              <div className={`absolute right-0 top-10   w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 transition-all duration-200 ${profileOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                tabIndex={-1}
                aria-hidden={!profileOpen}
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user?.kyc_status === 'verified'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : user?.kyc_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                      {user?.kyc_status === 'verified' ? '✓ Verified' : user?.kyc_status === 'pending' ? '⏳ Pending' : '❌ Unverified'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user?.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* KYC Progress Section */}
                {user && user.kycProgress && (
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">KYC Progress</div>
                    <div className="space-y-2">
                      {user.kycProgress.required.map((item) => {
                        const isVerified = user.kycProgress!.verified.includes(item);
                        const isPending = user.kycProgress!.pending.includes(item);
                        const isRejected = user.kycProgress!.rejected.includes(item);

                        return (
                          <div key={item} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                              {item.replace('_', ' ')}
                            </span>
                            <div className="flex items-center space-x-1">
                              {getVerificationIcon(
                                isVerified ? 'verified' : isPending ? 'pending' : isRejected ? 'rejected' : 'pending'
                              )}
                              <span className={getVerificationColor(
                                isVerified ? 'verified' : isPending ? 'pending' : isRejected ? 'rejected' : 'pending'
                              )}>
                                {isVerified ? 'Verified' : isPending ? 'Pending' : isRejected ? 'Rejected' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Completion</span>
                        <span>{user.kycProgress.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-my-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${user.kycProgress.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="px-4 py-2">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => { setShowProfileModal(true); }}
                    aria-label="Profile"
                  >
                    <User className="w-4 h-4 mr-2" /> Profile Details
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors mt-1"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Profile Modal */}
      {showProfileModal && user && (
        <Dialog open={showProfileModal} onClose={() => setShowProfileModal(false)} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-2xl mx-auto z-50 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Profile Details</Dialog.Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={`${user.firstName} ${user.lastName}`} 
                      className="w-24 h-24 rounded-full object-cover mb-4" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {!user.profileImageUrl && (
                    <UserCircle className="w-24 h-24 text-gray-400 mb-4" />
                  )}
                  <UserCircle className="w-24 h-24 text-gray-400 mb-4 hidden" />
                  <div className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 mb-2">{user.email}</div>
                  <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.kyc_status === 'verified'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : user.kyc_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                      {user.kyc_status === 'verified' ? '✓ Verified' : user.kyc_status === 'pending' ? '⏳ Pending' : '❌ Unverified'}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                      {user.role}
                    </span>
                  </div>
                  {/* Avatar Upload Button */}
                  <button
                    onClick={() => setShowAvatarUpload(true)}
                    className="mt-3 px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/80 transition-colors flex items-center text-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {user.profileImageUrl ? 'Change Avatar' : 'Upload Avatar'}
                  </button>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`font-medium ${user.status === 'active' ? 'text-green-600' :
                      user.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email Verified:</span>
                    <span className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                      {user.emailVerified ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone Verified:</span>
                    <span className={user.phoneVerified ? 'text-green-600' : 'text-red-600'}>
                      {user.phoneVerified ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {user.dateOfBirth && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date of Birth:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {new Date(user.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {user.gender && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                      <span className="text-gray-900 dark:text-gray-100 capitalize">
                        {user.gender}
                      </span>
                    </div>
                  )}
                  {user.bio && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Bio:</span>
                      <span className="text-gray-900 dark:text-gray-100 text-sm max-w-xs">
                        {user.bio}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            {(user.province || user.district || user.sector || user.cell || user.village || user.addressLine) && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Location Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {user.province && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Province:</span>
                        <span className="text-gray-900 dark:text-gray-100">{user.province}</span>
                      </div>
                    )}
                    {user.district && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">District:</span>
                        <span className="text-gray-900 dark:text-gray-100">{user.district}</span>
                      </div>
                    )}
                    {user.sector && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Sector:</span>
                        <span className="text-gray-900 dark:text-gray-100">{user.sector}</span>
                      </div>
                    )}
                    {user.cell && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cell:</span>
                        <span className="text-gray-900 dark:text-gray-100">{user.cell}</span>
                      </div>
                    )}
                    {user.village && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Village:</span>
                        <span className="text-gray-900 dark:text-gray-100">{user.village}</span>
                      </div>
                    )}
                    {user.addressLine && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Address:</span>
                        <span className="text-gray-900 dark:text-gray-100 text-sm max-w-xs">
                          {user.addressLine}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* KYC Progress Section */}
            {user.kycProgress && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">KYC Verification Progress</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                    <span className="text-sm font-bold text-my-primary">{user.kycProgress.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                    <div
                      className="bg-my-primary h-3 rounded-full transition-all duration-300"
                      style={{ width: `${user.kycProgress.completionRate}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{user.kycProgress.verified.length}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Verified</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{user.kycProgress.pending.length}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{user.kycProgress.rejected.length}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Rejected</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-6 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Avatar Upload Modal */}
      {showAvatarUpload && user && (
        <Dialog open={showAvatarUpload} onClose={() => setShowAvatarUpload(false)} className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md mx-auto z-50">
            <Dialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Upload Avatar
            </Dialog.Title>
            
            <form onSubmit={handleAvatarUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Select Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>
              </div>
              
              {avatarFile && (
                <div className="flex items-center space-x-3">
                  <img
                    src={URL.createObjectURL(avatarFile)}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{avatarFile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(avatarFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
              
              {avatarUploadError && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {avatarUploadError}
                </div>
              )}
              
              {avatarUploadSuccess && (
                <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  {avatarUploadSuccess}
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarUpload(false)}
                  className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={avatarUploadLoading || !avatarFile}
                  className="px-4 py-2 rounded bg-my-primary text-white hover:bg-my-primary/80 disabled:opacity-50 flex items-center transition-colors"
                >
                  {avatarUploadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Avatar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default AdminHeader; 