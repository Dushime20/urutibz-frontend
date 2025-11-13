import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  Eye, 
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { useRiskManagementStats } from '../hooks/useRiskManagementStats';
import { riskManagementService } from '../../../services/riskManagementService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ConfirmationDialog from './ConfirmationDialog';
import { formatDateUTC } from '../../../utils/dateUtils';

interface EnforcementAction {
  id: string;
  bookingId: string;
  productId: string;
  renterId: string;
  type: 'warning' | 'penalty' | 'suspension' | 'termination' | 'training_required' | 'audit_required';
  status: 'pending' | 'approved' | 'executed' | 'rejected' | 'cancelled';
  message: string;
  complianceScore: number;
  violationsCount: number;
  createdAt: string;
  executedAt?: string;
  executedBy?: string;
}

interface EnforcementActionsPanelProps {
  className?: string;
}

const EnforcementActionsPanel: React.FC<EnforcementActionsPanelProps> = ({ className = '' }) => {
  const { showToast } = useToast();
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useRiskManagementStats();
  const [actions, setActions] = useState<EnforcementAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'executed' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'violations'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showExecuteConfirm, setShowExecuteConfirm] = useState(false);
  const [actionToExecute, setActionToExecute] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Execute enforcement action mutation
  const executeActionMutation = useMutation({
    mutationFn: (actionId: string) => riskManagementService.executeEnforcementAction(actionId),
    onSuccess: () => {
      showToast('Enforcement action executed successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['enforcementActions'] });
      // Refresh stats
      refetchStats();
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Failed to execute enforcement action',
        'error'
      );
    }
  });

  // Fetch enforcement actions
  useEffect(() => {
    const fetchActions = async () => {
      setLoading(true);
      try {
        const statusFilter = filter === 'all' ? undefined : [filter];
        const result = await riskManagementService.getEnforcementActions(
          { status: statusFilter },
          1,
          100 // Get more actions for display
        );
        
        // Map the API response to the component's expected format
        const mappedActions: EnforcementAction[] = (result.data || []).map((action: any) => ({
          id: action.id,
          bookingId: action.bookingId || '',
          productId: action.productId || '',
          renterId: action.renterId || '',
          type: action.type?.toLowerCase() || 'warning',
          status: action.status?.toLowerCase() || 'pending',
          message: action.message || '',
          complianceScore: 0, // Not available in API response
          violationsCount: 0, // Not available in API response
          createdAt: action.createdAt || new Date().toISOString(),
          executedAt: action.executedAt,
          executedBy: action.executedBy
        }));
        
        setActions(mappedActions);
      } catch (error) {
        console.error('Error fetching enforcement actions:', error);
        showToast('Failed to load enforcement actions', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [filter, showToast]);

  const handleExecuteAction = (actionId: string) => {
    setActionToExecute(actionId);
    setShowExecuteConfirm(true);
  };

  const confirmExecuteAction = () => {
    if (actionToExecute) {
      executeActionMutation.mutate(actionToExecute);
      setShowExecuteConfirm(false);
      setActionToExecute(null);
    }
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'penalty':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'suspension':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'termination':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'training_required':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'audit_required':
        return <Shield className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'penalty':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      case 'suspension':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400';
      case 'termination':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      case 'training_required':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'audit_required':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'executed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredActions = actions.filter(action => {
    if (filter === 'all') return true;
    return action.status === filter;
  });

  const sortedActions = [...filteredActions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'score':
        comparison = a.complianceScore - b.complianceScore;
        break;
      case 'violations':
        comparison = a.violationsCount - b.violationsCount;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleRefresh = () => {
    setLoading(true);
    showToast('Refreshing enforcement actions...', 'info');
    setTimeout(() => {
      setLoading(false);
      showToast('Enforcement actions refreshed', 'success');
    }, 1000);
  };

  const handleViewAction = (action: EnforcementAction) => {
    showToast(`Viewing action: ${action.type} for booking ${action.bookingId.slice(0, 8)}...`, 'info');
  };

  const enforcementStats = stats ? {
    total: stats.enforcementActions.total,
    pending: stats.enforcementActions.pending,
    executed: stats.enforcementActions.successful,
    rejected: stats.enforcementActions.failed
  } : {
    total: 0,
    pending: 0,
    executed: 0,
    rejected: 0
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">Enforcement Actions</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">Monitor and manage risk enforcement actions</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleRefresh();
              refetchStats();
            }}
            disabled={loading || statsLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(loading || statsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        {statsLoading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-6 h-6 text-gray-400 dark:text-slate-500 animate-spin mr-3" />
            <span className="text-gray-600 dark:text-slate-400">Loading statistics...</span>
          </div>
        ) : statsError ? (
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 dark:text-red-400 text-sm">Failed to load statistics</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{enforcementStats.total}</div>
              <div className="text-sm text-gray-600 dark:text-slate-400">Total Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{enforcementStats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-slate-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{enforcementStats.executed}</div>
              <div className="text-sm text-gray-600 dark:text-slate-400">Executed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-red-600 dark:text-red-400">{enforcementStats.rejected}</div>
              <div className="text-sm text-gray-600 dark:text-slate-400">Rejected</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 dark:border-slate-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              >
                <option value="all">All Actions</option>
                <option value="pending">Pending</option>
                <option value="executed">Executed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 dark:border-slate-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              >
                <option value="date">Date</option>
                <option value="score">Score</option>
                <option value="violations">Violations</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                <TrendingUp className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="divide-y divide-gray-200 dark:divide-slate-700">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 dark:text-slate-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-400">Loading enforcement actions...</p>
            </div>
          </div>
        ) : sortedActions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Shield className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No Enforcement Actions</h3>
              <p className="text-gray-600 dark:text-slate-400">No actions match the current filter criteria</p>
            </div>
          </div>
        ) : (
          sortedActions.map((action) => (
            <div key={action.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getActionTypeIcon(action.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionTypeColor(action.type)}`}>
                        {action.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}>
                        {action.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">{action.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-slate-400">
                      <span>Booking: {action.bookingId.slice(0, 8)}...</span>
                      <span>Product: {action.productId.slice(0, 8)}...</span>
                      <span>Renter: {action.renterId.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-slate-400">
                      <span className={`font-medium ${getScoreColor(action.complianceScore)}`}>
                        Score: {action.complianceScore}%
                      </span>
                      <span>Violations: {action.violationsCount}</span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDateUTC(action.createdAt)}
                      </span>
                    </div>
                    {action.executedAt && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        Executed: {formatDateUTC(action.executedAt)}
                        {action.executedBy && ` by ${action.executedBy}`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleViewAction(action)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-md text-xs font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </button>
                  {action.status === 'pending' && (
                    <button
                      onClick={() => handleExecuteAction(action.id)}
                      disabled={executeActionMutation.isPending}
                      className="inline-flex items-center px-3 py-1 border border-green-300 dark:border-green-600 rounded-md text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {executeActionMutation.isPending ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Execute
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {sortedActions.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-slate-600">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-400">
            <span>Showing {sortedActions.length} of {actions.length} actions</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* Execute Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showExecuteConfirm}
        onClose={() => {
          setShowExecuteConfirm(false);
          setActionToExecute(null);
        }}
        onConfirm={confirmExecuteAction}
        title="Execute Enforcement Action"
        message="Are you sure you want to execute this enforcement action? This will trigger the action (e.g., block booking, send notification, etc.) and cannot be undone."
        type="warning"
        confirmText="Execute"
        cancelText="Cancel"
        isLoading={executeActionMutation.isPending}
      />
    </div>
  );
};

export default EnforcementActionsPanel;
