import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Edit3, MapPin, Package, DollarSign, Tag, ChevronLeft, ChevronRight, ZoomIn, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { getProductById, getProductImagesByProductId, fetchProductPricesByProductId } from '../service/api';
import { getProductInteractions } from '../../admin/service';

interface ProductDetailModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  onEdit?: () => void;
}

type PriceInfo = {
  price_per_hour?: number | string | null;
  price_per_day?: number | string | null;
  price_per_week?: number | string | null;
  price_per_month?: number | string | null;
  security_deposit?: number | string | null;
  currency?: string | null;
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ open, onClose, productId, onEdit }) => {
  const [images, setImages] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [categoryName, setCategoryName] = useState<string>('');
  const [interactions, setInteractions] = useState<any[]>([]);
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null);

  useEffect(() => {
    if (!open || !productId) return;
    setLoading(true);
    setError(null);
    let productDone = false;
    let imagesDone = false;

    getProductById(productId)
      .then(product => setProduct(product))
      .catch(() => setError('Failed to load product details.'))
      .finally(() => {
        productDone = true;
        if (imagesDone) setLoading(false);
      });
    getProductImagesByProductId(productId)
      .then(images => {
        setImages(images || []);
        setCurrentImageIndex(0);
      })
      .catch(() => setError('Failed to load product images.'))
      .finally(() => {
        imagesDone = true;
        if (productDone) setLoading(false);
      });
  }, [open, productId]);

  // Fetch category name when product loads
  useEffect(() => {
    const fetchCategoryName = async (id: string) => {
      try {
        const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${API_BASE_URL}/categories/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        const name = data?.data?.name || data?.data?.title || data?.name || '';
        setCategoryName(name || 'Unknown');
      } catch {
        setCategoryName('Unknown');
      }
    };
    if (product?.category_id) fetchCategoryName(product.category_id);
  }, [product?.category_id]);

  // Fetch recent interactions and metrics
  useEffect(() => {
    const loadInteractions = async (id: string) => {
      try {
        const token = (localStorage.getItem('token') as string) || undefined as any;
        const result = await getProductInteractions(id, 'click', 10, token);
        if (result?.success && Array.isArray(result.data)) {
          setInteractions(result.data);
        } else if (Array.isArray(result?.data)) {
          setInteractions(result.data);
        } else {
          setInteractions([]);
        }
      } catch {
        setInteractions([]);
      }
    };
    if (product?.id) loadInteractions(product.id);
  }, [product?.id]);

  // Fetch full pricing (hour/day/week/month)
  useEffect(() => {
    const loadPricing = async (id: string) => {
      try {
        const res = await fetchProductPricesByProductId(id, { page: 1, limit: 1 });
        const first = Array.isArray(res?.data) && res.data.length > 0 ? res.data[0] : null;
        if (first) {
          setPriceInfo({
            price_per_hour: first.price_per_hour ?? null,
            price_per_day: first.price_per_day ?? null,
            price_per_week: first.price_per_week ?? null,
            price_per_month: first.price_per_month ?? null,
            security_deposit: first.security_deposit ?? null,
            currency: first.currency ?? product?.base_currency ?? null,
          });
        } else {
          setPriceInfo(null);
        }
      } catch {
        setPriceInfo(null);
      }
    };
    if (product?.id) loadPricing(product.id);
  }, [product?.id, product?.base_currency]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getConditionBadgeColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'new':
        return 'bg-success-100 text-success-700 border-success-200';
      case 'excellent':
        return 'bg-my-primary/10 text-my-primary border-my-primary/30';
      case 'good':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'used':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 max-w-7xl w-full mx-4 h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Product Details</h2>
                <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">View complete product information</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200"
              >
                <X size={24} className="text-slate-700 dark:text-slate-200" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                  <span className="text-gray-600 dark:text-slate-300 font-medium">Loading product details...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8">
                {/* Images Section */}
                <div className="space-y-6">
                  {images.length > 0 ? (
                    <>
                      {/* Main Image */}
                      <div className="relative bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden aspect-square shadow-lg">
                        <img
                          src={images[currentImageIndex]?.url || images[currentImageIndex]?.image_url || images[currentImageIndex]?.path}
                          alt={images[currentImageIndex]?.alt_text || `Product image ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Controls */}
                        <button
                          onClick={() => setSelectedImage(images[currentImageIndex]?.url || images[currentImageIndex]?.image_url || images[currentImageIndex]?.path)}
                          className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-xl backdrop-blur-sm transition-all duration-200"
                        >
                          <ZoomIn size={20} />
                        </button>

                        {images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-xl backdrop-blur-sm transition-all duration-200"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-xl backdrop-blur-sm transition-all duration-200"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}

                        {images.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Grid */}
                      {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-3">
                          {images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                                idx === currentImageIndex 
                                  ? 'border-primary-500 ring-2 ring-primary-200 shadow-lg' 
                                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={img.url || img.image_url || img.path}
                                alt={img.alt_text || `Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="aspect-square bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                      <div className="text-center text-gray-500 dark:text-slate-400">
                        <Package size={48} className="mx-auto mb-4" />
                        <p className="font-medium">No images available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="space-y-6 sm:space-y-8">
                  {product && (
                    <>
                      {/* Title and Basic Info */}
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 break-words">{product.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConditionBadgeColor(product.condition)}`}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {product.condition || 'Used'}
                          </span>
                          {product.country_id && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                              <MapPin className="w-4 h-4 mr-1" />
                              {product.country_id}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-slate-300 leading-relaxed break-words">{product.description}</p>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Views</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">{product.view_count ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Reviews</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">{product.review_count ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Rating</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">{product.average_rating ?? '0.00'}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">{product.status || 'draft'}</p>
                        </div>
                      </div>

                      {/* Pricing (responsive, full) */}
                      <div className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <div className="flex items-center mb-4">
                          <DollarSign className="text-slate-700 dark:text-slate-200 mr-2" size={24} />
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Pricing</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-3 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Hourly</p>
                            <p className="font-semibold text-slate-900 dark:text-white break-words">{priceInfo?.price_per_hour ?? '-'}</p>
                          </div>
                          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-3 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Daily</p>
                            <p className="font-semibold text-slate-900 dark:text-white break-words">{priceInfo?.price_per_day ?? product.base_price_per_day ?? '-'}</p>
                          </div>
                          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-3 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Weekly</p>
                            <p className="font-semibold text-slate-900 dark:text-white break-words">{priceInfo?.price_per_week ?? product.base_price_per_week ?? '-'}</p>
                          </div>
                          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-3 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Monthly</p>
                            <p className="font-semibold text-slate-900 dark:text-white break-words">{priceInfo?.price_per_month ?? product.base_price_per_month ?? '-'}</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-3 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Security Deposit</p>
                            <p className="font-semibold text-slate-900 dark:text-white break-words">{priceInfo?.security_deposit ?? '-'}</p>
                          </div>
                          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-3 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Currency</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{priceInfo?.currency ?? product.base_currency ?? '-'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Product Details Grid */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center mb-3">
                            <Tag className="text-gray-500 mr-2" size={20} />
                            <span className="font-semibold text-gray-700 dark:text-slate-200">Category</span>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium break-words">{categoryName || product.category_id}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center mb-3">
                            <Package className="text-gray-500 mr-2" size={20} />
                            <span className="font-semibold text-gray-700 dark:text-slate-200">Pickup Methods</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(product.pickup_methods) 
                              ? product.pickup_methods.map((method: string, idx: number) => (
                                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                                    {method.charAt(0).toUpperCase() + method.slice(1)}
                                  </span>
                                ))
                              : <span className="text-gray-500 dark:text-slate-400">Not specified</span>
                            }
                          </div>
                        </div>

                        {(product.brand || product.model || product.year_manufactured != null || product.address_line || product.delivery_fee) && (
                          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center mb-3">
                              <Package className="text-gray-500 mr-2" size={20} />
                              <span className="font-semibold text-gray-700 dark:text-slate-200">Product Details</span>
                            </div>
                            <div className="space-y-2">
                              {product.brand && (
                                <div className="grid grid-cols-[auto,1fr] gap-3 items-start py-1">
                                  <span className="text-gray-600 dark:text-slate-300">Brand</span>
                                  <span className="font-medium text-gray-900 dark:text-white break-words">{product.brand}</span>
                                </div>
                              )}
                              {product.model && (
                                <div className="grid grid-cols-[auto,1fr] gap-3 items-start py-1">
                                  <span className="text-gray-600 dark:text-slate-300">Model</span>
                                  <span className="font-medium text-gray-900 dark:text-white break-words">{product.model}</span>
                                </div>
                              )}
                              {product.year_manufactured != null && (
                                <div className="grid grid-cols-[auto,1fr] gap-3 items-start py-1">
                                  <span className="text-gray-600 dark:text-slate-300">Year</span>
                                  <span className="font-medium text-gray-900 dark:text-white break-words">{product.year_manufactured}</span>
                                </div>
                              )}
                              {product.address_line && (
                                <div className="grid grid-cols-[auto,1fr] gap-3 items-start py-1">
                                  <span className="text-gray-600 dark:text-slate-300">Address</span>
                                  <span className="font-medium text-gray-900 dark:text-white break-words">{product.address_line}</span>
                                </div>
                              )}
                              {product.delivery_fee && (
                                <div className="grid grid-cols-[auto,1fr] gap-3 items-start py-1">
                                  <span className="text-gray-600 dark:text-slate-300">Delivery Fee</span>
                                  <span className="font-medium text-gray-900 dark:text-white break-words">{product.delivery_fee}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2" />
                            Features
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {product.features.map((feature: string, idx: number) => (
                              <div key={idx} className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                <span className="text-slate-700 dark:text-slate-300 font-medium break-words">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specifications */}
                      {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Specifications</h3>
                          <div className="space-y-4">
                            {Object.entries(product.specifications).map(([key, value]) => (
                              <div key={key} className="py-3 border-b border-gray-100 last:border-b-0 dark:border-slate-700">
                                <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-2">
                                  <span className="text-gray-600 dark:text-slate-300 font-medium capitalize break-words">{key.replace(/_/g, ' ')}</span>
                                  <span className="text-gray-900 dark:text-white font-semibold whitespace-pre-wrap break-words">
                                    {typeof value === 'string' || typeof value === 'number'
                                      ? String(value)
                                      : JSON.stringify(value, null, 2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Included Accessories */}
                      {Array.isArray(product.included_accessories) && product.included_accessories.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What's Included</h3>
                          <div className="space-y-2">
                            {product.included_accessories.map((acc: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-700 dark:text-slate-300 break-words">{acc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent Activity */}
                      {interactions.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                          <div className="space-y-2 overflow-x-auto">
                            {interactions.slice(0, 10).map((interaction: any, index: number) => (
                              <div key={interaction.id || index} className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span className="capitalize">{interaction.actionType || interaction.type || 'view'}</span>
                                <span>•</span>
                                <span>{interaction.deviceType || interaction.client || 'unknown'}</span>
                                <span>•</span>
                                <span>{interaction.createdAt ? new Date(interaction.createdAt).toLocaleDateString() : ''}</span>
                                {interaction.metadata?.source && (
                                  <>
                                    <span>•</span>
                                    <span className="text-gray-500 dark:text-slate-400 break-words">from {interaction.metadata.source}</span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && !error && onEdit && (
            <div className="border-t border-gray-200 dark:border-slate-700 px-6 sm:px-8 py-5 sm:py-6 bg-gray-50 dark:bg-slate-900">
              <div className="flex justify-end">
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 bg-my-primary hover:bg-primary-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Edit3 size={18} />
                  Edit Product
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && ReactDOM.createPortal(
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh] p-4">
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl" 
            />
            <button
              className="absolute top-6 right-6 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-3 text-gray-700 hover:text-red-500 transition-all duration-200 shadow-lg"
              onClick={e => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X size={24} />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProductDetailModal;