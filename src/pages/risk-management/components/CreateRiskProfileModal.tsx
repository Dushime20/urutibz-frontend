import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, Check } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { riskManagementService } from '../../../services/riskManagementService';
import { CreateRiskProfileRequest, RiskLevel } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRiskProfileModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState<CreateRiskProfileRequest>({
    productId: '',
    categoryId: '',
    riskLevel: RiskLevel.LOW,
    mandatoryRequirements: {
      insurance: false,
      inspection: false,
      minCoverage: 0,
      inspectionTypes: [],
      complianceDeadlineHours: 24
    },
    riskFactors: [],
    mitigationStrategies: [],
    enforcementLevel: 'moderate',
    autoEnforcement: false,
    gracePeriodHours: 24
  });

  // Additional state for UI form fields that don't map directly to API
  const [uiFormData, setUiFormData] = useState({
    mandatoryRequirements: [''],
    optionalRequirements: [''],
    riskFactors: [{
      name: '',
      description: '',
      weight: 1,
      impact: 1,
      probability: 1,
      mitigationStrategies: ['']
    }],
    complianceRules: [{
      name: '',
      description: '',
      requirement: '',
      validationCriteria: [''],
      enforcementAction: 'warning' as any,
      isMandatory: true
    }]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autocomplete states
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{id: string, title: string} | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{id: string, name: string} | null>(null);

  const createProfileMutation = useMutation({
    mutationFn: (data: CreateRiskProfileRequest) => riskManagementService.createRiskProfile(data),
    onSuccess: () => {
      showToast('Risk profile created successfully', 'success');
      onSuccess();
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to create risk profile', 'error');
    }
  });

  // Fetch products for autocomplete
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', productSearch],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      
      // Try different search approaches
      let searchUrl = `${API_BASE_URL}/products`;
      const params = new URLSearchParams();
      
      if (productSearch) {
        // Try different search parameter names
        params.append('search', productSearch);
        params.append('q', productSearch);
        params.append('title', productSearch);
      }
      params.append('limit', '10');
      
      searchUrl += `?${params.toString()}`;
      
      console.log('Products Search URL:', searchUrl);
      
      const response = await axios.get(searchUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Products API Response:', response.data); // Debug log
      console.log('Products Response Structure:', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        hasDataDataData: !!response.data?.data?.data,
        dataType: typeof response.data,
        dataDataType: typeof response.data?.data,
        dataDataDataType: typeof response.data?.data?.data
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
        console.warn('Unexpected products response structure:', response.data);
        products = [];
      }
      
      // Filter products that match the search term
      if (productSearch && products.length > 0) {
        products = products.filter((product: any) => 
          product.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.id?.toLowerCase().includes(productSearch.toLowerCase())
        );
      }
      
      console.log('Filtered Products:', products);
      
      return {
        data: products
      };
    },
    enabled: productSearch.length > 2,
  });

  // Fetch categories for autocomplete
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories', categorySearch],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(`${API_BASE_URL}/categories?search=${categorySearch}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Categories API Response:', response.data); // Debug log
      // Based on categories service, categories are directly in response.data
      return {
        data: response.data || []
      };
    },
    enabled: categorySearch.length > 2,
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowProductDropdown(false);
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debug dropdown visibility
  useEffect(() => {
    console.log('Dropdown Debug:', { 
      showProductDropdown, 
      productSearchLength: productSearch.length, 
      shouldShow: showProductDropdown && productSearch.length > 2,
      productsData: productsData?.data?.length || 0
    });
  }, [showProductDropdown, productSearch.length, productsData]);

  // Autocomplete handlers
  const handleProductSelect = (product: {id: string, title: string}) => {
    setSelectedProduct(product);
    setFormData(prev => ({ ...prev, productId: product.id }));
    setProductSearch(product.title);
    setShowProductDropdown(false);
  };

  const handleCategorySelect = (category: {id: string, name: string}) => {
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, categoryId: category.id }));
    setCategorySearch(category.name);
    setShowCategoryDropdown(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId.trim()) {
      newErrors.productId = 'Product ID is required';
    }

    if (!formData.categoryId.trim()) {
      newErrors.categoryId = 'Category ID is required';
    }

    if (uiFormData.mandatoryRequirements.some(req => !req.trim())) {
      newErrors.mandatoryRequirements = 'All mandatory requirements must be filled';
    }

    if (uiFormData.riskFactors.some(factor => !factor.name.trim() || !factor.description.trim())) {
      newErrors.riskFactors = 'All risk factors must have name and description';
    }

    if (uiFormData.complianceRules.some(rule => !rule.name.trim() || !rule.description.trim())) {
      newErrors.complianceRules = 'All compliance rules must have name and description';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Transform UI data to API format
    const cleanedData: CreateRiskProfileRequest = {
      ...formData,
      riskFactors: uiFormData.riskFactors
        .filter(factor => factor.name.trim() && factor.description.trim())
        .map(factor => factor.name.trim()),
      mitigationStrategies: uiFormData.riskFactors
        .flatMap(factor => factor.mitigationStrategies.filter(strategy => strategy.trim()))
    };

    createProfileMutation.mutate(cleanedData);
    setIsSubmitting(false);
  };

  const addMandatoryRequirement = () => {
    setUiFormData(prev => ({
      ...prev,
      mandatoryRequirements: [...prev.mandatoryRequirements, '']
    }));
  };

  const removeMandatoryRequirement = (index: number) => {
    setUiFormData(prev => ({
      ...prev,
      mandatoryRequirements: prev.mandatoryRequirements.filter((_, i) => i !== index)
    }));
  };

  const updateMandatoryRequirement = (index: number, value: string) => {
    setUiFormData(prev => ({
      ...prev,
      mandatoryRequirements: prev.mandatoryRequirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addOptionalRequirement = () => {
    setUiFormData(prev => ({
      ...prev,
      optionalRequirements: [...prev.optionalRequirements, '']
    }));
  };

  const removeOptionalRequirement = (index: number) => {
    setUiFormData(prev => ({
      ...prev,
      optionalRequirements: prev.optionalRequirements.filter((_, i) => i !== index)
    }));
  };

  const updateOptionalRequirement = (index: number, value: string) => {
    setUiFormData(prev => ({
      ...prev,
      optionalRequirements: prev.optionalRequirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addRiskFactor = () => {
    setUiFormData(prev => ({
      ...prev,
      riskFactors: [...prev.riskFactors, {
        name: '',
        description: '',
        weight: 1,
        impact: 1,
        probability: 1,
        mitigationStrategies: ['']
      }]
    }));
  };

  const removeRiskFactor = (index: number) => {
    setUiFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.filter((_, i) => i !== index)
    }));
  };

  const updateRiskFactor = (index: number, field: string, value: any) => {
    setUiFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.map((factor, i) => 
        i === index ? { ...factor, [field]: value } : factor
      )
    }));
  };

  const addMitigationStrategy = (factorIndex: number) => {
    setUiFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.map((factor, i) => 
        i === factorIndex 
          ? { ...factor, mitigationStrategies: [...factor.mitigationStrategies, ''] }
          : factor
      )
    }));
  };

  const removeMitigationStrategy = (factorIndex: number, strategyIndex: number) => {
    setUiFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.map((factor, i) => 
        i === factorIndex 
          ? { 
              ...factor, 
              mitigationStrategies: factor.mitigationStrategies.filter((_, j) => j !== strategyIndex)
            }
          : factor
      )
    }));
  };

  const updateMitigationStrategy = (factorIndex: number, strategyIndex: number, value: string) => {
    setUiFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.map((factor, i) => 
        i === factorIndex 
          ? { 
              ...factor, 
              mitigationStrategies: factor.mitigationStrategies.map((strategy, j) => 
                j === strategyIndex ? value : strategy
              )
            }
          : factor
      )
    }));
  };

  const addComplianceRule = () => {
    setUiFormData(prev => ({
      ...prev,
      complianceRules: [...prev.complianceRules, {
        name: '',
        description: '',
        requirement: '',
        validationCriteria: [''],
        enforcementAction: 'warning' as any,
        isMandatory: true
      }]
    }));
  };

  const removeComplianceRule = (index: number) => {
    setUiFormData(prev => ({
      ...prev,
      complianceRules: prev.complianceRules.filter((_, i) => i !== index)
    }));
  };

  const updateComplianceRule = (index: number, field: string, value: any) => {
    setUiFormData(prev => ({
      ...prev,
      complianceRules: prev.complianceRules.map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const addValidationCriteria = (ruleIndex: number) => {
    setUiFormData(prev => ({
      ...prev,
      complianceRules: prev.complianceRules.map((rule, i) => 
        i === ruleIndex 
          ? { ...rule, validationCriteria: [...rule.validationCriteria, ''] }
          : rule
      )
    }));
  };

  const removeValidationCriteria = (ruleIndex: number, criteriaIndex: number) => {
    setUiFormData(prev => ({
      ...prev,
      complianceRules: prev.complianceRules.map((rule, i) => 
        i === ruleIndex 
          ? { 
              ...rule, 
              validationCriteria: rule.validationCriteria.filter((_, j) => j !== criteriaIndex)
            }
          : rule
      )
    }));
  };

  const updateValidationCriteria = (ruleIndex: number, criteriaIndex: number, value: string) => {
    setUiFormData(prev => ({
      ...prev,
      complianceRules: prev.complianceRules.map((rule, i) => 
        i === ruleIndex 
          ? { 
              ...rule, 
              validationCriteria: rule.validationCriteria.map((criteria, j) => 
                j === criteriaIndex ? value : criteria
              )
            }
          : rule
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Create Risk Profile</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Product *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setShowProductDropdown(true);
                          if (!e.target.value) {
                            setSelectedProduct(null);
                            setFormData(prev => ({ ...prev, productId: '' }));
                          }
                        }}
                        onFocus={() => setShowProductDropdown(true)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${
                          errors.productId ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'
                        }`}
                        placeholder="Search for product..."
                      />
                      <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
                    </div>
                    
                    {/* Product Dropdown */}
                    {showProductDropdown && productSearch.length > 2 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {/* Debug info */}
                        <div className="px-2 py-1 text-xs text-gray-400 dark:text-slate-500 border-b border-gray-200 dark:border-slate-600">
                          Debug: Loading={productsLoading ? 'true' : 'false'}, 
                          Error={productsError ? 'true' : 'false'}, 
                          Data={productsData ? 'exists' : 'null'}, 
                          DataLength={productsData?.data?.length || 0}
                        </div>
                        
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
                              onClick={() => handleProductSelect({id: product.id, title: product.title})}
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{product.title}</div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">ID: {product.id}</div>
                              </div>
                              {selectedProduct?.id === product.id && (
                                <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400">
                            No products found for "{productSearch}"
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedProduct && (
                      <div className="mt-2 p-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-lg">
                        <div className="text-sm text-teal-800 dark:text-teal-200">
                          <strong>Selected:</strong> {selectedProduct.title}
                        </div>
                      </div>
                    )}
                    
                    {errors.productId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.productId}</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => {
                          setCategorySearch(e.target.value);
                          setShowCategoryDropdown(true);
                          if (!e.target.value) {
                            setSelectedCategory(null);
                            setFormData(prev => ({ ...prev, categoryId: '' }));
                          }
                        }}
                        onFocus={() => setShowCategoryDropdown(true)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${
                          errors.categoryId ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'
                        }`}
                        placeholder="Search for category..."
                      />
                      <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
                    </div>
                    
                    {/* Category Dropdown */}
                    {showCategoryDropdown && categorySearch.length > 2 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {categoriesLoading ? (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                            Loading categories...
                          </div>
                        ) : categoriesError ? (
                          <div className="px-4 py-2 text-sm text-red-500 dark:text-red-400">
                            Error loading categories
                          </div>
                        ) : categoriesData?.data?.length > 0 ? (
                          categoriesData?.data?.map((category: any) => (
                            <div
                              key={category.id}
                              onClick={() => handleCategorySelect({id: category.id, name: category.name})}
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{category.name}</div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">ID: {category.id}</div>
                              </div>
                              {selectedCategory?.id === category.id && (
                                <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400">
                            No categories found
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedCategory && (
                      <div className="mt-2 p-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-lg">
                        <div className="text-sm text-teal-800 dark:text-teal-200">
                          <strong>Selected:</strong> {selectedCategory.name}
                        </div>
                      </div>
                    )}
                    
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoryId}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Risk Level *
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskLevel: e.target.value as RiskLevel }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <option value={RiskLevel.LOW}>Low Risk</option>
                    <option value={RiskLevel.MEDIUM}>Medium Risk</option>
                    <option value={RiskLevel.HIGH}>High Risk</option>
                    <option value={RiskLevel.CRITICAL}>Critical Risk</option>
                  </select>
                </div>

                {/* Mandatory Requirements */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Mandatory Requirements *
                    </label>
                    <button
                      type="button"
                      onClick={addMandatoryRequirement}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  {uiFormData.mandatoryRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => updateMandatoryRequirement(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        placeholder="Enter mandatory requirement"
                      />
                      <button
                        type="button"
                        onClick={() => removeMandatoryRequirement(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {errors.mandatoryRequirements && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mandatoryRequirements}</p>
                  )}
                </div>

                {/* Optional Requirements */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Optional Requirements
                    </label>
                    <button
                      type="button"
                      onClick={addOptionalRequirement}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  {uiFormData.optionalRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => updateOptionalRequirement(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        placeholder="Enter optional requirement"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionalRequirement(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Risk Factors */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Risk Factors *
                    </label>
                    <button
                      type="button"
                      onClick={addRiskFactor}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Factor</span>
                    </button>
                  </div>
                  {uiFormData.riskFactors.map((factor, factorIndex) => (
                    <div key={factorIndex} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-4 bg-white dark:bg-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-slate-100">Risk Factor {factorIndex + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeRiskFactor(factorIndex)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={factor.name}
                            onChange={(e) => updateRiskFactor(factorIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                            placeholder="Risk factor name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Weight
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={factor.weight}
                            onChange={(e) => updateRiskFactor(factorIndex, 'weight', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={factor.description}
                          onChange={(e) => updateRiskFactor(factorIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          rows={3}
                          placeholder="Describe the risk factor"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Impact (1-10)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={factor.impact}
                            onChange={(e) => updateRiskFactor(factorIndex, 'impact', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Probability (1-10)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={factor.probability}
                            onChange={(e) => updateRiskFactor(factorIndex, 'probability', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                            Mitigation Strategies
                          </label>
                          <button
                            type="button"
                            onClick={() => addMitigationStrategy(factorIndex)}
                            className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>
                        {factor.mitigationStrategies.map((strategy, strategyIndex) => (
                          <div key={strategyIndex} className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={strategy}
                              onChange={(e) => updateMitigationStrategy(factorIndex, strategyIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                              placeholder="Enter mitigation strategy"
                            />
                            <button
                              type="button"
                              onClick={() => removeMitigationStrategy(factorIndex, strategyIndex)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {errors.riskFactors && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.riskFactors}</p>
                  )}
                </div>

                {/* Compliance Rules */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Compliance Rules *
                    </label>
                    <button
                      type="button"
                      onClick={addComplianceRule}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Rule</span>
                    </button>
                  </div>
                  {uiFormData.complianceRules.map((rule, ruleIndex) => (
                    <div key={ruleIndex} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-4 bg-white dark:bg-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-slate-100">Compliance Rule {ruleIndex + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeComplianceRule(ruleIndex)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={rule.name}
                            onChange={(e) => updateComplianceRule(ruleIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                            placeholder="Rule name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Enforcement Action
                          </label>
                          <select
                            value={rule.enforcementAction}
                            onChange={(e) => updateComplianceRule(ruleIndex, 'enforcementAction', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          >
                            <option value="warning">Warning</option>
                            <option value="penalty">Penalty</option>
                            <option value="suspension">Suspension</option>
                            <option value="termination">Termination</option>
                            <option value="training_required">Training Required</option>
                            <option value="audit_required">Audit Required</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={rule.description}
                          onChange={(e) => updateComplianceRule(ruleIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          rows={3}
                          placeholder="Describe the compliance rule"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Requirement
                        </label>
                        <input
                          type="text"
                          value={rule.requirement}
                          onChange={(e) => updateComplianceRule(ruleIndex, 'requirement', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          placeholder="Enter requirement"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                            Validation Criteria
                          </label>
                          <button
                            type="button"
                            onClick={() => addValidationCriteria(ruleIndex)}
                            className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>
                        {rule.validationCriteria.map((criteria, criteriaIndex) => (
                          <div key={criteriaIndex} className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={criteria}
                              onChange={(e) => updateValidationCriteria(ruleIndex, criteriaIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                              placeholder="Enter validation criteria"
                            />
                            <button
                              type="button"
                              onClick={() => removeValidationCriteria(ruleIndex, criteriaIndex)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={rule.isMandatory}
                            onChange={(e) => updateComplianceRule(ruleIndex, 'isMandatory', e.target.checked)}
                            className="rounded border-gray-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500 bg-white dark:bg-slate-700"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Mandatory requirement</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  {errors.complianceRules && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.complianceRules}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting || createProfileMutation.isPending}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 dark:bg-teal-500 text-base font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || createProfileMutation.isPending ? 'Creating...' : 'Create Profile'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRiskProfileModal;
