import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, TrendingUp, AlertCircle, RefreshCw, Package, Wifi, WifiOff, Search, X, ShieldCheck, Sparkles, Handshake, Globe, Briefcase, Users } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from '../hooks/useTranslation';
import { TranslatedText } from '../components/translated-text';

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

const heroBackgrounds = [
  // 'url("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80")',
  // url("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80")','
  'url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80")'
];

const demandCities = ['Berlin', 'Jakarta', 'São Paulo', 'Nairobi'];

const featuredStories = [
  {
    id: 'seller-1',
    sellerName: 'Nomad Wheels',
    location: 'Lisbon, Portugal',
    story: 'Built a cross-border camper rental line with Uruti Bz safety checks.',
    avatarBg: 'bg-emerald-500',
    metrics: { listings: 38, countries: 6 },
    rating: 4.9,
    category: 'Mobility fleet',
    heroImage: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80',
    volume: '$2.4M GMV'
  },
  {
    id: 'seller-2',
    sellerName: 'Skyline Tools',
    location: 'Singapore, Singapore',
    story: 'Scaled B2B tool rentals to 4 markets using secure escrow handovers.',
    avatarBg: 'bg-blue-500',
    metrics: { listings: 112, countries: 4 },
    rating: 4.8,
    category: 'Industrial MRO',
    heroImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
    volume: '$4.1M GMV'
  },
  {
    id: 'seller-3',
    sellerName: 'Andes Outfitters',
    location: 'Cusco, Peru',
    story: 'Offers expedition gear with multilingual concierge for travelers.',
    avatarBg: 'bg-orange-500',
    metrics: { listings: 57, countries: 9 },
    rating: 4.95,
    category: 'Adventure gear',
    heroImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    volume: '$1.1M GMV'
  }
];

const quickActionItems = [
  {
    title: 'Global compliance ready',
    description: 'Automated KYC, insurance, and escrow templates per region.',
    icon: ShieldCheck,
    link: '/risk-management'
  },
  {
    title: 'Intelligent matching',
    description: 'AI surfaces the best buyers for idle inventory in seconds.',
    icon: Sparkles,
    link: '/items'
  },
  {
    title: 'Handshake logistics',
    description: 'Fleet inspections, courier scheduling, and damage coverage.',
    icon: Handshake,
    link: '/handover-return-demo'
  }
];

const HomePage: React.FC = () => {
  const { showToast } = useToast();
  const { tSync } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});
  const [itemLocations, setItemLocations] = useState<Record<string, { city: string | null; country: string | null }>>({});
  const [productPrices, setProductPrices] = useState<Record<string, any>>({});
  const [locationsLoading, setLocationsLoading] = useState<Record<string, boolean>>({});
  const [productInteractions, setProductInteractions] = useState<Record<string, any[]>>({});
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const [activeStory, setActiveStory] = useState(0);
  const [liveDemandData, setLiveDemandData] = useState(
    () => demandCities.map((city) => ({ city, requests: Math.floor(Math.random() * 35) + 15 }))
  );
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Enhanced search state for homepage
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchPriceMin, setSearchPriceMin] = useState('');
  const [searchPriceMax, setSearchPriceMax] = useState('');
  const [searchCheckIn, setSearchCheckIn] = useState('');
  const [searchCheckOut, setSearchCheckOut] = useState('');
  const [searchNearMe, setSearchNearMe] = useState(false);
  const [searchLat, setSearchLat] = useState('');
  const [searchLng, setSearchLng] = useState('');
  const [searchRadiusKm, setSearchRadiusKm] = useState(25);
  
  // Pagination state for showing more products
  const [visibleCount, setVisibleCount] = useState(100);
  
  // Loading state for fetching more products
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setNetworkError(false);
      
      const token = localStorage.getItem('token') || undefined;

      // Fetch ALL active products (both booked and non-booked)
      // Always skip availability check to show all products
      const result = await fetchAvailableProducts(token, true);
      const initial = result.data || [];
      setProducts(initial);
      
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

  useEffect(() => {
    const bgInterval = window.setInterval(() => {
      setHeroBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 8000);
    return () => window.clearInterval(bgInterval);
  }, []);

  useEffect(() => {
    const storyInterval = window.setInterval(() => {
      setActiveStory((prev) => (prev + 1) % featuredStories.length);
    }, 9000);
    return () => window.clearInterval(storyInterval);
  }, []);

  useEffect(() => {
    const liveDemandInterval = window.setInterval(() => {
      setLiveDemandData(
        demandCities.map((city) => ({
          city,
          requests: Math.floor(Math.random() * 35) + 15
        }))
      );
    }, 12000);
    return () => window.clearInterval(liveDemandInterval);
  }, []);

  // Listen for search events from Header
  useEffect(() => {
    const handleHomepageSearch = (event: CustomEvent) => {
      const { query, category, priceMin, priceMax, checkIn, checkOut, nearMe, lat, lng, radiusKm } = event.detail;
      
      setSearchQuery(query || '');
      setSearchCategory(category || '');
      setSearchPriceMin(priceMin || '');
      setSearchPriceMax(priceMax || '');
      setSearchCheckIn(checkIn || '');
      setSearchCheckOut(checkOut || '');
      setSearchNearMe(nearMe || false);
      setSearchLat(lat || '');
      setSearchLng(lng || '');
      setSearchRadiusKm(radiusKm || 25);
      
      // Reset visible count when searching
      setVisibleCount(100);
      
      // Show toast for search feedback
      if (query) {
        showToast(`Searching for "${query}"...`, 'info');
      }
    };

    window.addEventListener('homepageSearch', handleHomepageSearch as EventListener);
    
    return () => {
      window.removeEventListener('homepageSearch', handleHomepageSearch as EventListener);
    };
  }, [showToast]);

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

  // Apply comprehensive search filter for the visible grid
  const filtered = products.filter(p => {
    const title = (p.title || p.name || '').toString().toLowerCase();
    const description = (p.description || '').toString().toLowerCase();
    const city = (itemLocations[p.id]?.city || '').toLowerCase();
    const country = (itemLocations[p.id]?.country || '').toLowerCase();
    
    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesText = title.includes(query) || 
                         description.includes(query) || 
                         city.includes(query) || 
                         country.includes(query);
      if (!matchesText) return false;
    }
    
    // Category filter (match by id, slug, or name)
    if (searchCategory && searchCategory !== 'all') {
      const selected = String(searchCategory).toLowerCase();
      const productCategoryId = (p as any).category_id?.toString().toLowerCase() || '';
      const productCategoryName = (p.category || '').toString().toLowerCase();
      const productCategorySlug = productCategoryName.replace(/\s+/g, '-');
      const matches = [productCategoryId, productCategoryName, productCategorySlug]
        .some(v => v && v === selected);
      if (!matches) return false;
    }
    
    // Price filter
    if (searchPriceMin || searchPriceMax) {
      const productPrice = productPrices[p.id]?.price_per_day || p.base_price_per_day;
      if (productPrice != null) {
        const price = parseFloat(productPrice);
        if (searchPriceMin && price < parseFloat(searchPriceMin)) return false;
        if (searchPriceMax && price > parseFloat(searchPriceMax)) return false;
      }
    }
    
    // Date availability filter (simplified - would need more complex logic for real availability)
    if (searchCheckIn || searchCheckOut) {
      // For now, just pass through - in a real app, you'd check actual availability
      // This would require integration with booking/availability system
    }
    
    // Location filter (simplified - would need distance calculation)
    if (searchNearMe && searchLat && searchLng) {
      // For now, just pass through - in a real app, you'd calculate distance
      // This would require geolocation distance calculation
    }
    
    return true;
  });

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="space-y-8 sm:space-y-10">
        <div className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 pt-6 sm:pt-10 lg:pt-12">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01aaa7] mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2"><TranslatedText text="Loading Products" /></h3>
              <p className="text-gray-600"><TranslatedText text="Please wait while we fetch the latest listings..." /></p>
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2"><TranslatedText text="Connection Lost" /></h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6">
                  <TranslatedText text="We couldn't connect to the server. Please check your internet connection and try again." />
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-my-primary hover:bg-my-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    <TranslatedText text="Try Again" />
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary"
                  >
                    <TranslatedText text="Refresh Page" />
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2"><TranslatedText text="Something Went Wrong" /></h3>
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2"><TranslatedText text="No Products Found" /></h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6">
                  <TranslatedText text="Try adjusting your search filters or browse different categories." />
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="space-y-8 sm:space-y-10">
        {/* Hero Section */}
        <section className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 pt-6 sm:pt-10 lg:pt-12">
          <div
            className="rounded-3xl overflow-hidden border border-white/20 dark:border-white/10 shadow-xl relative"
            style={{
              backgroundImage: heroBackgrounds[heroBgIndex],
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-slate-900/80"></div>
            <div className="relative px-8 sm:px-12 lg:px-16 py-10 sm:py-14 lg:py-16 text-white flex flex-col lg:flex-row gap-10 lg:gap-16">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <TranslatedText text="Trusted rentals across 45+ countries" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
                    {tSync('Rent anything, anywhere — with Uruti Bz protection')}
                  </h1>
                  <p className="text-base sm:text-lg text-white/80 max-w-2xl">
                    {tSync('Connect with verified hosts, manage multilingual inspections, and grow your rental business with real-time risk insights.')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/create-listing"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 font-semibold shadow-lg shadow-slate-900/10 hover:bg-slate-100 transition-colors"
                  >
                    <TranslatedText text="Start selling" />
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    to="/items"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
                  >
                    <TranslatedText text="Find inventory" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-white/80">
                  <div>
                    <p className="text-3xl font-semibold text-white">210K+</p>
                    <p><TranslatedText text="Monthly rentals" /></p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-white">76</p>
                    <p><TranslatedText text="Markets launched" /></p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-white">24/7</p>
                    <p><TranslatedText text="Live inspections" /></p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-white">18</p>
                    <p><TranslatedText text="Languages supported" /></p>
                  </div>
                </div>
              </div>
              <div className="w-full lg:max-w-sm">
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 space-y-6 border border-white/10">
                  <div className="flex justify-between items-center">
                    <p className="text-sm uppercase tracking-wide text-white/70"><TranslatedText text="Live demand" /></p>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full"><TranslatedText text="Updated now" /></span>
                  </div>
                  <ul className="space-y-4 text-sm">
                    {liveDemandData.map((slot) => (
                      <li key={slot.city} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                          <span>{slot.city}</span>
                        </div>
                        <span className="text-white/70">{slot.requests} <TranslatedText text="active requests" /></span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-4 rounded-xl bg-black/20">
                    <p className="text-sm text-white/70"><TranslatedText text="Need help launching in a new region?" /></p>
                    <p className="text-lg font-semibold"><TranslatedText text="Dedicated onboarding team is live." /></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise trust and quick actions */}
        <section className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-my-primary/10 text-my-primary">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-my-primary uppercase tracking-wide"><TranslatedText text="Enterprise-ready" /></p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    <TranslatedText text="Designed for international rental operators" />
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700">
                  <ShieldCheck className="w-4 h-4 text-my-primary" />
                  <TranslatedText text="Insurance-ready workflows" />
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700">
                  <Users className="w-4 h-4 text-my-primary" />
                  <TranslatedText text="Verified identity network" />
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700">
                  <Briefcase className="w-4 h-4 text-my-primary" />
                  <TranslatedText text="Enterprise SLAs" />
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActionItems.map((card) => (
                <Link
                  key={card.title}
                  to={card.link}
                  className="group h-full rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/60 p-6 flex flex-col gap-4 hover:border-my-primary hover:bg-white dark:hover:bg-slate-900 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-my-primary shadow-sm">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">{tSync(card.title)}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{tSync(card.description)}</p>
                  </div>
                  <span className="mt-auto text-sm font-semibold text-my-primary group-hover:underline flex items-center gap-2">
                    <TranslatedText text="Explore" /> <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured stories */}
        <section className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-my-primary font-semibold uppercase tracking-[0.2em]"><TranslatedText text="Featured sellers" /></p>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-slate-100">
                  <TranslatedText text="Stories from the Uruti Bz community" />
                </h2>
                <p className="text-gray-500 dark:text-slate-400 max-w-2xl">
                  <TranslatedText text="Operators in 70+ cities scale their rental businesses with Uruti Bz compliance, multilingual support, and intelligence that rivals the biggest marketplaces." />
                </p>
              </div>
            </div>

            {featuredStories[activeStory] && (
              <div className="flex flex-col lg:flex-row gap-8">
                <article className="relative flex-1 overflow-hidden rounded-3xl h-[420px]">
                  <img
                    src={featuredStories[activeStory].heroImage}
                    alt={featuredStories[activeStory].sellerName}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent" />
                  <div className="relative h-full p-8 flex flex-col justify-between text-white">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                        {featuredStories[activeStory].category}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full ${featuredStories[activeStory].avatarBg} text-white flex items-center justify-center text-xl font-semibold`}>
                          {featuredStories[activeStory].sellerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xl font-semibold">{featuredStories[activeStory].sellerName}</p>
                          <p className="text-white/80">{featuredStories[activeStory].location}</p>
                        </div>
                      </div>
                      <p className="text-lg leading-relaxed">{featuredStories[activeStory].story}</p>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm text-white/80">
                      <span className="inline-flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-300" />
                        {featuredStories[activeStory].rating} <TranslatedText text="avg rating" />
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {featuredStories[activeStory].metrics.listings} <TranslatedText text="active listings" />
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {featuredStories[activeStory].metrics.countries} <TranslatedText text="countries" />
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {featuredStories[activeStory].volume}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to="/items"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-semibold shadow-lg hover:bg-slate-100"
                      >
                        <TranslatedText text="View inventory" /> →
                      </Link>
                      <Link
                        to="/create-listing"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/30 text-white hover:bg-white/10"
                      >
                        <TranslatedText text="Become a featured seller" />
                      </Link>
                    </div>
                  </div>
                </article>

                <div className="w-full lg:w-80 space-y-4">
                  {featuredStories.map((story, index) => (
                    <button
                      key={story.id}
                      onClick={() => setActiveStory(index)}
                      className={`w-full text-left rounded-2xl border p-4 flex items-center justify-between gap-4 transition-all ${
                        index === activeStory
                          ? 'border-my-primary bg-my-primary/10 dark:bg-teal-900/20'
                          : 'border-gray-100 dark:border-slate-800 hover:border-my-primary/60'
                      }`}
                    >
                      <div>
                        <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-slate-400">{story.category}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">{story.sellerName}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{story.location}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600 dark:text-slate-300">
                        <p className="font-semibold">{story.volume}</p>
                        <p>{story.metrics.listings} listings</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                'Buyer protection included',
                'Multilingual concierge',
                'AI-powered pricing',
                'Same-day payouts'
              ].map((promise) => (
                <div key={promise} className="rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                  {tSync(promise)}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Results grid */}
        <div className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20">
          {/* Section header */}
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100">
                {searchQuery ? <><TranslatedText text="Search Results" /> "{searchQuery}"</> : <TranslatedText text="Popular Listings" />}
              </h2>
              {searchQuery ? (
                <span className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Search className="w-3 h-3" />
                  {filtered.length} <TranslatedText text="results" />
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-1 bg-my-primary/10 text-my-primary dark:bg-my-primary/20 dark:text-teal-400">
                  <TrendingUp className="w-3 h-3" />
                  <TranslatedText text="AI Trending" />
                </span>
              )}
              {loading && (
                <span className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <TranslatedText text="Updating..." />
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
                {navigator.onLine ? <TranslatedText text="Online" /> : <TranslatedText text="Offline" />}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchCategory('');
                    setSearchPriceMin('');
                    setSearchPriceMax('');
                    setSearchCheckIn('');
                    setSearchCheckOut('');
                    setSearchNearMe(false);
                    setSearchLat('');
                    setSearchLng('');
                    setSearchRadiusKm(25);
                    setVisibleCount(100);
                    showToast(tSync('Search cleared'), 'info');
                  }}
                  className="text-sm text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title={tSync('Clear Search')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="text-sm text-gray-600 dark:text-slate-400 hover:text-my-primary dark:hover:text-teal-400 transition-colors"
                title={tSync('Refresh')}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => {
                  setLoadingMore(true);
                  fetchProducts().finally(() => setLoadingMore(false));
                }}
                disabled={loading || loadingMore}
                className="text-sm text-my-primary dark:text-teal-400 hover:underline disabled:opacity-50"
              >
                {loadingMore ? <TranslatedText text="Fetching..." /> : <TranslatedText text="Fetch All Products" />}
              </button>
              <Link to="/items" className="text-sm text-my-primary dark:text-teal-400 hover:underline"><TranslatedText text="View All" /></Link>
            </div>
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.slice(0, visibleCount).map((item, index) => (
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
                      alt={item.title || tSync('Product listing')}
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
                    <span className="text-sm font-medium"><TranslatedText text="No Image" /></span>
                  </div>
                  {/* Heart Icon */}
                  <button
                    type="button"
                    aria-label={tSync('Add to favorites')}
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
                        <TranslatedText text="Loading location..." />
                      </span>
                    ) : (
                      <>
                        {itemLocations[item.id]?.city || <TranslatedText text="Unknown Location" />}
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
                        <span className="text-sm"> / <TranslatedText text="per day" /></span>
                      </>
                    ) : item.base_price_per_day != null ? (
                      <>
                        <span className="font-semibold">${item.base_price_per_day}</span>
                        <span className="text-sm"> / <TranslatedText text="per day" /></span>
                      </>
                    ) : (
                      <span className="font-semibold"><TranslatedText text="Price on Request" /></span>
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

        {/* Load More Button */}
        {filtered.length > visibleCount && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount(prev => Math.min(prev + 15, filtered.length))}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-my-primary hover:bg-my-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-my-primary transition-colors"
            >
              <Package className="w-4 h-4 mr-2" />
              <TranslatedText text="Load More" /> ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {/* Show total count */}
        <div className="text-center mt-4 text-sm text-gray-600 dark:text-slate-400">
          <TranslatedText text="Showing" /> {Math.min(visibleCount, filtered.length)} <TranslatedText text="of" /> {filtered.length} <TranslatedText text="products" />
        </div>
       
        </div>
      </div>
      
      {/* Padding between content and footer */}
      <div className="pb-8 sm:pb-10 lg:pb-12"></div>
    </div>
  );
};

export default HomePage;