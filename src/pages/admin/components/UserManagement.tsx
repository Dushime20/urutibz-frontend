import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Calendar, Package, Filter, Plus, Eye, MoreVertical, UserCircle, Shield, FileText, X, Search } from 'lucide-react';
import type { AdminUser, UserVerification, VerificationStats } from '../interfaces';
import { fetchAdminUsers, fetchAdminUserById, moderateAdminUser, fetchAllVerifications, updateVerificationStatus, fetchPendingVerifications, fetchVerificationStats, bulkReviewVerifications, updateUserKycStatus } from '../service';
import SkeletonTable from './SkeletonTable';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import VerificationDetailsModal from './VerificationDetailsModal';
import Pagination from '../../../components/ui/Pagination';
import UserRegistrationModal from './UserRegistrationModal';
import { Users as UsersIcon } from 'lucide-react';
import { formatDateUTC } from '../../../utils/dateUtils';

interface UserManagementProps {
  Button: React.FC<any>;
}

const UserManagement: React.FC<UserManagementProps> = ({ Button }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    hosts: 0
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  const [viewUser, setViewUser] = useState<any>(null);
  const [viewUserLoading, setViewUserLoading] = useState(false);
  const [viewUserError, setViewUserError] = useState<string | null>(null);
  const [moderateUser, setModerateUser] = useState<AdminUser | null>(null);
  const [moderateAction, setModerateAction] = useState<'ban' | 'suspend' | 'activate' | 'warn'>('ban');
  const [moderateReason, setModerateReason] = useState('');
  const [moderateDuration, setModerateDuration] = useState<number | ''>('');
  const [moderateLoading, setModerateLoading] = useState(false);
  const [moderateError, setModerateError] = useState<string | null>(null);
  const [moderateSuccess, setModerateSuccess] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'verifications' | 'pending'>('users');
  const [verifications, setVerifications] = useState<UserVerification[]>([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);
  const [verificationsError, setVerificationsError] = useState<string | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<UserVerification[]>([]);
  const [pendingVerificationsLoading, setPendingVerificationsLoading] = useState(false);
  const [pendingVerificationsError, setPendingVerificationsError] = useState<string | null>(null);
  const [verificationFilters, setVerificationFilters] = useState({
    status: '',
    verification_type: '',
    ai_processing_status: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  const [verificationStats, setVerificationStats] = useState<VerificationStats | null>(null);
  const [verificationStatsLoading, setVerificationStatsLoading] = useState(false);
  const [verificationStatsError, setVerificationStatsError] = useState<string | null>(null);
  
  // Bulk verification states
  const [selectedVerifications, setSelectedVerifications] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'verified' | 'rejected'>('verified');
  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Verification details modal states
  const [verificationDetailsModal, setVerificationDetailsModal] = useState<{
    isOpen: boolean;
    verificationId: string | null;
  }>({
    isOpen: false,
    verificationId: null
  });

  // KYC Status Update State
  const [kycUpdateUser, setKycUpdateUser] = useState<AdminUser | null>(null);
  const [kycStatus, setKycStatus] = useState<'verified' | 'rejected' | 'pending'>('verified');
  const [kycNotes, setKycNotes] = useState('');
  const [kycUpdating, setKycUpdating] = useState(false);
  const [kycMessage, setKycMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User filters state
  const [userFilters, setUserFilters] = useState({
    role: 'all',
    status: 'all',
    kycStatus: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showUserFilters, setShowUserFilters] = useState(false);
  
  // User registration modal state
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  
  // Handle successful user registration
  const handleUserRegistrationSuccess = (newUser: AdminUser) => {
    // Add the new user to the current users list
    setUsers(prev => [newUser, ...prev]);
    setTotalUsers(prev => prev + 1);
    setRegistrationModalOpen(false);
  };

  // Filter users based on current filter state
  const filteredUsers = users.filter((user) => {
    // Role filter
    if (userFilters.role !== 'all' && user.role.toLowerCase() !== userFilters.role.toLowerCase()) {
      return false;
    }

    // Status filter
    if (userFilters.status !== 'all' && user.status.toLowerCase() !== userFilters.status.toLowerCase()) {
      return false;
    }

    // KYC status filter
    if (userFilters.kycStatus !== 'all' && user.kyc_status.toLowerCase() !== userFilters.kycStatus.toLowerCase()) {
      return false;
    }

    // Date range filter
    if (userFilters.dateFrom) {
      const userCreatedDate = new Date(user.created_at);
      const filterFromDate = new Date(userFilters.dateFrom);
      if (userCreatedDate < filterFromDate) {
        return false;
      }
    }
    if (userFilters.dateTo) {
      const userCreatedDate = new Date(user.created_at);
      const filterToDate = new Date(userFilters.dateTo);
      if (userCreatedDate > filterToDate) {
        return false;
      }
    }

    // Search filter
    if (userFilters.search) {
      const userName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const userEmail = user.email.toLowerCase();
      const searchTerm = userFilters.search.toLowerCase();
      if (!userName.includes(searchTerm) && !userEmail.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });

  // Clear all user filters
  const clearUserFilters = () => {
    setUserFilters({
      role: 'all',
      status: 'all',
      kycStatus: 'all',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Check if any user filters are active
  const hasActiveUserFilters = userFilters.role !== 'all' || 
    userFilters.status !== 'all' || 
    userFilters.kycStatus !== 'all' || 
    userFilters.search || 
    userFilters.dateFrom || 
    userFilters.dateTo;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetchAdminUsers(currentPage, itemsPerPage, token || undefined);
        if (response.items) {
          setUsers(response.items);
          setTotalPages(response.pagination.totalPages);
          setTotalUsers(response.pagination.total);
          
          // Debug: Log the first user to see what fields are available
          if (response.items.length > 0) {
            console.log('First user in UserManagement:', response.items[0]);
            console.log('Profile image fields:', {
              profile_image: response.items[0].profile_image,
              profileImageUrl: response.items[0].profileImageUrl
            });
          }
          
          // Calculate stats
          const total = response.pagination.total;
          // Use kyc_status for verified
          const verified = response.items.filter(user => user.kyc_status?.toLowerCase() === 'verified').length;
          const pending = response.items.filter(user => user.status?.toLowerCase() === 'pending').length;
          const hosts = response.items.filter(user =>
            (user.role?.toLowerCase() === 'host') ||
            (user.role?.toLowerCase() === 'owner') ||
            (user.role?.toLowerCase() === 'vendor')
          ).length;
          setStats({
            total,
            verified,
            pending,
            hosts
          });
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('.relative')) {
        setActionMenuOpen(null);
      }
    }
    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [actionMenuOpen]);

  useEffect(() => {
    if (activeTab === 'verifications') {
      fetchVerifications();
      fetchVerificationStatsData();
    } else if (activeTab === 'pending') {
      fetchPendingVerificationsData();
    }
  }, [activeTab, verificationFilters]);

  const fetchVerifications = async () => {
    try {
      setVerificationsLoading(true);
      setVerificationsError(null);
      const token = localStorage.getItem('token');
      const response = await fetchAllVerifications(1, 50, verificationFilters, token || undefined);
      if (response.verifications) {
        setVerifications(response.verifications);
      }
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setVerificationsError('Failed to fetch verifications');
    } finally {
      setVerificationsLoading(false);
    }
  };

  const fetchPendingVerificationsData = async () => {
    try {
      setPendingVerificationsLoading(true);
      setPendingVerificationsError(null);
      const token = localStorage.getItem('token');
      const response = await fetchPendingVerifications(1, 50, token || undefined);
      setPendingVerifications(response || []);
    } catch (err) {
      console.error('Error fetching pending verifications:', err);
      setPendingVerificationsError('Failed to fetch pending verifications');
    } finally {
      setPendingVerificationsLoading(false);
    }
  };

  const fetchVerificationStatsData = async () => {
    try {
      setVerificationStatsLoading(true);
      setVerificationStatsError(null);
      const token = localStorage.getItem('token');
      const response = await fetchVerificationStats(token || undefined);
      setVerificationStats(response);
    } catch (err) {
      console.error('Error fetching verification stats:', err);
      setVerificationStatsError('Failed to fetch verification stats');
    } finally {
      setVerificationStatsLoading(false);
    }
  };

  // Bulk verification functions
  const handleVerificationSelect = (verificationId: string) => {
    setSelectedVerifications(prev => 
      prev.includes(verificationId) 
        ? prev.filter(id => id !== verificationId)
        : [...prev, verificationId]
    );
  };

  const handleSelectAllVerifications = () => {
    if (selectedVerifications.length === (activeTab === 'pending' ? pendingVerifications.length : verifications.length)) {
      setSelectedVerifications([]);
    } else {
      const allIds = activeTab === 'pending' 
        ? pendingVerifications.map(v => v.id)
        : verifications.map(v => v.id);
      setSelectedVerifications(allIds);
    }
  };

  const handleBulkVerification = async () => {
    if (selectedVerifications.length === 0) return;

    try {
      setBulkLoading(true);
      setBulkError(null);
      setBulkSuccess(null);
      
      const token = localStorage.getItem('token');
      await bulkReviewVerifications(selectedVerifications, bulkAction, bulkNotes, token || undefined);
      
      setBulkSuccess(`Successfully ${bulkAction} ${selectedVerifications.length} verification(s)`);
      setSelectedVerifications([]);
      setBulkNotes('');
      
      // Refresh the data
      if (activeTab === 'pending') {
        fetchPendingVerificationsData();
      } else {
        fetchVerifications();
      }
      if (activeTab === 'verifications') {
        fetchVerificationStatsData();
      }
    } catch (err) {
      console.error('Error performing bulk verification:', err);
      setBulkError('Failed to perform bulk verification');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleKycStatusUpdate = async () => {
    if (!kycUpdateUser) return;
    
    setKycUpdating(true);
    setKycMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      await updateUserKycStatus(kycUpdateUser.id, { kycStatus, notes: kycNotes }, token || undefined);
      
      setKycMessage({ type: 'success', text: `KYC status updated to ${kycStatus} successfully` });
      setKycUpdateUser(null);
      setKycStatus('verified');
      setKycNotes('');
      
      // Refresh users data by calling the useEffect logic
      const token2 = localStorage.getItem('token');
      const response = await fetchAdminUsers(1, 50, token2 || undefined);
      if (response.items) {
        setUsers(response.items);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setKycMessage(null), 3000);
    } catch (err: any) {
      setKycMessage({ type: 'error', text: err.message || 'Failed to update KYC status' });
    } finally {
      setKycUpdating(false);
    }
  };

  const openVerificationDetails = (verificationId: string) => {
    setVerificationDetailsModal({
      isOpen: true,
      verificationId
    });
  };

  const closeVerificationDetails = () => {
    setVerificationDetailsModal({
      isOpen: false,
      verificationId: null
    });
  };

  // Use shared UTC date formatter
  const formatDate = formatDateUTC;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'verified':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'host':
      case 'owner':
      case 'vendor':
        return 'bg-purple-100 text-purple-700';
      case 'user':
      case 'renter':
        return 'bg-my-primary/10 text-my-primary';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <SkeletonTable columns={6} rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <EmptyState icon={<UsersIcon />} title="No users found" message="There are currently no users in the system. New users will appear here as they register." />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">User Management</h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Users: {totalUsers} | Showing: {filteredUsers.length}
          </span>
          <button
            onClick={() => setShowUserFilters(!showUserFilters)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium transition-colors ${
              showUserFilters || hasActiveUserFilters
                ? 'bg-my-primary text-white border-my-primary'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveUserFilters && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                {[userFilters.role !== 'all', userFilters.status !== 'all', userFilters.kycStatus !== 'all', userFilters.search, userFilters.dateFrom, userFilters.dateTo].filter(Boolean).length}
              </span>
            )}
          </button>
          {activeTab === 'users' && (
            <button
              onClick={() => setRegistrationModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Register User
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-white dark:bg-gray-600 text-my-primary shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users</span>
        </button>
                 <button
           onClick={() => setActiveTab('verifications')}
           className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
             activeTab === 'verifications'
               ? 'bg-white dark:bg-gray-600 text-my-primary shadow-sm'
               : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
           }`}
         >
           <Shield className="w-4 h-4" />
           <span>Verifications</span>
         </button>
         <button
           onClick={() => setActiveTab('pending')}
           className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
             activeTab === 'pending'
               ? 'bg-white dark:bg-gray-600 text-my-primary shadow-sm'
               : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
           }`}
         >
           <Calendar className="w-4 h-4" />
           <span>Pending</span>
         </button>
      </div>

      {/* User Filters Panel */}
      {activeTab === 'users' && showUserFilters && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={userFilters.role}
                onChange={(e) => setUserFilters(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={userFilters.status}
                onChange={(e) => setUserFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* KYC Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                KYC Status
              </label>
              <select
                value={userFilters.kycStatus}
                onChange={(e) => setUserFilters(prev => ({ ...prev, kycStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              >
                <option value="all">All KYC</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Registration Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Registered From
              </label>
              <input
                type="date"
                value={userFilters.dateFrom}
                onChange={(e) => setUserFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              />
            </div>

            {/* Registration Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Registered To
              </label>
              <input
                type="date"
                value={userFilters.dateTo}
                onChange={(e) => setUserFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
              />
            </div>

            {/* User Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={userFilters.search}
                  onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              {hasActiveUserFilters && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredUsers.length} of {totalUsers} users match your filters
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {hasActiveUserFilters && (
                <button
                  onClick={clearUserFilters}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'users' ? (
        <>
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-my-primary/10 dark:bg-my-primary/20 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-my-primary font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-my-primary">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-my-primary" />
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Verified</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.verified}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Hosts</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.hosts}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th> */}
              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th> */}
              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                KYC Status
              </th> */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    {hasActiveUserFilters ? (
                      <div>
                        <p className="text-lg font-medium mb-2">No users match your filters</p>
                        <p className="text-sm">Try adjusting your filter criteria or clear all filters to see all users.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium mb-2">No users found</p>
                        <p className="text-sm">There are currently no users in the system.</p>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {(user.profile_image || user.profileImageUrl) ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={user.profile_image || user.profileImageUrl} 
                          alt={`${user.first_name || user.firstName} ${user.last_name || user.lastName}`}
                          onError={(e) => {
                            // Fallback to empty user icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      {!(user.profile_image || user.profileImageUrl) && (
                        <UserCircle className="h-10 w-10 text-gray-400" />
                      )}
                      <UserCircle className="h-10 w-10 text-gray-400 hidden" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.first_name || user.firstName} {user.last_name || user.lastName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td> */}
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td> */}
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getKycStatusColor(user.kyc_status)}`}>
                      {user.kyc_status || 'pending'}
                    </span>
                    <button
                      onClick={() => {
                        setKycUpdateUser(user);
                        setKycStatus(user.kyc_status as 'verified' | 'rejected' | 'pending' || 'pending');
                        setKycNotes('');
                        setKycMessage(null);
                      }}
                      className="text-xs text-my-primary hover:text-my-primary/80 font-medium"
                      title="Update KYC Status"
                    >
                      Update
                    </button>
                  </div>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at || user.createdAt || '')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <button
                    className="p-2 text-gray-400 hover:text-my-primary rounded-lg hover:bg-my-primary/10 transition-colors"
                    onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                    title="More actions"
                    aria-label="More actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {actionMenuOpen === user.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={async () => {
                          setActionMenuOpen(null);
                          // Open modal immediately with loading state
                          setViewUser({});
                          setViewUserLoading(true);
                          setViewUserError(null);
                          try {
                            const token = localStorage.getItem('token') || localStorage.getItem('authToken') || undefined;
                            const res = await fetchAdminUserById(user.id, token);
                            // res is normalized to the user object
                            setViewUser(res || {});
                          } catch (err: any) {
                            setViewUserError(err.message || 'Failed to retrieve user details');
                          } finally {
                            setViewUserLoading(false);
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setActionMenuOpen(null);
                          setModerateUser(user);
                          setModerateAction('ban');
                          setModerateReason('');
                          setModerateDuration('');
                          setModerateError(null);
                          setModerateSuccess(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                      >
                        Moderate
                      </button>
                    </div>
                  )}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
        {/* Items per page selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Users per page:</span>
          <select
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          >
            {[10, 20, 30, 50, 100].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        
        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalUsers}
          itemsPerPage={itemsPerPage}
          showItemCount={true}
        />
      </div>
        </>
      ) : activeTab === 'verifications' ? (
        <>
                     {/* Verification Stats */}
           {verificationStatsLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 animate-pulse">
                   <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                   <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                 </div>
               ))}
             </div>
           ) : verificationStatsError ? (
             <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 mb-6">
               <p className="text-red-600 dark:text-red-400 text-center">{verificationStatsError}</p>
               <button 
                 onClick={fetchVerificationStatsData}
                 className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
               >
                 Retry
               </button>
             </div>
           ) : verificationStats ? (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
               <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Users</p>
                     <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{verificationStats.totalUsers}</p>
                   </div>
                   <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                 </div>
               </div>
               <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-green-600 dark:text-green-400 font-medium">Verified</p>
                     <p className="text-2xl font-bold text-green-700 dark:text-green-400">{verificationStats.statusBreakdown.verified}</p>
                   </div>
                   <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                 </div>
               </div>
               <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Pending</p>
                     <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{verificationStats.statusBreakdown.pending}</p>
                   </div>
                   <Calendar className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                 </div>
               </div>
               <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-red-600 dark:text-red-400 font-medium">Rejected</p>
                     <p className="text-2xl font-bold text-red-700 dark:text-red-400">{verificationStats.statusBreakdown.rejected}</p>
                   </div>
                   <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                 </div>
               </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
               <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Verifications</p>
                     <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{verifications.length}</p>
                   </div>
                   <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                 </div>
               </div>
               <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-green-600 dark:text-green-400 font-medium">Verified</p>
                     <p className="text-2xl font-bold text-green-700 dark:text-green-400">{verifications.filter(v => v.verification_status === 'verified').length}</p>
                   </div>
                   <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                 </div>
               </div>
               <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Pending</p>
                     <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{verifications.filter(v => v.verification_status === 'pending').length}</p>
                   </div>
                   <Calendar className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                 </div>
               </div>
               <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm text-red-600 dark:text-red-400 font-medium">Rejected</p>
                     <p className="text-2xl font-bold text-red-700 dark:text-red-400">{verifications.filter(v => v.verification_status === 'rejected').length}</p>
                   </div>
                   <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                 </div>
               </div>
             </div>
                      )}

                     {/* Additional Verification Stats */}
          {verificationStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Verification Rate</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{verificationStats.verificationRate}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Verified Users</p>
                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{verificationStats.verifiedUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Recent Activity</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{verificationStats.recentActivity}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          )}

          {/* Verification Type Breakdown */}
          {verificationStats && verificationStats.typeBreakdown && Object.keys(verificationStats.typeBreakdown).length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Verification Type Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(verificationStats.typeBreakdown).map(([type, count]) => (
                  <div key={type} className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium capitalize">{type}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

           {/* Verification Filters */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={verificationFilters.status}
                  onChange={(e) => setVerificationFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification Type</label>
                <select
                  value={verificationFilters.verification_type}
                  onChange={(e) => setVerificationFilters(prev => ({ ...prev, verification_type: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="National ID">National ID</option>
                  <option value="Passport">Passport</option>
                  <option value="Driver License">Driver License</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI Processing</label>
                <select
                  value={verificationFilters.ai_processing_status}
                  onChange={(e) => setVerificationFilters(prev => ({ ...prev, ai_processing_status: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="queued">Queued</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Verifications Table */}
          {verificationsLoading ? (
            <SkeletonTable columns={6} rows={6} />
          ) : verificationsError ? (
            <ErrorState message={verificationsError} onRetry={fetchVerifications} />
          ) : verifications.length === 0 ? (
            <EmptyState icon={<Shield />} title="No verifications found" message="There are currently no verifications in the system." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      AI Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {verifications.map((verification) => (
                    <tr key={verification.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <UserCircle className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {verification.first_name} {verification.last_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{verification.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{verification.verification_type}</div>
                        {verification.document_number && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{verification.document_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(verification.verification_status)}`}>
                          {verification.verification_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {verification.ai_profile_score ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              parseFloat(verification.ai_profile_score) >= 0.7 ? 'bg-green-100 text-green-700' :
                              parseFloat(verification.ai_profile_score) >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {parseFloat(verification.ai_profile_score).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{verification.ai_processing_status}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(verification.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openVerificationDetails(verification.id)}
                          className="text-my-primary hover:text-my-primary/80 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
           )}
         </>
       ) : activeTab === 'pending' ? (
         <>
           {/* Pending Verifications Stats */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
             <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Pending</p>
                   <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{pendingVerifications.length}</p>
                 </div>
                 <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
               </div>
             </div>
             <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">AI Processing</p>
                   <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{pendingVerifications.filter(v => v.ai_processing_status === 'queued').length}</p>
                 </div>
                 <Package className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
               </div>
             </div>
             <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Passport</p>
                   <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{pendingVerifications.filter(v => v.verification_type === 'passport').length}</p>
                 </div>
                 <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
               </div>
             </div>
             <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-green-600 dark:text-green-400 font-medium">National ID</p>
                   <p className="text-2xl font-bold text-green-700 dark:text-green-400">{pendingVerifications.filter(v => v.verification_type === 'national_id').length}</p>
                 </div>
                 <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
               </div>
             </div>
           </div>

           {/* Bulk Verification Actions */}
           {pendingVerifications.length > 0 && (
             <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
               <div className="flex items-center justify-between mb-4">
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bulk Actions</h4>
                 <div className="text-sm text-gray-600 dark:text-gray-400">
                   {selectedVerifications.length} of {pendingVerifications.length} selected
                 </div>
               </div>
               
               <div className="flex items-center space-x-4 mb-4">
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     checked={selectedVerifications.length === pendingVerifications.length}
                     onChange={handleSelectAllVerifications}
                     className="rounded border-gray-300 text-my-primary focus:ring-my-primary"
                   />
                   <span className="text-sm text-gray-700 dark:text-gray-300">Select All</span>
                 </div>
                 
                 <select
                   value={bulkAction}
                   onChange={(e) => setBulkAction(e.target.value as 'verified' | 'rejected')}
                   className="rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm focus:ring-my-primary focus:border-my-primary"
                 >
                   <option value="verified">Verify</option>
                   <option value="rejected">Reject</option>
                 </select>
                 
                 <input
                   type="text"
                   placeholder="Optional notes..."
                   value={bulkNotes}
                   onChange={(e) => setBulkNotes(e.target.value)}
                   className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm focus:ring-my-primary focus:border-my-primary"
                 />
                 
                 <button
                   onClick={handleBulkVerification}
                   disabled={selectedVerifications.length === 0 || bulkLoading}
                   className="bg-my-primary hover:bg-my-primary/80 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                 >
                   {bulkLoading ? 'Processing...' : `Bulk ${bulkAction === 'verified' ? 'Verify' : 'Reject'}`}
                 </button>
               </div>
               
               {/* Success/Error Messages */}
               {bulkSuccess && (
                 <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-green-800 dark:text-green-200 text-sm">
                   {bulkSuccess}
                 </div>
               )}
               {bulkError && (
                 <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200 text-sm">
                   {bulkError}
                 </div>
               )}
             </div>
           )}

           {/* Pending Verifications Table */}
           {pendingVerificationsLoading ? (
             <SkeletonTable columns={6} rows={6} />
           ) : pendingVerificationsError ? (
             <ErrorState message={pendingVerificationsError} onRetry={fetchPendingVerificationsData} />
           ) : pendingVerifications.length === 0 ? (
             <EmptyState icon={<Calendar />} title="No pending verifications" message="There are currently no pending verifications in the system." />
           ) : (
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                 <thead className="bg-gray-50 dark:bg-gray-700">
                   <tr>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       <input
                         type="checkbox"
                         checked={selectedVerifications.length === pendingVerifications.length}
                         onChange={handleSelectAllVerifications}
                         className="rounded border-gray-300 text-my-primary focus:ring-my-primary"
                       />
                     </th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       User
                     </th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       Type
                     </th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       AI Status
                     </th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       Location
                     </th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       Created
                     </th>
                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       Actions
                     </th>
                   </tr>
                 </thead>
                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                   {pendingVerifications.map((verification) => (
                     <tr key={verification.id}>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <input
                           type="checkbox"
                           checked={selectedVerifications.includes(verification.id)}
                           onChange={() => handleVerificationSelect(verification.id)}
                           className="rounded border-gray-300 text-my-primary focus:ring-my-primary"
                         />
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                           <div className="flex-shrink-0 h-10 w-10">
                             <UserCircle className="h-10 w-10 text-gray-400" />
                           </div>
                           <div className="ml-4">
                             <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                               {verification.first_name} {verification.last_name}
                             </div>
                             <div className="text-sm text-gray-500 dark:text-gray-400">{verification.email}</div>
                             <div className="text-xs text-gray-400">{verification.phone_number}</div>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900 dark:text-gray-100 capitalize">{verification.verification_type}</div>
                         {verification.document_number && (
                           <div className="text-xs text-gray-500 dark:text-gray-400">{verification.document_number}</div>
                         )}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                           verification.ai_processing_status === 'completed' ? 'bg-green-100 text-green-700' :
                           verification.ai_processing_status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                           verification.ai_processing_status === 'failed' ? 'bg-red-100 text-red-700' :
                           'bg-gray-100 text-gray-700'
                         }`}>
                           {verification.ai_processing_status}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900 dark:text-gray-100">
                           {verification.city && verification.country ? (
                             <>
                               <div>{verification.city}</div>
                               <div className="text-xs text-gray-500 dark:text-gray-400">{verification.country}</div>
                             </>
                           ) : (
                             <span className="text-gray-400">N/A</span>
                           )}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                         {formatDate(verification.created_at)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <button
                           onClick={() => openVerificationDetails(verification.id)}
                           className="text-my-primary hover:text-my-primary/80 font-medium"
                         >
                           View Details
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </>
       ) : null}

      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">User Details</h4>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-my-primary">&times;</button>
            </div>
            {viewUserLoading ? (
              <div className="text-my-primary">Loading...</div>
            ) : viewUserError ? (
              <div className="text-red-500">{viewUserError}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {(viewUser.profile_image_url || viewUser.profile_image || viewUser.profileImageUrl) ? (
                      <img 
                        src={viewUser.profile_image_url || viewUser.profile_image || viewUser.profileImageUrl} 
                        alt={`${viewUser.first_name} ${viewUser.last_name}`} 
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {!(viewUser.profile_image_url || viewUser.profile_image || viewUser.profileImageUrl) && (
                      <UserCircle className="w-16 h-16 text-gray-400" />
                    )}
                    <UserCircle className="w-16 h-16 text-gray-400 hidden" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-900 dark:text-gray-100">{viewUser.first_name || viewUser.firstName} {viewUser.last_name || viewUser.lastName}</div>
                    <div className="text-gray-500 dark:text-gray-400">{viewUser.email}</div>
                    <div className="text-xs mt-1"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${(viewUser.kyc_status || '').toLowerCase() === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{viewUser.kyc_status || 'pending'}</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="text-gray-500 dark:text-gray-400">Phone: <span className="text-gray-900 dark:text-gray-200">{viewUser.phone || 'N/A'}</span></div>
                  <div className="text-gray-500 dark:text-gray-400">Role: <span className="text-gray-900 dark:text-gray-200">{viewUser.role || 'N/A'}</span></div>
                  <div className="text-gray-500 dark:text-gray-400">Status: <span className="text-gray-900 dark:text-gray-200">{viewUser.status || 'N/A'}</span></div>
                  <div className="text-gray-500 dark:text-gray-400">KYC: <span className="text-gray-900 dark:text-gray-200">{viewUser.kyc_status || 'pending'}</span></div>
                  <div className="text-gray-500 dark:text-gray-400">Last Login: <span className="text-gray-900 dark:text-gray-200">{viewUser.last_login ? formatDateUTC(viewUser.last_login) : 'N/A'}</span></div>
                  <div className="text-gray-500 dark:text-gray-400">Created: <span className="text-gray-900 dark:text-gray-200">{viewUser.created_at ? formatDateUTC(viewUser.created_at) : (viewUser.createdAt ? formatDateUTC(viewUser.createdAt) : 'N/A')}</span></div>
                  <div className="text-gray-500 dark:text-gray-400">Updated: <span className="text-gray-900 dark:text-gray-200">{viewUser.updated_at ? formatDateUTC(viewUser.updated_at) : (viewUser.updatedAt ? formatDateUTC(viewUser.updatedAt) : 'N/A')}</span></div>
                  <div className="text-gray-500 dark:text-gray-400">Total Bookings: <span className="text-gray-900 dark:text-gray-200">{typeof viewUser.total_bookings !== 'undefined' ? viewUser.total_bookings : 'N/A'}</span></div>
                  <div className="text-gray-500 dark:text-gray-400">Total Products: <span className="text-gray-900 dark:text-gray-200">{typeof viewUser.total_products !== 'undefined' ? viewUser.total_products : 'N/A'}</span></div>
                  <div className="text-gray-500 dark:text-gray-400">Total Reviews: <span className="text-gray-900 dark:text-gray-200">{typeof viewUser.total_reviews !== 'undefined' ? viewUser.total_reviews : 'N/A'}</span></div>
                </div>

                {(viewUser.city || viewUser.country || viewUser.address_line) && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Location: <span className="text-gray-900 dark:text-gray-200">{[viewUser.city, viewUser.country].filter(Boolean).join(', ') || 'N/A'}</span>
                    {viewUser.address_line && (
                      <div className="mt-1">Address: <span className="text-gray-900 dark:text-gray-200">{viewUser.address_line}</span></div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {moderateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Moderate User</h4>
              <button onClick={() => setModerateUser(null)} className="text-gray-400 hover:text-my-primary">&times;</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setModerateLoading(true);
                setModerateError(null);
                setModerateSuccess(null);
                try {
                  const token = localStorage.getItem('token') || undefined;
                  await moderateAdminUser(moderateUser.id, {
                    action: moderateAction,
                    reason: moderateReason || undefined,
                    duration: moderateAction === 'suspend' && moderateDuration ? Number(moderateDuration) : undefined,
                  }, token);
                  setModerateSuccess('Action successful!');
                } catch (err: any) {
                  setModerateError(err.message || 'Failed to moderate user');
                } finally {
                  setModerateLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
                <select
                  value={moderateAction}
                  onChange={e => setModerateAction(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded px-3 py-2"
                  required
                >
                  <option value="ban">Ban</option>
                  <option value="suspend">Suspend</option>
                  <option value="activate">Activate</option>
                  <option value="warn">Warn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={moderateReason}
                  onChange={e => setModerateReason(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded px-3 py-2"
                  placeholder="Reason for moderation"
                />
              </div>
              {moderateAction === 'suspend' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (days)</label>
                  <input
                    type="number"
                    min={1}
                    value={moderateDuration}
                    onChange={e => setModerateDuration(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded px-3 py-2"
                    placeholder="Duration in days"
                    required={moderateAction === 'suspend'}
                  />
                </div>
              )}
              {moderateError && <div className="text-red-500 text-sm">{moderateError}</div>}
              {moderateSuccess && <div className="text-green-600 text-sm">{moderateSuccess}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setModerateUser(null)} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">Cancel</button>
                <button type="submit" disabled={moderateLoading} className="px-4 py-2 rounded bg-my-primary text-white hover:bg-my-primary/90 disabled:opacity-50">
                  {moderateLoading ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYC Status Update Modal */}
      {kycUpdateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Update KYC Status</h4>
              <button onClick={() => setKycUpdateUser(null)} className="text-gray-400 hover:text-my-primary">&times;</button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update KYC status for <span className="font-medium">{kycUpdateUser.first_name || kycUpdateUser.firstName} {kycUpdateUser.last_name || kycUpdateUser.lastName}</span>
              </p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleKycStatusUpdate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">KYC Status</label>
                <select
                  value={kycStatus}
                  onChange={e => setKycStatus(e.target.value as 'verified' | 'rejected' | 'pending')}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded px-3 py-2"
                  required
                >
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={kycNotes}
                  onChange={e => setKycNotes(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded px-3 py-2"
                  placeholder="Optional notes for the status update"
                />
              </div>
              {kycMessage && (
                <div className={`text-sm ${kycMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {kycMessage.text}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setKycUpdateUser(null)} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">Cancel</button>
                <button type="submit" disabled={kycUpdating} className="px-4 py-2 rounded bg-my-primary text-white hover:bg-my-primary/90 disabled:opacity-50">
                  {kycUpdating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Details Modal */}
      <VerificationDetailsModal
        isOpen={verificationDetailsModal.isOpen}
        verificationId={verificationDetailsModal.verificationId}
        onClose={closeVerificationDetails}
        token={localStorage.getItem('token') || undefined}
      />

      {/* User Registration Modal */}
      <UserRegistrationModal
        isOpen={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        onSuccess={handleUserRegistrationSuccess}
        token={localStorage.getItem('token') || undefined}
      />
    </div>
  );
};

export default UserManagement; 