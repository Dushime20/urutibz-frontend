import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock, X } from 'lucide-react';
import { BulkCreateRiskProfileResponse } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';

interface BulkOperationProgressProps {
  isVisible: boolean;
  onClose: () => void;
  result: BulkCreateRiskProfileResponse | null;
  error: string | null;
}

const BulkOperationProgress: React.FC<BulkOperationProgressProps> = ({
  isVisible,
  onClose,
  result,
  error
}) => {
  const { showToast } = useToast();

  // Show toast notifications when results change
  useEffect(() => {
    if (!isVisible) return;

    if (error) {
      showToast(`Bulk operation failed: ${error}`, 'error');
    } else if (result) {
      const { successful, failed } = result.data;
      if (failed === 0) {
        showToast(`Successfully created ${successful} risk profile${successful > 1 ? 's' : ''}`, 'success');
      } else if (successful > 0) {
        showToast(`Created ${successful} profiles successfully, ${failed} failed`, 'warning');
      } else {
        showToast('All profiles failed to create', 'error');
      }
    }
  }, [isVisible, result, error, showToast]);

  if (!isVisible) return null;

  const getStatusIcon = () => {
    if (error) return <XCircle className="w-8 h-8 text-red-500" />;
    if (result?.success) return <CheckCircle className="w-8 h-8 text-green-500" />;
    return <Clock className="w-8 h-8 text-blue-500" />;
  };

  const getStatusColor = () => {
    if (error) return 'red';
    if (result?.success) return 'green';
    return 'blue';
  };

  const getStatusMessage = () => {
    if (error) return 'Operation Failed';
    if (result?.success) return 'Operation Completed';
    return 'Processing...';
  };

  const statusColor = getStatusColor();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Bulk Operation Results</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <div>
                  <h4 className={`text-lg font-medium text-${statusColor}-800`}>
                    {getStatusMessage()}
                  </h4>
                  {result?.message && (
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  )}
                  {error && (
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  )}
                </div>
              </div>

              {/* Results Summary */}
              {result && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Summary</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {result.data.successful + result.data.failed}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {result.data.successful}
                      </div>
                      <div className="text-sm text-gray-600">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {result.data.failed}
                      </div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Rate */}
              {result && result.data.successful + result.data.failed > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-medium">
                      {Math.round((result.data.successful / (result.data.successful + result.data.failed)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(result.data.successful / (result.data.successful + result.data.failed)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Details */}
              {result && result.data.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <h5 className="text-sm font-medium text-red-800 ml-2">
                      Failed Profiles ({result.data.errors.length})
                    </h5>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {result.data.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        <div className="font-medium">Profile {index + 1}:</div>
                        <div className="ml-2 text-red-600">{error.error}</div>
                        {error.data.productId && (
                          <div className="ml-2 text-xs text-gray-600">
                            Product ID: {error.data.productId}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Details */}
              {result && result.data.results.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h5 className="text-sm font-medium text-green-800 ml-2">
                      Successful Profiles ({result.data.results.length})
                    </h5>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {result.data.results.slice(0, 5).map((profile, index) => (
                      <div key={profile.id} className="text-sm text-green-700">
                        <div className="font-medium">Profile {index + 1}:</div>
                        <div className="ml-2 text-green-600">
                          {profile.productName || profile.productId} - {profile.riskLevel}
                        </div>
                      </div>
                    ))}
                    {result.data.results.length > 5 && (
                      <div className="text-sm text-green-600">
                        ... and {result.data.results.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Close
                </button>
                {result && result.data.successful > 0 && (
                  <button
                    onClick={() => {
                      // Refresh the risk profiles list
                      window.location.reload();
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    View Profiles
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationProgress;
