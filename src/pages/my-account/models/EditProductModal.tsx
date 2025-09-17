import React, { useEffect, useState } from 'react';
import { X, Upload, MapPin, Plus, Trash2, Camera, DollarSign, Package, Info } from 'lucide-react';
import { getProductById, updateProduct, createProductImage, getProductImagesByProductId, updateProductImage, fetchCategories, fetchCountries, fetchProductPricesByProductId } from '../service/api';
import { useToast } from '../../../contexts/ToastContext';

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
}

type FormState = {
  title: string;
  slug: string;
  description: string;
  category_id: string;
  condition: string;
  brand?: string;
  model?: string;
  year_manufactured?: string;
  base_price_per_day: string;
  base_currency: string;
  base_price_per_week?: string;
  base_price_per_month?: string;
  delivery_fee?: string;
  pickup_methods: string[];
  country_id: string;
  specifications: { [key: string]: string };
  features?: string[];
  included_accessories?: string[];
  images?: File[];
  alt_text?: string;
  sort_order?: string;
  isPrimary?: string;
  product_id?: string;
  location?: { latitude: string; longitude: string };
  address_line?: string;
};

const EditProductModal: React.FC<EditProductModalProps> = ({ open, onClose, productId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<Partial<FormState> | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [showEditImageModal, setShowEditImageModal] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [imageEditForm, setImageEditForm] = useState<any>({});
  const [imageEditLoading, setImageEditLoading] = useState(false);
  const [priceRowId, setPriceRowId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const cats = await fetchCategories();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch {
        setCategories([]);
      }
      try {
        const cnts = await fetchCountries().then(res => res.data);
        setCountries(Array.isArray(cnts) ? cnts : []);
      } catch {
        setCountries([]);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!open || !productId) return;
    setLoading(true);
    setError(null);
    
    // Fetch product data and pricing data in parallel
    Promise.all([
      getProductById(productId),
      fetchProductPricesByProductId(productId),
      getProductImagesByProductId(productId)
    ])
      .then(([product, pricingResponse, images]) => {
        let location = product.location || { latitude: '', longitude: '' };
        if ((!location.latitude || !location.longitude) && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setForm(f => ({
                ...f!,
                location: {
                  latitude: position.coords.latitude.toString(),
                  longitude: position.coords.longitude.toString(),
                },
              }));
            }
          );
        }

        // Extract pricing data from the response
        let pricingData = {};
        if (pricingResponse.success && pricingResponse.data && pricingResponse.data.length > 0) {
          const firstPricing = pricingResponse.data[0];
          setPriceRowId(firstPricing.id || null);
          const deliveryFeeFromProduct = product?.delivery_fee != null ? String(product.delivery_fee) : '';
          const deliveryFeeFromPricing = firstPricing?.delivery_fee != null ? String(firstPricing.delivery_fee) : '';
          pricingData = {
            base_price_per_day: firstPricing.price_per_day?.toString() || '',
            base_price_per_week: firstPricing.price_per_week?.toString() || '',
            base_price_per_month: firstPricing.price_per_month?.toString() || '',
            base_currency: firstPricing.currency || product?.base_currency || '',
            // Prefer product delivery_fee if present; else fall back to pricing
            delivery_fee: deliveryFeeFromProduct || deliveryFeeFromPricing,
          } as any;
        } else {
          // No pricing rows; still carry over delivery_fee from product if present
          if (product?.delivery_fee != null) {
            pricingData = { delivery_fee: String(product.delivery_fee) } as any;
          }
          setPriceRowId((product as any)?.pricing?.[0]?.id || null);
        }

        setForm({
          ...product,
          ...pricingData,
          features: Array.isArray(product.features) ? product.features : [],
          specifications: product.specifications || {},
          pickup_methods: Array.isArray(product.pickup_methods) ? product.pickup_methods : [],
          location,
        });
        
        setExistingImages(images || []);
      })
      .catch(() => setError('Failed to load product details.'))
      .finally(() => setLoading(false));
  }, [open, productId]);

  if (!open) return null;

  const steps = [
    { id: 1, title: 'Basic Info', icon: Info },
    { id: 2, title: 'Pricing', icon: DollarSign },
    { id: 3, title: 'Details', icon: Package },
    { id: 4, title: 'Images & Location', icon: Camera },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev!, [name]: value }));
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
      const existingNames = images.map((f: File) => f.name);
      const filteredNew = newFiles.filter(f => !existingNames.includes(f.name));
      setImages([...images, ...filteredNew]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    console.log("FORM SUBMITTED");
    if (!form) return;
    
    try {
      const productPayload: any = {
        ...form,
        features: Array.isArray(form.features) ? form.features : [],
      };
      // Normalize certain fields
      if (productPayload.year_manufactured) {
        productPayload.year_manufactured = Number(productPayload.year_manufactured);
      }
      if (Array.isArray(productPayload.included_accessories)) {
        productPayload.included_accessories = productPayload.included_accessories.filter((a: any) => typeof a === 'string' && a.trim() !== '');
      }
      // Compatibility key (camelCase)
      if (Array.isArray(productPayload.included_accessories)) {
        productPayload.includedAccessories = productPayload.included_accessories;
      }
      
      if ('base_price' in productPayload) delete (productPayload as any).base_price;
      
      try {
        // Debug: log outgoing payload
        try {
          const { logger } = await import('../../../lib/logger');
          logger.group('[DEBUG] Update Product Payload');
          logger.debug('productId:', productId);
          logger.debug('payload:', productPayload);
          logger.groupEnd();
        } catch {
          console.log('[DEBUG] Update Product Payload', { productId, productPayload });
        }

        const updateRes = await updateProduct(productId, productPayload);

        // After product core update, update pricing if we have a price row id
        try {
          const { updateProductPrice } = await import('../service/api');
          if (priceRowId) {
            const pricingUpdatePayload: any = {
              currency: form.base_currency,
              price_per_day: form.base_price_per_day ? Number(form.base_price_per_day) : 0,
              price_per_week: form.base_price_per_week ? Number(form.base_price_per_week) : 0,
              price_per_month: form.base_price_per_month ? Number(form.base_price_per_month) : 0,
              // keep other fields if needed
            };
            await updateProductPrice(priceRowId, pricingUpdatePayload);
          }
        } catch {}

        // Debug: log server response
        try {
          const { logger } = await import('../../../lib/logger');
          logger.group('[DEBUG] Response from PUT /products/{id}');
          logger.debug('response:', updateRes);
          logger.groupEnd();
        } catch {
          console.log('[DEBUG] Response from PUT /products/{id}', updateRes);
        }
      } catch (err) {
        // Also log error payload context
        try {
          const { logger } = await import('../../../lib/logger');
          logger.group('[DEBUG] Update Product Error');
          logger.error('error:', (err as any)?.response?.data || (err as any)?.message || err);
          logger.error('sent payload:', productPayload);
          logger.groupEnd();
        } catch {
          console.error('[DEBUG] Update Product Error', err);
          console.log('[DEBUG] Sent payload', productPayload);
        }
        throw err;
      }
      
      if (images && images.length > 0) {
        const imagePayload = {
          images,
          product_id: productId,
          alt_text: form.alt_text || '',
          sort_order: form.sort_order || '1',
          isPrimary: 'true',
        };
        await createProductImage(imagePayload);
      }
      
      showToast('Product updated!', 'success');
      onClose();
    } catch (err) {
      setError('Failed to update product.');
      showToast('Failed to update product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (!form) return null;

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
                value={form.title || ''}
                onChange={handleInputChange}
                required
                placeholder="Enter a descriptive title for your product"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleInputChange}
                required
                placeholder="Describe your product in detail. Include key features, condition, and any important information."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={form.category_id || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={form.condition || 'new'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Model</label>
                <input
                  name="model"
                  value={form.model || ''}
                  onChange={handleInputChange}
                  placeholder="EOS R6"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Country *
              </label>
              <select
                name="country_id"
                value={form.country_id || ''}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
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
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Pricing Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Currency *
                  </label>
                  <select
                    name="base_currency"
                    value={form.base_currency || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                  >
                    <option value="">Select currency</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Price per Day *
                  </label>
                  <input
                    name="base_price_per_day"
                    value={form.base_price_per_day || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Price per Week
                    <span className="text-gray-500 text-xs ml-1">(optional)</span>
                  </label>
                  <input
                    name="base_price_per_week"
                    value={form.base_price_per_week || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Price per Month
                    <span className="text-gray-500 text-xs ml-1">(optional)</span>
                  </label>
                  <input
                    name="base_price_per_month"
                    value={form.base_price_per_month || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Delivery Fee
                    <span className="text-gray-500 text-xs ml-1">(optional)</span>
                  </label>
                  <input
                    name="delivery_fee"
                    value={form.delivery_fee || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
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
                      checked={form.pickup_methods?.includes(method) || false}
                      onChange={(e) => {
                        const methods = form.pickup_methods || [];
                        if (e.target.checked) {
                          setForm(prev => ({
                            ...prev!,
                            pickup_methods: [...methods, method]
                          }));
                        } else {
                          setForm(prev => ({
                            ...prev!,
                            pickup_methods: methods.filter(m => m !== method)
                          }));
                        }
                      }}
                      className="w-4 h-4 text-my-primary border-gray-300 rounded focus:ring-my-primary"
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
            <div className="bg-gradient-to-r from-my-primary/10 to-cyan-50 p-6 rounded-lg border border-my-primary/20">
              <h3 className="text-lg font-semibold text-my-primary mb-4">Product Features</h3>
              
              <div className="space-y-4">
                {(Array.isArray(form.features) ? form.features : []).map((feature: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      value={feature}
                      onChange={e => {
                        const features = Array.isArray(form.features) ? [...form.features] : [];
                        features[idx] = e.target.value;
                        setForm((f) => ({ ...f!, features }));
                      }}
                      placeholder="Enter a feature (e.g., Waterproof, Bluetooth)"
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ 
                          ...f!, 
                          features: (Array.isArray(f!.features) ? f!.features : []).filter((_: any, i: number) => i !== idx) 
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
                  onClick={() => setForm((f) => ({ 
                    ...f!, 
                    features: [...(Array.isArray(f!.features) ? f!.features : []), ''] 
                  }))}
                  className="flex items-center gap-2 text-my-primary hover:text-my-primary/90 font-medium transition-colors"
                >
                  <Plus size={18} />
                  Add Feature
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-my-primary/10 to-cyan-50 p-6 rounded-lg border border-my-primary/20">
              <h3 className="text-lg font-semibold text-my-primary mb-4">Included Accessories</h3>

              <div className="space-y-4">
                {(Array.isArray(form.included_accessories) ? form.included_accessories : []).map((acc: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      value={acc}
                      onChange={e => {
                        const accessories = Array.isArray(form.included_accessories) ? [...form.included_accessories] : [];
                        accessories[idx] = e.target.value;
                        setForm((f) => ({ ...f!, included_accessories: accessories }));
                      }}
                      placeholder="e.g., 2x batteries"
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ 
                          ...f!, 
                          included_accessories: (Array.isArray(f!.included_accessories) ? f!.included_accessories : []).filter((_: any, i: number) => i !== idx) 
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
                  onClick={() => setForm((f) => ({ 
                    ...f!, 
                    included_accessories: [...(Array.isArray(f!.included_accessories) ? f!.included_accessories : []), ''] 
                  }))}
                  className="flex items-center gap-2 text-my-primary hover:text-my-primary/90 font-medium transition-colors"
                >
                  <Plus size={18} />
                  Add Accessory
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-my-primary/10 to-cyan-50 p-6 rounded-lg border border-my-primary/20">
              <h3 className="text-lg font-semibold text-my-primary mb-4">Specifications</h3>
              
              <div className="space-y-4">
                {Object.entries(form.specifications || {}).map(([key, value], idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <input
                      value={key}
                      onChange={e => {
                        const newKey = e.target.value;
                        setForm((f) => {
                          const entries = Object.entries(f!.specifications || {});
                          const newEntries = entries.map(([k, v], i) =>
                            i === idx ? [newKey, v] : [k, v]
                          );
                          const newSpecs = Object.fromEntries(newEntries);
                          return { ...f!, specifications: newSpecs };
                        });
                      }}
                      placeholder="Specification name (e.g., Color, Size)"
                      className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                    />
                    <div className="flex gap-3">
                      <input
                        value={value}
                        onChange={e => {
                          setForm((f) => {
                            const entries = Object.entries(f!.specifications || {});
                            const newEntries = entries.map(([k, v], i) =>
                              i === idx ? [k, e.target.value] : [k, v]
                            );
                            return { ...f!, specifications: Object.fromEntries(newEntries) };
                          });
                        }}
                        placeholder="Value (e.g., Red, Large)"
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                        disabled={!key}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForm((f) => {
                            const entries = Object.entries(f!.specifications || {});
                            const newEntries = entries.filter((_, i) => i !== idx);
                            return { ...f!, specifications: Object.fromEntries(newEntries) };
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
                  onClick={() => setForm((f) => ({
                    ...f!,
                    specifications: { ...f!.specifications, [`spec${Object.keys(f!.specifications || {}).length + 1}`]: '' }
                  }))}
                  className="flex items-center gap-2 text-my-primary hover:text-my-primary/90 font-medium transition-colors"
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
            <div className="bg-gradient-to-r from-my-primary/10 to-cyan-50 p-6 rounded-lg border border-my-primary/20">
              <h3 className="text-lg font-semibold text-my-primary mb-4">Product Images</h3>
              
              {/* Existing Images */}
              {existingImages && existingImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Current Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {existingImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={img.url || img.image_url || img.path}
                          alt={img.alt_text || `Product image ${idx + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 bg-my-primary text-white p-2 rounded-full hover:bg-my-primary/90 transition-all duration-200 mr-2"
                            onClick={() => {
                              setEditingImage(img);
                              setImageEditForm({ alt_text: img.alt_text || '', image: null });
                              setShowEditImageModal(true);
                            }}
                          >
                            <Camera size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-xs text-white bg-black bg-opacity-75 px-2 py-1 rounded truncate">
                            {img.alt_text || `Image ${idx + 1}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Upload */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Add New Images</h4>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    dragActive 
                      ? 'border-my-primary bg-my-primary/10' 
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
                    <label className="text-my-primary hover:text-my-primary/90 cursor-pointer font-medium">
                      browse
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => {
                          const input = e.target as HTMLInputElement;
                          const newFiles = input.files ? Array.from(input.files) : [];
                          const existingNames = images.map((f: File) => f.name);
                          const filteredNew = newFiles.filter(f => !existingNames.includes(f.name));
                          setImages([...images, ...filteredNew]);
                        }}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>

                {images && images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                    {images.map((file: File, idx: number) => (
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
                              setImages(images.filter((_, i) => i !== idx));
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
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Alt Text for New Images
                </label>
                <input
                  name="alt_text"
                  value={form.alt_text || ''}
                  onChange={handleInputChange}
                  placeholder="Describe the new images for accessibility"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                <MapPin className="inline mr-2 text-my-primary" size={20} />
                Location
              </h3>
              <div className="group mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Address Line</label>
                <input
                  name="address_line"
                  value={form.address_line || ''}
                  onChange={handleInputChange}
                  placeholder="KG 11 Ave, Kigali"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
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
                    onChange={e => setForm((f) => ({
                      ...f!,
                      location: { ...(f!.location || { latitude: '', longitude: '' }), latitude: e.target.value }
                    }))}
                    placeholder="e.g., 40.7128"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
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
                    onChange={e => setForm((f) => ({
                      ...f!,
                      location: { ...(f!.location || { latitude: '', longitude: '' }), longitude: e.target.value }
                    }))}
                    placeholder="e.g., -74.0060"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Sort Order
                </label>
                <input
                  name="sort_order"
                  value={form.sort_order || ''}
                  onChange={handleInputChange}
                  placeholder="0"
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                />
              </div>
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Is Primary
                </label>
                <select
                  name="isPrimary"
                  value={form.isPrimary || 'true'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-my-primary focus:border-my-primary transition-all duration-200"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-md shadow-2xl max-w-5xl w-full mx-4 h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Edit Product</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-slate-300 dark:hover:text-slate-100 text-2xl font-bold">&times;</button>
        </div>
        {/* Step indicator */}
        <div className="flex items-center justify-between mt-2 px-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${currentStep === step.id ? 'bg-my-primary' : 'bg-gray-300 dark:bg-slate-600'}`}>{index + 1}</div>
              {index < steps.length - 1 && <div className="w-8 h-1 bg-gray-300 mx-2 rounded" />}
            </div>
          ))}
        </div>
        {/* Scrollable form body and sticky footer now inside the form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 flex flex-col">
          {renderStepContent()}
          {/* Sticky footer */}
          <div className="border-t border-gray-200 dark:border-slate-700 px-4 sm:px-8 py-4 bg-white dark:bg-slate-900 flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 ${currentStep === 1 ? 'bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-100 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              ← Previous
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
              Step {currentStep} of {steps.length}
            </div>
            <div className="w-full sm:w-auto">
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  className="w-full sm:w-auto px-6 py-3 bg-my-primary text-white rounded-lg font-medium hover:bg-my-primary/90 transition-all duration-200"
                >
                  Next →
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="w-full bg-my-primary text-white py-3 rounded-lg font-semibold hover:bg-my-primary/90 transition-colors flex items-center justify-center gap-2">
                {isSubmitting && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              )}
            </div>
          </div>
        </form>
        {error && <div className="text-red-500 text-sm mt-2 px-8">{error}</div>}
      </div>

      
      {showEditImageModal && editingImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 dark:bg-black/60">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200" onClick={() => setShowEditImageModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-my-primary">Edit Image</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setImageEditLoading(true);
                showToast('Updating image...');
                try {
                  await updateProductImage(editingImage.id, imageEditForm);
                  showToast('Image updated!', 'success');
                  setShowEditImageModal(false);
                  setEditingImage(null);
                  // Refresh images
                  const imgs = await getProductImagesByProductId(productId);
                  setExistingImages(imgs || []);
                } catch {
                  showToast('Failed to update image.', 'error');
                } finally {
                  setImageEditLoading(false);
                }
              }}
            >
              <img src={editingImage.url || editingImage.image_url || editingImage.path} alt="Current" className="w-32 h-32 object-cover rounded mb-4 mx-auto" />
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageEditForm((f: any) => ({ ...f, image: e.target.files?.[0] || null }))}
                className="mb-2 w-full"
              />
              <input
                type="text"
                value={imageEditForm.alt_text}
                onChange={e => setImageEditForm((f: any) => ({ ...f, alt_text: e.target.value }))}
                placeholder="Alt text"
                className="mb-2 px-2 py-1 border rounded w-full"
              />
              <button type="submit" className="bg-my-primary text-white px-4 py-2 rounded text-sm font-semibold mt-2 w-full" disabled={imageEditLoading}>
                {imageEditLoading ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
  
    </div>
    
  );
};

export default EditProductModal;