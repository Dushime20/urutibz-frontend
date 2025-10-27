import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, MapPin, Calendar, Clock, Shield, TrendingUp, Eye, MousePointer, ThumbsUp, Search, Filter, X, Camera, Laptop, Car, Gamepad2, Headphones, Watch, Package, Grid, List, ChevronDown, AlertCircle, Truck } from 'lucide-react';

import { fetchAvailableProducts, fetchActiveDailyPrice, fetchCategories, addUserFavorite, removeUserFavorite, getUserFavorites } from './admin/service';
import { getProductImagesByProductId } from './my-account/service/api';
import { wkbHexToLatLng, getCityFromCoordinates } from '../lib/utils';
import { formatCurrency } from '../lib/utils';
import Button from '../components/ui/Button';
import { useI18n } from '../contexts/I18nContext';

// Product type definition with better typing
type Product = {
  id: string;
  owner_id?: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  category_id?: string;
  status?: string;
  condition?: string;
  price: number;
  base_price_per_day?: string;
  base_currency?: string;
  base_price_per_week?: string;
  base_price_per_month?: string;
  pickup_methods?: string[];
  specifications?: Record<string, any>;
  features?: string[];
  rating?: number;
  totalReviews?: number;
  average_rating?: string;
  review_count?: number;
  view_count?: number;
  tags?: string[];
  featured?: boolean;
  images?: string[];
  location?: any;
  availability?: any;
  deliveryAvailable?: boolean;
  createdAt?: string;
  updated_at?: string;
};

// Image type for better TypeScript support
interface ProductImage {
  url?: string;
  image_url?: string;
  path?: string;
}


// Note: wkbHexToLatLng and getCityFromCoordinates are imported from ../lib/utils



const ItemSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
     // Results state
   const [items, setItems] = useState<Product[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [totalResults, setTotalResults] = useState(0);
   const [productImages, setProductImages] = useState<{ [productId: string]: string[] }>({});
   const [itemLocations, setItemLocations] = useState<{ [id: string]: { city: string | null, country: string | null } }>({});
   const [locationsLoading, setLocationsLoading] = useState<Record<string, boolean>>({});
   const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
   
   // Categories state
   const [itemCategories, setItemCategories] = useState<Array<{ id: string; name: string; icon?: string }>>([]);

  // Filter and search logic
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token') || undefined;
        
        const result = await fetchAvailableProducts(token, false); // Full filtering for search page
        
        if (result.error) {
          setError(result.error);
          return;
        }
        
        const productList = result.data || [];
        setTotalResults(result.total || productList.length);
        
                 // Process item locations - will be handled by separate useEffect
         const processedItems = productList;

        // Enrich with active daily price and currency
        const enrichedItems = await Promise.all(processedItems.map(async (item: Product) => {
          try {
            const { pricePerDay, currency } = await fetchActiveDailyPrice(item.id);
            return {
              ...item,
              base_price_per_day: pricePerDay != null ? String(pricePerDay) : (item.base_price_per_day ?? null),
              base_currency: currency ?? (item.base_currency ?? null),
            } as Product;
          } catch {
            return item as Product;
          }
        }));

        // Fetch images for each product with proper error handling
        const imagesMap: { [productId: string]: string[] } = {};
        
        await Promise.all(enrichedItems.map(async (item: Product) => {
          try {
            const images = await getProductImagesByProductId(item.id);
            
            // Simple image extraction like in my-account
            const normalizedImages: string[] = [];
            
            if (Array.isArray(images)) {
              images.forEach((img: any) => {
                if (img && img.image_url) {
                  normalizedImages.push(img.image_url);
                }
              });
            }

            imagesMap[item.id] = normalizedImages.length > 0 ? normalizedImages : [];
          } catch (error) {
            imagesMap[item.id] = [];
          }
        }));

        setProductImages(imagesMap);
        setItems(enrichedItems);
      } catch (err) {
        setError('Failed to load items');
      } finally {
        setLoading(false);
      }
    };

         fetchItems();
   }, []);

   // Resolve city/country from product.location or product.geometry
   // Note: Locations load sequentially to avoid overwhelming the geocoding API
   useEffect(() => {
     let isMounted = true;
     async function loadLocations() {
       const map: Record<string, { city: string | null; country: string | null }> = {};
       const loadingMap: Record<string, boolean> = {};
       
       // Process only the first batch of products to reduce API load
       const productsToProcess = items.slice(0, 8); // Limit to first 8 items for initial display
       
       // Set loading state for all products that will be processed
       productsToProcess.forEach(item => {
         loadingMap[item.id] = true;
       });
       setLocationsLoading(loadingMap);
       
       const tasks = productsToProcess.map(async (item: Product) => {
         let lat: number | undefined; let lng: number | undefined;
         
         // Try to extract coordinates from different possible fields
         const locationSources = [item.location, (item as any).geometry];
         
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
     if (items.length) loadLocations();
     return () => { isMounted = false; };
   }, [items]);

  // Fetch categories
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const categories = await fetchCategories();
        
        if (Array.isArray(categories) && categories.length > 0) {
          setItemCategories(categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.iconName || '📦'
          })));
        } else {
          // Set default categories if API returns empty array
          setItemCategories([
            { id: 'photography', name: 'Photography', icon: '📷' },
            { id: 'electronics', name: 'Electronics', icon: '💻' },
            { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
            { id: 'gaming', name: 'Gaming', icon: '🎮' },
            { id: 'music', name: 'Music', icon: '🎧' },
            { id: 'tools', name: 'Tools', icon: '🔧' },
            { id: 'outdoor', name: 'Outdoor', icon: '🏕️' },
            { id: 'other', name: 'Other', icon: '📦' }
          ]);
        }
      } catch (err) {
        // Set default categories if API fails
        setItemCategories([
          { id: 'photography', name: 'Photography', icon: '📷' },
          { id: 'electronics', name: 'Electronics', icon: '💻' },
          { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
          { id: 'gaming', name: 'Gaming', icon: '🎮' },
          { id: 'music', name: 'Music', icon: '🎧' },
          { id: 'tools', name: 'Tools', icon: '🔧' },
          { id: 'outdoor', name: 'Outdoor', icon: '🏕️' },
          { id: 'other', name: 'Other', icon: '📦' }
        ]);
      }
    };

         fetchCategoriesData();
   }, []);

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
       } catch {
         // ignore favorites loading errors silently
       }
     })();
   }, []);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedLocation !== 'all') params.set('location', selectedLocation);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedLocation, setSearchParams]);

  const handleItemClick = (itemId: string) => {
    navigate(`/it/${itemId}`);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      photography: Camera,
      electronics: Laptop,
      vehicles: Car,
      gaming: Gamepad2,
      music: Headphones,
      tools: Watch,
      outdoor: Package,
      events: Package,
      sports: Package,
      home: Package,
      fashion: Package,
      fitness: Package,
      travel: Package,
      books: Package,
      art: Package,
      other: Package
    };
    return iconMap[category] || Package;
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setPriceRange({ min: 0, max: 1000 });
    setSortBy('relevance');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-900">
             {/* Enhanced Search Header */}
       <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
         <div className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 py-6">
          {/* Main Search Section */}
          <div className="flex flex-col gap-6">
            {/* Search Bar */}
            {/* <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items to rent..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none transition-all duration-200 text-lg"
                aria-label="Search for rental items"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div> */}
            
            {/* Quick Filters Row */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-my-primary focus:border-my-primary bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 min-w-48 cursor-pointer transition-all duration-200"
                  aria-label="Select category"
                >
                  <option value="all">All Categories</option>
                  {itemCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-my-primary focus:border-my-primary bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 min-w-40 cursor-pointer transition-all duration-200"
                  aria-label="Select location"
                >
                  <option value="all">All Locations</option>
                  <option value="Kigali">🇷🇼 Kigali</option>
                  <option value="Butare">🇷🇼 Butare</option>
                  <option value="Kampala">🇺🇬 Kampala</option>
                  <option value="Nairobi">🇰🇪 Nairobi</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all duration-200 ${
                  showFilters ? 'border-my-primary bg-my-primary/5 dark:bg-my-primary/10 text-my-primary dark:text-teal-400' : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300'
                }`}
                aria-label={showFilters ? 'Hide filters' : 'Show more filters'}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">More Filters</span>
              </button>

              {/* View Toggle */}
              <div className="ml-auto flex border border-gray-300 dark:border-slate-600 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 flex items-center gap-2 transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-my-primary dark:bg-teal-500 text-white' 
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 flex items-center gap-2 transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-my-primary dark:bg-teal-500 text-white' 
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-800 animate-in slide-in-from-top duration-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Price Range (USD)</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                      placeholder="Min"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary outline-none transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                      placeholder="Max"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary outline-none transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary outline-none transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-end">
                  <Button
                    onClick={clearAllFilters}
                    className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

             {/* Main Content */}
       <div className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 py-8">
        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-400 px-6 py-4 rounded-2xl mb-8 animate-in fade-in duration-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 text-red-600 dark:text-red-400" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              {searchQuery ? `Results for "${searchQuery}"` : 'Browse Rentals'}
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              {loading ? 'Searching...' : `${totalResults} items available`}
            </p>
          </div>
        </div>

        {/* Category Quick Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8 scroll-smooth">
          {itemCategories.slice(0, 8).map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-200 font-medium ${
                selectedCategory === category.id
                  ? 'bg-my-primary dark:bg-teal-500 text-white shadow-lg shadow-my-primary/25 dark:shadow-teal-500/25'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Results Grid/List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-my-primary dark:border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 dark:text-slate-400 font-medium">Finding the perfect items for you...</p>
          </div>
        ) : items.length > 0 ? (
                     <div className={viewMode === 'grid' 
             ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
             : 'space-y-6'
           }>
            {items.map((item) => {
              if (!item.id || typeof item.id !== 'string') return null;
              const id = item.id as string;
              const IconComponent = getCategoryIcon(item.category || '');
              
              return viewMode === 'grid' ? (
                // Enhanced Grid View
                                 <div
                   key={id}
                   onClick={() => handleItemClick(id)}
                   className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-slate-700"
                 >
                   {/* Image Container */}
                   <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                     {productImages[item.id]?.[0] ? (
                       <img
                         src={productImages[item.id][0]}
                         alt={item.title || item.name}
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
                       <svg className="w-12 h-12 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                       <span className="text-xs font-medium">No Image</span>
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
                           } else {
                             await addUserFavorite(item.id, token);
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
                       {item.base_price_per_day != null && item.base_currency ? (
                         <>
                           <span className="font-semibold">
                             {item.base_currency === 'USD' ? '$' : item.base_currency} {item.base_price_per_day}
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
                   </div>
                 </div>
              ) : (
                // Enhanced List View
                <div
                  key={id}
                  onClick={() => handleItemClick(id)}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex gap-6">
                    <div className="relative flex-shrink-0 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                      {productImages[item.id]?.[0] ? (
                        <img
                          src={productImages[item.id][0]}
                          alt={item.title || item.name}
                          className="w-28 h-28 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Hide the image and show icon instead
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      {/* No Image Icon */}
                      <div className={`${productImages[item.id]?.[0] ? 'hidden' : ''} flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 w-28 h-28`}>
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium">No Image</span>
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-white dark:bg-slate-600 rounded-full p-1.5 shadow-sm">
                          <IconComponent className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg mb-1">{item.title || item.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                                                 <button 
                           className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors ml-4"
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
                               } else {
                                 await addUserFavorite(item.id, token);
                               }
                             } catch {
                               // revert on failure
                               setFavoriteMap(prev => ({ ...prev, [item.id]: currentlyFav }));
                             }
                           }}
                         >
                           <Heart className={`w-5 h-5 ${favoriteMap[item.id] ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-slate-400'} hover:text-red-500 transition-colors`} />
                         </button>
                      </div>
                      
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{item.average_rating || '0.00'}</span>
                          <span className="text-sm text-gray-600 dark:text-slate-400">({item.review_count || 0})</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">
                            {itemLocations[item.id]?.city || 'Unknown'}{itemLocations[item.id]?.country ? `, ${itemLocations[item.id]?.country}` : ''}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-my-primary dark:text-teal-400">
                              {item.base_price_per_day != null && item.base_currency ? `$${item.base_price_per_day}` : 'No price'}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-slate-400">{item.base_price_per_day != null && item.base_currency ? `/${item.base_currency}` : ''}</span>
                          </div>
                          {item.condition && (
                            <span className="text-xs px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                              {item.condition}
                            </span>
                          )}
                          {item.pickup_methods?.includes('delivery') && (
                            <div className="flex items-center gap-1">
                              <Truck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Delivery</span>
                            </div>
                          )}
                          {item.pickup_methods?.includes('pickup') && (
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Pickup</span>
                            </div>
                          )}
                        </div>
                        <Button className="px-6 py-2.5 bg-my-primary dark:bg-teal-500 hover:bg-my-primary/90 dark:hover:bg-teal-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                          View Details
                        </Button>
                      </div>
                      
                      {/* Features in list view */}
                      {item.features && item.features.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {item.features.slice(0, 4).map((feature, index) => (
                              <span key={index} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                                {feature}
                              </span>
                            ))}
                            {item.features.length > 4 && (
                              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                                +{item.features.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md mx-auto">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">No items found</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We couldn't find any items matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <Button 
                onClick={clearAllFilters}
                className="px-6 py-3 bg-[#00aaa9] hover:bg-[#008b8a] text-white rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemSearchPage;
