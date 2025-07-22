import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Calendar, Package, Filter, Plus, Eye, MoreVertical } from 'lucide-react';
import type { AdminUser } from '../interfaces';
import { fetchAdminUsers, fetchAdminUserById, moderateAdminUser } from '../service/api';
import SkeletonTable from './SkeletonTable';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { Users as UsersIcon } from 'lucide-react';

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetchAdminUsers(1, 50, token || undefined);
        if (response.items) {
          setUsers(response.items);
          // Calculate stats
          const total = response.pagination.total;
          // Use kyc_status for verified
          const verified = response.items.filter(user => user.kyc_status?.toLowerCase() === 'verified').length;
          const pending = response.items.filter(user => user.status?.toLowerCase() === 'pending').length;
          const hosts = response.items.filter(user =>
            user.role?.toLowerCase() === 'host' ||
            user.role?.toLowerCase() === 'owner' ||
            user.role?.toLowerCase() === 'vendor'
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
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <SkeletonTable columns={6} rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <EmptyState icon={<UsersIcon />} title="No users found" message="There are currently no users in the system. New users will appear here as they register." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">User Management</h3>
        <div className="flex items-center space-x-3">
          <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Verified</p>
              <p className="text-2xl font-bold text-green-700">{stats.verified}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Hosts</p>
              <p className="text-2xl font-bold text-purple-700">{stats.hosts}</p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover" src={user.profile_image || '/assets/img/profiles/avatar-01.jpg'} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
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
                          setViewUserLoading(true);
                          setViewUserError(null);
                          try {
                            const token = localStorage.getItem('token') || undefined;
                            const res = await fetchAdminUserById(user.id, token);
                            setViewUser(res.data);
                          } catch (err: any) {
                            setViewUserError(err.message || 'Failed to fetch user details');
                          } finally {
                            setViewUserLoading(false);
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        View
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
            ))}
          </tbody>
        </table>
      </div>
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">User Details</h4>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-my-primary">&times;</button>
            </div>
            {viewUserLoading ? (
              <div className="text-my-primary">Loading...</div>
            ) : viewUserError ? (
              <div className="text-red-500">{viewUserError}</div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-4 mb-4">
                  <img src={viewUser.profile_image_url || '/assets/img/profiles/avatar-01.jpg'} alt={viewUser.first_name} className="w-16 h-16 rounded-full" />
                  <div>
                    <div className="font-bold text-lg">{viewUser.first_name} {viewUser.last_name}</div>
                    <div className="text-gray-500">{viewUser.email}</div>
                    <div className="text-xs mt-1"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${viewUser.kyc_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{viewUser.kyc_status}</span></div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Role: {viewUser.role}</div>
                <div className="text-xs text-gray-500">Status: {viewUser.status}</div>
                <div className="text-xs text-gray-500">Created: {viewUser.created_at ? new Date(viewUser.created_at).toLocaleString() : ''}</div>
                <div className="text-xs text-gray-500">Total Bookings: {viewUser.total_bookings}</div>
                <div className="text-xs text-gray-500">Total Products: {viewUser.total_products}</div>
                <div className="text-xs text-gray-500">Total Reviews: {viewUser.total_reviews}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {moderateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">Moderate User</h4>
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
                <label className="block text-sm font-medium mb-1">Action</label>
                <select
                  value={moderateAction}
                  onChange={e => setModerateAction(e.target.value as any)}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="ban">Ban</option>
                  <option value="suspend">Suspend</option>
                  <option value="activate">Activate</option>
                  <option value="warn">Warn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={moderateReason}
                  onChange={e => setModerateReason(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Reason for moderation"
                />
              </div>
              {moderateAction === 'suspend' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (days)</label>
                  <input
                    type="number"
                    min={1}
                    value={moderateDuration}
                    onChange={e => setModerateDuration(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Duration in days"
                    required={moderateAction === 'suspend'}
                  />
                </div>
              )}
              {moderateError && <div className="text-red-500 text-sm">{moderateError}</div>}
              {moderateSuccess && <div className="text-green-600 text-sm">{moderateSuccess}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setModerateUser(null)} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={moderateLoading} className="px-4 py-2 rounded bg-my-primary text-white hover:bg-my-primary/90 disabled:opacity-50">
                  {moderateLoading ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 