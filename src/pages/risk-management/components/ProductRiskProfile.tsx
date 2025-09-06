import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Package,
  Download,
  Calendar,
  Settings
} from 'lucide-react';
import { useProductRiskProfile } from '../hooks/useProductRiskProfile';
import { useToast } from '../../../contexts/ToastContext';

interface ProductRiskProfileProps {
  onProfileLoaded?: (profile: any) => void;
  className?: string;
}

const ProductRiskProfile: React.FC<ProductRiskProfileProps> = ({ 
  onProfileLoaded, 
  className = '' 
}) => {
  const { showToast } = useToast();
  const { profile, loading, error, getProfile, clearProfile } = useProductRiskProfile();
  const [productId, setProductId] = useState('');

  const handleGetProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId.trim()) {
      showToast('Please enter a Product ID', 'error');
      return;
    }

    try {
      await getProfile(productId.trim());
      
      if (onProfileLoaded && profile) {
        onProfileLoaded(profile);
      }
    } catch (err) {
      console.error('Get profile failed:', err);
    }
  };

  const handleClear = () => {
    clearProfile();
    setProductId('');
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getEnforcementLevelColor = (level: string) => {
    switch (level) {
      case 'very_strict':
        return 'text-red-600 bg-red-50';
      case 'strict':
        return 'text-orange-600 bg-orange-50';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50';
      case 'lenient':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const exportProfileReport = () => {
    if (!profile) return;

    const report = {
      productId: profile.productId,
      productName: profile.productName,
      categoryName: profile.categoryName,
      riskLevel: profile.riskLevel,
      mandatoryRequirements: profile.mandatoryRequirements,
      riskFactors: profile.riskFactors,
      mitigationStrategies: profile.mitigationStrategies,
      enforcementLevel: profile.enforcementLevel,
      autoEnforcement: profile.autoEnforcement,
      gracePeriodHours: profile.gracePeriodHours,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-risk-profile-${profile.productId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Product risk profile exported successfully', 'success');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-lg font-medium text-gray-900">Product Risk Profile</h2>
              <p className="text-sm text-gray-600">View product-specific risk information</p>
            </div>
          </div>
          {profile && (
            <div className="flex items-center space-x-2">
              <button
                onClick={exportProfileReport}
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
        <form onSubmit={handleGetProfile} className="space-y-6">
          <div>
            <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-2" />
              Product ID
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter product UUID"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !productId.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Get Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Failed to Load Profile</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {profile && (
          <div className="mt-6 space-y-6">
            {/* Product Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Product Name</div>
                  <div className="text-lg font-medium text-gray-900">{profile.productName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Category</div>
                  <div className="text-lg font-medium text-gray-900">{profile.categoryName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Product ID</div>
                  <div className="text-sm font-mono text-gray-700">{profile.productId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Risk Level</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(profile.riskLevel)}`}>
                    {profile.riskLevel.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Requirements */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mandatory Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${profile.mandatoryRequirements.insurance ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-700">Insurance Required</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${profile.mandatoryRequirements.inspection ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-700">Inspection Required</span>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-700">
                    Minimum Coverage: ${profile.mandatoryRequirements.minCoverage?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    Inspection Types: {profile.mandatoryRequirements.inspectionTypes?.join(', ') || 'None specified'}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    Compliance Deadline: {profile.mandatoryRequirements.complianceDeadlineHours} hours
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            {profile.riskFactors.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-800">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mitigation Strategies */}
            {profile.mitigationStrategies.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mitigation Strategies</h3>
                <div className="space-y-2">
                  {profile.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-800">{strategy}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enforcement Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Enforcement Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Enforcement Level</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEnforcementLevelColor(profile.enforcementLevel)}`}>
                    {profile.enforcementLevel.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Auto Enforcement</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${profile.autoEnforcement ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {profile.autoEnforcement ? 'ENABLED' : 'DISABLED'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Grace Period</div>
                  <div className="text-lg font-medium text-gray-900">{profile.gracePeriodHours} hours</div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="text-sm font-medium text-gray-900">
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Last Updated</div>
                    <div className="text-sm font-medium text-gray-900">
                      {profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRiskProfile;
