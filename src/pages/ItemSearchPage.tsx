import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Star, Clock,
  Grid, List, Heart,
  Camera, Laptop, Car, Gamepad2, Headphones, Watch,
  Package, Zap, Truck, AlertCircle, ChevronDown, X
} from 'lucide-react';
import { itemCategories } from '../data/mockRentalData';
import { formatPrice } from '../lib/utils';
import Button from '../components/ui/Button';
import { fetchAvailableProducts, fetchProductImages } from './admin/service/api';

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

// Utility function to extract image URL with proper typing
function extractImageUrl(img: unknown): string | null {
  if (typeof img === 'string' && img.trim() !== '') {
    return img;
  }
  
  if (img && typeof img === 'object') {
    const imageObj = img as ProductImage;
    return imageObj.url || imageObj.image_url || imageObj.path || null;
  }
  
  return null;
}

// WKB Hex to LatLng conversion
function wkbHexToLatLng(wkbHex: string) {
  if (!wkbHex || wkbHex.length < 50) return null;
  function hexToDouble(hex: string) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    for (let i = 0; i < 8; i++) {
      view.setUint8(i, parseInt(hex.substr(i * 2, 2), 16));
    }
    return view.getFloat64(0, true);
  }
  const lng = hexToDouble(wkbHex.substr(18, 16));
  const lat = hexToDouble(wkbHex.substr(34, 16));
  return { lat, lng };
}

// Get city from coordinates
async function getCityFromCoordinates(lat: number, lng: number): Promise<{ city: string | null, country: string | null }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await response.json();
    if (!data.address) return { city: null, country: null };
    return {
      city: data.address.city || data.address.town || data.address.village || data.address.hamlet || data.address.county || null,
      country: data.address.country || null
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    return { city: null, country: null };
  }
}

// Process item locations
const processItemLocations = async (items: any[]) => {
  const processedItems = await Promise.all(items.map(async (item) => {
    let city = null;
    let country = null;

    try {
      let lat, lng;
      if (typeof item.location === 'string') {
        const coords = wkbHexToLatLng(item.location);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      } else if (
        item.location &&
        typeof item.location === 'object' &&
        ('lat' in item.location || 'latitude' in item.location) &&
        ('lng' in item.location || 'longitude' in item.location)
      ) {
        lat = (item.location as any).lat ?? (item.location as any).latitude;
        lng = (item.location as any).lng ?? (item.location as any).longitude;
      }

      if (lat !== undefined && lng !== undefined) {
        const locationData = await getCityFromCoordinates(lat, lng);
        city = locationData.city;
        country = locationData.country;
      } else if (
        item.location &&
        typeof item.location === 'object' &&
        'city' in item.location
      ) {
        city = (item.location as any).city;
      }
    } catch (error) {
      console.error(`Error processing location for item ${item.id}:`, error);
    }

    return {
      ...item,
      city,
      country
    };
  }));

  return processedItems;
};

const ItemSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
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
        
        // Process item locations
        const processedItems = await processItemLocations(productList);
        setItems(processedItems);

        // Fetch images for each product with proper error handling
        const imagesMap: { [productId: string]: string[] } = {};
        
        await Promise.all(processedItems.map(async (item) => {
          try {
            const images = await fetchProductImages(item.id, token);
            
            // Normalize images with proper typing
            const normalizedImages: string[] = [];
            
            if (Array.isArray(images)) {
              images.forEach(img => {
                const extractedUrl = extractImageUrl(img);
                if (extractedUrl) normalizedImages.push(extractedUrl);
              });
            } else {
              const extractedUrl = extractImageUrl(images);
              if (extractedUrl) normalizedImages.push(extractedUrl);
            }

            imagesMap[item.id] = normalizedImages.length > 0 
              ? normalizedImages 
              : ['/assets/img/placeholder-image.png'];
          } catch (error) {
            console.error(`Error fetching images for product ${item.id}:`, error);
            imagesMap[item.id] = ['/assets/img/placeholder-image.png'];
          }
        }));

        setProductImages(imagesMap);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
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
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Search Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] bg-white min-w-48 cursor-pointer transition-all duration-200"
                  aria-label="Select category"
                >
                  <option value="all">All Categories</option>
                  {itemCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] bg-white min-w-40 cursor-pointer transition-all duration-200"
                  aria-label="Select location"
                >
                  <option value="all">All Locations</option>
                  <option value="Kigali">🇷🇼 Kigali</option>
                  <option value="Butare">🇷🇼 Butare</option>
                  <option value="Kampala">🇺🇬 Kampala</option>
                  <option value="Nairobi">🇰🇪 Nairobi</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 ${
                  showFilters ? 'border-[#00aaa9] bg-[#00aaa9]/5 text-[#00aaa9]' : 'border-gray-300 text-gray-700'
                }`}
                aria-label={showFilters ? 'Hide filters' : 'Show more filters'}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">More Filters</span>
              </button>

              {/* View Toggle */}
              <div className="ml-auto flex border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 flex items-center gap-2 transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-[#00aaa9] text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
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
                      ? 'bg-[#00aaa9] text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
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
            <div className="mt-6 p-6 border border-gray-200 rounded-2xl bg-gray-50 animate-in slide-in-from-top duration-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range (USD)</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                      placeholder="Min"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none transition-all duration-200"
                    />
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                      placeholder="Max"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none transition-all duration-200"
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
                    className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl mb-8 animate-in fade-in duration-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 text-red-600" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {searchQuery ? `Results for "${searchQuery}"` : 'Browse Rentals'}
            </h1>
            <p className="text-gray-600">
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
                  ? 'bg-[#00aaa9] text-white shadow-lg shadow-[#00aaa9]/25'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
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
            <div className="w-12 h-12 border-4 border-[#00aaa9] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Finding the perfect items for you...</p>
          </div>
        ) : items.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
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
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={productImages[item.id]?.[0] || '/assets/img/placeholder-image.png'}
                      alt={item.title || item.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/img/placeholder-image.png';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-sm">
                        <IconComponent className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {item.featured && (
                        <div className="bg-[#00aaa9] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                          Featured
                        </div>
                      )}
                      <button className="bg-white/90 backdrop-blur-sm rounded-full p-2.5 hover:bg-white transition-colors shadow-sm group/heart">
                        <Heart className="w-4 h-4 text-gray-600 group-hover/heart:text-red-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    {/* Title and Condition */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 line-clamp-2 text-lg leading-tight">
                        {item.title || item.name}
                      </h3>
                      {item.condition && (
                        <span className="ml-2 text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full capitalize font-medium">
                          {item.condition}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{item.description}</p>

                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold text-gray-900">{item.average_rating || '0.00'}</span>
                      <span className="text-xs text-gray-500">({item.review_count || 0} reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-[#00aaa9]">
                        {item.base_price_per_day != null && item.base_currency ? `$${item.base_price_per_day}` : 'No price'}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">{item.base_price_per_day != null && item.base_currency ? `/${item.base_currency}` : ''}</span>
                    </div>

                    {/* Features */}
                    {item.features && item.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.features.slice(0, 2).map((feature, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                            {feature}
                          </span>
                        ))}
                        {item.features.length > 2 && (
                          <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                            +{item.features.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Pickup Methods */}
                    <div className="flex gap-2 mb-4">
                      {item.pickup_methods?.includes('delivery') && (
                        <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          Delivery
                        </span>
                      )}
                      {item.pickup_methods?.includes('pickup') && (
                        <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full font-medium flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Pickup
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">
                        {itemLocations[item.id]?.city || 'Unknown'}{itemLocations[item.id]?.country ? `, ${itemLocations[item.id]?.country}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Enhanced List View
                <div
                  key={id}
                  onClick={() => handleItemClick(id)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex gap-6">
                    <div className="relative flex-shrink-0">
                      <img
                        src={productImages[item.id]?.[0] || '/assets/img/placeholder-image.png'}
                        alt={item.title || item.name}
                        className="w-28 h-28 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/img/placeholder-image.png';
                        }}
                      />
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-white rounded-full p-1.5 shadow-sm">
                          <IconComponent className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title || item.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4">
                          <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold">{item.average_rating || '0.00'}</span>
                          <span className="text-sm text-gray-600">({item.review_count || 0})</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">
                            {itemLocations[item.id]?.city || 'Unknown'}{itemLocations[item.id]?.country ? `, ${itemLocations[item.id]?.country}` : ''}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#00aaa9]">
                              {item.base_price_per_day != null && item.base_currency ? `$${item.base_price_per_day}` : 'No price'}
                            </span>
                            <span className="text-sm text-gray-600">{item.base_price_per_day != null && item.base_currency ? `/${item.base_currency}` : ''}</span>
                          </div>
                          {item.condition && (
                            <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                              {item.condition}
                            </span>
                          )}
                          {item.pickup_methods?.includes('delivery') && (
                            <div className="flex items-center gap-1">
                              <Truck className="w-4 h-4 text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">Delivery</span>
                            </div>
                          )}
                          {item.pickup_methods?.includes('pickup') && (
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4 text-purple-500" />
                              <span className="text-xs text-purple-600 font-medium">Pickup</span>
                            </div>
                          )}
                        </div>
                        <Button className="px-6 py-2.5 bg-[#00aaa9] hover:bg-[#008b8a] text-white rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
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
