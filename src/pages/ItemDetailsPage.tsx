import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, Heart, Share2, MapPin, Clock, Shield, Zap, Truck,
  User, MessageCircle, Phone,
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Package, Info, ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice, getCityFromCoordinates, wkbHexToLatLng } from '../lib/utils';
import Button from '../components/ui/Button';
import { getProductById, fetchProductPricesByProductId, getProductInteractions, addUserFavorite, removeUserFavorite, getUserFavorites } from './admin/service';
import { getProductImagesByProductId } from './my-account/service/api';
import { fetchProductReviews } from './my-account/service/api';
import { UserProfileService } from './admin/service/userProfileService';



// Utility to format currency display
function formatCurrency(amount: string, currency: string): string {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'INR': '₹'
  };
  
  const symbol = currencySymbols[currency] || currency;
  return symbol === currency ? `${currency} ${amount}` : `${symbol}${amount}`;
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
  const [latestKycStatus, setLatestKycStatus] = useState<string | null>(null);
  const [itemLocation, setItemLocation] = useState<{ city: string | null, country: string | null }>({ city: null, country: null });
  const [productPrices, setProductPrices] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [productInteractions, setProductInteractions] = useState<any[]>([]);
  const [productReviews, setProductReviews] = useState<any[]>([]);

  useEffect(() => {
    // Fetch latest KYC status from authoritative API using localStorage user.id
    const token = localStorage.getItem('token');
    const storedUserStr = localStorage.getItem('user');
    if (!token || !storedUserStr) return;
    try {
      const storedUser = JSON.parse(storedUserStr);
      const userId: string | undefined = storedUser?.id;
      if (!userId) return;
      (async () => {
        const { data } = await UserProfileService.getUserProfile(userId, token);
        const status: string | null = data?.kyc_status ?? null;
        setLatestKycStatus(status);
      })();
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {

    if (!id) return;
    setLoading(true);
    const token = localStorage.getItem('token') || undefined;
    getProductById(id, token)
      .then(result => {
        setItem(result);
        setLoading(false);
        
        if (result && result.id) {
          getProductImagesByProductId(result.id)
            .then((rawImages) => {
              // Simple image extraction like in my-account
              const normalizedImages: string[] = [];
              
              if (Array.isArray(rawImages)) {
                rawImages.forEach((img: any) => {
                  if (img && img.image_url) {
                    normalizedImages.push(img.image_url);
                  }
                });
              }
              
              // Set images array (empty if no images)
              const finalImages = normalizedImages.length > 0 ? normalizedImages : [];
              
              setImages(finalImages);
            })
            .catch(() => {
              // Set empty array on error
              setImages([]);
            });
        } else {
          setImages([]);
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

  // Fetch product prices
  useEffect(() => {
    if (!item?.id) return;
    
    async function loadPrices() {
      try {
        const result = await fetchProductPricesByProductId(item.id);
        if (result.success && result.data && result.data.length > 0) {
          // Use the first pricing data available
          setProductPrices(result.data[0]);
        }
      } catch (error) {
      }
    }
    
    loadPrices();
  }, [item?.id]);

  // Fetch product interactions
  useEffect(() => {
    if (!item?.id) return;
    
    async function loadInteractions() {
      try {
        const token = localStorage.getItem('token') || undefined;
        const result = await getProductInteractions(item.id, 'click', 5, token);
        if (result.success && result.data) {
          setProductInteractions(result.data);
        }
      } catch (error) {
      }
    }
    
    loadInteractions();
  }, [item?.id]);

  // Fetch product reviews
  useEffect(() => {
    if (!item?.id) return;
    (async () => {
      try {
        const token = localStorage.getItem('token') || undefined;
        const reviews = await fetchProductReviews(item.id, token);
        setProductReviews(Array.isArray(reviews) ? reviews : []);
      } catch {
        setProductReviews([]);
      }
    })();
  }, [item?.id]);

  // Fetch location data
  useEffect(() => {
    if (!item) return;
    
    async function loadLocation() {
      setLocationLoading(true);
      let lat: number | undefined; 
      let lng: number | undefined;
      
      // Try to extract coordinates from different possible fields
      const locationSources = [item.location, item.geometry];
      
      for (const source of locationSources) {
        if (!source) continue;
        
        // Handle string format (WKB hex)
        if (typeof source === 'string') {
          const coords = wkbHexToLatLng(source);
          if (coords) { 
            lat = coords.lat; 
            lng = coords.lng; 
            break;
          }
        } 
        // Handle object format
        else if (source && typeof source === 'object') {
          // Try different property names
          lat = (source as any).lat ?? (source as any).latitude ?? (source as any).y;
          lng = (source as any).lng ?? (source as any).longitude ?? (source as any).x;
          
          // Handle nested coordinates array [lng, lat] or [lat, lng]
          if ((source as any).coordinates && Array.isArray((source as any).coordinates)) {
            const coords = (source as any).coordinates;
            if (coords.length >= 2) {
              // GeoJSON format is [longitude, latitude]
              lng = coords[0];
              lat = coords[1];
            }
          }
          
          if (lat != null && lng != null) break;
        }
      }
      
      if (lat != null && lng != null) {
        try {
          const { city, country } = await getCityFromCoordinates(lat, lng);
          setItemLocation({ city, country });
        } catch {
          setItemLocation({ city: null, country: null });
        }
      } else {
        setItemLocation({ city: null, country: null });
      }
      
      setLocationLoading(false);
    }
    
    loadLocation();
  }, [item]);

  // Load user's favorites and check if current item is favorited
  useEffect(() => {
    if (!id || !isAuthenticated) return;
    
    const token = localStorage.getItem('token') || undefined;
    if (!token) return;
    
    (async () => {
      try {
        const favs = await getUserFavorites(token);
        if (Array.isArray(favs)) {
          const isFav = favs.some((f: any) => {
            const productId = f?.product_id || f?.productId || f?.id;
            return productId === id;
          });
          setIsFavorited(isFav);
        }
      } catch {
        // ignore favorites loading errors silently
      }
    })();
  }, [id, isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Item</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate('/items')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
          Browse Items
        </Button>
      </div>
    </div>;
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

  const handleBookNow = async () => {
    // Authentication Gate Logic
    if (!isAuthenticated) {
      // Show auth modal instead of direct redirect
      setShowAuthModal(true);
      return;
    }

    // Fetch latest KYC status from API (authoritative)
    try {
      const token = localStorage.getItem('token');
      const storedUserStr = localStorage.getItem('user');
      if (!token || !storedUserStr) {
        setShowAuthModal(true);
        return;
      }
      const storedUser = JSON.parse(storedUserStr);
      const userId: string | undefined = storedUser?.id;
      if (!userId) {
        setShowAuthModal(true);
        return;
      }
      const { data } = await UserProfileService.getUserProfile(userId, token);
      const status: string | null = data?.kyc_status ?? null;
      setLatestKycStatus(status);

      if (status && status.toLowerCase() === 'verified') {
        navigate(`/booking/item/${item.id}`);
      } else {
        setShowVerificationModal(true);
      }
    } catch (_err) {
      // On API failure, be conservative and require verification
      setLatestKycStatus(null);
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

  const renderImage = (image: string, index?: number) => {
    return (
      <img 
        src={image} 
        alt={`Product image ${index !== undefined ? index + 1 : ''}`} 
        className="w-full h-full object-cover"
        onError={(e) => {
          // Hide the image and show icon instead
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
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
              <div className="relative bg-gray-100 flex items-center justify-center">
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={item.name}
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                      // Hide the image and show icon instead
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {/* No Image Icon */}
                <div className={`${images.length > 0 ? 'hidden' : ''} flex flex-col items-center justify-center text-gray-400 h-96`}>
                  <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg font-medium">No Images Available</span>
                </div>

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
                    onClick={async () => {
                      if (!isAuthenticated) {
                        setShowAuthModal(true);
                        return;
                      }
                      
                      const token = localStorage.getItem('token') || undefined;
                      if (!token) return;
                      
                      const currentlyFav = isFavorited;
                      // optimistic update
                      setIsFavorited(!currentlyFav);
                      
                      try {
                        if (currentlyFav) {
                          await removeUserFavorite(id!, token);
                        } else {
                          await addUserFavorite(id!, token);
                        }
                      } catch {
                        // revert on failure
                        setIsFavorited(currentlyFav);
                      }
                    }}
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
              {Array.isArray(images) && images.length > 1 ? (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'}`}
                    >
                      {renderImage(image, index)}
                    </button>
                  ))}
                </div>
              ) : null}
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
                        {locationLoading ? (
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            Loading location...
                          </span>
                        ) : (
                          <>
                            {itemLocation.city || 'Unknown'}{itemLocation.country ? `, ${itemLocation.country}` : ''}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Response time: {item.availability.responseTime}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      {productPrices?.price_per_day && productPrices?.currency ? (
                        <>
                          {formatCurrency(productPrices.price_per_day, productPrices.currency)}
                          <span className="text-lg font-normal text-gray-600">/day</span>
                        </>
                      ) : item.base_price_per_day != null && item.base_currency ? (
                        <>
                          {item.base_price_per_day}
                          <span className="text-lg font-normal text-gray-600">/{item.base_currency}</span>
                        </>
                      ) : (
                        <span className="text-gray-500 text-base">No price</span>
                      )}
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
                  {productInteractions.length > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-600 flex items-center gap-1">
                        <span>👥</span>
                        {productInteractions.length} recent interaction{productInteractions.length !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
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
                    {productPrices?.security_deposit && productPrices?.currency ? 
                      `${formatCurrency(productPrices.security_deposit, productPrices.currency)} Security Deposit` :
                      `$${item.security || 0} Security Deposit`
                    }
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              </div>

              {/* Features */}
              {item.features && item.features.length > 0 && (
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
              {item.specifications && Object.keys(item.specifications).length > 0 && (
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

              {/* Product Meta */}
              {(item.brand || item.model || item.year_manufactured || item.address_line || item.delivery_fee) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.brand && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Brand</span>
                        <span className="font-medium text-gray-900">{item.brand}</span>
                      </div>
                    )}
                    {item.model && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Model</span>
                        <span className="font-medium text-gray-900">{item.model}</span>
                      </div>
                    )}
                    {item.year_manufactured != null && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Year</span>
                        <span className="font-medium text-gray-900">{item.year_manufactured}</span>
                      </div>
                    )}
                    {item.address_line && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Address</span>
                        <span className="font-medium text-gray-900">{item.address_line}</span>
                      </div>
                    )}
                    {item.delivery_fee && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium text-gray-900">{formatPrice(Number(item.delivery_fee))}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Included Accessories */}
              {Array.isArray(item.included_accessories) && item.included_accessories.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                  <div className="space-y-2">
                    {item.included_accessories.map((acc: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">{acc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {productReviews.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Reviews</h3>
                  <div className="space-y-4">
                    {productReviews.map((rev: any, idx: number) => (
                      <div key={rev.id || idx} className="border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{rev.user_name || rev.reviewer || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{rev.rating || rev.overallRating || 0}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{rev.comment || rev.text || ''}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Interactions */}
              {productInteractions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h3>
                  <div className="space-y-2">
                    {productInteractions.slice(0, 3).map((interaction, index) => (
                      <div key={interaction.id || index} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="capitalize">{interaction.actionType}</span>
                        <span>•</span>
                        <span>{interaction.deviceType}</span>
                        <span>•</span>
                        <span>{new Date(interaction.createdAt).toLocaleDateString()}</span>
                        {interaction.metadata?.source && (
                          <>
                            <span>•</span>
                            <span className="text-gray-500">from {interaction.metadata.source}</span>
                          </>
                        )}
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
                    {productPrices?.price_per_day && productPrices?.currency ? (
                      <>
                        {formatCurrency(productPrices.price_per_day, productPrices.currency)}
                        <span className="text-lg font-normal text-gray-600">/day</span>
                      </>
                    ) : item.base_price_per_day != null && item.base_currency ? (
                      <>
                        {item.base_price_per_day}
                        <span className="text-lg font-normal text-gray-600">/{item.base_currency}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-base">No price</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {productPrices?.min_rental_duration_hours ? 
                      `Min rental: ${productPrices.min_rental_duration_hours} hours` : 
                      'Item min rental period loading...'
                    }
                  </p>
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

                {isAuthenticated && ((latestKycStatus ?? user?.kyc_status) !== 'verified') && (
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
                      <span className="font-medium">
                        {productPrices?.security_deposit && productPrices?.currency ? 
                          formatCurrency(productPrices.security_deposit, productPrices.currency) :
                          formatPrice(item.securityDeposit || 0)
                        }
                      </span>
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
      {showVerificationModal && ((latestKycStatus ?? user?.kyc_status) !== 'verified') && (
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
