import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
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

  // Friendly search inputs (no React Query)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';
  const [productQuery, setProductQuery] = useState('');
  const [renterQuery, setRenterQuery] = useState('');
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProductOptions, setShowProductOptions] = useState(false);
  const productDebounceRef = useRef<number | undefined>(undefined);
  const renterDebounceRef = useRef<number | undefined>(undefined);

  // Fetch helpers
  const normalizeProducts = (list: any[]): any[] => {
    return (Array.isArray(list) ? list : []).map((p: any) => ({
      id: p.id ?? p.productId ?? p._id ?? p.uuid,
      name: p.name ?? p.productName ?? p.title ?? '',
      title: p.title,
      productName: p.productName,
    })).filter((p: any) => p.id);
  };

  const loadAllProducts = async () => {
    if (productsLoaded || productsLoading) return;
    setProductsLoading(true);
    try {
      // Try large limit to fetch all; backend should cap if needed
      const { data } = await axios.get(`${API_BASE_URL}/products`, { params: { limit: 1000 } });
      const list = data?.data?.data || data?.data || data || [];
      const normalized = normalizeProducts(list);
      setAllProducts(normalized);
      setProductsLoaded(true);
      // Initialize visible options
      setProductOptions(normalized.slice(0, 20));
    } catch (_) {
      setAllProducts([]);
      setProductOptions([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const filterProducts = (q: string) => {
    const term = (q || '').toLowerCase();
    if (!term) return allProducts.slice(0, 20);
    return allProducts.filter((p: any) =>
      (p.name || '').toLowerCase().includes(term)
    ).slice(0, 20);
  };

  // Initialize renterId from current authenticated user and hide renter input
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const currentUserId = parsed?.id || parsed?.userId || parsed?.sub;
        const displayName = parsed?.name || [parsed?.firstName, parsed?.lastName].filter(Boolean).join(' ') || parsed?.email;
        if (currentUserId) {
          setFormData(prev => ({ ...prev, renterId: String(currentUserId) }));
        }
        if (displayName) {
          setRenterQuery(displayName);
        }
      }
    } catch {}
  }, []);

  // Renter comes from current session; no user search needed

  // Debounce queries
  useEffect(() => {
    if (productDebounceRef.current) window.clearTimeout(productDebounceRef.current);
    productDebounceRef.current = window.setTimeout(() => {
      if (productsLoaded) {
        setProductOptions(filterProducts(productQuery));
      }
    }, 200);
    return () => {
      if (productDebounceRef.current) window.clearTimeout(productDebounceRef.current);
    };
  }, [productQuery, productsLoaded, allProducts]);

  useEffect(() => {
    if (renterDebounceRef.current) window.clearTimeout(renterDebounceRef.current);
    renterDebounceRef.current = window.setTimeout(() => {
      // No-op: renter is current logged-in user
    }, 250);
    return () => {
      if (renterDebounceRef.current) window.clearTimeout(renterDebounceRef.current);
    };
  }, [renterQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId.trim() || !formData.renterId.trim()) {
      showToast('Please select both Product and Renter', 'error');
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
    setProductQuery('');
    setRenterQuery('');
    setProductOptions([]);
    // keep renterId from session
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
            {/* Product autocomplete */}
            <div className="relative">
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-2" />
                Product
              </label>
              <input
                type="text"
                id="product"
                value={productQuery}
                onChange={(e) => {
                  setProductQuery(e.target.value);
                  setShowProductOptions(true);
                  // Clear selected id if user changes query
                  setFormData(prev => ({ ...prev, productId: '' }));
                }}
                onFocus={() => {
                  setShowProductOptions(true);
                  if (!productsLoaded && !productsLoading) {
                    void loadAllProducts();
                  } else if (productsLoaded) {
                    setProductOptions(filterProducts(productQuery));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Search product by name"
                disabled={loading}
                autoComplete="off"
              />
              {showProductOptions && productOptions.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200">
                  {productOptions.map((p: any) => (
                    <li
                      key={p.id || p.productId}
                      className="cursor-pointer select-none py-2 px-3 text-gray-700 hover:bg-gray-100"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const id = p.id || p.productId;
                        const name = p.name || p.productName || p.title || `Product ${id?.slice?.(0,8)}`;
                        setProductQuery(name);
                        setFormData(prev => ({ ...prev, productId: String(id) }));
                        setShowProductOptions(false);
                      }}
                    >
                      <div className="font-medium">{p.name || p.productName || p.title || 'Unnamed product'}</div>
                      <div className="text-xs text-gray-500 truncate">ID: {p.id || p.productId}</div>
                    </li>
                  ))}
                </ul>
              )}
              {formData.productId && (
                <div className="mt-1 text-xs text-gray-500">Selected Product ID: {formData.productId}</div>
              )}
            </div>

            {/* Renter field hidden: backend expects renterId from current session */}
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
