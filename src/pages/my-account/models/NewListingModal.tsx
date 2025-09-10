import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, Plus, Trash2, Camera, DollarSign, Package, Info, AlertCircle, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { fetchCategories, fetchCountries } from '../service/api';

type FormState = {
  title: string;
  slug: string;
  description: string;
  category_id: string;
  condition: string;
  // New product meta
  brand?: string;
  model?: string;
  year_manufactured?: string;
  // Pricing fields - moved from product to separate pricing system
  price_per_hour: string;
  price_per_day: string;
  price_per_week: string;
  price_per_month: string;
  security_deposit: string;
  delivery_fee?: string;
  currency: string;
  market_adjustment_factor: string;
  weekly_discount_percentage: string;
  monthly_discount_percentage: string;
  bulk_discount_threshold: string;
  bulk_discount_percentage: string;
  dynamic_pricing_enabled: boolean;
  peak_season_multiplier: string;
  off_season_multiplier: string;
  // Product fields
  pickup_methods: string[];
  country_id: string;
  specifications: { [key: string]: string };
  features?: string[];
  included_accessories?: string[];
  images: File[];
  alt_text: string;
  sort_order: string;
  isPrimary: string;
  product_id: string;
  location: { latitude: string; longitude: string };
  // Address details
  address_line?: string;
};

interface ValidationErrors {
  title?: string;
  description?: string;
  condition?: string;
  currency?: string;
  price_per_day?: string;
  images?: string;
  category_id?: string;
  country_id?: string;
  pickup_methods?: string;
}

interface NewListingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  isSubmitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const NewListingModal: React.FC<NewListingModalProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  form, 
  setForm, 
  isSubmitting, 
  handleInputChange 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const cats = await fetchCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch {
        setCategories([]);
      }
      try {
        const cnts = await fetchCountries().then(res=>res.data);
        setCountries(Array.isArray(cnts) ? cnts : []);
      } catch {
        setCountries([]);
      }
    }
    fetchData();
  }, []);

  // Clear validation errors when form changes
  useEffect(() => {
    setValidationErrors({});
  }, [form]);

  if (!open) return null;

  const steps = [
    { id: 1, title: 'Basic Info', icon: Info },
    { id: 2, title: 'Pricing', icon: DollarSign },
    { id: 3, title: 'Details', icon: Package },
    { id: 4, title: 'Images & Location', icon: Camera },
  ];

  // Validation function
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Title validation
    if (!form.title.trim()) {
      errors.title = 'Product title is required';
    } else if (form.title.trim().length < 5) {
      errors.title = 'Product title must be at least 5 characters long';
    }

    // Description validation
    if (!form.description.trim()) {
      errors.description = 'Product description is required';
    } else if (form.description.trim().length < 20) {
      errors.description = 'Product description must be at least 20 characters long';
    }

    // Category validation
    if (!form.category_id) {
      errors.category_id = 'Please select a category';
    }

    // Condition validation
    if (!form.condition) {
      errors.condition = 'Please select a condition';
    }

    // Country validation
    if (!form.country_id) {
      errors.country_id = 'Please select a country';
    }

    // Currency validation
    if (!form.currency) {
      errors.currency = 'Please select a currency';
    }

    // Price per day validation
    if (!form.price_per_day) {
      errors.price_per_day = 'Price per day is required';
    } else if (parseFloat(form.price_per_day) <= 0) {
      errors.price_per_day = 'Price per day must be greater than 0';
    }

    // Images validation
    if (!form.images || form.images.length === 0) {
      errors.images = 'At least one product image is required';
    }

    // Pickup methods validation
    if (!form.pickup_methods || form.pickup_methods.length === 0) {
      errors.pickup_methods = 'Please select at least one pickup method';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced input change handler with validation
  const handleInputChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    handleInputChange(e);
    
    // Clear specific validation error when user starts typing
    const fieldName = e.target.name as keyof ValidationErrors;
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  // Enhanced form submission with validation
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Find the first step with errors and navigate to it
      const errorFields = Object.keys(validationErrors);
      if (errorFields.includes('title') || errorFields.includes('description') || errorFields.includes('category_id') || errorFields.includes('condition') || errorFields.includes('country_id')) {
        setCurrentStep(1);
      } else if (errorFields.includes('currency') || errorFields.includes('price_per_day') || errorFields.includes('pickup_methods')) {
        setCurrentStep(2);
      } else if (errorFields.includes('images')) {
        setCurrentStep(4);
      }
      return;
    }

    // If validation passes, submit the form
    onSubmit(e);
  };

  // Validate current step before allowing next
  const validateCurrentStep = (): boolean => {
    const errors: ValidationErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!form.title.trim()) errors.title = 'Product title is required';
        else if (form.title.trim().length < 5) errors.title = 'Product title must be at least 5 characters long';
        
        if (!form.description.trim()) errors.description = 'Product description is required';
        else if (form.description.trim().length < 20) errors.description = 'Product description must be at least 20 characters long';
        
        if (!form.category_id) errors.category_id = 'Please select a category';
        if (!form.condition) errors.condition = 'Please select a condition';
        if (!form.country_id) errors.country_id = 'Please select a country';
        break;
        
      case 2:
        if (!form.currency) errors.currency = 'Please select a currency';
        if (!form.price_per_day) errors.price_per_day = 'Price per day is required';
        else if (parseFloat(form.price_per_day) <= 0) errors.price_per_day = 'Price per day must be greater than 0';
        if (!form.pickup_methods || form.pickup_methods.length === 0) errors.pickup_methods = 'Please select at least one pickup method';
        break;
        
      case 3:
        // Step 3 has no required fields, so always valid
        break;
        
      case 4:
        if (!form.images || form.images.length === 0) errors.images = 'At least one product image is required';
        break;
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return false;
    }
    
    return true;
  };

  // Handle next step with validation
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(Math.min(steps.length, currentStep + 1));
      setValidationErrors({}); // Clear errors when moving to next step
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
    setValidationErrors({}); // Clear errors when moving to previous step
  };

  // Helper function to render error message
  const renderErrorMessage = (fieldName: keyof ValidationErrors) => {
    const error = validationErrors[fieldName];
    if (!error) return null;
    
    return (
      <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
        <AlertCircle size={14} />
        <span>{error}</span>
      </div>
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setForm((prev: FormState) => {
        const existingNames = prev.images.map((f: File) => f.name);
        const filteredNew = newFiles.filter(f => !existingNames.includes(f.name));
        return { ...prev, images: [...prev.images, ...filteredNew] };
      });
      
      // Clear images validation error when files are added
      if (validationErrors.images) {
        setValidationErrors(prev => ({ ...prev, images: undefined }));
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Product Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleInputChangeWithValidation}
                required
                placeholder="Enter a descriptive title for your product"
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 ${
                  validationErrors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700'
                }`}
              />
              {renderErrorMessage('title')}
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChangeWithValidation}
                required
                placeholder="Describe your product in detail. Include key features, condition, and any important information."
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 resize-none ${
                  validationErrors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700'
                }`}
              />
              {renderErrorMessage('description')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleInputChangeWithValidation}
                  required
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.category_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {renderErrorMessage('category_id')}
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleInputChangeWithValidation}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.condition ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700'
                  }`}
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
                {renderErrorMessage('condition')}
              </div>
            </div>

            {/* New fields: brand, model, year manufactured */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Brand</label>
                <input
                  name="brand"
                  value={form.brand || ''}
                  onChange={handleInputChange}
                  placeholder="Canon"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Model</label>
                <input
                  name="model"
                  value={form.model || ''}
                  onChange={handleInputChange}
                  placeholder="EOS R6"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Year Manufactured</label>
                <input
                  name="year_manufactured"
                  value={form.year_manufactured || ''}
                  onChange={handleInputChange}
                  placeholder="2022"
                  type="number"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Country *
              </label>
              <select
                name="country_id"
                value={form.country_id}
                onChange={handleInputChangeWithValidation}
                required
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 ${
                  validationErrors.country_id ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700'
                }`}
              >
                <option value="">Select country</option>
                {countries.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {renderErrorMessage('country_id')}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pricing Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Currency *
                  </label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleInputChangeWithValidation}
                    required
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.currency ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700'
                    }`}
                  >
                    <option value="">Select currency</option>
                    <option value="USD">USD ($)</option>
                    <option value="RWF">RWF (FRW)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                  {renderErrorMessage('currency')}
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Price per Day *
                  </label>
                  <input
                    name="price_per_day"
                    value={form.price_per_day}
                    onChange={handleInputChangeWithValidation}
                    required
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.price_per_day ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-slate-700'
                    }`}
                  />
                  {renderErrorMessage('price_per_day')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Price per Hour
                  </label>
                  <input
                    name="price_per_hour"
                    value={form.price_per_hour}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Price per Week
                  </label>
                  <input
                    name="price_per_week"
                    value={form.price_per_week}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Pickup Methods *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {['pickup', 'delivery'].map((method) => (
                  <label key={method} className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={form.pickup_methods.includes(method)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm(prev => ({
                            ...prev,
                            pickup_methods: [...prev.pickup_methods, method]
                          }));
                        } else {
                          setForm(prev => ({
                            ...prev,
                            pickup_methods: prev.pickup_methods.filter(m => m !== method)
                          }));
                        }
                        
                        // Clear pickup methods validation error when user makes selection
                        if (validationErrors.pickup_methods) {
                          setValidationErrors(prev => ({ ...prev, pickup_methods: undefined }));
                        }
                      }}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">{method}</span>
                  </label>
                ))}
              </div>
              {renderErrorMessage('pickup_methods')}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Product Features</h3>
              
              <div className="space-y-4">
                {(Array.isArray(form.features) ? form.features : []).map((feature: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      value={feature}
                      onChange={e => {
                        const features = Array.isArray(form.features) ? [...form.features] : [];
                        features[idx] = e.target.value;
                        setForm((f: FormState) => ({ ...f, features }));
                      }}
                      placeholder="Enter a feature (e.g., Waterproof, Bluetooth)"
                      className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f: FormState) => ({ 
                          ...f, 
                          features: (Array.isArray(f.features) ? f.features : []).filter((_: any, i: number) => i !== idx) 
                        }));
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => setForm((f: FormState) => ({ 
                    ...f, 
                    features: [...(Array.isArray(f.features) ? f.features : []), ''] 
                  }))}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                >
                  <Plus size={18} />
                  Add Feature
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Specifications</h3>
              
              <div className="space-y-4">
                {Object.entries(form.specifications).map(([key, value], idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <input
                      value={key}
                      onChange={e => {
                        const newKey = e.target.value;
                        setForm((f: FormState) => {
                          const entries = Object.entries(f.specifications);
                          const newEntries = entries.map(([k, v], i) =>
                            i === idx ? [newKey, v] : [k, v]
                          );
                          const newSpecs = Object.fromEntries(newEntries);
                          return { ...f, specifications: newSpecs };
                        });
                      }}
                      placeholder="Specification name (e.g., Color, Size)"
                      className="px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="flex gap-3">
                      <input
                        value={value}
                        onChange={e => {
                          setForm((f: FormState) => {
                            const entries = Object.entries(f.specifications);
                            const newEntries = entries.map(([k, v], i) =>
                              i === idx ? [k, e.target.value] : [k, v]
                            );
                            return { ...f, specifications: Object.fromEntries(newEntries) };
                          });
                        }}
                        placeholder="Value (e.g., Red, Large)"
                        className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                        disabled={!key}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f: FormState) => {
                            const entries = Object.entries(f.specifications);
                            const newEntries = entries.filter((_, i) => i !== idx);
                            return { ...f, specifications: Object.fromEntries(newEntries) };
                          });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => setForm((f: FormState) => ({
                    ...f,
                    specifications: { ...f.specifications, [`spec${Object.keys(f.specifications).length + 1}`]: '' }
                  }))}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                >
                  <Plus size={18} />
                  Add Specification
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Included Accessories</h3>

              <div className="space-y-4">
                {(Array.isArray(form.included_accessories) ? form.included_accessories : []).map((acc: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      value={acc}
                      onChange={e => {
                        const accessories = Array.isArray(form.included_accessories) ? [...form.included_accessories] : [];
                        accessories[idx] = e.target.value;
                        setForm((f: FormState) => ({ ...f, included_accessories: accessories }));
                      }}
                      placeholder="e.g., 2x batteries"
                      className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f: FormState) => ({ 
                          ...f, 
                          included_accessories: (Array.isArray(f.included_accessories) ? f.included_accessories : []).filter((_: any, i: number) => i !== idx) 
                        }));
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setForm((f: FormState) => ({ 
                    ...f, 
                    included_accessories: [...(Array.isArray(f.included_accessories) ? f.included_accessories : []), ''] 
                  }))}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                >
                  <Plus size={18} />
                  Add Accessory
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Product Images
              </h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-slate-500 bg-slate-50 dark:bg-slate-800' 
                    : validationErrors.images
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-slate-300 mb-2">
                  Drag and drop images here, or{' '}
                  <label className="text-slate-900 dark:text-white underline cursor-pointer font-medium">
                    browse
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => {
                        const input = e.target as HTMLInputElement;
                        const newFiles = input.files ? Array.from(input.files) : [];
                        setForm((prev: FormState) => {
                          const existingNames = prev.images.map((f: File) => f.name);
                          const filteredNew = newFiles.filter(f => !existingNames.includes(f.name));
                          return { ...prev, images: [...prev.images, ...filteredNew] };
                        });
                        
                        // Clear images validation error when files are added
                        if (validationErrors.images) {
                          setValidationErrors(prev => ({ ...prev, images: undefined }));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">PNG, JPG, GIF up to 10MB each</p>
              </div>

              {renderErrorMessage('images')}

              {form.images && form.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                  {form.images.map((file: File, idx: number) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                          onClick={() => {
                            const newImages = form.images.filter((_: File, i: number) => i !== idx);
                            setForm((prev: FormState) => ({ ...prev, images: newImages }));
                            
                            if (newImages.length === 0 && validationErrors.images) {
                              setValidationErrors(prev => ({ ...prev, images: 'At least one product image is required' }));
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs text-white bg-black/70 px-2 py-1 rounded truncate">
                          {file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Alt Text for Images *
                </label>
                <input
                  name="alt_text"
                  value={form.alt_text}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the images for accessibility"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                <MapPin className="inline mr-2" size={20} />
                Location
              </h3>
              
              <div className="group mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Address Line</label>
                <input
                  name="address_line"
                  value={form.address_line || ''}
                  onChange={handleInputChange}
                  placeholder="KG 11 Ave, Kigali"
                  className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.location?.latitude || ''}
                    onChange={e => setForm((f: FormState) => ({
                      ...f,
                      location: { ...(f.location || { latitude: '', longitude: '' }), latitude: e.target.value }
                    }))}
                    placeholder="e.g., 40.7128"
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.location?.longitude || ''}
                    onChange={e => setForm((f: FormState) => ({
                      ...f,
                      location: { ...(f.location || { latitude: '', longitude: '' }), longitude: e.target.value }
                    }))}
                    placeholder="e.g., -74.0060"
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Sort Order
                  </label>
                  <input
                    name="sort_order"
                    value={form.sort_order}
                    onChange={handleInputChange}
                    placeholder="0"
                    type="number"
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Is Primary
                  </label>
                  <select
                    name="isPrimary"
                    value={form.isPrimary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl max-w-6xl w-full mx-3 sm:mx-4 h-[95vh] overflow-hidden">
        {/* Content with Sidebar */}
        <form onSubmit={handleFormSubmit} className="flex flex-1 h-full flex-col md:flex-row">
          {/* Mobile Step Header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Step {currentStep} of {steps.length}</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{steps.find(s => s.id === currentStep)?.title}</div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
              <X size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Sidebar with Steps */}
          <div className="w-full md:w-64 bg-gray-50 dark:bg-slate-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700 p-4 md:p-6 md:block">
            <div className="hidden md:flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Steps</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
              >
                <X size={20} className="text-gray-500 dark:text-slate-300" />
              </button>
            </div>
            <div className="hidden md:block space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentStep >= step.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle size={18} />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-slate-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-xs ${
                      currentStep >= step.id ? 'text-slate-600 dark:text-slate-400' : 'text-gray-400 dark:text-slate-500'
                    }`}>
                      {step.id === 1 && 'Product details & category'}
                      {step.id === 2 && 'Pricing & pickup options'}
                      {step.id === 3 && 'Features & specifications'}
                      {step.id === 4 && 'Images & location'}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ml-4 transition-all duration-200 ${
                      currentStep > step.id ? 'bg-slate-900' : 'bg-gray-200 dark:bg-slate-800'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 min-h-0">
              {renderStepContent()}
            </div>

            {/* Footer - Always Visible */}
            <div className="border-t border-gray-200 dark:border-slate-700 px-4 sm:px-8 py-3 bg-gray-50 dark:bg-slate-900 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className={`px-5 py-3 rounded-lg font-medium transition-all duration-200 ${
                    currentStep === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    Step {currentStep} of {steps.length}
                  </span>
                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all duration-200 flex items-center gap-2"
                    >
                      Continue
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewListingModal;