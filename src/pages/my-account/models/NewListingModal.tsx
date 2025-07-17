import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, Plus, Trash2, Camera, DollarSign, Package, Info } from 'lucide-react';
import { fetchCategories, fetchCountries } from '../service/api';

type FormState = {
  title: string;
  slug: string;
  description: string;
  category_id: string;
  condition: string;
  base_price_per_day: string;
  base_currency: string;
  base_price_per_week?: string;
  base_price_per_month?: string;
  pickup_methods: string[];
  country_id: string;
  specifications: { [key: string]: string };
  features?: string[];
  images: File[];
  alt_text: string;
  sort_order: string;
  isPrimary: string;
  product_id: string;
  location: { latitude: string; longitude: string };
};

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

  if (!open) return null;

  const steps = [
    { id: 1, title: 'Basic Info', icon: Info },
    { id: 2, title: 'Pricing', icon: DollarSign },
    { id: 3, title: 'Details', icon: Package },
    { id: 4, title: 'Images & Location', icon: Camera },
  ];

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
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleInputChange}
                required
                placeholder="Enter a descriptive title for your product"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                required
                placeholder="Describe your product in detail. Include key features, condition, and any important information."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                name="country_id"
                value={form.country_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select country</option>
                {countries.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg border border-teal-200">
              <h3 className="text-lg font-semibold text-teal-800 mb-4">Pricing Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <select
                    name="base_currency"
                    value={form.base_currency}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select currency</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Day *
                  </label>
                  <input
                    name="base_price_per_day"
                    value={form.base_price_per_day}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Week
                    <span className="text-gray-500 text-xs ml-1">(optional)</span>
                  </label>
                  <input
                    name="base_price_per_week"
                    value={form.base_price_per_week}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Month
                    <span className="text-gray-500 text-xs ml-1">(optional)</span>
                  </label>
                  <input
                    name="base_price_per_month"
                    value={form.base_price_per_month}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      }}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg border border-teal-200">
              <h3 className="text-lg font-semibold text-teal-800 mb-4">Product Features</h3>
              
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
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f: FormState) => ({ 
                          ...f, 
                          features: (Array.isArray(f.features) ? f.features : []).filter((_: any, i: number) => i !== idx) 
                        }));
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  <Plus size={18} />
                  Add Feature
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg border border-teal-200">
              <h3 className="text-lg font-semibold text-teal-800 mb-4">Specifications</h3>
              
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
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
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
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
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
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  <Plus size={18} />
                  Add Specification
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg border border-teal-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Product Images</h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop images here, or{' '}
                  <label className="text-teal-600 hover:text-teal-700 cursor-pointer font-medium">
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
                      }}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB each</p>
              </div>

              {form.images && form.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                  {form.images.map((file: File, idx: number) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                          onClick={() => {
                            const newImages = form.images.filter((_: File, i: number) => i !== idx);
                            setForm((prev: FormState) => ({ ...prev, images: newImages }));
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs text-white bg-black bg-opacity-75 px-2 py-1 rounded truncate">
                          {file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text for Images *
                </label>
                <input
                  name="alt_text"
                  value={form.alt_text}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the images for accessibility"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                <MapPin className="inline mr-2" size={20} />
                Location
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  name="sort_order"
                  value={form.sort_order}
                  onChange={handleInputChange}
                  placeholder="0"
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Is Primary
                </label>
                <select
                  name="isPrimary"
                  value={form.isPrimary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-2xl max-w-5xl w-full mx-4 h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-cyan-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold ">Create New Listing</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center justify-between mt-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    step.id === currentStep
                      ? 'bg-white text-teal-600 border-white'
                      : step.id < currentStep
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-transparent text-white border-white border-opacity-50'
                  }`}
                >
                  <step.icon size={18} />
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  step.id <= currentStep ? 'text-white' : 'text-white text-opacity-70'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-white' : 'bg-white bg-opacity-30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-8 py-6 max-h-[60vh]">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 sm:px-8 py-4 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </div>

              <div className="w-full sm:w-auto">
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                    className="w-full sm:w-auto px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-all duration-200"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    )}
                    {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewListingModal;