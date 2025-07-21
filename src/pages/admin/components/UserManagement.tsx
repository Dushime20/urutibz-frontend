import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Calendar, Package, Filter, Plus } from 'lucide-react';
import { fetchAdminUsers } from '../service/api';
import type { AdminUser } from '../service/api';

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
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
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
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center space-x-4 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
            <div className="relative">
              <img 
                src={user.profile_image || '/assets/img/profiles/avatar-01.jpg'} 
                alt={`${user.first_name} ${user.last_name}`} 
                className="w-16 h-16 rounded-xl object-cover" 
              />
              {user.kyc_status?.toLowerCase() === 'verified' && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="font-semibold text-gray-900">{user.first_name} {user.last_name}</h4>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{user.email}</p>
              <p className="text-xs text-gray-400">Joined: {formatDate(user.created_at)}</p>
            </div>
            <Button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              {/* Add actions here if needed */}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement; 