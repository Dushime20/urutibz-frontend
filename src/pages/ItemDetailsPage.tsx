import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, Heart, Share2, MapPin, Clock, Shield, Zap, Truck,
  User, MessageCircle, Phone,
  ChevronLeft, ChevronRight, CheckCircle, AlertCircle,
  Package, Info, ArrowRight, ShoppingCart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { TranslatedText } from '../components/translated-text';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { formatPrice, getCityFromCoordinates, wkbHexToLatLng } from '../lib/utils';
import Button from '../components/ui/Button';
import { getProductById, fetchProductPricesByProductId, getProductInteractions, addUserFavorite, removeUserFavorite, getUserFavorites, fetchAvailableProducts, fetchUserById } from './admin/service';
import { getProductImagesByProductId } from './my-account/service/api';
import { fetchProductReviews } from './my-account/service/api';
import { UserProfileService } from './admin/service/userProfileService';
import ProductSwiper from '../components/products/ProductSwiper';
import ProductMap from '../components/map/ProductMap';
import MessagingModal from '../components/messaging/MessagingModal';
import AddToCartModal from '../components/cart/AddToCartModal';
import ReviewsSection from '../components/reviews/ReviewsSection';



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
  const { tSync } = useTranslation();
  const { addToCart, isInCart } = useCart();
  const { showToast } = useToast();

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
  const [productCoordinates, setProductCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [productInteractions, setProductInteractions] = useState<any[]>([]);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  
  // Related products state
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [relatedProductImages, setRelatedProductImages] = useState<Record<string, string[]>>({});
  const [relatedProductPrices, setRelatedProductPrices] = useState<Record<string, any>>({});
  const [relatedItemLocations, setRelatedItemLocations] = useState<Record<string, { city: string | null; country: string | null }>>({});
  const [relatedLocationsLoading, setRelatedLocationsLoading] = useState<Record<string, boolean>>({});
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);

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

  // Fetch owner information when item is loaded
  useEffect(() => {
    if (!item?.owner_id) return;
    
    const fetchOwnerInfo = async () => {
      try {
        const token = localStorage.getItem('token') || undefined;
        const result = await fetchUserById(item.owner_id, token);
        
        if (result.data) {
          const owner = result.data;
          const ownerName = owner.first_name && owner.last_name
            ? `${owner.first_name} ${owner.last_name}`
            : owner.email || 'Product Owner';
          
          setOwnerInfo({
            id: owner.id,
            name: ownerName,
            avatar: owner.profile_image || owner.profileImageUrl || owner.avatar || item.ownerAvatar
          });
        }
      } catch (err) {
        console.error('Error fetching owner info:', err);
        // Fallback to item data if available
        if (item.ownerName) {
          setOwnerInfo({
            id: item.owner_id,
            name: item.ownerName,
            avatar: item.ownerAvatar
          });
        }
      }
    };
    
    fetchOwnerInfo();
  }, [item?.owner_id, item?.ownerName, item?.ownerAvatar]);

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
        console.log('Fetching reviews for product ID:', item.id, 'Type:', typeof item.id);
        const reviews = await fetchProductReviews(item.id, token);
        setProductReviews(Array.isArray(reviews) ? reviews : []);
      } catch (error) {
        console.error('Error in ItemDetailsPage review fetch:', error);
        // Set empty array as fallback - page will still work without reviews
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
        // Store coordinates for map display
        setProductCoordinates({ lat, lng });
        try {
          const { city, country } = await getCityFromCoordinates(lat, lng);
          setItemLocation({ city, country });
        } catch {
          setItemLocation({ city: null, country: null });
        }
      } else {
        setItemLocation({ city: null, country: null });
        setProductCoordinates(null);
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
          
          // Build favorite map for related products
          const map: Record<string, boolean> = {};
          favs.forEach((f: any) => {
            const productId = f?.product_id || f?.productId || f?.id;
            if (typeof productId === 'string') map[productId] = true;
          });
          setFavoriteMap(map);
        }
      } catch {
        // ignore favorites loading errors silently
      }
    })();
  }, [id, isAuthenticated]);

  // Fetch related products
  useEffect(() => {
    if (!item?.id) return;
    
    let isMounted = true;
    const fetchRelated = async () => {
      try {
        const token = localStorage.getItem('token') || undefined;
        const result = await fetchAvailableProducts(token, true);
        const allProducts = result.data || [];
        
        // Filter out current product and get related products (same category or random)
        const filtered = allProducts
          .filter((p: any) => p.id !== item.id)
          .filter((p: any) => {
            // Prefer same category, but include others if not enough
            if (item.category_id) {
              return String(p.category_id || p.categoryId) === String(item.category_id);
            }
            return true;
          })
          .slice(0, 12); // Limit to 12 products
        
        if (isMounted) {
          setRelatedProducts(filtered);
          
          // Fetch images for related products
          const imagesMap: Record<string, string[]> = {};
          await Promise.all(
            filtered.map(async (product: any) => {
              try {
                const imgs = await getProductImagesByProductId(product.id);
                const normalized: string[] = [];
                if (Array.isArray(imgs)) {
                  imgs.forEach((img: any) => {
                    if (img && img.image_url) {
                      normalized.push(img.image_url);
                    }
                  });
                }
                imagesMap[product.id] = normalized.length ? normalized : [];
              } catch {
                imagesMap[product.id] = [];
              }
            })
          );
          
          // Fetch prices for related products
          const pricesMap: Record<string, any> = {};
          await Promise.all(
            filtered.map(async (product: any) => {
              try {
                const result = await fetchProductPricesByProductId(product.id);
                if (result.success && result.data && result.data.length > 0) {
                  pricesMap[product.id] = result.data[0];
                }
              } catch {
                // ignore
              }
            })
          );
          
          // Fetch locations for related products (first 8 only to reduce API load)
          const locationsMap: Record<string, { city: string | null; country: string | null }> = {};
          const loadingMap: Record<string, boolean> = {};
          const productsToProcess = filtered.slice(0, 8);
          
          productsToProcess.forEach((product: any) => {
            loadingMap[product.id] = true;
          });
          setRelatedLocationsLoading(loadingMap);
          
          await Promise.all(
            productsToProcess.map(async (product: any) => {
              let lat: number | undefined;
              let lng: number | undefined;
              
              const locationSources = [product.location, product.geometry];
              for (const source of locationSources) {
                if (!source) continue;
                
                if (typeof source === 'string') {
                  const coords = wkbHexToLatLng(source);
                  if (coords) {
                    lat = coords.lat;
                    lng = coords.lng;
                    break;
                  }
                } else if (source && typeof source === 'object') {
                  lat = (source as any).lat ?? (source as any).latitude ?? (source as any).y;
                  lng = (source as any).lng ?? (source as any).longitude ?? (source as any).x;
                  
                  if ((source as any).coordinates && Array.isArray((source as any).coordinates)) {
                    const coords = (source as any).coordinates;
                    if (coords.length >= 2) {
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
                  locationsMap[product.id] = { city, country };
                } catch {
                  locationsMap[product.id] = { city: null, country: null };
                }
              } else {
                locationsMap[product.id] = { city: null, country: null };
              }
              
              if (isMounted) {
                setRelatedLocationsLoading(prev => {
                  const updated = { ...prev };
                  delete updated[product.id];
                  return updated;
                });
              }
            })
          );
          
          if (isMounted) {
            setRelatedProductImages(imagesMap);
            setRelatedProductPrices(pricesMap);
            setRelatedItemLocations(locationsMap);
            setRelatedLocationsLoading({});
          }
        }
      } catch (error) {
        console.error('Failed to fetch related products:', error);
        if (isMounted) {
          setRelatedProducts([]);
        }
      }
    };
    
    fetchRelated();
    
    return () => {
      isMounted = false;
    };
  }, [item?.id]);

  if (loading) {
    return <div><TranslatedText text="Loading..." /></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2"><TranslatedText text="Error Loading Item" /></h2>
        <p className="text-gray-600 dark:text-slate-300 mb-4">{error}</p>
        <Button onClick={() => navigate('/items')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
          <TranslatedText text="Browse Items" />
        </Button>
      </div>
    </div>;
  }
  
  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2"><TranslatedText text="Item Not Found" /></h2>
          <p className="text-gray-600 dark:text-slate-300 mb-4"><TranslatedText text="The item you're looking for doesn't exist or has been removed." /></p>
          <Button onClick={() => navigate('/items')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            <TranslatedText text="Browse Items" />
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

  const handleAddToCart = () => {
    if (!item) return;

    // Check if already in cart
    if (isInCart(item.id)) {
      showToast(tSync('Item is already in your cart'), 'info');
      return;
    }

    // Get price - prefer productPrices, fallback to item base_price_per_day
    const pricePerDay = productPrices?.price_per_day || item.base_price_per_day || 0;
    const currency = productPrices?.currency || item.currency || 'RWF';

    // Default dates: tomorrow to day after tomorrow (2 days rental)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    dayAfter.setHours(0, 0, 0, 0);

    const startDate = tomorrow.toISOString().split('T')[0];
    const endDate = dayAfter.toISOString().split('T')[0];

    // Get product image
    const productImage = images.length > 0 ? images[0] : undefined;

    addToCart({
      productId: item.id,
      productTitle: item.title || 'Product',
      productImage,
      startDate,
      endDate,
      pricePerDay,
      currency,
      ownerId: item.owner_id,
      categoryId: item.category_id,
    });

    showToast(tSync('Item added to cart'), 'success');
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-900">
      {/* Breadcrumb */}
      <div className="bg-white border-b dark:bg-slate-900 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/items" className="text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"><TranslatedText text="Items" /></Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link to={`/items?category=${item.category}`} className="text-gray-600 hover:text-gray-900 capitalize dark:text-slate-300 dark:hover:text-white">
              {item.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium dark:text-white">{item.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm dark:bg-slate-900 dark:border dark:border-slate-700">
              <div className="relative bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={item.name}
                    className="w-full h-80 sm:h-96 object-cover"
                    onError={(e) => {
                      // Hide the image and show icon instead
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {/* No Image Icon */}
                <div className={`${images.length > 0 ? 'hidden' : ''} flex flex-col items-center justify-center text-gray-400 dark:text-slate-400 h-80 sm:h-96`}>
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg font-medium"><TranslatedText text="No Images" /></span>
                </div>

                {/* Image Navigation */}
                {Array.isArray(images) && images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors"
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
                        className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
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
                    className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-slate-300'}`} />
                  </button>
                  <button className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                  </button>
                </div>

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {item.featured && (
                    <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <TranslatedText text="Featured" />
                    </div>
                  )}
                  {item.verified && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <TranslatedText text="Verified" />
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
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${index === currentImageIndex ? 'border-blue-500' : 'border-gray-200 dark:border-slate-700'}`}
                    >
                      {renderImage(image, index)}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-700">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{item.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {locationLoading ? (
                        <span className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          <TranslatedText text="Loading location..." />
                          </span>
                        ) : (
                          <>
                          {itemLocation.city || <TranslatedText text="Unknown Location" />}{itemLocation.country ? `, ${itemLocation.country}` : ''}
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
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {productPrices?.price_per_day && productPrices?.currency ? (
                        <>
                          {formatCurrency(productPrices.price_per_day, productPrices.currency)}
                          <span className="text-lg font-normal text-gray-600 dark:text-slate-300">/<TranslatedText text="per day" /></span>
                        </>
                      ) : item.base_price_per_day != null && item.base_currency ? (
                        <>
                          {item.base_price_per_day}
                          <span className="text-lg font-normal text-gray-600 dark:text-slate-300">/{item.base_currency}</span>
                        </>
                      ) : (
                        <span className="text-gray-500 text-base dark:text-slate-400">No price</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold dark:text-white">{item.average_rating || '0.00'}</span>
                    <span className="text-gray-600 dark:text-slate-300">({item.review_count || 0} <TranslatedText text="reviews" />)</span>
                  </div>
                  <span className="text-gray-300 dark:text-slate-600">•</span>
                  <span className="text-gray-600 dark:text-slate-300">{item.view_count || 0} views</span>
                  {productInteractions.length > 0 && (
                    <>
                      <span className="text-gray-300 dark:text-slate-600">•</span>
                      <span className="text-gray-600 dark:text-slate-300 flex items-center gap-1">
                        <span>👥</span>
                        {productInteractions.length} recent interaction{productInteractions.length !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {item.availability.instantBook && (
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm dark:bg-green-900/30 dark:text-green-300">
                      <Zap className="w-4 h-4" />
                      <TranslatedText text="Instant Book" />
                    </div>
                  )}
                  {item.deliveryAvailable && (
                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm dark:bg-blue-900/30 dark:text-blue-300">
                      <Truck className="w-4 h-4" />
                      <TranslatedText text="Delivery Available" />
                    </div>
                  )}
                  <div className="flex items-center gap-1 bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-sm dark:bg-slate-800 dark:text-slate-200">
                    <Shield className="w-4 h-4" />
                    {productPrices?.security_deposit && productPrices?.currency ? 
                      `${formatCurrency(productPrices.security_deposit, productPrices.currency)} ${tSync('Security Deposit')}` :
                      `$${item.security || 0} ${tSync('Security Deposit')}`
                    }
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed dark:text-slate-300">{item.description}</p>
              </div>

              {/* Features */}
              {item.features && item.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3"><TranslatedText text="Features" /></h3>
                  <div className="grid grid-cols-2 gap-2">
                    {item.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 dark:text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {item.specifications && Object.keys(item.specifications).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3"><TranslatedText text="Specifications" /></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(item.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0 dark:border-slate-700">
                        <span className="text-gray-600 capitalize dark:text-slate-300">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Meta */}
              {(item.brand || item.model || item.year_manufactured || item.address_line || item.delivery_fee) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3"><TranslatedText text="Product Details" /></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.brand && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-gray-600 dark:text-slate-300"><TranslatedText text="Brand" /></span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.brand}</span>
                      </div>
                    )}
                    {item.model && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-gray-600 dark:text-slate-300"><TranslatedText text="Model" /></span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.model}</span>
                      </div>
                    )}
                    {item.year_manufactured != null && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-gray-600 dark:text-slate-300"><TranslatedText text="Year" /></span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.year_manufactured}</span>
                      </div>
                    )}
                    {item.address_line && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-gray-600 dark:text-slate-300"><TranslatedText text="Address" /></span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.address_line}</span>
                      </div>
                    )}
                    {item.delivery_fee && (
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-gray-600 dark:text-slate-300">Delivery Fee</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatPrice(Number(item.delivery_fee))}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Location Map */}
              {productCoordinates && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <TranslatedText text="Location" />
                  </h3>
                  <ProductMap
                    latitude={productCoordinates.lat}
                    longitude={productCoordinates.lng}
                    productTitle={item.name || item.title || 'Product Location'}
                    address={item.address_line}
                    height="400px"
                  />
                  {itemLocation.city && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                      {itemLocation.city}{itemLocation.country ? `, ${itemLocation.country}` : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Included Accessories */}
              {Array.isArray(item.included_accessories) && item.included_accessories.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3"><TranslatedText text="What's Included" /></h3>
                  <div className="space-y-2">
                    {item.included_accessories.map((acc: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700 dark:text-slate-300">{acc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* Recent Interactions */}
              {productInteractions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3"><TranslatedText text="Recent Activity" /></h3>
                  <div className="space-y-2">
                    {productInteractions.slice(0, 3).map((interaction, index) => (
                      <div key={interaction.id || index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="capitalize">{interaction.actionType}</span>
                        <span>•</span>
                        <span>{interaction.deviceType}</span>
                        <span>•</span>
                        <span>{new Date(interaction.createdAt).toLocaleDateString()}</span>
                        {interaction.metadata?.source && (
                          <>
                            <span>•</span>
                            <span className="text-gray-500 dark:text-slate-400">{tSync(`From ${interaction.metadata.source}`)}</span>
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
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {productPrices?.price_per_day && productPrices?.currency ? (
                      <>
                        {formatCurrency(productPrices.price_per_day, productPrices.currency)}
                        <span className="text-lg font-normal text-gray-600 dark:text-slate-300">/day</span>
                      </>
                    ) : item.base_price_per_day != null && item.base_currency ? (
                      <>
                        {item.base_price_per_day}
                        <span className="text-lg font-normal text-gray-600 dark:text-slate-300">/{item.base_currency}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-base dark:text-slate-400"><TranslatedText text="Price not available" /></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    {productPrices?.min_rental_duration_hours ? 
                      `Min rental: ${productPrices.min_rental_duration_hours} hours` : 
                      'Item min rental period loading...'
                    }
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowAddToCartModal(true)}
                    className="flex-1 py-3 bg-white border-2 border-teal-600 text-teal-600 dark:text-teal-400 rounded-xl font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <TranslatedText text="Add to Cart" />
                  </Button>
                  <Button
                    onClick={handleBookNow}
                    className="flex-1 py-3 btn-primary text-white rounded-xl font-semibold hover:bg-[#01aaa7] transition-colors flex items-center justify-center gap-2"
                  >
                    <TranslatedText text="Book Now" />
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Authentication Status */}
                {!isAuthenticated && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <Info className="w-4 h-4" />
                      <span className="text-sm"><TranslatedText text="Login Required" /></span>
                    </div>
                  </div>
                )}

                {isAuthenticated && ((latestKycStatus ?? user?.kyc_status) !== 'verified') && (
                  <div className="mt-4 p-3 b border border-blue-200 rounded-lg dark:border-blue-900/40">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <AlertCircle className="w-4 h-4 text-[#01aaa7]" />
                      <span className="text-sm text-[#01aaa7]"><TranslatedText text="Account Verification Required" /></span>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                  <p className="text-sm text-gray-600 text-center mb-4 dark:text-slate-300">
                    <TranslatedText text="No charge yet" />
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-300">Security Deposit</span>
                      <span className="font-medium dark:text-white">
                        {productPrices?.security_deposit && productPrices?.currency ? 
                          formatCurrency(productPrices.security_deposit, productPrices.currency) :
                          formatPrice(item.securityDeposit || 0)
                        }
                      </span>
                    </div>
                    {item.deliveryAvailable && item.deliveryFee && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-300"><TranslatedText text="Delivery Fee" /></span>
                        <span className="font-medium dark:text-white">{formatPrice(item.deliveryFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-300"><TranslatedText text="Cancellation Policy" /></span>
                      <span className="font-medium capitalize dark:text-white">{item.cancellationPolicy}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Host Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6 dark:bg-slate-900 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4"><TranslatedText text="Your Host" /></h3>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={item.ownerAvatar}
                    alt={item.ownerName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.ownerName}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-slate-300">{item.ownerRating} ({item.ownerReviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => setShowMessagingModal(true)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <TranslatedText text="Message" />
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    <TranslatedText text="Call" />
                  </Button>
                </div>

                {/* Reviews Section */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                  <ReviewsSection
                    reviews={productReviews}
                    productId={item?.id || ''}
                    ownerId={item?.owner_id || item?.user_id}
                    onReviewAdded={() => {
                      // Refetch reviews after a new review is added
                      const token = localStorage.getItem('token') || undefined;
                      fetchProductReviews(item.id, token).then((reviews) => {
                        setProductReviews(Array.isArray(reviews) ? reviews : []);
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More items to explore section */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
              <TranslatedText text="More items to explore" />
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              <TranslatedText text="Discover similar products you might like" />
            </p>
          </div>
          <ProductSwiper
            title=""
            products={relatedProducts}
            productImages={relatedProductImages}
            itemLocations={relatedItemLocations}
            productPrices={relatedProductPrices}
            favoriteMap={favoriteMap}
            locationsLoading={relatedLocationsLoading}
            onFavoriteToggle={async (productId, isFavorite) => {
              const token = localStorage.getItem('token') || undefined;
              if (!token || !isAuthenticated) return;
              const currentlyFav = isFavorite;
              setFavoriteMap(prev => ({ ...prev, [productId]: !currentlyFav }));
              try {
                if (currentlyFav) {
                  await removeUserFavorite(productId, token);
                } else {
                  await addUserFavorite(productId, token);
                }
              } catch {
                setFavoriteMap(prev => ({ ...prev, [productId]: currentlyFav }));
              }
            }}
            onProductClick={(productId) => {
              navigate(`/it/${productId}`);
            }}
            formatCurrency={formatCurrency}
            tSync={tSync}
            slidesPerView={4}
            autoplay={true}
            showNavigation={true}
          />
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-gray-100 dark:border-slate-700">
            <div className="text-center">
              <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2"><TranslatedText text="Account Required" /></h3>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                <TranslatedText text="Please log in or create an account to book this item." />
              </p>

              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => navigate(`/login?redirect=/items/${item.id}&action=book`)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                >
                  <TranslatedText text="Log In" />
                </Button>
                <Button
                  onClick={() => navigate(`/register?redirect=/items/${item.id}&action=book`)}
                  variant="outline"
                  className="w-full py-3 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <TranslatedText text="Create Account" />
                </Button>
                <Button
                  onClick={() => setShowAuthModal(false)}
                  variant="outline"
                  className="w-full py-3"
                >
                  <TranslatedText text="Cancel" />
                </Button>
              </div>

              <p className="text-xs text-gray-500 dark:text-slate-400">
                <TranslatedText text="Join thousands of satisfied renters" />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && ((latestKycStatus ?? user?.kyc_status) !== 'verified') && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full text-center dark:bg-slate-900 dark:border dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-[#01aaa7]"><TranslatedText text="Verification Required" /></h2>
            <p className="mb-6 text-gray-700 dark:text-slate-300">
              <TranslatedText text="Please verify your account to book items. This helps us ensure a safe and secure rental experience." />
            </p>
            <Button
              className="w-full btn-primary text-white"
              onClick={() => {
                setShowVerificationModal(false);
                navigate('/verify/id');
              }}
            >
              <TranslatedText text="Go to Verification" />
            </Button>
            <button
              className="mt-4 text-sm text-gray-500 underline dark:text-slate-400"
              onClick={() => setShowVerificationModal(false)}
            >
              <TranslatedText text="Cancel" />
            </button>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      {item && ownerInfo && (
        <MessagingModal
          isOpen={showMessagingModal}
          onClose={() => setShowMessagingModal(false)}
          productId={item.id}
          productTitle={item.title}
          ownerId={ownerInfo.id}
          ownerName={ownerInfo.name}
          ownerAvatar={ownerInfo.avatar}
          productImage={images[0] || item.image}
          productPrice={productPrices?.price_per_day && productPrices?.currency 
            ? formatCurrency(productPrices.price_per_day, productPrices.currency) + '/day'
            : item.base_price_per_day 
              ? `${item.base_price_per_day} ${item.base_currency}/day`
              : undefined
          }
        />
      )}

      {/* Add to Cart Modal */}
      {showAddToCartModal && item && productPrices && (
        <AddToCartModal
          isOpen={showAddToCartModal}
          onClose={() => setShowAddToCartModal(false)}
          product={{
            id: item.id,
            title: item.title || item.name || '',
            image: images[0],
            pricePerDay: typeof productPrices.price_per_day === 'string' 
              ? parseFloat(productPrices.price_per_day) 
              : (productPrices.price_per_day || parseFloat(item.base_price_per_day || '0')),
            currency: productPrices.currency || item.base_currency || 'USD',
            ownerId: item.owner_id || '',
            categoryId: item.category_id,
            pickupAvailable: item.pickup_available !== false,
            deliveryAvailable: item.delivery_available === true,
          }}
        />
      )}
    </div>
  );
};

export default ItemDetailsPage;
