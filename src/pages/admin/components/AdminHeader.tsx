import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Shield, User, LogOut, ChevronDown, UserCircle, RefreshCw, Upload, X, AlertCircle, Lock, Smartphone, Menu, Globe, Check } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { adminService, type AdminUserProfile } from '../service';
import { TwoFactorManagement, TwoFactorVerification } from '../../../components/2fa';
import ChangePasswordModal from '../../my-account/components/ChangePasswordModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../contexts/ToastContext';
import Portal from '../../../components/ui/Portal';
import { useTranslation } from '../../../hooks/useTranslation';
import { getMyNotifications } from '../../../features/notifications/api';
import { useMarkReadMutation } from '../../../features/notifications/queries';

interface AdminHeaderProps {
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (val: string) => void;
  onMenuToggle?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ selectedLocation, setSelectedLocation, selectedLanguage, setSelectedLanguage, onMenuToggle }) => {
  const { language, setLanguage } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<AdminUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState<string | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [show2FAVerify, setShow2FAVerify] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const { mutate: markRead } = useMarkReadMutation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const languageButtonRef = useRef<HTMLButtonElement | null>(null);
  const languageDropdownRef = useRef<HTMLDivElement | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const languageOptions = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
    { code: 'rw', name: 'Kinyarwanda', nativeName: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' }
  ];
  const activeLanguage =
    languageOptions.find((option) => option.code === selectedLanguage) || languageOptions[0];

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
      try {
        const enabled = (userData as any)?.twoFactorEnabled || (userData as any)?.two_factor_enabled;
        const verified = (userData as any)?.twoFactorVerified || (userData as any)?.two_factor_verified;
        if (enabled && !verified) {
          setShow2FAVerify(true);
        }
      } catch {}
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

  // Close profile menu on outside click
  useEffect(() => {
    const handleDocumentMouseDown = (e: MouseEvent) => {
      if (!profileOpen) return;
      const target = e.target as Node | null;
      const withinButton = profileButtonRef.current?.contains(target as Node) ?? false;
      const withinMenu = profileMenuRef.current?.contains(target as Node) ?? false;
      if (!withinButton && !withinMenu) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [profileOpen]);

  useEffect(() => {
    if (!showLanguageDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const withinButton = languageButtonRef.current?.contains(target ?? null) ?? false;
      const withinDropdown = languageDropdownRef.current?.contains(target ?? null) ?? false;
      if (!withinButton && !withinDropdown) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageDropdown]);

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
    showToast('Logged out successfully', 'success');
    navigate('/login');
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
      <div className="sticky top-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button - visible on mobile/tablet, hidden on xl+ */}
              {onMenuToggle && (
                <button
                  onClick={onMenuToggle}
                  className="xl:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
              )}
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
    <div className="sticky top-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Mobile: Minimal compact header */}
      <div className="md:hidden px-3 py-2">
        <div className="flex items-center justify-between">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}
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
                ref={profileButtonRef}
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
                <div
                  ref={profileMenuRef}
                  className="absolute right-0 top-10 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 transition-all duration-200"
                  tabIndex={-1}
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                    </div>
                  </div>
                  <div className="px-4 py-2">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => {
                        (document.activeElement as HTMLElement | null)?.blur?.();
                        setProfileOpen(false);
                        setTimeout(() => {
                          const event = new CustomEvent('admin-navigate', { detail: { tab: 'profile' } });
                          window.dispatchEvent(event);
                        }, 0);
                      }}
                      aria-label="Profile"
                    >
                      <User className="w-4 h-4 mr-2" /> Profile Details
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors mt-1"
                      onClick={() => {
                        (document.activeElement as HTMLElement | null)?.blur?.();
                        setProfileOpen(false);
                        setTimeout(() => setShow2FAModal(true), 0);
                      }}
                      aria-label="Two-factor Authentication"
                    >
                      <Smartphone className="w-4 h-4 mr-2" /> Two-Factor Authentication
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors mt-1"
                      onClick={() => {
                        (document.activeElement as HTMLElement | null)?.blur?.();
                        setProfileOpen(false);
                        setTimeout(() => setShowChangePassword(true), 0);
                      }}
                      aria-label="Change Password"
                    >
                      <Lock className="w-4 h-4 mr-2" /> Change Password
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
      <div className="hidden md:block w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu Button - visible on mobile/tablet, hidden on xl+ */}
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="xl:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            )}
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
              <div className="relative">
                <button
                  ref={languageButtonRef}
                  onClick={() => setShowLanguageDropdown((open) => !open)}
                  className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary"
                >
                  <span className="text-base">{activeLanguage?.flag}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {activeLanguage?.nativeName || selectedLanguage.toUpperCase()}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {showLanguageDropdown && (
                  <div
                    ref={languageDropdownRef}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30"
                  >
                    <div className="py-1 max-h-72 overflow-y-auto">
                      {languageOptions.map((option) => (
                        <button
                          key={option.code}
                          onClick={() => {
                            setLanguage(option.code); // Update global language context
                            setSelectedLanguage(option.code); // Update local state (prop)
                            setShowLanguageDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                            selectedLanguage === option.code
                              ? 'bg-my-primary/10 text-my-primary font-semibold'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="text-lg">{option.flag}</span>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.nativeName}</span>
                            {option.name !== option.nativeName && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{option.name}</span>
                            )}
                          </div>
                          {selectedLanguage === option.code && <span className="ml-auto text-my-primary">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                ref={profileButtonRef}
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
              <div ref={profileMenuRef} className={`absolute right-0 top-10 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 transition-all duration-200 ${profileOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                tabIndex={-1}
                role="menu"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                  </div>
                </div>


                {/* Action Buttons */}
                <div className="px-4 py-2">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => {
                      // Move focus away before closing hidden menu
                      (document.activeElement as HTMLElement | null)?.blur?.();
                      // Close the dropdown first
                      setProfileOpen(false);
                      // Switch Admin Dashboard to Profile tab (defer to next tick)
                      setTimeout(() => {
                        const event = new CustomEvent('admin-navigate', { detail: { tab: 'profile' } });
                        window.dispatchEvent(event);
                      }, 0);
                    }}
                    aria-label="Profile"
                  >
                    <User className="w-4 h-4 mr-2" /> Profile Details
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors mt-1"
                    onClick={() => {
                      (document.activeElement as HTMLElement | null)?.blur?.();
                      setProfileOpen(false);
                      setTimeout(() => setShow2FAModal(true), 0);
                    }}
                    aria-label="Two-factor Authentication"
                  >
                    <Smartphone className="w-4 h-4 mr-2" /> Two-Factor Authentication
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors mt-1"
                    onClick={() => {
                      (document.activeElement as HTMLElement | null)?.blur?.();
                      setProfileOpen(false);
                      setTimeout(() => setShowChangePassword(true), 0);
                    }}
                    aria-label="Change Password"
                  >
                    <Lock className="w-4 h-4 mr-2" /> Change Password
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


      {/* 2FA Management Modal */}
      {show2FAModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-my-primary/10 rounded-md">
                    <Smartphone className="w-4 h-4 text-my-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage your 2FA settings</p>
                  </div>
                </div>
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  aria-label="Close 2FA"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="p-3">
                <div className="max-h-[70vh] overflow-y-auto scale-95 origin-top">
                  <TwoFactorManagement onStatusChange={() => {}} />
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {show2FAVerify && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md overflow-hidden">
              <TwoFactorVerification
                onVerificationSuccess={() => setShow2FAVerify(false)}
                onCancel={() => setShow2FAVerify(false)}
                onBackToLogin={() => setShow2FAVerify(false)}
              />
            </div>
          </div>
        </Portal>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <Portal>
          <ChangePasswordModal
            isOpen={showChangePassword}
            onClose={() => setShowChangePassword(false)}
            token={typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : ''}
          />
        </Portal>
      )}
    </div>
  );
};

export default AdminHeader; 