import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Star, Clock,
  Grid, List, Heart,
  Camera, Laptop, Car, Gamepad2, Headphones, Watch,
  Package, Zap, Truck
} from 'lucide-react';
import { mockRentalItems, itemCategories } from '../data/mockRentalData';
import { formatPrice } from '../lib/utils';
import Button from '../components/ui/Button';

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
  const [items, setItems] = useState(mockRentalItems);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Filter and search logic
  useEffect(() => {
    setLoading(true);
    
    let filteredItems = mockRentalItems;
    
    // Search query filter
    if (searchQuery) {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === selectedCategory);
    }
    
    // Location filter
    if (selectedLocation !== 'all') {
      filteredItems = filteredItems.filter(item => item.location.city === selectedLocation);
    }
    
    // Price range filter
    filteredItems = filteredItems.filter(item => 
      item.price >= priceRange.min && item.price <= priceRange.max
    );
    
    // Sort items
    switch (sortBy) {
      case 'price-low':
        filteredItems.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredItems.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredItems.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filteredItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // Relevance sort (featured first, then by rating)
        filteredItems.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
        });
    }
    
    setItems(filteredItems);
    setTotalResults(filteredItems.length);
    setLoading(false);
  }, [searchQuery, selectedCategory, selectedLocation, priceRange, sortBy]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedLocation !== 'all') params.set('location', selectedLocation);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedLocation, setSearchParams]);

  const handleItemClick = (itemId: string) => {
    navigate(`/items/${itemId}`);
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
              const IconComponent = getCategoryIcon(item.category);
              
              return viewMode === 'grid' ? (
                // Grid View
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={item.images[0]}
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
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-sm text-gray-600">/{item.priceUnit}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {item.location.city}
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
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className="relative">
                      <img
                        src={item.images[0]}
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
                          {item.location.city}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          {item.availability.responseTime}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(item.price)}/{item.priceUnit}
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
