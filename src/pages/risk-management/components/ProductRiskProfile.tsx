import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
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
  // Product autocomplete (no React Query)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';
  const [productQuery, setProductQuery] = useState('');
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProductOptions, setShowProductOptions] = useState(false);
  const productDebounceRef = useRef<number | undefined>(undefined);

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
      const { data } = await axios.get(`${API_BASE_URL}/products`, { params: { limit: 1000 } });
      const list = data?.data?.data || data?.data || data || [];
      const normalized = normalizeProducts(list);
      setAllProducts(normalized);
      setProductsLoaded(true);
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
    return allProducts.filter((p: any) => (p.name || '').toLowerCase().includes(term)).slice(0, 20);
  };

  useEffect(() => {
    if (productDebounceRef.current) window.clearTimeout(productDebounceRef.current);
    productDebounceRef.current = window.setTimeout(() => {
      if (productsLoaded) setProductOptions(filterProducts(productQuery));
    }, 200);
    return () => { if (productDebounceRef.current) window.clearTimeout(productDebounceRef.current); };
  }, [productQuery, productsLoaded, allProducts]);

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
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-slate-900 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-slate-100">Product Risk Profile</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">View product-specific risk information</p>
            </div>
          </div>
          {profile && (
            <div className="flex items-center space-x-2">
              <button
                onClick={exportProfileReport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:border-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleClear}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:border-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Form */}
        <form onSubmit={handleGetProfile} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
              <Package className="w-4 h-4 inline mr-2" />
              Product
            </label>
            <div className="flex gap-2 sm:space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  id="product"
                  value={productQuery}
                  onChange={(e) => {
                    setProductQuery(e.target.value);
                    setShowProductOptions(true);
                    setProductId('');
                  }}
                  onFocus={() => {
                    setShowProductOptions(true);
                    if (!productsLoaded && !productsLoading) {
                      void loadAllProducts();
                    } else if (productsLoaded) {
                      setProductOptions(filterProducts(productQuery));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  placeholder="Search product by name"
                  disabled={loading}
                  autoComplete="off"
                />
                {showProductOptions && productOptions.length > 0 && (
                  <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200 dark:bg-slate-900 dark:border-slate-700">
                    {productOptions.map((p: any) => (
                      <li
                        key={p.id || p.productId}
                        className="cursor-pointer select-none py-2 px-3 text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const id = p.id || p.productId;
                          const name = p.name || p.productName || p.title || `Product ${id?.slice?.(0,8)}`;
                          setProductQuery(name);
                          setProductId(String(id));
                          setShowProductOptions(false);
                        }}
                      >
                        <div className="font-medium dark:text-slate-100">{p.name || p.productName || p.title || 'Unnamed product'}</div>
                        <div className="text-xs text-gray-500 truncate dark:text-slate-400">ID: {p.id || p.productId}</div>
                      </li>
                    ))}
                  </ul>
                )}
                {productId && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">Selected Product ID: {productId}</div>
                )}
              </div>
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
                {/* Product ID intentionally hidden per requirement */}
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
