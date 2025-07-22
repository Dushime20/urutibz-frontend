import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Star, Clock,
  Grid, List, Heart,
  Camera, Laptop, Car, Gamepad2, Headphones, Watch,
  Package, Zap, Truck, AlertCircle
} from 'lucide-react';
import { itemCategories } from '../data/mockRentalData';
import { formatPrice } from '../lib/utils';
import Button from '../components/ui/Button';
import { fetchAllProducts, fetchProductImages } from './admin/service/api'; // adjust path if needed

// Add Product type if not already imported
// import type { Product } from '../types';
type Product = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  category?: string;
  category_id?: string;
  status?: string;
  price: number;
  base_price_per_day?: string;
  base_currency?:string
  rating?: number;
  totalReviews?: number;
  tags?: string[];
  featured?: boolean;
  images?: string[];
  location?: any;
  availability?: any;
  deliveryAvailable?: boolean;
  createdAt?: string;
};

// Add this utility function at the top (or import from utils)
function wkbHexToLatLng(wkbHex: string) {
  // Works for 2D POINT with SRID (hex string, 50 chars)
  if (!wkbHex || wkbHex.length < 50) return null;
  function hexToDouble(hex: string) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    for (let i = 0; i < 8; i++) {
      view.setUint8(i, parseInt(hex.substr(i * 2, 2), 16));
    }
    return view.getFloat64(0, true); // little endian
  }
  // X (lng): hex 18-33 (16 chars), Y (lat): hex 34-49 (16 chars)
  const lng = hexToDouble(wkbHex.substr(18, 16));
  const lat = hexToDouble(wkbHex.substr(34, 16));
  return { lat, lng };
}

// Update getCityFromCoordinates to return both city and country
async function getCityFromCoordinates(lat: number, lng: number): Promise<{ city: string | null, country: string | null }> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  );
  const data = await response.json();
  if (!data.address) return { city: null, country: null };
  return {
    city: data.address.city || data.address.town || data.address.village || data.address.hamlet || data.address.county || null,
    country: data.address.country || null
  };
}

// Modify the location fetching logic
const processItemLocations = async (items: any[]) => {
  const processedItems = await Promise.all(items.map(async (item) => {
    let city = null;
    let country = null;

    try {
      // Extract coordinates
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

      // Fetch city if coordinates are available
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
      // Continue with null city/country
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
  // Change itemCities to itemLocations to store both city and country
  const [itemLocations, setItemLocations] = useState<{ [id: string]: { city: string | null, country: string | null } }>({});
  console.log(itemLocations,'items cities')

  // Filter and search logic
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || undefined;
        
        // Fetch items
        const result = await fetchAllProducts(token);
        
        if (result.error) {
          setError(result.error);
          return;
        }
        
        const productList = result.data || [];
        console.log('Fetched productList:', productList);
        
        // Set total results
        setTotalResults(result.total || productList.length);
        
        // Process item locations
        const processedItems = await processItemLocations(productList);
        
        console.log('Processed Items:', processedItems);
        setItems(processedItems);

        // Fetch images for each product
        console.group('🖼️ ItemSearchPage Image Fetching');
        const imagesMap: { [productId: string]: string[] } = {};
        
        await Promise.all(processedItems.map(async (item) => {
          try {
            const images = await fetchProductImages(item.id, token);
            
            console.log(`Images for product ${item.id}:`, images);

            // Normalize images to ensure we have valid URLs
            const normalizedImages = Array.isArray(images) 
              ? images.map(img => 
                  typeof img === 'string' 
                    ? img 
                    : (img.url || img.image_url || img.path)
                ).filter(img => img && img.trim() !== '')
              : [images].filter(img => img && img.trim() !== '');

            console.log(`Normalized images for product ${item.id}:`, normalizedImages);

            // Use placeholder if no images
            imagesMap[item.id] = normalizedImages.length > 0 
              ? normalizedImages 
              : ['/assets/img/placeholder-image.png'];
          } catch (error) {
            console.error(`Error fetching images for product ${item.id}:`, error);
            imagesMap[item.id] = ['/assets/img/placeholder-image.png'];
          }
        }));

        console.log('Final Images Map:', imagesMap);
        console.groupEnd();

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

  // Add debug log before rendering items
  console.log('Rendering items:', items);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items to rent..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-2 overflow-x-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white min-w-40"
              >
                <option value="all">All Categories</option>
                {itemCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white min-w-32"
              >
                <option value="all">All Locations</option>
                <option value="Kigali">🇷🇼 Kigali</option>
                <option value="Butare">🇷🇼 Butare</option>
                <option value="Kampala">🇺🇬 Kampala</option>
                <option value="Nairobi">🇰🇪 Nairobi</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                More Filters
              </button>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                      placeholder="Min"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                      placeholder="Max"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 px-3 py-2 flex items-center justify-center gap-2 ${
                        viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 px-3 py-2 flex items-center justify-center gap-2 ${
                        viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Results for "${searchQuery}"` : 'Browse Items'}
            </h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Searching...' : `${totalResults} items available`}
            </p>
          </div>
        </div>

        {/* Category Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {itemCategories.slice(0, 8).map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Results Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : items.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {items.map((item) => {
              if (!item.id || typeof item.id !== 'string') return null;
              const id = item.id as string;
              const IconComponent = getCategoryIcon(item.category || '');
              
              return viewMode === 'grid' ? (
                // Grid View
                <div
                  key={id}
                  onClick={() => handleItemClick(id)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={
                        (productImages[item.id] && productImages[item.id][0])
                          ? productImages[item.id][0]
                          : '/assets/img/placeholder-image.png'
                      }
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                        <IconComponent className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {item.featured && (
                        <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                      <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{item.totalReviews} reviews</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          {item.base_price_per_day}
                        </span>
                        <span className="text-sm text-gray-600">/{item.base_currency}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {itemLocations[item.id]?.city || 'Unknown'}, {itemLocations[item.id]?.country || ''}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        {item.availability.instantBook && (
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">Instant Book</span>
                          </div>
                        )}
                        {item.deliveryAvailable && (
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-blue-500" />
                            <span className="text-xs text-blue-600 font-medium">Delivery</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {item.availability.responseTime}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // List View
                <div
                  key={id}
                  onClick={() => handleItemClick(id)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className="relative">
                      <img
                        src={
                          (productImages[item.id] && productImages[item.id][0])
                            ? productImages[item.id][0]
                            : '/assets/img/placeholder-image.png'
                        }
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="absolute -top-1 -right-1">
                        <div className="bg-white rounded-full p-1">
                          <IconComponent className="w-3 h-3 text-gray-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{item.rating}</span>
                          <span className="text-sm text-gray-600">({item.totalReviews})</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {itemLocations[item.id]?.city || 'Unknown'}, {itemLocations[item.id]?.country || ''}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          {item.availability.responseTime}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(item.price)}/{item.base_currency}
                          </span>
                          {item.availability.instantBook && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">Instant Book</span>
                            </div>
                          )}
                          {item.deliveryAvailable && (
                            <div className="flex items-center gap-1">
                              <Truck className="w-3 h-3 text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">Delivery</span>
                            </div>
                          )}
                        </div>
                        <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLocation('all');
                setPriceRange({ min: 0, max: 1000 });
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemSearchPage;

console.log('ItemSearchPage component loaded and exported');
