import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, Heart, Share2, MapPin, Clock, Shield, Zap, Truck,
  User, MessageCircle, Phone,
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Package, Info, ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';
import Button from '../components/ui/Button';
import { getProductById, fetchProductImages } from './admin/service/api'; // adjust path as needed
import { wkbHexToLatLng, getCityFromCoordinates } from '../lib/utils';

// Define an interface for image objects
interface ProductImage {
  url?: string;
  image_url?: string;
  path?: string;
}

// Type guard to check if an item is a ProductImage
function isProductImage(item: unknown): item is ProductImage {
  return typeof item === 'object' && item !== null && 
    ('url' in (item as ProductImage) || 
     'image_url' in (item as ProductImage) || 
     'path' in (item as ProductImage));
}

// Utility function to extract image URL
function extractImageUrl(img: unknown): string | null {
  // If it's already a string and not empty, return it
  if (typeof img === 'string' && img.trim() !== '') {
    return img;
  }

  // If it's a ProductImage object, extract URL
  if (isProductImage(img)) {
    const url = img.url || img.image_url || img.path;
    return typeof url === 'string' && url.trim() !== '' ? url : null;
  }

  // If no valid URL found
  return null;
}

const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Debug: log user and kyc_status


  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [itemLocation, setItemLocation] = useState<{ city: string | null, country: string | null }>({ city: null, country: null });

  useEffect(() => {

    if (!id) return;
    setLoading(true);
    const token = localStorage.getItem('token') || undefined;
    getProductById(id, token)
      .then(result => {
        setItem(result);
        setLoading(false);
        
        if (result && result.id) {
          fetchProductImages(result.id, token)
            .then((rawImages) => {
              // Normalize images to extract URLs
              const normalizedImages: string[] = [];
              
              // Handle array of images
              if (Array.isArray(rawImages)) {
                rawImages.forEach((img) => {
                  const extractedUrl = extractImageUrl(img);
                  if (extractedUrl) normalizedImages.push(extractedUrl);
                });
              } 
              // Handle single image
              else {
                const extractedUrl = extractImageUrl(rawImages);
                if (extractedUrl) normalizedImages.push(extractedUrl);
              }
              
              // Fallback to placeholder if no images
              const finalImages = normalizedImages.length > 0 
                ? normalizedImages 
                : ['/assets/img/placeholder-image.png'];
              
              setImages(finalImages);
            })
            .catch(() => {
              // Fallback to placeholder on error
              setImages(['/assets/img/placeholder-image.png']);
            });
        } else {
          setImages(['/assets/img/placeholder-image.png']);
          navigate('/items');
        }
        
        // Rest of the existing location fetching logic remains the same
      })
      .catch(() => {
        setLoading(false);
        setError('Failed to load product details');
        navigate('/items');
      });
  }, [id, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Item not found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/items')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            Browse Items
          </Button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    // Authentication Gate Logic
    if (!isAuthenticated) {
      // Show auth modal instead of direct redirect
      setShowAuthModal(true);
      return;
    }

    // Check KYC status
    if (user?.kyc_status === 'verified') {
      // Proceed to booking
      navigate(`/booking/item/${item.id}`);
    } else {
      // Not verified, show verification modal
      setShowVerificationModal(true);
    }
  };


  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const renderImage = (image: string | ProductImage, index?: number) => {
    // Determine the actual image URL
    const currentImageUrl = 
      typeof image === 'string' 
        ? image 
        : (image.url || image.image_url || image.path || '/assets/img/placeholder-image.png');
    
    return (
      <img 
        src={currentImageUrl} 
        alt={`Product image ${index !== undefined ? index + 1 : ''}`} 
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/assets/img/placeholder-image.png';
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/items" className="text-gray-600 hover:text-gray-900">Items</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to={`/items?category=${item.category}`} className="text-gray-600 hover:text-gray-900 capitalize">
              {item.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{item.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative">
                <img
                  src={
                    images[currentImageIndex] 
                      ? renderImage(images[currentImageIndex]).props.src
                      : '/assets/img/placeholder-image.png'
                  }
                  alt={item.name}
                  className="w-full h-96 object-cover"
                                  onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/img/placeholder-image.png';
                }}
                />

                {/* Image Navigation */}
                {Array.isArray(images) && images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                {Array.isArray(images) && images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                  </button>
                  <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {item.featured && (
                    <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </div>
                  )}
                  {item.verified && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {Array.isArray(images) && images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {images.map((image: string | ProductImage, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'}`}
                    >
                      {renderImage(image, index)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {itemLocation.city || 'Unknown'}{itemLocation.country ? `, ${itemLocation.country}` : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Response time: {item.availability.responseTime}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(item.base_price_per_day)}
                      <span className="text-lg font-normal text-gray-600">/{item.base_currency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{item.average_rating || '0.00'}</span>
                    <span className="text-gray-600">({item.review_count || 0} reviews)</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-600">{item.view_count || 0} views</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {item.availability.instantBook && (
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                      <Zap className="w-4 h-4" />
                      Instant Book
                    </div>
                  )}
                  {item.deliveryAvailable && (
                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      <Truck className="w-4 h-4" />
                      Delivery Available
                    </div>
                  )}
                  <div className="flex items-center gap-1 bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-sm">
                    <Shield className="w-4 h-4" />
                    ${item.securityDeposit} Security Deposit
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              </div>

              {/* Features */}
              {item.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {item.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {Object.keys(item.specifications).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(item.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-medium text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Included Items */}
              {item.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                  <div className="space-y-2">
                    {item.includedItems.map((includedItem: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">{includedItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Booking Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {item.base_price_per_day}
                    <span className="text-lg font-normal text-gray-600">/{item.base_currency}</span>
                  </div>
                  <p className="text-sm text-gray-600">Item min rental period loading...</p>
                </div>

                {/* Book Now Button */}
                <Button
                  onClick={handleBookNow}
                  className="w-full py-3 btn-primary text-white rounded-xl font-semibold hover:bg-[#01aaa7]  transition-colors flex items-center justify-center gap-2"
                >
                  Book Now
                  <ArrowRight className="w-4 h-4" />
                </Button>

                {/* Authentication Status */}
                {!isAuthenticated && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Info className="w-4 h-4" />
                      <span className="text-sm">Login required to book items</span>
                    </div>
                  </div>
                )}

                {isAuthenticated && (user?.kyc_status !== 'verified') && (
                  <div className="mt-4 p-3 b border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <AlertCircle className="w-4 h-4 text-[#01aaa7]" />
                      <span className="text-sm text-[#01aaa7]">Account verification required</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-600 text-center mb-4">
                    You won't be charged yet
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit</span>
                      <span className="font-medium">{formatPrice(item.securityDeposit)}</span>
                    </div>
                    {item.deliveryAvailable && item.deliveryFee && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">{formatPrice(item.deliveryFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cancellation Policy</span>
                      <span className="font-medium capitalize">{item.cancellationPolicy}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Host Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Host</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={item.ownerAvatar}
                    alt={item.ownerName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.ownerName}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{item.ownerRating} ({item.ownerReviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Required</h3>
              <p className="text-gray-600 mb-6">
                Please log in or create an account to book items on our platform.
              </p>

              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => navigate(`/login?redirect=/items/${item.id}&action=book`)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => navigate(`/register?redirect=/items/${item.id}&action=book`)}
                  variant="outline"
                  className="w-full py-3 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Create Account
                </Button>
                <Button
                  onClick={() => setShowAuthModal(false)}
                  variant="outline"
                  className="w-full py-3"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                Join thousands of users renting safely on our platform.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && user?.kyc_status !== 'verified' && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4 text-[#01aaa7]">Verification Required</h2>
            <p className="mb-6 text-gray-700">
              You must complete your account verification (including document upload) before booking this item.
            </p>
            <Button
              className="w-full btn-primary text-white"
              onClick={() => {
                setShowVerificationModal(false);
                navigate('/verify/id');
              }}
            >
              Go to Verification
            </Button>
            <button
              className="mt-4 text-sm text-gray-500 underline"
              onClick={() => setShowVerificationModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetailsPage;
