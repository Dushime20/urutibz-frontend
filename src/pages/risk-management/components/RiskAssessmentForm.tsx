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
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

interface RiskAssessmentFormProps {
  onAssessmentComplete?: (assessment: any) => void;
  className?: string;
}

const RiskAssessmentForm: React.FC<RiskAssessmentFormProps> = ({ 
  onAssessmentComplete, 
  className = '' 
}) => {
  const { showToast } = useToast();
  const { tSync } = useTranslation();
  const { assessment, loading, error, assessRisk, clearAssessment } = useRiskAssessment();
  const [formData, setFormData] = useState({
    productId: '',
    renterId: ''
  });

  // Friendly search inputs (no React Query)
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
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
      showToast(tSync('Please select both Product and Renter'), 'error');
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
    if (score >= 80) return tSync('Critical');
    if (score >= 60) return tSync('High');
    if (score >= 40) return tSync('Medium');
    return tSync('Low');
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
      <div className={`bg-white rounded-xl sm:rounded-lg shadow-sm border border-gray-200 dark:bg-slate-900 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-slate-100"><TranslatedText text="Risk Assessment" /></h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400"><TranslatedText text="Evaluate risk for product-renter combination" /></p>
            </div>
          </div>
          {assessment && (
            <button
              onClick={handleClear}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 touch-manipulation min-h-[44px] sm:min-h-0 transition-colors w-full sm:w-auto"
            >
              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <TranslatedText text="Clear" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Product autocomplete */}
            <div className="relative">
              <label htmlFor="product" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
                <TranslatedText text="Product" />
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
                className="w-full px-3 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg sm:rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 touch-manipulation min-h-[44px] sm:min-h-0"
                placeholder={tSync("Search product by name")}
                disabled={loading}
                autoComplete="off"
              />
              {showProductOptions && productOptions.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg sm:rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:bg-slate-900 dark:border-slate-700">
                  {productOptions.map((p: any) => (
                    <li
                      key={p.id || p.productId}
                      className="cursor-pointer select-none py-2.5 sm:py-2 px-3 text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700 touch-manipulation min-h-[44px] sm:min-h-0 flex flex-col justify-center"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const id = p.id || p.productId;
                        const name = p.name || p.productName || p.title || `Product ${id?.slice?.(0,8)}`;
                        setProductQuery(name);
                        setFormData(prev => ({ ...prev, productId: String(id) }));
                        setShowProductOptions(false);
                      }}
                    >
                      <div className="font-medium text-sm dark:text-slate-100 truncate">{p.name || p.productName || p.title || tSync('Unnamed product')}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 truncate dark:text-slate-400"><TranslatedText text="ID" />: {p.id || p.productId}</div>
                    </li>
                  ))}
                  {filterProducts(productQuery).length > productOptions.length && (
                    <li
                      className="cursor-pointer select-none py-2.5 sm:py-2 px-3 text-center text-xs sm:text-sm text-teal-700 hover:bg-gray-100 active:bg-gray-200 dark:text-teal-400 dark:hover:bg-slate-800 dark:active:bg-slate-700 touch-manipulation min-h-[44px] sm:min-h-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        // show more results (up to 200)
                        const all = filterProducts(productQuery);
                        setProductOptions(all.slice(0, 200));
                      }}
                    >
                      <TranslatedText text="Show all results" /> ({filterProducts(productQuery).length})
                    </li>
                  )}
                </ul>
              )}
              {formData.productId && (
                <div className="mt-1.5 sm:mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-slate-400"><TranslatedText text="Selected Product ID" />: {formData.productId}</div>
              )}
            </div>

            {/* Renter field hidden: backend expects renterId from current session */}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !formData.productId.trim() || !formData.renterId.trim()}
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 sm:py-2 border border-transparent rounded-lg sm:rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-0 transition-colors w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  <TranslatedText text="Assessing..." />
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  <TranslatedText text="Assess Risk" />
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
                <h3 className="text-sm font-medium text-red-800"><TranslatedText text="Assessment Failed" /></h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {assessment && (
          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            {/* Overall Risk Score */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4"><TranslatedText text="Overall Risk Assessment" /></h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{assessment.overallRiskScore}</div>
                  <div className="text-xs sm:text-sm text-gray-600"><TranslatedText text="Risk Score" /> (0-100)</div>
                </div>
                <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${getRiskLevelColor(assessment.overallRiskScore)}`}>
                  {getRiskLevel(assessment.overallRiskScore)} <TranslatedText text="Risk" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 w-full bg-gray-200 rounded-full h-2">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{assessment.riskFactors.productRisk}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1"><TranslatedText text="Product Risk" /></div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{assessment.riskFactors.renterRisk}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1"><TranslatedText text="Renter Risk" /></div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{assessment.riskFactors.bookingRisk}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1"><TranslatedText text="Booking Risk" /></div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white border border-gray-200 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{assessment.riskFactors.seasonalRisk}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1"><TranslatedText text="Seasonal Risk" /></div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4"><TranslatedText text="Compliance Status" /></h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center space-x-2.5 sm:space-x-3">
                  {assessment.complianceStatus === 'compliant' ? (
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                  )}
                  <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getComplianceStatusColor(assessment.complianceStatus)}`}>
                    {tSync(assessment.complianceStatus.replace('_', ' '))}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  <TranslatedText text="Assessed" />: {formatDateUTC(assessment.assessmentDate)}
                </div>
              </div>
            </div>

            {/* Mandatory Requirements */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4"><TranslatedText text="Mandatory Requirements" /></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center space-x-2.5 sm:space-x-3">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${assessment.mandatoryRequirements.insurance ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs sm:text-sm text-gray-700"><TranslatedText text="Insurance Required" /></span>
                </div>
                <div className="flex items-center space-x-2.5 sm:space-x-3">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${assessment.mandatoryRequirements.inspection ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs sm:text-sm text-gray-700"><TranslatedText text="Inspection Required" /></span>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1.5 sm:space-y-1">
                  <div className="text-xs sm:text-sm text-gray-700">
                    <TranslatedText text="Minimum Coverage" />: ${assessment.mandatoryRequirements.minCoverage?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-700">
                    <TranslatedText text="Inspection Types" />: {assessment.mandatoryRequirements.inspectionTypes?.join(', ') || tSync('None specified')}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {assessment.recommendations.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4"><TranslatedText text="Recommendations" /></h3>
                <ul className="space-y-2">
                  {assessment.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2.5 sm:space-x-3">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700">{recommendation}</span>
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
