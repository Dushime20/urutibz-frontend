import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, TrendingUp, AlertCircle, RefreshCw, Package, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

import { fetchAvailableProducts, fetchProductPricesByProductId, addUserFavorite, removeUserFavorite, getUserFavorites, getProductInteractions } from './admin/service';
import { getProductImagesByProductId } from './my-account/service/api';
import { logInteraction } from './admin/service/ai';
import { wkbHexToLatLng, getCityFromCoordinates } from '../lib/utils';


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

const HomePage: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});
  const [itemLocations, setItemLocations] = useState<Record<string, { city: string | null; country: string | null }>>({});
  const [productPrices, setProductPrices] = useState<Record<string, any>>({});
  const [locationsLoading, setLocationsLoading] = useState<Record<string, boolean>>({});
  const [productInteractions, setProductInteractions] = useState<Record<string, any[]>>({});
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Simple in-page search state (visual UX only for now)
  const [where] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setNetworkError(false);
      
      const token = localStorage.getItem('token') || undefined;

      // First load: get active products quickly (skip availability check for performance)
      const result = await fetchAvailableProducts(token, true);
      const initial = result.data || [];
      setProducts(initial);

      // Background load: get fully filtered products (with availability check)
      setTimeout(async () => {
        try {
          const filteredResult = await fetchAvailableProducts(token, false);
          if (filteredResult.data) {
            setProducts(filteredResult.data);
          }
        } catch (backgroundError) {
          console.warn('Background product fetch failed:', backgroundError);
          // Don't show error for background fetch, just log it
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      
      // Check if it's a network error
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error') || !navigator.onLine) {
        setNetworkError(true);
        setError('Unable to connect to the server. Please check your internet connection.');
        showToast('Network connection failed. Please check your internet connection.', 'error');
      } else {
        setError('Failed to load products. Please try again.');
        showToast('Failed to load products. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Network status listener
  useEffect(() => {
    const handleOnline = () => {
      setNetworkError(false);
      showToast('Connection restored', 'success');
      // Auto-retry if there was a network error
      if (error && products.length === 0) {
        fetchProducts();
      }
    };

    const handleOffline = () => {
      setNetworkError(true);
      showToast('Connection lost', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, products.length, showToast]);

  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    showToast(`Retrying... (Attempt ${newRetryCount})`, 'info');
    fetchProducts();
  };

  const handleRefresh = () => {
    fetchProducts();
    showToast('Refreshing products...', 'info');
  };

  // Load user's favorites and map by product id
  useEffect(() => {
    const token = localStorage.getItem('token') || undefined;
    if (!token) return; // require auth for favorites
    (async () => {
      try {
        const favs = await getUserFavorites(token);
        const map: Record<string, boolean> = {};
        if (Array.isArray(favs)) {
          favs.forEach((f: any) => {
            const productId = f?.product_id || f?.productId || f?.id;
            if (typeof productId === 'string') map[productId] = true;
          });
        }
        setFavoriteMap(map);
      } catch (err) {
        console.warn('Failed to load favorites:', err);
        // ignore favorites loading errors silently
      }
    })();
  }, []);

  // Fetch images for visible products
  useEffect(() => {
    let isMounted = true;
    async function loadImages() {
      const map: Record<string, string[]> = {};
      await Promise.all(
        products.map(async (p) => {
          try {
            const imgs = await getProductImagesByProductId(p.id);
            
            const normalized: string[] = [];
            if (Array.isArray(imgs)) {
              imgs.forEach((img: any) => {
                if (img && img.image_url) {
                  normalized.push(img.image_url);
                }
              });
            }
            map[p.id] = normalized.length ? normalized : [];
          } catch (e) {
            map[p.id] = [];
          }
        })
      );
      if (isMounted) setProductImages(map);
    }
    if (products.length) loadImages();
    return () => { isMounted = false; };
  }, [products]);

  // Resolve city/country from product.location or product.geometry
  // Note: Locations load sequentially to avoid overwhelming the geocoding API
  useEffect(() => {
    let isMounted = true;
    async function loadLocations() {
      const map: Record<string, { city: string | null; country: string | null }> = {};
      const loadingMap: Record<string, boolean> = {};
      
      // Process only the first batch of products to reduce API load
      const productsToProcess = products.slice(0, 8); // Limit to first 8 items for initial display
      
      // Set loading state for all products that will be processed
      productsToProcess.forEach(item => {
        loadingMap[item.id] = true;
      });
      setLocationsLoading(loadingMap);
      
      const tasks = productsToProcess.map(async (item) => {
        let lat: number | undefined; let lng: number | undefined;
        
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
            map[item.id] = { city, country };
          } catch {
            map[item.id] = { city: null, country: null };
          }
        } else {
          map[item.id] = { city: null, country: null };
        }
        
        // Clear loading state for this item
        if (isMounted) {
          setLocationsLoading(prev => {
            const updated = { ...prev };
            delete updated[item.id];
            return updated;
          });
        }
      });
      
      await Promise.allSettled(tasks);
      if (isMounted) {
        setItemLocations(map);
        // Clear any remaining loading states
        setLocationsLoading({});
      }
    }
    if (products.length) loadLocations();
    return () => { isMounted = false; };
  }, [products]);

  // Fetch product prices for all products
  useEffect(() => {
    let isMounted = true;
    async function loadPrices() {
      const priceMap: Record<string, any> = {};
      await Promise.all(
        products.map(async (product) => {
          try {
            const result = await fetchProductPricesByProductId(product.id);
            if (result.success && result.data && result.data.length > 0) {
              // Use the first pricing data available
              priceMap[product.id] = result.data[0];
            }
          } catch (error) {
          }
        })
      );
      if (isMounted) setProductPrices(priceMap);
    }
    if (products.length) loadPrices();
    return () => { isMounted = false; };
  }, [products]);

  // Fetch product interactions for visible products
  useEffect(() => {
    let isMounted = true;
    async function loadInteractions() {
      const interactionMap: Record<string, any[]> = {};
      const token = localStorage.getItem('token') || undefined;
      
      // Only fetch interactions for visible products (first 15)
      const visibleProducts = products.slice(0, 15);
      
      await Promise.all(
        visibleProducts.map(async (product) => {
          try {
            const result = await getProductInteractions(product.id, 'click', 3, token);
            if (result.success && result.data) {
              interactionMap[product.id] = result.data;
            }
          } catch (error) {
          }
        })
      );
      if (isMounted) setProductInteractions(interactionMap);
    }
    if (products.length) loadInteractions();
    return () => { isMounted = false; };
  }, [products]);

  // Apply simple in-memory filter for the visible grid
  const filtered = products.filter(p => {
    const title = (p.title || p.name || '').toString().toLowerCase();
    const city = (itemLocations[p.id]?.city || '').toLowerCase();
    const q = where.trim().toLowerCase();
    if (!q) return true;
    return title.includes(q) || city.includes(q);
  });

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="space-y-8 sm:space-y-10">
        <div className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 pt-6 sm:pt-10 lg:pt-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01aaa7] mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading products...</h3>
              <p className="text-gray-600">Please wait while we fetch the latest listings</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Network error state
  if (networkError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-900">
        <div className="space-y-8 sm:space-y-10">
          <div className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 pt-6 sm:pt-10 lg:pt-12">
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <WifiOff className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">Connection Lost</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6">
                  Unable to connect to the server. Please check your internet connection and try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-my-primary hover:bg-my-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // General error state
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-900">
        <div className="space-y-8 sm:space-y-10">
          <div className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 pt-6 sm:pt-10 lg:pt-12">
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">Something went wrong</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-my-primary hover:bg-my-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && !error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-900">
        <div className="space-y-8 sm:space-y-10">
          <div className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 pt-6 sm:pt-10 lg:pt-12">
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                  <Package className="h-8 w-8 text-gray-600 dark:text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No products available</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6">
                  There are currently no products available for rent. Check back later or explore other categories.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-my-primary hover:bg-my-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                  <Link
                    to="/search"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary"
                  >
                    Browse All Categories
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-900">
      <div className="space-y-8 sm:space-y-10">
        {/* Search Bar removed (moved into Header) */}

        {/* Category chips removed to declutter above Popular listings */}

        {/* Results grid */}
        <div className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 pt-6 sm:pt-10 lg:pt-12">
          {/* Section header */}
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100">Popular listings</h2>
              <span className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-1 bg-my-primary/10 text-my-primary dark:bg-my-primary/20 dark:text-teal-400">
                <TrendingUp className="w-3 h-3" />
                AI trending
              </span>
              {loading && (
                <span className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Updating...
                </span>
              )}
              {/* Network status indicator */}
              <span className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-1 ${
                navigator.onLine 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              }`}>
                {navigator.onLine ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                {navigator.onLine ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="text-sm text-gray-600 dark:text-slate-400 hover:text-my-primary dark:hover:text-teal-400 transition-colors"
                title="Refresh products"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link to="/search" className="text-sm text-my-primary dark:text-teal-400 hover:underline">View all</Link>
            </div>
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.slice(0, 15).map((item, index) => (
            <Link key={item.id} to={`/it/${item.id}`} className="group"
              onClick={() => {
                const token = localStorage.getItem('token') || undefined;
                const userStr = localStorage.getItem('user');
                const userId = userStr ? (() => { try { return JSON.parse(userStr)?.id; } catch { return undefined; } })() : undefined;
                const payload = {
                  userId,
                  sessionId: localStorage.getItem('sessionId') || undefined,
                  actionType: 'click' as const,
                  targetType: 'product' as const,
                  targetId: item.id,
                  pageUrl: `/it/${item.id}`,
                  referrerUrl: document.referrer || '/homepage',
                  userAgent: navigator.userAgent,
                  deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' as const : 'desktop' as const,
                  metadata: { source: 'home_grid', position: index }
                };
                // fire-and-forget
                void logInteraction(payload, token);
              }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300 border border-gray-100 dark:border-slate-700">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  {productImages[item.id]?.[0] ? (
                    <img
                      src={productImages[item.id][0]}
                      alt={item.title || 'Listing'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Hide the image and show icon instead
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {/* No Image Icon */}
                  <div className={`${productImages[item.id]?.[0] ? 'hidden' : ''} flex flex-col items-center justify-center text-gray-400 dark:text-slate-500`}>
                    <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                  {/* Heart Icon */}
                  <button
                    type="button"
                    aria-label="Add to favorites"
                    className="absolute top-3 right-3 w-8 h-8 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const token = localStorage.getItem('token') || undefined;
                      if (!token) return; // optionally prompt login
                      const currentlyFav = Boolean(favoriteMap[item.id]);
                      // optimistic update
                      setFavoriteMap(prev => ({ ...prev, [item.id]: !currentlyFav }));
                      try {
                        if (currentlyFav) {
                          await removeUserFavorite(item.id, token);
                          void logInteraction({
                            actionType: 'unfavorite',
                            targetType: 'product',
                            targetId: item.id,
                            pageUrl: window.location.pathname,
                            userAgent: navigator.userAgent,
                            deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                          }, token);
                        } else {
                          await addUserFavorite(item.id, token);
                          void logInteraction({
                            actionType: 'favorite',
                            targetType: 'product',
                            targetId: item.id,
                            pageUrl: window.location.pathname,
                            userAgent: navigator.userAgent,
                            deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                          }, token);
                        }
                      } catch {
                        // revert on failure
                        setFavoriteMap(prev => ({ ...prev, [item.id]: currentlyFav }));
                      }
                    }}
                  >
                    <Heart className={`w-4 h-4 ${favoriteMap[item.id] ? 'text-red-500 fill-current' : 'text-white dark:text-slate-200'}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3 space-y-1">
                  {/* Title and Rating */}
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm leading-tight flex-1 pr-2">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      <span className="text-sm text-gray-900 dark:text-slate-100">
                        {item.average_rating || '4.8'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <p className="text-gray-600 dark:text-slate-400 text-sm">
                    {locationsLoading[item.id] ? (
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-gray-300 dark:border-slate-500 border-t-gray-600 dark:border-t-slate-300 rounded-full animate-spin"></div>
                        Loading location...
                      </span>
                    ) : (
                      <>
                        {itemLocations[item.id]?.city || 'Unknown Location'}
                        {itemLocations[item.id]?.country ? `, ${itemLocations[item.id]?.country}` : ''}
                      </>
                    )}
                  </p>
                  
                  {/* Price */}
                  <div className="text-gray-900 dark:text-slate-100 pt-1">
                    {productPrices[item.id]?.price_per_day ? (
                      <>
                        <span className="font-semibold">
                          {formatCurrency(productPrices[item.id].price_per_day, productPrices[item.id].currency)}
                        </span>
                        <span className="text-sm"> / day</span>
                      </>
                    ) : item.base_price_per_day != null ? (
                      <>
                        <span className="font-semibold">${item.base_price_per_day}</span>
                        <span className="text-sm"> / day</span>
                      </>
                    ) : (
                      <span className="font-semibold">Price on request</span>
                    )}
                  </div>

                  {/* Interactions */}
                  {productInteractions[item.id] && productInteractions[item.id].length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <span>👥</span>
                        <span>{productInteractions[item.id].length} recent interaction{productInteractions[item.id].length !== 1 ? 's' : ''}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

       
        </div>
      </div>
      
      {/* Padding between content and footer */}
      <div className="pb-8 sm:pb-10 lg:pb-12"></div>
    </div>
  );
};

export default HomePage;