import React, { useState, useEffect } from 'react';
import { Search, Bell, Shield, User, LogOut, ChevronDown, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import type { UserProfile } from '../../../types/user';

interface AdminHeaderProps {
  selectedLocation: string;
  setSelectedLocation: (val: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (val: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ selectedLocation, setSelectedLocation, selectedLanguage, setSelectedLanguage }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        // For now, we'll use the user data structure you provided
        // In a real implementation, you'd make an API call here
        const mockUserData: UserProfile = {
          id: "6cc890f2-7169-44e1-b0f1-dc13d797d4e0",
          email: "nzayisengaemmy2001@gmail.com",
          firstName: "Emmy",
          lastName: "Keen",
          role: "admin",
          status: "pending",
          countryId: null,
          emailVerified: false,
          phoneVerified: true,
          createdAt: "2025-07-10T15:10:52.356Z",
          updatedAt: "2025-07-28T09:51:14.530Z",
          kyc_status: "verified",
          verifications: [
            {
              verification_type: "National ID",
              verification_status: "pending",
              created_at: "2025-07-18T12:27:14.610Z",
              updated_at: "2025-07-18T12:27:50.393Z"
            }
          ],
          kycProgress: {
            required: ["national_id", "selfie", "address"],
            verified: [],
            pending: ["National ID", "national_id"],
            rejected: [],
            completionRate: 0
          }
        };

        setUser(mockUserData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

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
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-my-primary" aria-label="Dashboard" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
            </div>
          </div>
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
                onBlur={() => setTimeout(() => setProfileOpen(false), 150)}
              >
                <img
                  src="/assets/img/profiles/avatar-01.jpg"
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="w-8 h-8 rounded-full object-cover"
                />
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
                  <img src="/assets/img/profiles/avatar-01.jpg" alt={`${user.firstName} ${user.lastName}`} className="w-24 h-24 rounded-full object-cover mb-4" />
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
                </div>
              </div>
            </div>

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
    </div>
  );
};

export default AdminHeader; 