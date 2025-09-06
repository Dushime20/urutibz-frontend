import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  User,
  Package
} from 'lucide-react';
import { useRiskAssessment } from '../hooks/useRiskAssessment';
import { useToast } from '../../../contexts/ToastContext';
import ErrorBoundary from '../../../components/ErrorBoundary';

interface RiskAssessmentFormProps {
  onAssessmentComplete?: (assessment: any) => void;
  className?: string;
}

const RiskAssessmentForm: React.FC<RiskAssessmentFormProps> = ({ 
  onAssessmentComplete, 
  className = '' 
}) => {
  const { showToast } = useToast();
  const { assessment, loading, error, assessRisk, clearAssessment } = useRiskAssessment();
  const [formData, setFormData] = useState({
    productId: '',
    renterId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId.trim() || !formData.renterId.trim()) {
      showToast('Please enter both Product ID and Renter ID', 'error');
      return;
    }

    try {
      await assessRisk({
        productId: formData.productId.trim(),
        renterId: formData.renterId.trim()
      });
      
      if (onAssessmentComplete && assessment) {
        onAssessmentComplete(assessment);
      }
    } catch (err) {
      console.error('Assessment failed:', err);
    }
  };

  const handleClear = () => {
    clearAssessment();
    setFormData({ productId: '', renterId: '' });
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
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
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <ErrorBoundary>
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-lg font-medium text-gray-900">Risk Assessment</h2>
              <p className="text-sm text-gray-600">Evaluate risk for product-renter combination</p>
            </div>
          </div>
          {assessment && (
            <button
              onClick={handleClear}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !formData.productId.trim() || !formData.renterId.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Assessing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Assess Risk
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
                <h3 className="text-sm font-medium text-red-800">Assessment Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {assessment && (
          <div className="mt-6 space-y-6">
            {/* Overall Risk Score */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Risk Assessment</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{assessment.overallRiskScore}</div>
                  <div className="text-sm text-gray-600">Risk Score (0-100)</div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${getRiskLevelColor(assessment.overallRiskScore)}`}>
                  {getRiskLevel(assessment.overallRiskScore)} Risk
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    assessment.overallRiskScore >= 80 ? 'bg-red-500' :
                    assessment.overallRiskScore >= 60 ? 'bg-orange-500' :
                    assessment.overallRiskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${assessment.overallRiskScore}%` }}
                ></div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{assessment.riskFactors.productRisk}</div>
                <div className="text-sm text-gray-600">Product Risk</div>
              </div>
              <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{assessment.riskFactors.renterRisk}</div>
                <div className="text-sm text-gray-600">Renter Risk</div>
              </div>
              <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{assessment.riskFactors.bookingRisk}</div>
                <div className="text-sm text-gray-600">Booking Risk</div>
              </div>
              <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{assessment.riskFactors.seasonalRisk}</div>
                <div className="text-sm text-gray-600">Seasonal Risk</div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Status</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {assessment.complianceStatus === 'compliant' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceStatusColor(assessment.complianceStatus)}`}>
                    {assessment.complianceStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Assessed: {new Date(assessment.assessmentDate).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Mandatory Requirements */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mandatory Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${assessment.mandatoryRequirements.insurance ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-700">Insurance Required</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${assessment.mandatoryRequirements.inspection ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-700">Inspection Required</span>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-700">
                    Minimum Coverage: ${assessment.mandatoryRequirements.minCoverage?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    Inspection Types: {assessment.mandatoryRequirements.inspectionTypes?.join(', ') || 'None specified'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {assessment.recommendations.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                <ul className="space-y-2">
                  {assessment.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </ErrorBoundary>
  );
};

export default RiskAssessmentForm;
