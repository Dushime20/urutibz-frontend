import React, { useState, useEffect } from 'react';
import { Search, Bell, Shield, User, LogOut, ChevronDown, UserCircle, RefreshCw, Upload, X, AlertCircle, Lock, Smartphone } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { adminService, type AdminUserProfile } from '../service';
import { TwoFactorManagement, TwoFactorVerification } from '../../../components/2fa';
import ChangePasswordModal from '../../my-account/components/ChangePasswordModal';
// import { useNavigate } from 'react-router-dom';
// import { useToast } from '../../../contexts/ToastContext';
import Portal from '../../../components/ui/Portal';

interface AdminHeaderProps {
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (val: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ selectedLocation, setSelectedLocation, selectedLanguage, setSelectedLanguage }) => {
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
  // const navigate = useNavigate();
  // const { showToast } = useToast();
  const profileButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = React.useRef<HTMLDivElement | null>(null);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
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
      <div className="w-full px-4 sm:px-6 lg:px-8">
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
            <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
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