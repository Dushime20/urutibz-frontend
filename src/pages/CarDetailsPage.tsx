import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Heart, Star, MapPin, Shield, Check, 
  Bot, MessageCircle, Zap, TrendingUp, AlertCircle,
  Eye, Share2, Flag, Sparkles, Lock, Headphones
} from 'lucide-react';
import Button from '../components/ui/Button';

const RentalDetailsPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Mock data for demonstration - in real app, this would come from API
  const item = {
    id: itemId,
    name: 'Professional Camera Kit - Canon EOS R5',
    category: 'Electronics',
    subcategory: 'Photography',
    description: 'Complete professional photography setup including Canon EOS R5, multiple lenses (24-70mm, 70-200mm), tripod, lighting equipment, and carrying case. Perfect for weddings, events, and professional shoots.',
    price: 45,
    originalPrice: 65,
    currency: 'USD',
    priceType: 'day',
    location: 'Kigali, Rwanda',
    coordinates: { lat: -1.9441, lng: 30.0619 },
    distance: '1.2 km away',
    available: true,
    rating: 4.8,
    reviewCount: 127,
    aiMatch: 98,
    trending: true,
    verified: true,
    instantBook: true,
    images: [
      '/assets/img/items/camera-kit-1.jpg',
      '/assets/img/items/camera-kit-2.jpg',
      '/assets/img/items/camera-kit-3.jpg',
      '/assets/img/items/camera-kit-4.jpg'
    ],
    features: [
      'Canon EOS R5 Body',
      'RF 24-70mm f/2.8L IS USM',
      'RF 70-200mm f/2.8L IS USM',
      'Professional Tripod',
      'LED Light Panel Kit',
      'Extra Batteries (3)',
      'Memory Cards (128GB x2)',
      'Waterproof Carrying Case',
      'Lens Cleaning Kit',
      'Remote Shutter Release'
    ],
    specifications: {
      brand: 'Canon',
      model: 'EOS R5',
      year: '2023',
      condition: 'Excellent',
      weight: '3.2 kg',
      dimensions: '35cm x 25cm x 15cm'
    },
    owner: {
      id: 'owner-123',
      name: 'Amara Nkomo',
      avatar: '/assets/img/profiles/avatar-01.jpg',
      rating: 4.9,
      reviewCount: 89,
      responseTime: '< 1 hour',
      responseRate: '100%',
      joinDate: 'Jan 2023',
      verified: true,
      languages: ['English', 'Kinyarwanda', 'French'],
      badges: ['Super Host', 'Photography Expert', 'Quick Responder'],
      about: 'Professional photographer with 8+ years experience. I love sharing my equipment with fellow creatives to help bring their visions to life.',
      totalRentals: 156,
      totalEarnings: '$3,240'
    },
    policies: {
      cancellation: 'Free cancellation up to 24 hours before pickup',
      damage: 'Comprehensive damage protection included',
      lateReturn: '$15/hour after agreed return time',
      cleaning: 'Please return equipment clean and organized'
    },
    insurance: {
      coverage: 'Up to $8,000',
      deductible: '$50',
      included: ['Theft', 'Accidental Damage', 'Weather Damage']
    }
  };

  const currencies = [
    { code: 'USD', symbol: '$', rate: 1 },
    { code: 'RWF', symbol: 'FRw', rate: 1200 },
    { code: 'EUR', symbol: '€', rate: 0.85 },
    { code: 'GBP', symbol: '£', rate: 0.73 }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' }
  ];

  const aiRecommendations = [
    {
      id: '1',
      name: 'Lighting Kit Extension',
      price: 15,
      owner: 'Same Owner',
      match: 95,
      image: '/assets/img/items/lighting-kit.jpg'
    },
    {
      id: '2', 
      name: 'Drone Camera Setup',
      price: 35,
      owner: 'James O.',
      match: 89,
      image: '/assets/img/items/drone-camera.jpg'
    },
    {
      id: '3',
      name: 'Photo Editing Laptop',
      price: 25,
      owner: 'Priya M.',
      match: 87,
      image: '/assets/img/items/laptop-editing.jpg'
    }
  ];

  const handleBookNow = () => {
    if (item.available) {
      navigate(`/booking/${itemId}`);
    }
  };

  const convertPrice = (price: number) => {
    const currency = currencies.find(c => c.code === selectedCurrency);
    return currency ? price * currency.rate : price;
  };

  const formatLocalPrice = (price: number) => {
    const currency = currencies.find(c => c.code === selectedCurrency);
    const convertedPrice = convertPrice(price);
    return `${currency?.symbol}${convertedPrice.toLocaleString()}`;
  };

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl mb-6">
          <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
          <p className="mb-4">The item you're looking for doesn't exist or has been removed.</p>
          <Link to="/browse" className="text-blue-600 hover:underline font-medium">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/50 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center text-sm">
            <Link to="/" className="text-slate-600 hover:text-blue-600">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
            <Link to="/browse" className="text-slate-600 hover:text-blue-600">Browse</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
            <Link to={`/browse?category=${item.category.toLowerCase()}`} className="text-slate-600 hover:text-blue-600">{item.category}</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
            <span className="text-blue-600 font-medium">{item.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* AI Badges Row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            <Bot className="w-4 h-4" />
            <span>{item.aiMatch}% AI Match</span>
          </div>
          {item.trending && (
            <div className="flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </div>
          )}
          {item.verified && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>AI Verified</span>
            </div>
          )}
          {item.instantBook && (
            <div className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>Instant Book</span>
            </div>
          )}
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content */}
          <div className="xl:w-2/3 space-y-8">
            {/* Item Images */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="relative h-80 md:h-96 bg-slate-200 rounded-xl overflow-hidden mb-4">
                <img 
                  src={item.images[activeImage]} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Overlay Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                  </button>
                  <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg">
                    <Share2 className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg">
                    <Flag className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                
                {/* Price Badge */}
                <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg">
                  <div className="text-lg font-bold">
                    {formatLocalPrice(item.price)}
                    <span className="text-sm font-normal">/{item.priceType}</span>
                  </div>
                  {item.originalPrice > item.price && (
                    <div className="text-xs line-through opacity-75">
                      {formatLocalPrice(item.originalPrice)}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Thumbnails */}
              {item.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {item.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                        activeImage === index ? 'border-blue-500 scale-105' : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">{item.name}</h1>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{item.location}</span>
                      <span className="text-sm text-slate-500 ml-2">• {item.distance}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm font-medium text-slate-800">{item.rating}</span>
                      <span className="text-sm text-slate-600 ml-1">({item.reviewCount} reviews)</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-sm text-slate-600">
                      <Eye className="w-4 h-4" />
                      <span>Viewed 847 times</span>
                    </div>
                  </div>
                </div>

                {/* Currency & Language Selectors */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <select 
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed mb-6">{item.description}</p>

              {/* Specifications */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {Object.entries(item.specifications).map(([key, value]) => (
                  <div key={key} className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-slate-500 text-xs mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="font-semibold text-slate-800">{value}</div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>What's Included</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policies */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Rental Policies</h3>
                <div className="space-y-3">
                  {Object.entries(item.policies).map(([key, value]) => (
                    <div key={key} className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-slate-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                        <span className="text-slate-600">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Owner Profile */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Meet Your Host</h3>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={item.owner.avatar}
                      alt={item.owner.name}
                      className="w-16 h-16 rounded-full border-2 border-white shadow-lg"
                    />
                    {item.owner.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-800">{item.owner.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-slate-600 mb-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium">{item.owner.rating}</span>
                        <span className="ml-1">({item.owner.reviewCount} reviews)</span>
                      </div>
                      <span>Joined {item.owner.joinDate}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.owner.badges.map((badge, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {badge}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-4">{item.owner.about}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-slate-800">{item.owner.responseTime}</div>
                        <div className="text-slate-500">Response time</div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{item.owner.responseRate}</div>
                        <div className="text-slate-500">Response rate</div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{item.owner.totalRentals}</div>
                        <div className="text-slate-500">Total rentals</div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{item.owner.totalEarnings}</div>
                        <div className="text-slate-500">Platform earnings</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-64 space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                    onClick={() => setShowContact(!showContact)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Host
                  </Button>
                  
                  <div className="text-center text-xs text-slate-500">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Contact info protected until booking
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span>AI Recommends for You</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <img src={rec.image} alt={rec.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                    <h4 className="font-medium text-slate-800 mb-1">{rec.name}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">by {rec.owner}</span>
                      <span className="font-bold text-blue-600">{formatLocalPrice(rec.price)}/day</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-2 text-xs text-green-600">
                      <Bot className="w-3 h-3" />
                      <span>{rec.match}% match</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="xl:w-1/3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatLocalPrice(item.price)}
                    <span className="text-sm text-slate-600 font-normal">/{item.priceType}</span>
                  </div>
                  {item.originalPrice > item.price && (
                    <div className="text-sm text-slate-500 line-through">
                      {formatLocalPrice(item.originalPrice)}
                    </div>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl mb-6 overflow-hidden">
                {/* Dates */}
                <div className="grid grid-cols-2">
                  <div className="p-4 border-r border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full text-sm text-slate-800 bg-transparent border-0 p-0 focus:ring-0"
                      defaultValue="2025-07-15"
                    />
                  </div>
                  <div className="p-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full text-sm text-slate-800 bg-transparent border-0 p-0 focus:ring-0"
                      defaultValue="2025-07-16"
                    />
                  </div>
                </div>
                
                {/* Times */}
                <div className="grid grid-cols-2 border-t border-slate-200">
                  <div className="p-4 border-r border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Time</label>
                    <input
                      type="time"
                      className="w-full text-sm text-slate-800 bg-transparent border-0 p-0 focus:ring-0"
                      defaultValue="10:00"
                    />
                  </div>
                  <div className="p-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Return Time</label>
                    <input
                      type="time"
                      className="w-full text-sm text-slate-800 bg-transparent border-0 p-0 focus:ring-0"
                      defaultValue="18:00"
                    />
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">1 day rental</span>
                  <span className="font-medium">{formatLocalPrice(item.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Service fee</span>
                  <span className="font-medium">{formatLocalPrice(item.price * 0.12)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Insurance</span>
                  <span className="font-medium">{formatLocalPrice(5)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="font-bold text-xl text-blue-600">
                    {formatLocalPrice(item.price * 1.12 + 5)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3"
                  disabled={!item.available}
                  onClick={handleBookNow}
                >
                  {item.available ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      {item.instantBook ? 'Instant Book' : 'Request to Book'}
                    </>
                  ) : (
                    'Currently Unavailable'
                  )}
                </Button>
                
                <Button className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl py-3">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Host
                </Button>
              </div>

              {/* Insurance Info */}
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-green-800 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Protection Included
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Coverage up to {formatLocalPrice(8000)}</li>
                  <li>• ${formatLocalPrice(50)} deductible</li>
                  <li>• 24/7 claim support</li>
                </ul>
              </div>

              {/* Support */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center text-sm text-slate-500">
                  <Headphones className="w-4 h-4 mr-1" />
                  <span>24/7 AI-powered support</span>
                </div>
                <div className="flex items-center justify-center text-sm text-slate-500">
                  <Lock className="w-4 h-4 mr-1" />
                  <span>Secure payments with escrow protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalDetailsPage;