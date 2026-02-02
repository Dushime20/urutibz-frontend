import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Star, Heart, MapPin, Calendar, Clock, Shield, TrendingUp, Eye, MousePointer, ThumbsUp, Search, Filter, X, Camera, Laptop, Car, Gamepad2, Headphones, Watch, Package, Grid, List, ChevronDown, AlertCircle, Truck, ShoppingCart, Check, Sparkles, Navigation } from 'lucide-react';
import MapSearchView from '../components/map/MapSearchView';

import { fetchAvailableProducts, fetchAllProducts, fetchActiveDailyPrice, fetchCategories, addUserFavorite, removeUserFavorite, getUserFavorites } from './admin/service';
import { getProductImagesByProductId } from './my-account/service/api';
import { ImageSearchResult } from './admin/service/imageSearch';
import { wkbHexToLatLng, getCityFromCoordinates } from '../lib/utils';
import { formatCurrency } from '../lib/utils';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { TranslatedText } from '../components/translated-text';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AddToCartModal from '../components/cart/AddToCartModal';
import axios from '../lib/http';
import { API_BASE_URL } from './admin/service/config';

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
  address_line?: string;
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


// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Extract coordinates from product location
function extractProductCoordinates(product: Product): { lat: number; lng: number } | null {
  let lat: number | undefined;
  let lng: number | undefined;

  const locationSources = [product.location, (product as any).geometry];

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
    return { lat, lng };
  }
  return null;
}

// Format distance for display
function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}

// Note: wkbHexToLatLng and getCityFromCoordinates are imported from ../lib/utils



const ItemSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { isInCart } = useCart();

  // Check if we have image search results from navigation state
  const imageSearchResults = (location.state as any)?.imageSearchResults as ImageSearchResult[] | undefined;
  const searchMode = (location.state as any)?.searchMode as string | undefined;

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'all');
  const searchType = searchParams.get('searchType');
  const aiPrompt = searchParams.get('prompt');

  const [priceRange, setPriceRange] = useState({
    min: Number(searchParams.get('priceMin') || 0),
    max: Number(searchParams.get('priceMax') || 0),
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; radiusKm: number } | null>(null);

  // Sync state with URL parameters when URL changes (e.g., from AI Modal navigation)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'all';
    const loc = searchParams.get('location') || 'all';
    const min = searchParams.get('priceMin') || '0';
    const max = searchParams.get('priceMax') || '0';

    if (q !== searchQuery) setSearchQuery(q);
    if (cat !== selectedCategory) setSelectedCategory(cat);
    if (loc !== selectedLocation) setSelectedLocation(loc);
    if (Number(min) !== priceRange.min) setPriceRange(prev => ({ ...prev, min: Number(min) }));
    if (Number(max) !== priceRange.max) setPriceRange(prev => ({ ...prev, max: Number(max) }));
  }, [searchParams]); // Synchronize all parameters correctly including absent ones

  // Results state
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [productImages, setProductImages] = useState<{ [productId: string]: string[] }>({});
  const [itemLocations, setItemLocations] = useState<{ [id: string]: { city: string | null, country: string | null } }>({});
  const [locationsLoading, setLocationsLoading] = useState<Record<string, boolean>>({});
  const [relatedCategories, setRelatedCategories] = useState<any[]>([]);
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [selectedProductForCart, setSelectedProductForCart] = useState<Product | null>(null);
  const [translatedAttrs, setTranslatedAttrs] = useState<Record<string, string>>({});
  const [translatedProductNames, setTranslatedProductNames] = useState<Record<string, string>>({});
  const [translatedCategoryNames, setTranslatedCategoryNames] = useState<Record<string, string>>({});

  // Categories state
  const [itemCategories, setItemCategories] = useState<Array<{ id: string; name: string; icon?: string }>>([]);

  // Translate attributes
  useEffect(() => {
    const translateAttributes = async () => {
      const keys = [
        'Remove from favorites', 'Add to favorites', 'Add to cart',
        'Please log in to add products to favorites', 'Removed from favorites',
        'Added to favorites', 'Failed to update favorites',
        'Please log in to add items to cart', 'Min', 'Max'
      ];
      const translations: Record<string, string> = {};
      await Promise.all(keys.map(async (key) => {
        const translated = await t(key);
        translations[key] = translated;
      }));
      setTranslatedAttrs(translations);
    };
    translateAttributes();
  }, [t, language]);

  // Translate product names for alt attributes
  useEffect(() => {
    const translateProductNames = async () => {
      const productNames: Record<string, string> = {};
      await Promise.all(items.map(async (item) => {
        const productName = item.title || item.name || 'Product';
        if (productName && productName !== 'Product') {
          const translated = await t(productName);
          productNames[item.id] = translated;
        } else {
          productNames[item.id] = productName;
        }
      }));
      setTranslatedProductNames(productNames);
    };
    if (items.length > 0) {
      translateProductNames();
    }
  }, [items, t, language]);

  // Translate category names
  useEffect(() => {
    const translateCategoryNames = async () => {
      const categoryNames: Record<string, string> = {};
      await Promise.all(itemCategories.map(async (category) => {
        const translated = await t(category.name);
        categoryNames[category.id] = translated;
      }));
      setTranslatedCategoryNames(categoryNames);
    };
    if (itemCategories.length > 0) {
      translateCategoryNames();
    }
  }, [itemCategories, t, language]);

  // Handle image search results
  useEffect(() => {
    if (imageSearchResults && searchMode === 'image') {
      // Convert image search results to product format
      const convertedProducts: Product[] = imageSearchResults.map((result) => ({
        id: result.product.id,
        title: result.product.title,
        description: result.product.description,
        price: typeof result.product.base_price_per_day === 'number'
          ? result.product.base_price_per_day
          : (typeof result.product.base_price_per_day === 'string'
            ? parseFloat(result.product.base_price_per_day) || 0
            : 0),
        base_price_per_day: String(result.product.base_price_per_day),
        base_currency: result.product.currency,
        images: [result.image.url],
        // Add similarity as a custom property for display
        similarity: result.similarity,
        similarity_percentage: result.similarity_percentage,
      } as Product));

      setItems(convertedProducts);
      setTotalResults(convertedProducts.length);
      setLoading(false);

      // Set product images
      const imagesMap: { [productId: string]: string[] } = {};
      imageSearchResults.forEach((result) => {
        imagesMap[result.product.id] = [result.image.url];
      });
      setProductImages(imagesMap);
    }
  }, [imageSearchResults, searchMode]);

  // Filter and search logic
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token') || undefined;

        // Fetch logic
        let productList: Product[] = [];
        let total = 0;

        if (searchType === 'ai' && aiPrompt) {
          // AI Search Mode
          console.log('Performing AI Search:', aiPrompt);
          const res = await axios.get(`${API_BASE_URL}/products/ai-search`, {
            params: { prompt: aiPrompt, limit: 100 }
          });
          if (res.data?.success) {
            productList = res.data.data?.data || (Array.isArray(res.data.data) ? res.data.data : []);
            total = res.data.data?.total || res.data.pagination?.total || productList.length;
            // If AI derived filters, we could optionally update local filter state here
            // to reflect what AI "chose"
          } else {
            throw new Error(res.data?.message || 'AI Search failed');
          }
        } else {
          // Standard Mode with Server-side Filtering
          console.log('Fetching filtered products:', {
            searchQuery,
            selectedCategory,
            priceRange,
            mapLocation,
            sortBy
          });

          const result = await fetchAllProducts(
            token,
            false,
            1,
            100, // Fetch first 100 for now
            'active',
            sortBy,
            searchQuery,
            selectedCategory,
            priceRange.min,
            priceRange.max,
            mapLocation?.lat,
            mapLocation?.lng,
            mapLocation?.radiusKm
          );

          if (result.error) {
            console.error('Error fetching products:', result.error);
            setError(result.error);
            setItems([]);
            setTotalResults(0);
            setRelatedCategories([]);
            return;
          }
          productList = result.data || [];
          total = result.total || productList.length;

          // Capture related categories from metadata
          if (result.meta?.relatedCategories) {
            setRelatedCategories(result.meta.relatedCategories);
          } else {
            setRelatedCategories([]);
          }
        }

        setTotalResults(total);

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
      } catch (err: any) {
        console.error('Error fetching items:', err);
        const errorMessage = err?.message || 'Failed to load items. Please try again.';
        setError(errorMessage);
        // Set empty state to prevent blank page
        setItems([]);
        setTotalResults(0);
        setProductImages({});
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [searchType, aiPrompt, searchQuery, selectedCategory, sortBy, priceRange.min, priceRange.max, mapLocation]);

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

  // Initialize map location from URL params
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radiusKm = searchParams.get('radiusKm');
    if (lat && lng) {
      setMapLocation({
        lat: Number(lat),
        lng: Number(lng),
        radiusKm: radiusKm ? Number(radiusKm) : 25
      });
    }
  }, []);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedLocation !== 'all') params.set('location', selectedLocation);
    if (priceRange.min > 0) params.set('priceMin', String(priceRange.min));
    if (priceRange.max > 0) params.set('priceMax', String(priceRange.max));
    if (mapLocation) {
      params.set('lat', mapLocation.lat.toString());
      params.set('lng', mapLocation.lng.toString());
      params.set('radiusKm', mapLocation.radiusKm.toString());
      params.set('nearMe', 'true');
    }
    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedLocation, priceRange.min, priceRange.max, mapLocation, setSearchParams]);

  // Derived filtered and sorted items based on selected filters
  const filteredItems = React.useMemo(() => {
    try {
      const query = (searchQuery || '').toLowerCase();
      const selectedCat = (selectedCategory || '').toLowerCase();
      const selectedLoc = selectedLocation;

      let list = items.filter((item) => {
        const title = (item.title || item.name || '').toString().toLowerCase();
        const description = (item.description || '').toString().toLowerCase();
        const city = (itemLocations[item.id]?.city || '').toString();
        const country = (itemLocations[item.id]?.country || '').toString();

        // Text search
        if (query) {
          const matchesText = title.includes(query) || description.includes(query) || city.toLowerCase().includes(query) || country.toLowerCase().includes(query);
          if (!matchesText) return false;
        }

        // Category filter (match by id, name or slug)
        if (selectedCat && selectedCat !== 'all') {
          const itemCategoryId = (item.category_id || (item as any).categoryId || '').toString().toLowerCase();
          const itemCategoryName = (item.category || '').toString().toLowerCase();
          const itemCategorySlug = itemCategoryName.replace(/\s+/g, '-');
          const catMatches = [itemCategoryId, itemCategoryName, itemCategorySlug].some(v => v && v === selectedCat);
          if (!catMatches) return false;
        }

        // Location filter (simple exact match on city or country label)
        if (selectedLoc && selectedLoc !== 'all') {
          const locMatches = city === selectedLoc || country === selectedLoc;
          if (!locMatches) return false;
        }

        // Price filter
        const pricePerDay = item.base_price_per_day != null ? Number(item.base_price_per_day) : (typeof item.price === 'number' ? item.price : undefined);
        if (priceRange.min != null && priceRange.min > 0 && pricePerDay != null && pricePerDay < priceRange.min) return false;
        if (priceRange.max != null && priceRange.max > 0 && pricePerDay != null && pricePerDay > priceRange.max) return false;

        return true;
      });

      // Sorting
      list = [...list].sort((a, b) => {
        const aPrice = a.base_price_per_day != null ? Number(a.base_price_per_day) : (typeof a.price === 'number' ? a.price : 0);
        const bPrice = b.base_price_per_day != null ? Number(b.base_price_per_day) : (typeof b.price === 'number' ? b.price : 0);
        switch (sortBy) {
          case 'price-low':
            return aPrice - bPrice;
          case 'price-high':
            return bPrice - aPrice;
          case 'rating':
            return Number(b.average_rating || 0) - Number(a.average_rating || 0);
          case 'newest':
            return new Date(b.updated_at || b.createdAt || 0).getTime() - new Date(a.updated_at || a.createdAt || 0).getTime();
          case 'relevance':
          default:
            return 0;
        }
      });

      return list;
    } catch (error) {
      console.error('Error filtering items:', error);
      return []; // Return empty array on error to prevent blank page
    }
  }, [items, itemLocations, searchQuery, selectedCategory, selectedLocation, priceRange.min, priceRange.max, sortBy]);

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
    setPriceRange({ min: 0, max: 0 });
    setSortBy('relevance');
    setMapLocation(null); // Clear location-based filtering

    // Clear AI search parameters from URL
    const params = new URLSearchParams(searchParams);
    params.delete('searchType');
    params.delete('prompt');
    params.delete('lat');
    params.delete('lng');
    params.delete('radiusKm');
    params.delete('nearMe');
    setSearchParams(params);
  };

  // Early return for critical errors to prevent blank page
  if (error && items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            <TranslatedText text="Unable to Load Items" />
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold"
          >
            <TranslatedText text="Reload Page" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-900">
      {/* Enhanced Search Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-9xl mx-auto px-6 lg:px-20 py-6">
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
                      {category.icon} {translatedCategoryNames[category.id] || category.name}
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
                className={`px-4 py-3 border rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all duration-200 ${showFilters ? 'border-my-primary bg-my-primary/5 dark:bg-my-primary/10 text-my-primary dark:text-teal-400' : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300'
                  }`}
                aria-label={showFilters ? 'Hide filters' : 'Show more filters'}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline"><TranslatedText text="More" /></span>
              </button>

              {/* Search Near Me Button */}
              <button
                onClick={() => {
                  if (!navigator.geolocation) {
                    alert('Geolocation is not supported by your browser. Please use the map to select a location.');
                    return;
                  }

                  const options = {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 300000, // 5 minutes cache
                  };

                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const { latitude: lat, longitude: lng, accuracy } = position.coords;
                      
                      // Calculate appropriate radius based on GPS accuracy
                      let searchRadius = 25; // Default 25km
                      if (accuracy) {
                        if (accuracy > 1000) {
                          searchRadius = 50; // 50km for poor accuracy
                        } else if (accuracy > 100) {
                          searchRadius = 25; // 25km for moderate accuracy
                        } else {
                          searchRadius = 10; // 10km for good accuracy
                        }
                      }
                      
                      setMapLocation({ lat, lng, radiusKm: searchRadius });
                      
                      // Switch to map view to show results
                      setViewMode('map');
                      
                      // Show success message
                      t('Searching for products near your location...').then(msg => showToast(msg, 'success'));
                    },
                    (error) => {
                      console.error('Geolocation error:', error);
                      
                      let errorMessage = 'Unable to get your location. ';
                      switch (error.code) {
                        case error.PERMISSION_DENIED:
                          errorMessage += 'Please enable location services and try again.';
                          break;
                        case error.POSITION_UNAVAILABLE:
                          errorMessage += 'Location information is unavailable.';
                          break;
                        case error.TIMEOUT:
                          errorMessage += 'Location request timed out.';
                          break;
                        default:
                          errorMessage += 'An unknown error occurred.';
                          break;
                      }
                      
                      t(errorMessage).then(msg => showToast(msg, 'error'));
                    },
                    options
                  );
                }}
                className={`px-4 py-3 border rounded-xl flex items-center gap-2 transition-all duration-200 font-medium ${
                  mapLocation 
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30' 
                    : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
                aria-label="Search for products near my location"
              >
                <Navigation className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {mapLocation ? <TranslatedText text="Near Me Active" /> : <TranslatedText text="Search Near Me" />}
                </span>
                <span className="sm:hidden">
                  {mapLocation ? <TranslatedText text="Near Me" /> : <TranslatedText text="Near Me" />}
                </span>
              </button>

              {/* View Toggle */}
              <div className="ml-auto flex border border-gray-300 dark:border-slate-600 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 flex items-center gap-2 transition-all duration-200 ${viewMode === 'grid'
                    ? 'bg-my-primary dark:bg-teal-500 text-white'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                    }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline"><TranslatedText text="Grid" /></span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 flex items-center gap-2 transition-all duration-200 ${viewMode === 'list'
                    ? 'bg-my-primary dark:bg-teal-500 text-white'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                    }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline"><TranslatedText text="List" /></span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-3 flex items-center gap-2 transition-all duration-200 ${viewMode === 'map'
                    ? 'bg-my-primary dark:bg-teal-500 text-white'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                    }`}
                  aria-label="Map view"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline"><TranslatedText text="Map" /></span>
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-800 animate-in slide-in-from-top duration-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3"><TranslatedText text="Price Range" /></label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                      placeholder=""
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary outline-none transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                      placeholder=""
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary outline-none transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3"><TranslatedText text="Sort By" /></label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary outline-none transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <option value="relevance"><TranslatedText text="Relevance" /></option>
                    <option value="price-low"><TranslatedText text="Price: Low to High" /></option>
                    <option value="price-high"><TranslatedText text="Price: High to Low" /></option>
                    <option value="rating"><TranslatedText text="Highest Rated" /></option>
                    <option value="newest"><TranslatedText text="Newest" /></option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-end">
                  <Button
                    onClick={clearAllFilters}
                    className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <TranslatedText text="Clear All" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-9xl mx-auto px-6 lg:px-20 py-8">
        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-400 px-6 py-4 rounded-2xl mb-8 animate-in fade-in duration-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 text-red-600 dark:text-red-400" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results Header & Summary */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1">
                {searchMode === 'image' ? (
                  <div className="flex items-center gap-3">
                    <Camera className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    <span><TranslatedText text="Similar Results" /></span>
                  </div>
                ) : searchType === 'ai' ? (
                  <><TranslatedText text="AI Search Results" /></>
                ) : (
                  <TranslatedText text="Marketplace" />
                )}
              </h1>

              <div className="text-gray-600 dark:text-slate-400 flex flex-wrap items-center gap-1.5 text-lg">
                <span>{totalResults} <TranslatedText text="results" /></span>
                {(searchQuery || selectedCategory !== 'all' || priceRange.min > 0 || priceRange.max > 0) && (
                  <>
                    <span className="mx-1">•</span>
                    <TranslatedText text="for" />
                    {searchQuery && (
                      <span className="font-bold text-gray-900 dark:text-white mx-1">"{searchQuery}"</span>
                    )}
                    {selectedCategory !== 'all' && (
                      <>
                        <TranslatedText text="in" />
                        <span className="font-bold text-gray-900 dark:text-white mx-1">
                          {itemCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                        </span>
                      </>
                    )}
                    {(priceRange.min > 0 || priceRange.max > 0) && (
                      <>
                        <span className="mx-1">at</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {priceRange.min > 0 && priceRange.max > 0
                            ? `${priceRange.min}-${priceRange.max}`
                            : priceRange.min > 0
                              ? `> ${priceRange.min}`
                              : `< ${priceRange.max}`}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {searchType === 'ai' && aiPrompt && (
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 rounded-lg text-sm font-medium border border-teal-100 dark:border-teal-800">
                <Sparkles className="w-4 h-4" />
                <span>AI Prompt: "{aiPrompt}"</span>
              </div>
            )}
          </div>

          {/* Active Filter Chips (Alibaba Style) */}
          {(selectedCategory !== 'all' || selectedLocation !== 'all' || priceRange.min > 0 || priceRange.max > 0 || mapLocation) && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedCategory !== 'all' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-my-primary/10 dark:bg-my-primary/20 text-my-primary dark:text-teal-300 rounded-full text-sm font-medium border border-my-primary/20">
                  <span>Category: {itemCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {selectedLocation !== 'all' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800">
                  <span>Location: {selectedLocation}</span>
                  <button onClick={() => setSelectedLocation('all')} className="hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {(priceRange.min > 0 || priceRange.max > 0) && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 rounded-full text-sm font-medium border border-amber-100 dark:border-amber-800">
                  <span>Price: {priceRange.min}-{priceRange.max || 'Any'}</span>
                  <button onClick={() => setPriceRange({ min: 0, max: 0 })} className="hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {mapLocation && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 rounded-full text-sm font-medium border border-teal-100 dark:border-teal-800">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Within {mapLocation.radiusKm}km of your location</span>
                  <button onClick={() => setMapLocation(null)} className="hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-my-primary dark:text-slate-400 dark:hover:text-teal-400 font-medium px-2 py-1.5 underline underline-offset-4 decoration-dotted"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Related Category Suggestions (Refine Search) - Alibaba Style */}
          {relatedCategories.length > 0 && selectedCategory === 'all' && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  Refine:
                </span>
                <div className="flex flex-wrap gap-2">
                  {relatedCategories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:border-my-primary dark:hover:border-teal-500 hover:text-my-primary dark:hover:text-teal-400 transition-all duration-200 shadow-sm"
                    >
                      {cat.name} <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">({cat.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Quick Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8 scroll-smooth">
          {itemCategories.slice(0, 8).map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-200 font-medium ${selectedCategory === category.id
                ? 'bg-my-primary dark:bg-teal-500 text-white shadow-lg shadow-my-primary/25 dark:shadow-teal-500/25'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
            >
              {/* <span className="text-lg">{category.icon}</span> */}
              <span className="text-sm"><TranslatedText text={category.name} /></span>
            </button>
          ))}
        </div>

        {/* Results Grid/List/Map */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-my-primary dark:border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 dark:text-slate-400 font-medium"><TranslatedText text="Loading items..." /></p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-full mb-6">
              <Search className="w-12 h-12 text-gray-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
              <TranslatedText text="No items found" />
            </h3>
            <p className="text-gray-600 dark:text-slate-400 max-w-md mx-auto mb-8">
              <TranslatedText text="We couldn't find any items matching your search. Try adjusting your filters or search terms." />
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLocation('all');
                setPriceRange({ min: 0, max: 0 });
              }}
              className="px-6 py-3 bg-my-primary dark:bg-teal-600 text-white rounded-xl font-semibold hover:bg-my-primary/90 dark:hover:bg-teal-500 transition-colors shadow-lg shadow-my-primary/20"
            >
              <TranslatedText text="Clear all filters" />
            </button>
          </div>
        ) : viewMode === 'map' ? (
          <div className="relative" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
            <MapSearchView
              products={filteredItems.map(item => ({
                ...item,
                images: productImages[item.id] || []
              }))}
              onLocationSelect={(lat, lng, radiusKm) => {
                setMapLocation({ lat, lng, radiusKm });
                // Update URL params
                const params = new URLSearchParams(searchParams);
                params.set('lat', lat.toString());
                params.set('lng', lng.toString());
                params.set('radiusKm', radiusKm.toString());
                params.set('nearMe', 'true');
                setSearchParams(params);
              }}
              selectedLocation={mapLocation}
              onProductClick={(productId) => handleItemClick(productId)}
              height="100%"
            />
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
            : 'space-y-6'
          }>
            {filteredItems.map((item) => {
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
                        alt={translatedProductNames[item.id] || item.title || item.name || 'Product'}
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
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 pointer-events-none">
                      {/* Heart Icon - Favorites */}
                      <button
                        type="button"
                        aria-label={favoriteMap[item.id] ? (translatedAttrs['Remove from favorites'] || 'Remove from favorites') : (translatedAttrs['Add to favorites'] || 'Add to favorites')}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg pointer-events-auto cursor-pointer ${favoriteMap[item.id]
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm'
                          }`}
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                          const token = localStorage.getItem('token') || undefined;
                          if (!token || !isAuthenticated) {
                            t('Please log in to add products to favorites').then(msg => showToast(msg, 'info'));
                            navigate('/login');
                            return;
                          }
                          const currentlyFav = Boolean(favoriteMap[item.id]);
                          // optimistic update
                          setFavoriteMap(prev => ({ ...prev, [item.id]: !currentlyFav }));
                          try {
                            if (currentlyFav) {
                              await removeUserFavorite(item.id, token);
                              t('Removed from favorites').then(msg => showToast(msg, 'success'));
                            } else {
                              await addUserFavorite(item.id, token);
                              t('Added to favorites').then(msg => showToast(msg, 'success'));
                            }
                          } catch (error) {
                            // revert on failure
                            setFavoriteMap(prev => ({ ...prev, [item.id]: currentlyFav }));
                            t('Failed to update favorites').then(msg => showToast(msg, 'error'));
                          }
                        }}
                      >
                        <Heart className={`w-5 h-5 transition-all ${favoriteMap[item.id]
                          ? 'text-white fill-current'
                          : 'text-gray-700 dark:text-slate-300'
                          }`} />
                      </button>
                      {/* Add to Cart Icon */}
                      {item.base_price_per_day && parseFloat(String(item.base_price_per_day)) > 0 && (
                        <button
                          type="button"
                          aria-label={translatedAttrs['Add to cart'] || 'Add to cart'}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg pointer-events-auto cursor-pointer ${isInCart(item.id)
                            ? 'bg-teal-600 hover:bg-teal-700'
                            : 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm'
                            }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            if (!isAuthenticated) {
                              t('Please log in to add items to cart').then(msg => showToast(msg, 'info'));
                              navigate('/login');
                              return;
                            }
                            setSelectedProductForCart(item);
                            setShowAddToCartModal(true);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onMouseUp={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {isInCart(item.id) ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-slate-300" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-1">
                    {/* Title and Rating */}
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm leading-tight flex-1 pr-2">
                        <TranslatedText text={item.title || item.name || 'Product'} />
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Similarity Score for Image Search */}
                        {(item as any).similarity_percentage && searchMode === 'image' && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Camera className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                              {(item as any).similarity_percentage}%
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span className="text-sm text-gray-900 dark:text-slate-100">
                            {item.average_rating || '4.8'}
                          </span>
                        </div>
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
                        <span className="flex items-center justify-between">
                          <span>
                            {itemLocations[item.id]?.city || <TranslatedText text="Unknown Location" />}
                            {itemLocations[item.id]?.country ? `, ${itemLocations[item.id]?.country}` : ''}
                          </span>
                          {mapLocation && (() => {
                            const productCoords = extractProductCoordinates(item);
                            if (productCoords) {
                              const distance = calculateDistance(
                                mapLocation.lat,
                                mapLocation.lng,
                                productCoords.lat,
                                productCoords.lng
                              );
                              return (
                                <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-full">
                                  {formatDistance(distance)}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </span>
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
                          <span className="text-sm"> / <TranslatedText text="per day" /></span>
                        </>
                      ) : (
                        <span className="font-semibold"><TranslatedText text="Price on Request" /></span>
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
                          alt={translatedProductNames[item.id] || item.title || item.name || 'Product'}
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
                          <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg mb-1"><TranslatedText text={item.title || item.name || 'Product'} /></h3>
                          <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className={`p-2 rounded-lg transition-all shadow-sm ${favoriteMap[item.id]
                              ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                              : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                              }`}
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const token = localStorage.getItem('token') || undefined;
                              if (!token || !isAuthenticated) {
                                t('Please log in to add products to favorites').then(msg => showToast(msg, 'info'));
                                navigate('/login');
                                return;
                              }
                              const currentlyFav = Boolean(favoriteMap[item.id]);
                              // optimistic update
                              setFavoriteMap(prev => ({ ...prev, [item.id]: !currentlyFav }));
                              try {
                                if (currentlyFav) {
                                  await removeUserFavorite(item.id, token);
                                  t('Removed from favorites').then(msg => showToast(msg, 'success'));
                                } else {
                                  await addUserFavorite(item.id, token);
                                  t('Added to favorites').then(msg => showToast(msg, 'success'));
                                }
                              } catch (error) {
                                // revert on failure
                                setFavoriteMap(prev => ({ ...prev, [item.id]: currentlyFav }));
                                t('Failed to update favorites').then(msg => showToast(msg, 'error'));
                              }
                            }}
                            aria-label={favoriteMap[item.id] ? (translatedAttrs['Remove from favorites'] || 'Remove from favorites') : (translatedAttrs['Add to favorites'] || 'Add to favorites')}
                          >
                            <Heart className={`w-5 h-5 transition-all ${favoriteMap[item.id]
                              ? 'text-red-500 fill-current'
                              : 'text-gray-600 dark:text-slate-400 hover:text-red-500'
                              }`} />
                          </button>
                          {/* Add to Cart Icon - List View */}
                          {item.base_price_per_day && parseFloat(String(item.base_price_per_day)) > 0 && (
                            <button
                              type="button"
                              aria-label={translatedAttrs['Add to cart'] || 'Add to cart'}
                              className={`p-2 rounded-lg transition-all shadow-sm ${isInCart(item.id)
                                ? 'bg-teal-600 hover:bg-teal-700'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isAuthenticated) {
                                  t('Please log in to add items to cart').then(msg => showToast(msg, 'info'));
                                  navigate('/login');
                                  return;
                                }
                                setSelectedProductForCart(item);
                                setShowAddToCartModal(true);
                              }}
                            >
                              {isInCart(item.id) ? (
                                <Check className="w-5 h-5 text-white" />
                              ) : (
                                <ShoppingCart className={`w-5 h-5 transition-all ${isInCart(item.id)
                                  ? 'text-white'
                                  : 'text-gray-600 dark:text-slate-400 hover:text-teal-600'
                                  }`} />
                              )}
                            </button>
                          )}
                        </div>
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
                            {itemLocations[item.id]?.city || <TranslatedText text="Unknown Location" />}{itemLocations[item.id]?.country ? `, ${itemLocations[item.id]?.country}` : ''}
                          </span>
                          {mapLocation && (() => {
                            const productCoords = extractProductCoordinates(item);
                            if (productCoords) {
                              const distance = calculateDistance(
                                mapLocation.lat,
                                mapLocation.lng,
                                productCoords.lat,
                                productCoords.lng
                              );
                              return (
                                <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-full ml-2">
                                  {formatDistance(distance)}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-my-primary dark:text-teal-400">
                              {item.base_price_per_day != null && item.base_currency ? `$${item.base_price_per_day}` : <TranslatedText text="Price not available" />}
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
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium"><TranslatedText text="Delivery" /></span>
                            </div>
                          )}
                          {item.pickup_methods?.includes('pickup') && (
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium"><TranslatedText text="Pickup" /></span>
                            </div>
                          )}
                        </div>
                        <Button className="px-6 py-2.5 bg-my-primary dark:bg-teal-500 hover:bg-my-primary/90 dark:hover:bg-teal-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                          <TranslatedText text="View Details" />
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
                                +{item.features.length - 4} <TranslatedText text="more features" />
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
        )}
      </div>

      {/* Add to Cart Modal */}
      {
        showAddToCartModal && selectedProductForCart && (
          <AddToCartModal
            isOpen={showAddToCartModal}
            onClose={() => {
              setShowAddToCartModal(false);
              setSelectedProductForCart(null);
            }}
            product={{
              id: selectedProductForCart.id,
              title: selectedProductForCart.title || selectedProductForCart.name || '',
              image: productImages[selectedProductForCart.id]?.[0],
              pricePerDay: typeof selectedProductForCart.base_price_per_day === 'string'
                ? parseFloat(selectedProductForCart.base_price_per_day)
                : (selectedProductForCart.base_price_per_day || 0),
              currency: selectedProductForCart.base_currency || 'USD',
              pickup_methods: selectedProductForCart.pickup_methods,
              address_line: selectedProductForCart.address_line,
              location: selectedProductForCart.location,
              ownerId: selectedProductForCart.owner_id || '',
              categoryId: selectedProductForCart.category_id,
              pickupAvailable: true,
              deliveryAvailable: selectedProductForCart.deliveryAvailable === true,
            }}
          />
        )
      }
    </div >
  );
};

export default ItemSearchPage;
