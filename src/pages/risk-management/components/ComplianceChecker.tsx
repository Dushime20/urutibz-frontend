import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Clock,
  FileText,
  Download,
  Package,
  User
} from 'lucide-react';
import { useComplianceCheck } from '../hooks/useComplianceCheck';
import { useToast } from '../../../contexts/ToastContext';

interface ComplianceCheckerProps {
  onComplianceChecked?: (compliance: any) => void;
  className?: string;
}

const ComplianceChecker: React.FC<ComplianceCheckerProps> = ({ 
  onComplianceChecked, 
  className = '' 
}) => {
  const { showToast } = useToast();
  const { compliance, loading, error, checkCompliance, getBookingCompliance, clearCompliance } = useComplianceCheck();
  const [formData, setFormData] = useState({
    bookingId: '',
    productId: '',
    renterId: '',
    forceCheck: false
  });

  const handleCheckCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bookingId.trim() || !formData.productId.trim() || !formData.renterId.trim()) {
      showToast('Please enter Booking ID, Product ID, and Renter ID', 'error');
      return;
    }

    try {
      await checkCompliance({
        bookingId: formData.bookingId.trim(),
        productId: formData.productId.trim(),
        renterId: formData.renterId.trim(),
        forceCheck: formData.forceCheck
      });
      
      if (onComplianceChecked && compliance) {
        onComplianceChecked(compliance);
      }
    } catch (err) {
      console.error('Compliance check failed:', err);
    }
  };

  const handleGetCompliance = async () => {
    if (!formData.bookingId.trim()) {
      showToast('Please enter a Booking ID', 'error');
      return;
    }

    try {
      await getBookingCompliance(formData.bookingId.trim());
      
      if (onComplianceChecked && compliance) {
        onComplianceChecked(compliance);
      }
    } catch (err) {
      console.error('Get compliance failed:', err);
    }
  };

  const handleClear = () => {
    clearCompliance();
    setFormData({
      bookingId: '',
      productId: '',
      renterId: '',
      forceCheck: false
    });
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-50';
      case 'non_compliant':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'under_review':
        return 'text-teal-600 bg-teal-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-teal-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportComplianceReport = () => {
    if (!compliance) return;

    const report = {
      bookingId: compliance.bookingId,
      isCompliant: compliance.isCompliant,
      complianceScore: compliance.complianceScore,
      status: compliance.status,
      missingRequirements: compliance.missingRequirements,
      enforcementActions: compliance.enforcementActions,
      lastCheckedAt: compliance.lastCheckedAt,
      formData: formData,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${compliance.bookingId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Compliance report exported successfully', 'success');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-lg font-medium text-gray-900">Compliance Checker</h2>
              <p className="text-sm text-gray-600">Check booking compliance status</p>
            </div>
          </div>
          {compliance && (
            <div className="flex items-center space-x-2">
              <button
                onClick={exportComplianceReport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleClear}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Form */}
        <form onSubmit={handleCheckCompliance} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Booking ID
              </label>
              <input
                type="text"
                id="bookingId"
                value={formData.bookingId}
                onChange={(e) => setFormData(prev => ({ ...prev, bookingId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter booking UUID"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-2" />
                Product ID
              </label>
              <input
                type="text"
                id="productId"
                value={formData.productId}
                onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter product UUID"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="renterId" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Renter ID
              </label>
              <input
                type="text"
                id="renterId"
                value={formData.renterId}
                onChange={(e) => setFormData(prev => ({ ...prev, renterId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter renter UUID"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.forceCheck}
                  onChange={(e) => setFormData(prev => ({ ...prev, forceCheck: e.target.checked }))}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <span className="text-sm font-medium text-gray-700">Force Check</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleGetCompliance}
              disabled={loading || !formData.bookingId.trim()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clock className="w-4 h-4 mr-2" />
              Get Status
            </button>
            <button
              type="submit"
              disabled={loading || !formData.bookingId.trim() || !formData.productId.trim() || !formData.renterId.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Check Compliance
                </>
              )}
            </button>
          </div>

        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Compliance Check Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {compliance && (
          <div className="mt-6 space-y-6">
            {/* Compliance Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Status</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {compliance.isCompliant ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                  <div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceStatusColor(compliance.status)}`}>
                      {compliance.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {compliance.isCompliant ? 'Fully Compliant' : 'Non-Compliant'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getComplianceScoreColor(compliance.complianceScore)}`}>
                    {compliance.complianceScore}%
                  </div>
                  <div className="text-sm text-gray-600">Compliance Score</div>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    compliance.complianceScore >= 80 ? 'bg-green-500' :
                    compliance.complianceScore >= 60 ? 'bg-teal-500' :
                    compliance.complianceScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${compliance.complianceScore}%` }}
                ></div>
              </div>
            </div>

            {/* Missing Requirements */}
            {compliance.missingRequirements.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Missing Requirements</h3>
                <div className="space-y-2">
                  {compliance.missingRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-800">{requirement.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enforcement Actions */}
            {compliance.enforcementActions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Required Enforcement Actions</h3>
                <div className="space-y-3">
                  {compliance.enforcementActions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-yellow-800">{action.actionType}</div>
                        <div className="text-sm text-yellow-700 mt-1">{action.description}</div>
                        {action.executedAt && (
                          <div className="text-xs text-yellow-600 mt-1">
                            Executed: {new Date(action.executedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Checked */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Last Checked</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(compliance.lastCheckedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceChecker;
