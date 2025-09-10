import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, AlertCircle, CheckCircle, Download, Search, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { riskManagementService } from '../../../services/riskManagementService';
import { RiskLevel } from '../../../types/riskManagement';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RiskProfileFormData {
  productId: string;
  categoryId: string;
  riskLevel: RiskLevel;
  mandatoryRequirements: {
    insurance: boolean;
    inspection: boolean;
    minCoverage: number;
    inspectionTypes: string[];
    complianceDeadlineHours: number;
  };
  riskFactors: string[];
  mitigationStrategies: string[];
  enforcementLevel: 'moderate' | 'strict' | 'very_strict' | 'lenient';
  autoEnforcement: boolean;
  gracePeriodHours: number;
}

const BulkCreateRiskProfileModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [profiles, setProfiles] = useState<RiskProfileFormData[]>([
    {
      productId: '',
      categoryId: '',
      riskLevel: RiskLevel.MEDIUM,
      mandatoryRequirements: {
        insurance: true,
        inspection: true,
        minCoverage: 10000,
        inspectionTypes: ['pre_rental', 'post_rental'],
        complianceDeadlineHours: 24
      },
      riskFactors: ['high_value'],
      mitigationStrategies: ['require_insurance'],
      enforcementLevel: 'moderate',
      autoEnforcement: true,
      gracePeriodHours: 48
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Autocomplete state for each profile
  const [productSearches, setProductSearches] = useState<{ [key: number]: string }>({});
  const [categorySearches, setCategorySearches] = useState<{ [key: number]: string }>({});
  const [showProductDropdowns, setShowProductDropdowns] = useState<{ [key: number]: boolean }>({});
  const [showCategoryDropdowns, setShowCategoryDropdowns] = useState<{ [key: number]: boolean }>({});
  const [selectedProducts, setSelectedProducts] = useState<{ [key: number]: { id: string; title: string } | null }>({});
  const [selectedCategories, setSelectedCategories] = useState<{ [key: number]: { id: string; name: string } | null }>({});

  const riskLevels = [
    { value: RiskLevel.LOW, label: 'Low Risk', color: 'green' },
    { value: RiskLevel.MEDIUM, label: 'Medium Risk', color: 'yellow' },
    { value: RiskLevel.HIGH, label: 'High Risk', color: 'orange' },
    { value: RiskLevel.CRITICAL, label: 'Critical Risk', color: 'red' }
  ];

  const enforcementLevels = [
    { value: 'lenient', label: 'Lenient' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'strict', label: 'Strict' },
    { value: 'very_strict', label: 'Very Strict' }
  ];

  const inspectionTypes = [
    { value: 'pre_rental', label: 'Pre-rental' },
    { value: 'post_rental', label: 'Post-rental' },
    { value: 'periodic', label: 'Periodic' },
    { value: 'damage_assessment', label: 'Damage Assessment' }
  ];

  const commonRiskFactors = [
    'high_value', 'fragile', 'seasonal_demand', 'weather_sensitive', 
    'technical_complexity', 'safety_critical', 'regulatory_compliance'
  ];

  const commonMitigationStrategies = [
    'require_insurance', 'mandatory_inspection', 'user_training', 
    'safety_protocols', 'regular_maintenance', 'monitoring_systems'
  ];

  // Get all unique search terms for products and categories
  const allProductSearches = Object.values(productSearches).filter(search => search.length > 2);
  const allCategorySearches = Object.values(categorySearches).filter(search => search.length > 2);

  // Fetch products for autocomplete
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', allProductSearches.join(',')],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      
      // Try different search approaches
      let searchUrl = `http://localhost:3000/api/v1/products`;
      const params = new URLSearchParams();
      
      if (allProductSearches.length > 0) {
        // Use the first search term for now
        params.append('search', allProductSearches[0]);
        params.append('q', allProductSearches[0]);
        params.append('title', allProductSearches[0]);
      }
      params.append('limit', '10');
      
      searchUrl += `?${params.toString()}`;
      
      const response = await axios.get(searchUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Try multiple extraction strategies
      let products = [];
      
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        products = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        products = response.data.data;
      } else if (Array.isArray(response.data)) {
        products = response.data;
      } else {
        products = [];
      }
      
      // Filter products that match any of the search terms
      if (allProductSearches.length > 0 && products.length > 0) {
        products = products.filter((product: any) => 
          allProductSearches.some(search => 
            product.title?.toLowerCase().includes(search.toLowerCase()) ||
            product.name?.toLowerCase().includes(search.toLowerCase()) ||
            product.id?.toLowerCase().includes(search.toLowerCase())
          )
        );
      }
      
      return {
        data: products
      };
    },
    enabled: allProductSearches.length > 0,
  });

  // Fetch categories for autocomplete
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories', allCategorySearches.join(',')],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      
      let searchUrl = `http://localhost:3000/api/v1/categories`;
      const params = new URLSearchParams();
      
      if (allCategorySearches.length > 0) {
        params.append('search', allCategorySearches[0]);
        params.append('q', allCategorySearches[0]);
        params.append('name', allCategorySearches[0]);
      }
      params.append('limit', '10');
      
      searchUrl += `?${params.toString()}`;
      
      const response = await axios.get(searchUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let categories = [];
      
      if (Array.isArray(response.data)) {
        categories = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        categories = response.data.data;
      } else {
        categories = [];
      }
      
      // Filter categories that match any of the search terms
      if (allCategorySearches.length > 0 && categories.length > 0) {
        categories = categories.filter((category: any) => 
          allCategorySearches.some(search => 
            category.name?.toLowerCase().includes(search.toLowerCase()) ||
            category.id?.toLowerCase().includes(search.toLowerCase())
          )
        );
      }
      
      return {
        data: categories
      };
    },
    enabled: allCategorySearches.length > 0,
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowProductDropdowns({});
        setShowCategoryDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete handlers
  const handleProductSelect = (profileIndex: number, product: { id: string; title: string }) => {
    setSelectedProducts(prev => ({ ...prev, [profileIndex]: product }));
    updateProfile(profileIndex, 'productId', product.id);
    setProductSearches(prev => ({ ...prev, [profileIndex]: product.title }));
    setShowProductDropdowns(prev => ({ ...prev, [profileIndex]: false }));
  };

  const handleCategorySelect = (profileIndex: number, category: { id: string; name: string }) => {
    setSelectedCategories(prev => ({ ...prev, [profileIndex]: category }));
    updateProfile(profileIndex, 'categoryId', category.id);
    setCategorySearches(prev => ({ ...prev, [profileIndex]: category.name }));
    setShowCategoryDropdowns(prev => ({ ...prev, [profileIndex]: false }));
  };

  const addProfile = () => {
    const newIndex = profiles.length;
    setProfiles([...profiles, {
      productId: '',
      categoryId: '',
      riskLevel: RiskLevel.MEDIUM,
      mandatoryRequirements: {
        insurance: true,
        inspection: true,
        minCoverage: 10000,
        inspectionTypes: ['pre_rental', 'post_rental'],
        complianceDeadlineHours: 24
      },
      riskFactors: ['high_value'],
      mitigationStrategies: ['require_insurance'],
      enforcementLevel: 'moderate',
      autoEnforcement: true,
      gracePeriodHours: 48
    }]);
    
    // Initialize autocomplete state for new profile
    setProductSearches(prev => ({ ...prev, [newIndex]: '' }));
    setCategorySearches(prev => ({ ...prev, [newIndex]: '' }));
    setShowProductDropdowns(prev => ({ ...prev, [newIndex]: false }));
    setShowCategoryDropdowns(prev => ({ ...prev, [newIndex]: false }));
    setSelectedProducts(prev => ({ ...prev, [newIndex]: null }));
    setSelectedCategories(prev => ({ ...prev, [newIndex]: null }));
  };

  const removeProfile = (index: number) => {
    if (profiles.length > 1) {
      setProfiles(profiles.filter((_, i) => i !== index));
      
      // Clean up autocomplete state for removed profile
      setProductSearches(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      setCategorySearches(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      setShowProductDropdowns(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      setShowCategoryDropdowns(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      setSelectedProducts(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      setSelectedCategories(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  const updateProfile = (index: number, field: keyof RiskProfileFormData, value: any) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[index] = { ...updatedProfiles[index], [field]: value };
    setProfiles(updatedProfiles);
  };

  const updateMandatoryRequirements = (index: number, field: keyof RiskProfileFormData['mandatoryRequirements'], value: any) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[index].mandatoryRequirements = {
      ...updatedProfiles[index].mandatoryRequirements,
      [field]: value
    };
    setProfiles(updatedProfiles);
  };

  const toggleArrayItem = (index: number, field: 'riskFactors' | 'mitigationStrategies' | 'inspectionTypes', item: string) => {
    const updatedProfiles = [...profiles];
    const currentArray = field === 'inspectionTypes' 
      ? updatedProfiles[index].mandatoryRequirements.inspectionTypes
      : updatedProfiles[index][field];
    
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    
    if (field === 'inspectionTypes') {
      updatedProfiles[index].mandatoryRequirements.inspectionTypes = newArray;
    } else {
      updatedProfiles[index][field] = newArray;
    }
    
    setProfiles(updatedProfiles);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Transform the form data to match the API specification
      const apiData = {
        profiles: profiles.map(profile => ({
          productId: profile.productId,
          categoryId: profile.categoryId,
          riskLevel: profile.riskLevel,
          mandatoryRequirements: profile.mandatoryRequirements,
          riskFactors: profile.riskFactors,
          mitigationStrategies: profile.mitigationStrategies,
          enforcementLevel: profile.enforcementLevel,
          autoEnforcement: profile.autoEnforcement,
          gracePeriodHours: profile.gracePeriodHours
        }))
      };

      const result = await riskManagementService.createRiskProfilesBulk(apiData);
      setResult(result);
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create risk profiles');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleProfiles: RiskProfileFormData[] = [
      {
        productId: '403eb546-56bf-4b2e-987d-6bb05a09cadd',
        categoryId: 'photography-equipment',
        riskLevel: RiskLevel.HIGH,
        mandatoryRequirements: {
          insurance: true,
          inspection: true,
          minCoverage: 25000,
          inspectionTypes: ['pre_rental', 'post_rental'],
          complianceDeadlineHours: 12
        },
        riskFactors: ['high_value', 'fragile', 'technical_complexity'],
        mitigationStrategies: ['require_insurance', 'mandatory_inspection', 'user_training'],
        enforcementLevel: 'strict',
        autoEnforcement: true,
        gracePeriodHours: 24
      },
      {
        productId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: 'vehicles',
        riskLevel: RiskLevel.CRITICAL,
        mandatoryRequirements: {
          insurance: true,
          inspection: true,
          minCoverage: 50000,
          inspectionTypes: ['pre_rental', 'post_rental', 'periodic'],
          complianceDeadlineHours: 6
        },
        riskFactors: ['high_value', 'safety_critical', 'regulatory_compliance'],
        mitigationStrategies: ['require_insurance', 'mandatory_inspection', 'safety_protocols'],
        enforcementLevel: 'very_strict',
        autoEnforcement: true,
        gracePeriodHours: 12
      }
    ];
    setProfiles(sampleProfiles);
  };

  const downloadSampleJSON = () => {
    const sampleData = {
      profiles: [
        {
          productId: "403eb546-56bf-4b2e-987d-6bb05a09cadd",
          categoryId: "photography-equipment",
          riskLevel: "high",
          mandatoryRequirements: {
            insurance: true,
            inspection: true,
            minCoverage: 25000,
            inspectionTypes: ["pre_rental", "post_rental"],
            complianceDeadlineHours: 12
          },
          riskFactors: ["high_value", "fragile", "technical_complexity"],
          mitigationStrategies: ["require_insurance", "mandatory_inspection", "user_training"],
          enforcementLevel: "strict",
          autoEnforcement: true,
          gracePeriodHours: 24
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk-profiles-sample.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  if (success && result) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Bulk Creation Results</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md p-4">
                  <div className="flex">
                    <CheckCircle className="w-5 h-5 text-green-400 dark:text-green-500" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Bulk Creation Completed</h3>
                      <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                        <p>Total: {result.summary.total}</p>
                        <p>Successful: {result.summary.successful}</p>
                        <p>Failed: {result.summary.failed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {result.failed.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-red-400 dark:text-red-500" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Failed Profiles</h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                          {result.failed.map((failure: any, index: number) => (
                            <p key={index}>Profile {index + 1}: {failure.error}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full max-h-[95vh] overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Bulk Create Risk Profiles</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadSampleJSON}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Sample JSON</span>
                  <span className="sm:hidden">JSON</span>
                </button>
                <button
                  onClick={generateSampleData}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Load Sample</span>
                  <span className="sm:hidden">Sample</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-400 dark:text-red-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {profiles.map((profile, index) => (
                <div key={index} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 bg-white dark:bg-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-slate-100">Profile {index + 1}</h4>
                    {profiles.length > 1 && (
                      <button
                        onClick={() => removeProfile(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Product ID */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Product *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={productSearches[index] || ''}
                          onChange={(e) => {
                            setProductSearches(prev => ({ ...prev, [index]: e.target.value }));
                            setShowProductDropdowns(prev => ({ ...prev, [index]: true }));
                            if (!e.target.value) {
                              setSelectedProducts(prev => ({ ...prev, [index]: null }));
                              updateProfile(index, 'productId', '');
                            }
                          }}
                          onFocus={() => setShowProductDropdowns(prev => ({ ...prev, [index]: true }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                          placeholder="Search for product..."
                        />
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
                      </div>
                      
                      {/* Product Dropdown */}
                      {showProductDropdowns[index] && (productSearches[index]?.length || 0) > 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {productsLoading ? (
                            <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400 flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                              Loading products...
                            </div>
                          ) : productsError ? (
                            <div className="px-4 py-2 text-sm text-red-500 dark:text-red-400">
                              Error loading products: {productsError.message}
                            </div>
                          ) : productsData?.data && productsData.data.length > 0 ? (
                            productsData.data.map((product: any) => (
                              <div
                                key={product.id}
                                onClick={() => handleProductSelect(index, { id: product.id, title: product.title })}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center justify-between"
                              >
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{product.title}</div>
                                  <div className="text-xs text-gray-500 dark:text-slate-400">ID: {product.id}</div>
                                </div>
                                {selectedProducts[index]?.id === product.id && (
                                  <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400">
                              No products found for "{productSearches[index]}"
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedProducts[index] && (
                        <div className="mt-2 p-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-lg">
                          <div className="text-sm text-teal-800 dark:text-teal-200">
                            <strong>Selected:</strong> {selectedProducts[index]?.title}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Category ID */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Category *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={categorySearches[index] || ''}
                          onChange={(e) => {
                            setCategorySearches(prev => ({ ...prev, [index]: e.target.value }));
                            setShowCategoryDropdowns(prev => ({ ...prev, [index]: true }));
                            if (!e.target.value) {
                              setSelectedCategories(prev => ({ ...prev, [index]: null }));
                              updateProfile(index, 'categoryId', '');
                            }
                          }}
                          onFocus={() => setShowCategoryDropdowns(prev => ({ ...prev, [index]: true }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                          placeholder="Search for category..."
                        />
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
                      </div>
                      
                      {/* Category Dropdown */}
                      {showCategoryDropdowns[index] && (categorySearches[index]?.length || 0) > 2 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {categoriesLoading ? (
                            <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400 flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                              Loading categories...
                            </div>
                          ) : categoriesError ? (
                            <div className="px-4 py-2 text-sm text-red-500 dark:text-red-400">
                              Error loading categories: {categoriesError.message}
                            </div>
                          ) : categoriesData?.data && categoriesData.data.length > 0 ? (
                            categoriesData.data.map((category: any) => (
                              <div
                                key={category.id}
                                onClick={() => handleCategorySelect(index, { id: category.id, name: category.name })}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center justify-between"
                              >
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{category.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-slate-400">ID: {category.id}</div>
                                </div>
                                {selectedCategories[index]?.id === category.id && (
                                  <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400">
                              No categories found for "{categorySearches[index]}"
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedCategories[index] && (
                        <div className="mt-2 p-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-lg">
                          <div className="text-sm text-teal-800 dark:text-teal-200">
                            <strong>Selected:</strong> {selectedCategories[index]?.name}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Risk Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Risk Level *
                      </label>
                      <select
                        value={profile.riskLevel}
                        onChange={(e) => updateProfile(index, 'riskLevel', e.target.value as RiskLevel)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                      >
                        {riskLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Enforcement Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Enforcement Level *
                      </label>
                      <select
                        value={profile.enforcementLevel}
                        onChange={(e) => updateProfile(index, 'enforcementLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                      >
                        {enforcementLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mandatory Requirements */}
                    <div className="lg:col-span-2">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Mandatory Requirements</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.mandatoryRequirements.insurance}
                            onChange={(e) => updateMandatoryRequirements(index, 'insurance', e.target.checked)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                          />
                          <label className="ml-2 text-sm text-gray-700 dark:text-slate-300">Insurance Required</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.mandatoryRequirements.inspection}
                            onChange={(e) => updateMandatoryRequirements(index, 'inspection', e.target.checked)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                          />
                          <label className="ml-2 text-sm text-gray-700 dark:text-slate-300">Inspection Required</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profile.autoEnforcement}
                            onChange={(e) => updateProfile(index, 'autoEnforcement', e.target.checked)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                          />
                          <label className="ml-2 text-sm text-gray-700 dark:text-slate-300">Auto Enforcement</label>
                        </div>
                      </div>
                    </div>

                    {/* Min Coverage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Minimum Coverage ($)
                      </label>
                      <input
                        type="number"
                        value={profile.mandatoryRequirements.minCoverage}
                        onChange={(e) => updateMandatoryRequirements(index, 'minCoverage', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                      />
                    </div>

                    {/* Compliance Deadline */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Compliance Deadline (hours)
                      </label>
                      <input
                        type="number"
                        value={profile.mandatoryRequirements.complianceDeadlineHours}
                        onChange={(e) => updateMandatoryRequirements(index, 'complianceDeadlineHours', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                      />
                    </div>

                    {/* Grace Period */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Grace Period (hours)
                      </label>
                      <input
                        type="number"
                        value={profile.gracePeriodHours}
                        onChange={(e) => updateProfile(index, 'gracePeriodHours', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                      />
                    </div>

                    {/* Inspection Types */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Inspection Types
                      </label>
                      <div className="space-y-2">
                        {inspectionTypes.map(type => (
                          <div key={type.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={profile.mandatoryRequirements.inspectionTypes.includes(type.value)}
                              onChange={() => toggleArrayItem(index, 'inspectionTypes', type.value)}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                            />
                            <label className="ml-2 text-sm text-gray-700 dark:text-slate-300">{type.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Risk Factors
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {commonRiskFactors.map(factor => (
                          <div key={factor} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={profile.riskFactors.includes(factor)}
                              onChange={() => toggleArrayItem(index, 'riskFactors', factor)}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                            />
                            <label className="ml-2 text-sm text-gray-700 dark:text-slate-300">{factor.replace('_', ' ')}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mitigation Strategies */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Mitigation Strategies
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {commonMitigationStrategies.map(strategy => (
                          <div key={strategy} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={profile.mitigationStrategies.includes(strategy)}
                              onChange={() => toggleArrayItem(index, 'mitigationStrategies', strategy)}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                            />
                            <label className="ml-2 text-sm text-gray-700 dark:text-slate-300">{strategy.replace('_', ' ')}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center sm:justify-between">
              <button
                onClick={addProfile}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Profile
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 flex flex-col sm:flex-row sm:flex-row-reverse gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : `Create ${profiles.length} Profile${profiles.length > 1 ? 's' : ''}`}
            </button>
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkCreateRiskProfileModal;
