import React, { useState, useEffect } from 'react';
import { Shield, Filter, Eye, Clock, AlertTriangle, CheckCircle, XCircle, Flag } from 'lucide-react';
import { fetchModerationActions, fetchModerationStats } from '../service/api';
import SkeletonTable from './SkeletonTable';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

interface ModerationAction {
  id: string;
  resourceType: string;
  resourceId: string;
  action: 'approve' | 'reject' | 'flag' | 'quarantine';
  reason: string | null;
  moderatorId: string;
  metadata: {
    newStatus: string;
    previousStatus: string;
  };
  createdAt: string;
}

interface ModerationStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByResource: Record<string, number>;
  recentActions: number;
}

const ModerationActionsManagement: React.FC = () => {
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      const [actionsData, statsData] = await Promise.all([
        fetchModerationActions(token),
        fetchModerationStats(token)
      ]);
      
      setActions(actionsData.data || []);
      setStats(statsData.data || null);
    } catch (err: any) {
      if (err.message.includes('Authentication token')) {
        setError('Please log in again to access moderation data');
      } else {
        setError(err.message || 'Failed to load moderation data');
      }
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'reject':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'flag':
        return <Flag className="w-5 h-5 text-yellow-600" />;
      case 'quarantine':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reject':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'flag':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'quarantine':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredActions = actions.filter(action => {
    if (filter === 'all') return true;
    if (filter === 'recent') {
      const actionDate = new Date(action.createdAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return actionDate > oneWeekAgo;
    }
    return true;
  }).filter(action => {
    if (resourceTypeFilter === 'all') return true;
    return action.resourceType === resourceTypeFilter;
  }).filter(action => {
    if (actionTypeFilter === 'all') return true;
    return action.action === actionTypeFilter;
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <SkeletonTable columns={6} rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <ErrorState message={error} onRetry={loadModerationData} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Moderation Actions</h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadModerationData}
            className="bg-my-primary hover:bg-my-primary/90 text-white px-4 py-2 rounded-xl transition-colors flex items-center"
          >
            <Clock className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Actions</p>
                <p className="text-3xl font-bold">{stats.totalActions}</p>
              </div>
              <Shield className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Recent Actions</p>
                <p className="text-3xl font-bold">{stats.recentActions}</p>
              </div>
              <Clock className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Resource Types</p>
                <p className="text-3xl font-bold">{Object.keys(stats.actionsByResource).length}</p>
              </div>
              <Filter className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Action Types</p>
                <p className="text-3xl font-bold">{Object.keys(stats.actionsByType).length}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-my-primary focus:border-transparent"
          >
            <option value="all">All Actions</option>
            <option value="recent">Recent (Last 7 days)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Resource Type:</label>
          <select
            value={resourceTypeFilter}
            onChange={(e) => setResourceTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-my-primary focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="product">Products</option>
            <option value="user">Users</option>
            <option value="review">Reviews</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Action Type:</label>
          <select
            value={actionTypeFilter}
            onChange={(e) => setActionTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-my-primary focus:border-transparent"
          >
            <option value="all">All Actions</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="flag">Flag</option>
            <option value="quarantine">Quarantine</option>
          </select>
        </div>
      </div>

      {/* Actions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Moderator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredActions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <EmptyState 
                    icon={<Shield />} 
                    title="No moderation actions found" 
                    message="There are currently no moderation actions matching your filters." 
                  />
                </td>
              </tr>
            ) : (
              filteredActions.map((action) => (
                <tr key={action.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(action.action)}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getActionColor(action.action)}`}>
                        {action.action.charAt(0).toUpperCase() + action.action.slice(1)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {action.resourceType.charAt(0).toUpperCase() + action.resourceType.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {action.resourceId.slice(0, 8)}...
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(action.metadata.previousStatus)}`}>
                        {action.metadata.previousStatus}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(action.metadata.newStatus)}`}>
                        {action.metadata.newStatus}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {action.reason ? (
                        <p className="text-sm text-gray-900 dark:text-gray-100 truncate" title={action.reason}>
                          {action.reason}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">No reason provided</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {action.moderatorId.slice(0, 8)}...
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(action.createdAt)}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-my-primary rounded-lg hover:bg-my-primary/10 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {action.resourceType === 'product' && (
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="View Product"
                        >
                          <Filter className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {filteredActions.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredActions.length} of {actions.length} moderation actions
        </div>
      )}
    </div>
  );
};

export default ModerationActionsManagement;
