import React, { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle, Flag, Eye, Package, X } from 'lucide-react';
import { fetchProductModerationActions, moderateAdminProduct } from '../service';
import SkeletonTable from './SkeletonTable';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { TranslatedText } from '../../../components/translated-text';

interface ProductModerationAction {
  id: string;
  resourceType: string;
  resourceId: string;
  action: 'approve' | 'reject' | 'flag' | 'quarantine' | 'delete' | 'draft' | 'ban' | 'suspend' | 'activate' | 'warn';
  reason?: string | null;
  moderatorId: string;
  metadata?: {
    newStatus?: string;
    previousStatus?: string;
    [key: string]: any;
  };
  createdAt: string | Date;
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
  
  // Moderation form state
  const [moderateOpen, setModerateOpen] = useState(false);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'flag' | 'quarantine'>('approve');
  const [moderationReason, setModerationReason] = useState('');
  const [moderateLoading, setModerateLoading] = useState(false);
  const [moderateError, setModerateError] = useState<string | null>(null);
  const [moderationSuccess, setModerationSuccess] = useState(false);

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
      // processApiResponse already extracts the data, so response is the array directly
      const actionsArray = Array.isArray(response) ? response : (response?.data || []);
      setActions(actionsArray);
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
      case 'activate':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ban':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'suspend':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
      case 'activate':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'reject':
      case 'ban':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'flag':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'quarantine':
      case 'suspend':
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

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
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
            onClick={() => setModerateOpen(true)}
            className="bg-my-primary hover:bg-my-primary/90 text-white px-4 py-2 rounded-xl transition-colors flex items-center"
          >
            <Shield className="w-4 h-4 mr-2" />
            <TranslatedText text="Moderate Product" />
          </button>
          <button
            onClick={loadModerationHistory}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center"
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
                      {action.metadata?.previousStatus && action.metadata?.newStatus && (
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
                      )}
                      
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

      {/* Moderate Product Modal */}
      {moderateOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !moderateLoading && !moderationSuccess) {
              setModerateOpen(false);
              setModerationAction('approve');
              setModerationReason('');
              setModerateError(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                <TranslatedText text="Moderate Product" />
              </h3>
              <button
                onClick={() => {
                  setModerateOpen(false);
                  setModerationAction('approve');
                  setModerationReason('');
                  setModerateError(null);
                }}
                disabled={moderateLoading || moderationSuccess}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <TranslatedText text="Action" />
                </label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  value={moderationAction}
                  onChange={e => setModerationAction(e.target.value as any)}
                  disabled={moderationSuccess}
                >
                  <option value="approve"><TranslatedText text="Approve" /></option>
                  <option value="reject"><TranslatedText text="Reject" /></option>
                  <option value="flag"><TranslatedText text="Flag" /></option>
                  <option value="quarantine"><TranslatedText text="Quarantine" /></option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <TranslatedText text="Reason" /> (<TranslatedText text="Optional" />)
                </label>
                <textarea
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 h-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                  placeholder="Enter reason for moderation"
                  value={moderationReason}
                  onChange={e => setModerationReason(e.target.value)}
                  disabled={moderationSuccess}
                />
              </div>
              {moderationSuccess ? (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center text-green-600 dark:text-green-400 text-lg font-semibold mb-2">
                    <CheckCircle className="w-6 h-6 mr-2" />
                    <TranslatedText text="Product moderated successfully!" />
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    <TranslatedText text="Closing in a moment..." />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setModerateOpen(false);
                        setModerationAction('approve');
                        setModerationReason('');
                        setModerateError(null);
                      }}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      disabled={moderateLoading}
                    >
                      <TranslatedText text="Cancel" />
                    </button>
                    <button
                      onClick={async () => {
                        setModerateLoading(true);
                        setModerateError(null);
                        try {
                          const token = localStorage.getItem('token') || undefined;
                          await moderateAdminProduct(productId, { action: moderationAction, reason: moderationReason }, token);
                          
                          setModerationSuccess(true);
                          
                          setTimeout(() => {
                            setModerationSuccess(false);
                            setModerateOpen(false);
                            setModerationAction('approve');
                            setModerationReason('');
                            // Reload moderation history
                            loadModerationHistory();
                          }, 1500);
                        } catch (err: any) {
                          setModerateError(err.message || 'Failed to moderate product');
                        } finally {
                          setModerateLoading(false);
                        }
                      }}
                      disabled={moderateLoading || moderationSuccess}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        moderateLoading || moderationSuccess
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-my-primary hover:bg-my-primary/90 text-white'
                      }`}
                    >
                      {moderateLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <TranslatedText text="Submitting..." />
                        </div>
                      ) : (
                        <TranslatedText text="Submit" />
                      )}
                    </button>
                  </div>
                  {moderateError && (
                    <div className="text-red-600 dark:text-red-400 mt-2 text-sm">{moderateError}</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModerationHistory;
