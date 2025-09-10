import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
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
  Package
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

  // Product autocomplete and renter auto-fill (no React Query)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';
  const [productQuery, setProductQuery] = useState('');
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProductOptions, setShowProductOptions] = useState(false);
  const productDebounceRef = useRef<number | undefined>(undefined);
  // Booking autocomplete
  const [bookingQuery, setBookingQuery] = useState('');
  const [bookingOptions, setBookingOptions] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const bookingDebounceRef = useRef<number | undefined>(undefined);

  const normalizeProducts = (list: any[]): any[] => {
    return (Array.isArray(list) ? list : []).map((p: any) => ({
      id: p.id ?? p.productId ?? p._id ?? p.uuid,
      name: p.name ?? p.productName ?? p.title ?? '',
      title: p.title,
      productName: p.productName,
    })).filter((p: any) => p.id);
  };

  const normalizeBookings = (list: any[]): any[] => {
    return (Array.isArray(list) ? list : []).map((b: any) => ({
      id: b.id ?? b.bookingId ?? b._id ?? b.uuid,
      name: b.reference ?? b.code ?? b.bookingCode ?? b.name ?? '',
      reference: b.reference ?? b.code ?? b.bookingCode,
    })).filter((b: any) => b.id);
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

  const loadAllBookings = async () => {
    if (bookingsLoaded || bookingsLoading) return;
    setBookingsLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/bookings`, { params: { limit: 1000 } });
      const list = data?.data?.data || data?.data || data || [];
      const normalized = normalizeBookings(list);
      setAllBookings(normalized);
      setBookingsLoaded(true);
      setBookingOptions(normalized.slice(0, 20));
    } catch (_) {
      setAllBookings([]);
      setBookingOptions([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const filterBookings = (q: string) => {
    const term = (q || '').toLowerCase();
    if (!term) return allBookings.slice(0, 20);
    return allBookings.filter((b: any) => (b.name || '').toLowerCase().includes(term)).slice(0, 20);
  };

  useEffect(() => {
    if (productDebounceRef.current) window.clearTimeout(productDebounceRef.current);
    productDebounceRef.current = window.setTimeout(() => {
      if (productsLoaded) setProductOptions(filterProducts(productQuery));
    }, 200);
    return () => { if (productDebounceRef.current) window.clearTimeout(productDebounceRef.current); };
  }, [productQuery, productsLoaded, allProducts]);

  useEffect(() => {
    if (bookingDebounceRef.current) window.clearTimeout(bookingDebounceRef.current);
    bookingDebounceRef.current = window.setTimeout(() => {
      if (bookingsLoaded) setBookingOptions(filterBookings(bookingQuery));
    }, 200);
    return () => { if (bookingDebounceRef.current) window.clearTimeout(bookingDebounceRef.current); };
  }, [bookingQuery, bookingsLoaded, allBookings]);

  // Initialize renterId from current user; hide renter input
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const currentUserId = parsed?.id || parsed?.userId || parsed?.sub;
        if (currentUserId) {
          setFormData(prev => ({ ...prev, renterId: String(currentUserId) }));
        }
      }
    } catch {}
  }, []);

  const handleCheckCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bookingId.trim() || !formData.productId.trim() || !formData.renterId.trim()) {
      showToast('Please enter Booking ID and select Product', 'error');
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
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-slate-900 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-slate-100">Compliance Checker</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">Check booking compliance status</p>
            </div>
          </div>
          {compliance && (
            <div className="flex items-center space-x-2">
              <button
                onClick={exportComplianceReport}
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
        <form onSubmit={handleCheckCompliance} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative">
              <label htmlFor="booking" className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
                <FileText className="w-4 h-4 inline mr-2" />
                Booking
              </label>
              <input
                type="text"
                id="booking"
                value={bookingQuery}
                onChange={(e) => {
                  setBookingQuery(e.target.value);
                  setShowBookingOptions(true);
                  setFormData(prev => ({ ...prev, bookingId: '' }));
                }}
                onFocus={() => {
                  setShowBookingOptions(true);
                  if (!bookingsLoaded && !bookingsLoading) {
                    void loadAllBookings();
                  } else if (bookingsLoaded) {
                    setBookingOptions(filterBookings(bookingQuery));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                placeholder="Search booking by reference/code"
                disabled={loading}
                autoComplete="off"
              />
              {showBookingOptions && bookingOptions.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200 dark:bg-slate-900 dark:border-slate-700">
                  {bookingOptions.map((b: any) => (
                    <li
                      key={b.id || b.bookingId}
                      className="cursor-pointer select-none py-2 px-3 text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const id = b.id || b.bookingId;
                        const label = b.name || `Booking ${id?.slice?.(0,8)}`;
                        setBookingQuery(label);
                        setFormData(prev => ({ ...prev, bookingId: String(id) }));
                        setShowBookingOptions(false);
                      }}
                    >
                      <div className="font-medium dark:text-slate-100">{b.name || 'Unnamed booking'}</div>
                      <div className="text-xs text-gray-500 truncate dark:text-slate-400">ID: {b.id || b.bookingId}</div>
                    </li>
                  ))}
                </ul>
              )}
              {formData.bookingId && (
                <div className="mt-1 text-xs text-gray-500">Selected Booking ID: {formData.bookingId}</div>
              )}
            </div>
            <div className="relative">
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">
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
                        setFormData(prev => ({ ...prev, productId: String(id) }));
                        setShowProductOptions(false);
                      }}
                    >
                      <div className="font-medium dark:text-slate-100">{p.name || p.productName || p.title || 'Unnamed product'}</div>
                      <div className="text-xs text-gray-500 truncate dark:text-slate-400">ID: {p.id || p.productId}</div>
                    </li>
                  ))}
                </ul>
              )}
              {formData.productId && (
                <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">Selected Product ID: {formData.productId}</div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Renter hidden: backend uses current session */}
            <div className="flex items-end">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.forceCheck}
                  onChange={(e) => setFormData(prev => ({ ...prev, forceCheck: e.target.checked }))}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Force Check</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleGetCompliance}
              disabled={loading || !formData.bookingId.trim()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
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
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-900/30">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Compliance Check Failed</h3>
                <p className="text-sm text-red-700 mt-1 dark:text-red-300/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {compliance && (
          <div className="mt-6 space-y-6">
            {/* Compliance Status */}
            <div className="bg-gray-50 rounded-lg p-6 dark:bg-slate-800">
              <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-slate-100">Compliance Status</h3>
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
                    <div className="text-sm text-gray-600 mt-1 dark:text-slate-400">
                      {compliance.isCompliant ? 'Fully Compliant' : 'Non-Compliant'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getComplianceScoreColor(compliance.complianceScore)}`}>
                    {compliance.complianceScore}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-slate-400">Compliance Score</div>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2 dark:bg-slate-700">
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
              <div className="bg-white border border-gray-200 rounded-lg p-6 dark:bg-slate-900 dark:border-slate-700">
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-slate-100">Missing Requirements</h3>
                <div className="space-y-2">
                  {compliance.missingRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-900/30">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-800 dark:text-red-300">{requirement.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enforcement Actions */}
            {compliance.enforcementActions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 dark:bg-slate-900 dark:border-slate-700">
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-slate-100">Required Enforcement Actions</h3>
                <div className="space-y-3">
                  {compliance.enforcementActions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-900/30">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{action.actionType}</div>
                        <div className="text-sm text-yellow-700 mt-1 dark:text-yellow-300/80">{action.description}</div>
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
            <div className="bg-white border border-gray-200 rounded-lg p-6 dark:bg-slate-900 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                  <span className="text-sm text-gray-600 dark:text-slate-400">Last Checked</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
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
