import React, { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle, Flag, Eye, Package } from 'lucide-react';
import { fetchProductModerationActions } from '../service';
import SkeletonTable from './SkeletonTable';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

interface ProductModerationAction {
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

interface ProductModerationHistoryProps {
  productId: string;
  productTitle?: string;
  onClose?: () => void;
}

const ProductModerationHistory: React.FC<ProductModerationHistoryProps> = ({
  productId,
  productTitle = 'Product',
  onClose
}) => {
  const [actions, setActions] = useState<ProductModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<ProductModerationAction | null>(null);

  useEffect(() => {
    if (productId) {
      loadModerationHistory();
    }
  }, [productId]);

  const loadModerationHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetchProductModerationActions(productId, token);
      setActions(response.data || []);
    } catch (err: any) {
      if (err.message.includes('Authentication token')) {
        setError('Please log in again to access moderation history');
      } else {
        setError(err.message || 'Failed to load moderation history');
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

  const getTimelinePosition = (index: number, total: number) => {
    if (total === 1) return 'single';
    if (index === 0) return 'first';
    if (index === total - 1) return 'last';
    return 'middle';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <SkeletonTable columns={5} rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <ErrorState message={error} onRetry={loadModerationHistory} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Moderation History</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {productTitle} • {actions.length} moderation action{actions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadModerationHistory}
            className="bg-my-primary hover:bg-my-primary/90 text-white px-4 py-2 rounded-xl transition-colors flex items-center"
          >
            <Clock className="w-4 h-4 mr-2" />
            Refresh
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {actions.length === 0 ? (
        <EmptyState 
          icon={<Shield />} 
          title="No moderation history" 
          message="This product has not been moderated yet." 
        />
      ) : (
        <div className="space-y-6">
          {/* Timeline View */}
          <div className="relative">
            {actions.map((action, index) => (
              <div key={action.id} className="relative">
                {/* Timeline Line */}
                {index < actions.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200 dark:bg-gray-700" />
                )}
                
                {/* Timeline Item */}
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      {getActionIcon(action.action)}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getActionColor(action.action)}`}>
                            {action.action.charAt(0).toUpperCase() + action.action.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            by {action.moderatorId.slice(0, 8)}...
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(action.createdAt)}
                        </span>
                      </div>
                      
                      {/* Status Change */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Status changed from:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(action.metadata.previousStatus)}`}>
                            {action.metadata.previousStatus}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(action.metadata.newStatus)}`}>
                            {action.metadata.newStatus}
                          </span>
                        </div>
                      </div>
                      
                      {/* Reason */}
                      {action.reason && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason:</h4>
                          <p className="text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            {action.reason}
                          </p>
                        </div>
                      )}
                      
                      {/* Action Details */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Action ID: {action.id.slice(0, 8)}...
                        </div>
                        <button
                          onClick={() => setSelectedAction(selectedAction?.id === action.id ? null : action)}
                          className="text-my-primary hover:text-my-primary/80 text-sm font-medium flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {selectedAction?.id === action.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                      
                      {/* Expanded Details */}
                      {selectedAction?.id === action.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Resource Type:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {action.resourceType.charAt(0).toUpperCase() + action.resourceType.slice(1)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Resource ID:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono">
                                {action.resourceId}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Moderator ID:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono">
                                {action.moderatorId}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Created At:</span>
                              <span className="ml-2 text-gray-900 dark:text-gray-100">
                                {new Date(action.createdAt).toISOString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {actions.length}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Total Actions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {actions.filter(a => a.action === 'approve').length}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Approvals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {actions.filter(a => a.action === 'reject').length}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Rejections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {actions.filter(a => a.action === 'flag' || a.action === 'quarantine').length}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Flags/Quarantine</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModerationHistory;
