import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Edit3, MapPin, Package, DollarSign, Tag, Calendar, Star, ChevronLeft, ChevronRight, ZoomIn, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { getProductById, getProductImagesByProductId } from '../service/api';

interface ProductDetailModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  onEdit?: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ open, onClose, productId, onEdit }) => {
  const [images, setImages] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-7xl w-full mx-4 h-[95vh] overflow-hidden flex flex-col">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl text-my-primary font-bold">Product Details</h2>
                <p className="text-my-primary text-sm mt-1">View complete product information</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
              >
                <X size={24}  className='text-my-primary'/>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="text-gray-600 font-medium">Loading product details...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Enhanced Images Section */}
                <div className="space-y-6">
                  {images.length > 0 ? (
                    <>
                      {/* Main Image */}
                      <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square shadow-lg">
                        <img
                          src={images[currentImageIndex]?.url || images[currentImageIndex]?.image_url || images[currentImageIndex]?.path}
                          alt={images[currentImageIndex]?.alt_text || `Product image ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Enhanced Controls */}
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

                      {/* Enhanced Thumbnail Grid */}
                      {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-3">
                          {images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                                idx === currentImageIndex 
                                  ? 'border-primary-500 ring-2 ring-primary-200 shadow-lg' 
                                  : 'border-gray-200 hover:border-gray-300'
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
                    <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Package size={48} className="mx-auto mb-4" />
                        <p className="font-medium">No images available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Product Information */}
                <div className="space-y-8">
                  {product && (
                    <>
                      {/* Title and Basic Info */}
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConditionBadgeColor(product.condition)}`}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {product.condition || 'Used'}
                          </span>
                          {product.country_id && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              <MapPin className="w-4 h-4 mr-1" />
                              {product.country_id}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                      </div>

                      {/* Enhanced Pricing */}
                      <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-2xl border border-primary-200">
                        <div className="flex items-center mb-4">
                          <DollarSign className="text-primary-600 mr-2" size={24} />
                          <h3 className="text-xl font-bold text-primary-800">Pricing</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Daily Rate:</span>
                            <span className="text-2xl font-bold text-primary-600">
                              {product.base_price_per_day != null && product.base_currency
                                ? `${product.base_price_per_day} ${product.base_currency}`
                                : 'No price'}
                            </span>
                          </div>
                          {product.base_price_per_week && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Weekly Rate:</span>
                              <span className="font-semibold text-primary-600">
                                {product.base_price_per_week} {product.base_currency}
                              </span>
                            </div>
                          )}
                          {product.base_price_per_month && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Monthly Rate:</span>
                              <span className="font-semibold text-primary-600">
                                {product.base_price_per_month} {product.base_currency}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Product Details Grid */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center mb-3">
                            <Tag className="text-gray-500 mr-2" size={20} />
                            <span className="font-semibold text-gray-700">Category</span>
                          </div>
                          <p className="text-gray-900 font-medium">{product.category_id}</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center mb-3">
                            <Package className="text-gray-500 mr-2" size={20} />
                            <span className="font-semibold text-gray-700">Pickup Methods</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(product.pickup_methods) 
                              ? product.pickup_methods.map((method: string, idx: number) => (
                                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-my-primary/10 text-my-primary border border-my-primary/30">
                                    {method.charAt(0).toUpperCase() + method.slice(1)}
                                  </span>
                                ))
                              : <span className="text-gray-500">Not specified</span>
                            }
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Features */}
                      {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                        <div className="bg-gradient-to-r from-success-50 to-success-100 p-6 rounded-2xl border border-success-200">
                          <h3 className="text-lg font-bold text-success-800 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2" />
                            Features
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {product.features.map((feature: string, idx: number) => (
                              <div key={idx} className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-success-500 rounded-full flex-shrink-0"></div>
                                <span className="text-success-700 font-medium">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Specifications */}
                      {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Specifications</h3>
                          <div className="space-y-4">
                            {Object.entries(product.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                                <span className="text-gray-600 font-medium">{key}:</span>
                                <span className="text-gray-900 font-semibold">
                                  {typeof value === 'string' || typeof value === 'number'
                                    ? value
                                    : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Location */}
                      {product.location && (product.location.latitude || product.location.longitude) && (
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200">
                          <div className="flex items-center mb-4">
                            <MapPin className="text-yellow-600 mr-2" size={20} />
                            <h3 className="text-lg font-bold text-yellow-800">Location</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <span className="text-yellow-700 font-medium">Latitude:</span>
                              <p className="text-yellow-900 font-mono text-sm">{product.location.latitude}</p>
                            </div>
                            <div>
                              <span className="text-yellow-700 font-medium">Longitude:</span>
                              <p className="text-yellow-900 font-mono text-sm">{product.location.longitude}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Footer */}
          {!loading && !error && onEdit && (
            <div className="border-t border-gray-200 px-8 py-6 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 bg-my-primary hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Edit3 size={18} />
                  Edit Product
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Lightbox */}
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