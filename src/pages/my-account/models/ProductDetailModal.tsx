import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Edit3, MapPin, Package, DollarSign, Tag, Calendar, Star, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
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

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-cyan-600 px-6 py-4 text-white flex items-center justify-between">
            <h2 className="text-2xl font-bold">Product Details</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  <span className="text-gray-600 font-medium">Loading product details...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                {/* Images Section */}
                <div className="space-y-4">
                  {images.length > 0 ? (
                    <>
                      {/* Main Image */}
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                        <img
                          src={images[currentImageIndex]?.url || images[currentImageIndex]?.image_url || images[currentImageIndex]?.path}
                          alt={images[currentImageIndex]?.alt_text || `Product image ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Zoom button */}
                        <button
                          onClick={() => setSelectedImage(images[currentImageIndex]?.url || images[currentImageIndex]?.image_url || images[currentImageIndex]?.path)}
                          className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <ZoomIn size={20} />
                        </button>

                        {/* Navigation arrows */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </>
                        )}

                        {/* Image counter */}
                        {images.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Images */}
                      {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                idx === currentImageIndex 
                                  ? 'border-teal-500 ring-2 ring-teal-200' 
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
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Package size={48} className="mx-auto mb-2" />
                        <p>No images available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="space-y-6">
                  {product && (
                    <>
                      {/* Title and Basic Info */}
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                      </div>

                      {/* Pricing */}
                      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
                        <div className="flex items-center mb-3">
                          <DollarSign className="text-teal-600 mr-2" size={20} />
                          <h3 className="text-lg font-semibold text-teal-800">Pricing</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Daily Rate:</span>
                            <span className="font-semibold text-teal-600">
                              {product.base_price_per_day} {product.base_currency}
                            </span>
                          </div>
                          {product.base_price_per_week && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Weekly Rate:</span>
                              <span className="font-semibold text-teal-600">
                                {product.base_price_per_week} {product.base_currency}
                              </span>
                            </div>
                          )}
                          {product.base_price_per_month && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monthly Rate:</span>
                              <span className="font-semibold text-teal-600">
                                {product.base_price_per_month} {product.base_currency}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Tag className="text-gray-500 mr-2" size={16} />
                            <span className="text-sm font-medium text-gray-700">Category</span>
                          </div>
                          <p className="text-gray-900">{product.category_id}</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Star className="text-gray-500 mr-2" size={16} />
                            <span className="text-sm font-medium text-gray-700">Condition</span>
                          </div>
                          <p className="text-gray-900 capitalize">{product.condition}</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <MapPin className="text-gray-500 mr-2" size={16} />
                            <span className="text-sm font-medium text-gray-700">Country</span>
                          </div>
                          <p className="text-gray-900">{product.country_id}</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Package className="text-gray-500 mr-2" size={16} />
                            <span className="text-sm font-medium text-gray-700">Pickup Methods</span>
                          </div>
                          <p className="text-gray-900 capitalize">
                            {Array.isArray(product.pickup_methods) 
                              ? product.pickup_methods.join(', ') 
                              : 'Not specified'}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {product.features.map((feature: string, idx: number) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                <span className="text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specifications */}
                      {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                          <div className="space-y-3">
                            {Object.entries(product.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                <span className="text-gray-600 font-medium">{key}:</span>
                                <span className="text-gray-900">
                                  {typeof value === 'string' || typeof value === 'number'
                                    ? value
                                    : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      {product.location && (product.location.latitude || product.location.longitude) && (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center mb-3">
                            <MapPin className="text-gray-500 mr-2" size={20} />
                            <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-gray-600">Latitude:</span>
                              <p className="text-gray-900 font-mono">{product.location.latitude}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Longitude:</span>
                              <p className="text-gray-900 font-mono">{product.location.longitude}</p>
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

          {/* Footer with Edit Button */}
          {!loading && !error && onEdit && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Edit3 size={18} />
                <span>Edit Product</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Lightbox */}
      {selectedImage && ReactDOM.createPortal(
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh] p-4">
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" 
            />
            <button
              className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full p-2 text-gray-700 hover:bg-white hover:text-red-500 transition-all duration-200 shadow-lg"
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