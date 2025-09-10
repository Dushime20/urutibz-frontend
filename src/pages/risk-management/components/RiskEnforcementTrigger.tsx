import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Info } from 'lucide-react';
import { useRiskEnforcement } from '../hooks/useRiskEnforcement';
import { useToast } from '../../../contexts/ToastContext';

interface RiskEnforcementTriggerProps {
  bookingId?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

const RiskEnforcementTrigger: React.FC<RiskEnforcementTriggerProps> = ({
  bookingId: initialBookingId,
  onSuccess,
  onError
}) => {
  const { showToast } = useToast();
  const { loading, error, result, triggerEnforcement, reset } = useRiskEnforcement();
  const [bookingId, setBookingId] = useState(initialBookingId || '');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingId.trim()) {
      showToast('Please enter a valid booking ID', 'error');
      return;
    }

    try {
      await triggerEnforcement({ bookingId: bookingId.trim() });
      showToast('Risk enforcement triggered successfully', 'success');
      onSuccess?.(result);
      setShowModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to trigger risk enforcement', 'error');
      onError?.(err.message);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'non_compliant':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'under_review':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <Shield className="w-4 h-4 mr-2" />
        Trigger Enforcement
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" onClick={handleClose}></div>

            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Trigger Risk Enforcement</h3>
                  <button
                    type="button"
                    className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                    onClick={handleClose}
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {!result ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Booking ID
                      </label>
                      <input
                        type="text"
                        id="bookingId"
                        value={bookingId}
                        onChange={(e) => setBookingId(e.target.value)}
                        placeholder="Enter booking UUID"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        required
                      />
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
                      <div className="flex">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Warning</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            This action will trigger risk enforcement for the specified booking. 
                            This may result in violations being recorded and enforcement actions being taken.
                          </p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-4">
                        <div className="flex">
                          <XCircle className="w-5 h-5 text-red-400" />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-red-800 dark:text-red-400">Error</h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Triggering...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Trigger Enforcement
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {/* Success Message */}
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md p-4">
                      <div className="flex">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-green-800 dark:text-green-400">Enforcement Triggered</h4>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">{result.message}</p>
                        </div>
                      </div>
                    </div>

                    {/* Compliance Details */}
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-md p-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-3">Compliance Details</h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Booking ID</label>
                          <p className="text-sm text-gray-900 dark:text-slate-100">{result.data.compliance.bookingId}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Product ID</label>
                          <p className="text-sm text-gray-900 dark:text-slate-100">{result.data.compliance.productId}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Renter ID</label>
                          <p className="text-sm text-gray-900 dark:text-slate-100">{result.data.compliance.renterId}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Violations Recorded</label>
                          <p className="text-sm text-gray-900 dark:text-slate-100">{result.data.violationsRecorded}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Compliance Status</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplianceStatusColor(result.data.compliance.status)}`}>
                            {result.data.compliance.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Compliance Score</label>
                          <p className={`text-lg font-semibold ${getComplianceScoreColor(result.data.compliance.score)}`}>
                            {result.data.compliance.complianceScore}%
                          </p>
                        </div>
                      </div>

                      {result.data.compliance.missingRequirements.length > 0 && (
                        <div className="mb-4">
                          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Missing Requirements</label>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {result.data.compliance.missingRequirements.map((requirement, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                                {requirement.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.data.compliance.enforcementActions.length > 0 && (
                        <div className="mb-4">
                          <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Enforcement Actions</label>
                          <div className="mt-1 space-y-2">
                            {result.data.compliance.enforcementActions.map((action, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-600">
                                <span className="text-sm text-gray-900 dark:text-slate-100">{action.type}</span>
                                <span className={`text-xs px-2 py-1 rounded ${getComplianceStatusColor(action.status)}`}>
                                  {action.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Last Checked</label>
                        <p className="text-sm text-gray-900 dark:text-slate-100">
                          {new Date(result.data.compliance.lastCheckedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          reset();
                          setBookingId('');
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Trigger Another
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RiskEnforcementTrigger;
